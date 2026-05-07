import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getDisplayName, getRelationId } from '@/lib/coaching'
import { createNotification } from '@/utilities/createNotification'

type UpdateCoachingEventBody = {
  action?: 'cancel' | 'update'
  description?: string
  durationMinutes?: number
  scheduledAt?: string
  teamsJoinUrl?: string
  theme?: string
  title?: string
}

function sanitizeText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

async function notifyRegisteredStudents({
  eventId,
  link,
  message,
  payload,
  title,
}: {
  eventId: string | number
  link: string
  message: string
  payload: Awaited<ReturnType<typeof getPayload>>
  title: string
}) {
  const registrations = await payload.find({
    collection: 'coaching-registrations',
    where: {
      and: [
        {
          event: {
            equals: eventId,
          },
        },
        {
          status: {
            equals: 'registered',
          },
        },
      ],
    },
    depth: 0,
    limit: 1000,
  })

  await Promise.all(
    registrations.docs.map((registration) => {
      const studentId = getRelationId(registration.student)

      if (!studentId) return Promise.resolve()

      return createNotification({
        event: 'coaching_event_updated',
        link,
        message,
        payload,
        recipient: Number(studentId),
        sendEmail: true,
        title,
        type: 'coaching',
      })
    }),
  )
}

export async function PATCH(
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

  if (user.role !== 'coach') {
    return Response.json(
      { error: 'Seul un coach peut gerer une seance de coaching.' },
      { status: 403 },
    )
  }

  const { eventId } = await context.params
  const existingEvent = await payload.findByID({
    collection: 'coaching-events',
    id: eventId,
    user,
    overrideAccess: false,
    depth: 0,
  })

  if (String(getRelationId(existingEvent.coach)) !== String(user.id)) {
    return Response.json({ error: 'Acces refuse.' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as UpdateCoachingEventBody

  if (body.action === 'cancel') {
    const event = await payload.update({
      collection: 'coaching-events',
      id: existingEvent.id,
      user,
      overrideAccess: false,
      data: {
        status: 'cancelled',
      },
    })

    await notifyRegisteredStudents({
      eventId: event.id,
      link: '/dashboard/student/coaching',
      message: `La seance de coaching "${event.title}" a ete annulee par ${getDisplayName(user)}.`,
      payload,
      title: `Seance annulee: ${event.theme}`,
    })

    return Response.json({ event })
  }

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

  const event = await payload.update({
    collection: 'coaching-events',
    id: existingEvent.id,
    user,
    overrideAccess: false,
    data: {
      description,
      durationMinutes,
      scheduledAt: scheduledDate.toISOString(),
      teamsJoinUrl,
      theme,
      title,
    },
  })

  await notifyRegisteredStudents({
    eventId: event.id,
    link: `/dashboard/student/coaching/events/${event.id}/register`,
    message: `La seance de coaching "${event.title}" a ete mise a jour par ${getDisplayName(user)}. Consultez les nouvelles informations dans votre espace.`,
    payload,
    title: `Seance mise a jour: ${event.theme}`,
  })

  return Response.json({ event })
}
