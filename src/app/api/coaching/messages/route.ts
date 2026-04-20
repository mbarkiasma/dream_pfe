import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { isSameId, sanitizeCoachingMessage } from '@/lib/coaching'
import { generateSmartCoachingReply } from '@/lib/smart-coaching'

type SendMessageBody = {
  content?: string
  sessionId?: string
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as SendMessageBody
  const content = sanitizeCoachingMessage(body.content)

  if (!body.sessionId || !content) {
    return Response.json({ error: 'Session et message requis.' }, { status: 400 })
  }

  const session = await payload.findByID({
    collection: 'coaching-sessions',
    id: body.sessionId,
    depth: 0,
    user,
    overrideAccess: false,
  })

  if (session.status !== 'open') {
    return Response.json({ error: 'Cette session est cloturee.' }, { status: 409 })
  }

  const isStudent = user.role === 'etudiant' && isSameId(session.student, user.id)
  const isCoach = user.role === 'coach' && isSameId(session.coach, user.id)

  if (!isStudent && !isCoach) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (session.mode === 'smart' && !isStudent) {
    return Response.json({ error: 'Le smart coaching est reserve a l etudiant.' }, { status: 403 })
  }

  const senderRole = isStudent ? 'student' : 'coach'
  const message = await payload.create({
    collection: 'coaching-messages',
    data: {
      session: session.id,
      senderRole,
      senderUser: user.id,
      content,
    },
  })

  let aiMessage = null

  if (session.mode === 'smart' && senderRole === 'student') {
    const previousMessages = await payload.find({
      collection: 'coaching-messages',
      where: {
        session: {
          equals: session.id,
        },
      },
      sort: '-createdAt',
      depth: 0,
      limit: 12,
    })
    const coachingHistory = previousMessages.docs.reverse().map((item) => ({
      content: item.content,
      senderRole: item.senderRole,
    }))
    const aiContent = await generateSmartCoachingReply({ history: coachingHistory })

    aiMessage = await payload.create({
      collection: 'coaching-messages',
      data: {
        session: session.id,
        senderRole: 'ai',
        content: aiContent,
      },
    })
  }

  return Response.json({
    message,
    aiMessage,
  })
}
