import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getDisplayName, getRelationId, isSameId, sanitizeCoachingMessage } from '@/lib/coaching'
import { generateSmartCoachingReply } from '@/lib/smart-coaching'
import { createNotification } from '@/utilities/createNotification'

type SendMessageBody = {
  attachments?: AttachmentInput[]
  content?: string
  sessionId?: string
}

type AttachmentInput =
  | string
  | number
  | {
      filename?: string
      id?: string | number
      mimeType?: string
      url?: string
    }

function normalizeAttachment(attachment: AttachmentInput) {
  if (typeof attachment === 'string' || typeof attachment === 'number') {
    return { media: attachment }
  }

  const fileUrl = typeof attachment.url === 'string' ? attachment.url.trim() : ''

  if (!fileUrl.startsWith('/api/coaching/files/')) {
    return null
  }

  return {
    fileUrl,
    filename: typeof attachment.filename === 'string' ? attachment.filename.slice(0, 255) : 'Fichier',
    mimeType:
      typeof attachment.mimeType === 'string'
        ? attachment.mimeType.slice(0, 120)
        : 'application/octet-stream',
  }
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as SendMessageBody
  const content = sanitizeCoachingMessage(body.content)
  const attachments = Array.isArray(body.attachments)
    ? body.attachments.map(normalizeAttachment).filter((item): item is NonNullable<typeof item> => Boolean(item))
    : []

  if (!body.sessionId || (!content && attachments.length === 0)) {
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
      content: content || '',
      attachments,
    },
  })

  if (session.mode === 'classic') {
    const recipientId = senderRole === 'student' ? getRelationId(session.coach) : getRelationId(session.student)
    const recipientLink =
      senderRole === 'student' ? '/dashboard/coach/coaching' : '/dashboard/student/coaching'

    if (typeof recipientId === 'number') {
      try {
        await createNotification({
          actor: user.id,
          event: 'coaching_message_created',
          link: recipientLink,
          message: `${getDisplayName(user)} vous a envoye un nouveau message de coaching.`,
          payload,
          recipient: recipientId,
          sendEmail: true,
          title: 'Nouveau message de coaching',
          type: 'coaching',
        })
      } catch (error) {
        console.error('Failed to create coaching message notification:', error)
      }
    }
  }

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
