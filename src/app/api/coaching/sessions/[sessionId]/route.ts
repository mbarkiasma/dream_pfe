import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { isSameId, sanitizeCoachingMessage } from '@/lib/coaching'

type RouteContext = {
  params: Promise<{
    sessionId: string
  }>
}

type UpdateSessionBody = {
  title?: string
}

export async function PATCH(request: Request, context: RouteContext) {
  const { sessionId } = await context.params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = await payload.findByID({
    collection: 'coaching-sessions',
    id: sessionId,
    depth: 0,
    user,
    overrideAccess: false,
  })

  if (user.role !== 'etudiant' || !isSameId(session.student, user.id)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as UpdateSessionBody
  const title = sanitizeCoachingMessage(body.title)
  const data: UpdateSessionBody = {}

  if (title) {
    data.title = title.slice(0, 120)
  }

  if (!data.title) {
    return Response.json({ error: 'Aucune modification valide.' }, { status: 400 })
  }

  const updatedSession = await payload.update({
    collection: 'coaching-sessions',
    id: session.id,
    data,
  })

  return Response.json({ session: updatedSession })
}

export async function DELETE(_: Request, context: RouteContext) {
  const { sessionId } = await context.params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = await payload.findByID({
    collection: 'coaching-sessions',
    id: sessionId,
    depth: 0,
    user,
    overrideAccess: false,
  })

  if (user.role !== 'etudiant' || !isSameId(session.student, user.id)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (session.mode !== 'smart') {
    return Response.json(
      { error: 'Seules les sessions smart peuvent etre supprimees par l etudiant.' },
      { status: 409 },
    )
  }

  await payload.delete({
    collection: 'coaching-messages',
    where: {
      session: {
        equals: session.id,
      },
    },
  })

  await payload.delete({
    collection: 'coaching-sessions',
    id: session.id,
  })

  return Response.json({ success: true })
}
