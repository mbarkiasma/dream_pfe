import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { CoachingEvent, User } from '@/payload-types'
import { getDisplayName, getRelationId } from '@/lib/coaching'
import { createNotification } from '@/utilities/createNotification'

type RegisterBody = {
  motivation?: string
  questions?: string
  specialNeeds?: string
}

type NotifyCoachArgs = {
  event: CoachingEvent
  motivation: string
  payload: Awaited<ReturnType<typeof getPayload>>
  questions: string
  specialNeeds: string
  user: User
}

function sanitizeText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

async function notifyCoach({
  event,
  motivation,
  payload,
  questions,
  specialNeeds,
  user,
}: NotifyCoachArgs) {
  const coachId = getRelationId(event.coach)

  if (!coachId) return

  const details = [
    `${getDisplayName(user)} a confirme sa participation a la seance "${event.title}".`,
    `Motivation: ${motivation}`,
    questions ? `Questions: ${questions}` : '',
    specialNeeds ? `Besoin particulier: ${specialNeeds}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  await createNotification({
    actor: user.id,
    event: 'coaching_event_registration_created',
    link: '/dashboard/coach/rendez_vous',
    message: details,
    payload,
    recipient: Number(coachId),
    sendEmail: true,
    title: `Nouvelle inscription: ${event.theme}`,
    type: 'coaching',
  })
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      eventId: string
    }>
  },
) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'etudiant') {
    return Response.json(
      { error: 'Seul un etudiant peut s inscrire a une seance.' },
      { status: 403 },
    )
  }

  const { eventId } = await context.params

  const event = await payload.findByID({
    collection: 'coaching-events',
    id: eventId,
    user,
    overrideAccess: false,
    depth: 0,
  })

  if (event.status !== 'published') {
    return Response.json(
      { error: "Cette seance n'est pas ouverte aux inscriptions." },
      { status: 409 },
    )
  }

  const body = (await request.json().catch(() => ({}))) as RegisterBody
  const motivation = sanitizeText(body.motivation)
  const questions = sanitizeText(body.questions)
  const specialNeeds = sanitizeText(body.specialNeeds)

  if (!motivation) {
    return Response.json({ error: 'La motivation est obligatoire.' }, { status: 400 })
  }

  const existing = await payload.find({
    collection: 'coaching-registrations',
    user,
    overrideAccess: false,
    where: {
      and: [
        {
          event: {
            equals: event.id,
          },
        },
        {
          student: {
            equals: user.id,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  if (existing.docs[0]) {
    return Response.json(
      { error: 'Vous avez deja confirme votre participation a cette seance.' },
      { status: 409 },
    )
  }

  const registration = await payload.create({
    collection: 'coaching-registrations',
    user,
    overrideAccess: false,
    data: {
      event: event.id,
      student: user.id,
      motivation,
      questions,
      specialNeeds,
      status: 'registered',
      registeredAt: new Date().toISOString(),
    },
  })

  await notifyCoach({
    event,
    motivation,
    payload,
    questions,
    specialNeeds,
    user,
  })

  return Response.json({ registration })
}
