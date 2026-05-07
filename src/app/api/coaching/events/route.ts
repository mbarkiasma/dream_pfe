import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { createNotification } from '@/utilities/createNotification'

type CreateCoachingEventBody = {
  title?: string
  theme?: string
  description?: string
  scheduledAt?: string
  durationMinutes?: number
  teamsJoinUrl?: string
}

function sanitizeText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'coach') {
    return Response.json(
      { error: 'Seul un coach peut publier une seance de coaching.' },
      { status: 403 },
    )
  }

  const body = (await request.json().catch(() => ({}))) as CreateCoachingEventBody

  const title = sanitizeText(body.title)
  const theme = sanitizeText(body.theme)
  const description = sanitizeText(body.description)
  const scheduledAt = sanitizeText(body.scheduledAt)
  const teamsJoinUrl = sanitizeText(body.teamsJoinUrl)
  const durationMinutes = Number(body.durationMinutes || 60)

  if (!title || !theme || !description || !scheduledAt) {
    return Response.json(
      { error: 'Titre, theme, description et date sont obligatoires.' },
      { status: 400 },
    )
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes < 15) {
    return Response.json({ error: 'Duree invalide.' }, { status: 400 })
  }

  const scheduledDate = new Date(scheduledAt)

  if (Number.isNaN(scheduledDate.getTime())) {
    return Response.json({ error: 'Date invalide.' }, { status: 400 })
  }

  const event = await payload.create({
    collection: 'coaching-events',
    user,
    overrideAccess: false,
    data: {
      title,
      theme,
      description,
      coach: user.id,
      scheduledAt: scheduledDate.toISOString(),
      durationMinutes,
      teamsJoinUrl,
      status: 'published',
    },
  })

  const students = await payload.find({
    collection: 'users',
    user,
    overrideAccess: false,
    where: {
      role: {
        equals: 'etudiant',
      },
    },
    depth: 0,
    limit: 1000,
  })

  const registrationLink = `/dashboard/student/coaching/events/${event.id}/register`

  await Promise.all(
    students.docs.map((student) =>
      createNotification({
        actor: user.id,
        event: 'coaching_event_published',
        link: registrationLink,
        message: `Une nouvelle seance de coaching est disponible: ${title}. Merci de confirmer votre participation via le formulaire.`,
        payload,
        recipient: Number(student.id),
        sendEmail: true,
        title: `Nouvelle seance de coaching: ${theme}`,
        type: 'coaching',
      }),
    ),
  )

  const updatedEvent = await payload.update({
    collection: 'coaching-events',
    id: event.id,
    user,
    overrideAccess: false,
    data: {
      announcementSentAt: new Date().toISOString(),
    },
  })

  return Response.json({ event: updatedEvent })
}
