import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getRelationId, isSameId, sanitizeCoachingMessage } from '@/lib/coaching'
import { generateSmartCoachingReply } from '@/lib/smart-coaching'

type RouteContext = {
  params: Promise<{
    messageId: string
  }>
}

type UpdateMessageBody = {
  content?: string
}

export async function PATCH(request: Request, context: RouteContext) {
  const { messageId } = await context.params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as UpdateMessageBody
  const content = sanitizeCoachingMessage(body.content)

  if (!content) {
    return Response.json({ error: 'Message requis.' }, { status: 400 })
  }

  const message = await payload.findByID({
    collection: 'coaching-messages',
    id: messageId,
    depth: 0,
    user,
    overrideAccess: false,
  })

  if (message.senderRole !== 'student' || !isSameId(message.senderUser, user.id)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const sessionId = getRelationId(message.session)

  if (!sessionId) {
    return Response.json({ error: 'Session introuvable.' }, { status: 400 })
  }

  const session = await payload.findByID({
    collection: 'coaching-sessions',
    id: sessionId,
    depth: 0,
    user,
    overrideAccess: false,
  })

  if (session.mode !== 'smart' || user.role !== 'etudiant' || !isSameId(session.student, user.id)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (session.status !== 'open') {
    return Response.json({ error: 'Cette session est cloturee.' }, { status: 409 })
  }

  const laterMessages = await payload.find({
    collection: 'coaching-messages',
    where: {
      and: [
        {
          session: {
            equals: session.id,
          },
        },
        {
          createdAt: {
            greater_than: message.createdAt,
          },
        },
      ],
    },
    depth: 0,
    limit: 100,
  })

  await Promise.all(
    laterMessages.docs.map((item) =>
      payload.delete({
        collection: 'coaching-messages',
        id: item.id,
      }),
    ),
  )

  await payload.update({
    collection: 'coaching-messages',
    id: message.id,
    data: {
      content,
    },
  })

  const historyBeforeReply = await payload.find({
    collection: 'coaching-messages',
    where: {
      session: {
        equals: session.id,
      },
    },
    sort: 'createdAt',
    depth: 0,
    limit: 30,
  })

  const aiContent = await generateSmartCoachingReply({
    history: historyBeforeReply.docs.map((item) => ({
      content: item.id === message.id ? content : item.content,
      senderRole: item.senderRole,
    })),
  })

  await payload.create({
    collection: 'coaching-messages',
    data: {
      session: session.id,
      senderRole: 'ai',
      content: aiContent,
    },
  })

  const refreshedMessages = await payload.find({
    collection: 'coaching-messages',
    where: {
      session: {
        equals: session.id,
      },
    },
    sort: 'createdAt',
    depth: 1,
    limit: 100,
  })

  return Response.json({ messages: refreshedMessages.docs })
}
