import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { isSameId } from '@/lib/coaching'

type RouteContext = {
  params: Promise<{
    sessionId: string
  }>
}

export async function GET(_: Request, context: RouteContext) {
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

  if (
    user.role !== 'admin' &&
    user.role !== 'psy' &&
    !isSameId(session.student, user.id) &&
    !isSameId(session.coach, user.id)
  ) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const messages = await payload.find({
    collection: 'coaching-messages',
    user,
    overrideAccess: false,
    where: {
      session: {
        equals: session.id,
      },
    },
    sort: 'createdAt',
    depth: 1,
    limit: 100,
  })

  return Response.json({ session, messages: messages.docs })
}
