import { getPayload } from 'payload'
import config from '@payload-config'

import { createNotification } from '@/utilities/createNotification'

function getDateWindowTwoDaysFromNow() {
  const start = new Date()
  start.setDate(start.getDate() + 2)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setHours(23, 59, 59, 999)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

function getDateWindowFromMinutes(minutes: number) {
  const start = new Date()
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + minutes)

  return {
    label: `${minutes} minutes`,
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

function getReminderWindow(request: Request) {
  const url = new URL(request.url)
  const minutes = Number(url.searchParams.get('minutes'))

  if (Number.isFinite(minutes) && minutes > 0) {
    return getDateWindowFromMinutes(minutes)
  }

  return {
    label: 'deux jours',
    ...getDateWindowTwoDaysFromNow(),
  }
}

function getRelationId(value: unknown) {
  if (typeof value === 'number' || typeof value === 'string') return value

  if (value && typeof value === 'object' && 'id' in value) {
    return (value as { id: string | number }).id
  }

  return undefined
}

export async function GET(request: Request) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const { end, label, start } = getReminderWindow(request)

  const events = await payload.find({
    collection: 'coaching-events',
    where: {
      and: [
        {
          status: {
            equals: 'published',
          },
        },
        {
          scheduledAt: {
            greater_than_equal: start,
          },
        },
        {
          scheduledAt: {
            less_than_equal: end,
          },
        },
        {
          reminderSentAt: {
            exists: false,
          },
        },
      ],
    },
    depth: 0,
    limit: 100,
  })

  let sentCount = 0

  for (const event of events.docs) {
    const registrations = await payload.find({
      collection: 'coaching-registrations',
      where: {
        and: [
          {
            event: {
              equals: event.id,
            },
          },
          {
            status: {
              equals: 'registered',
            },
          },
        ],
      },
      depth: 1,
      limit: 1000,
    })

    await Promise.all(
      registrations.docs.map((registration) => {
        const studentId = getRelationId(registration.student)

        if (!studentId) return Promise.resolve()

        sentCount += 1

        return createNotification({
          actor: getRelationId(event.coach) ? Number(getRelationId(event.coach)) : undefined,
          event: 'coaching_event_reminder',
          link: event.teamsJoinUrl || '/dashboard/student/coaching',
          message: `Votre seance de coaching "${event.title}" aura lieu dans ${label}. Voici le lien Microsoft Teams pour rejoindre la seance.`,
          payload,
          recipient: Number(studentId),
          sendEmail: true,
          title: `Rappel seance de coaching: ${event.theme}`,
          type: 'coaching',
        })
      }),
    )

    await payload.update({
      collection: 'coaching-events',
      id: event.id,
      data: {
        reminderSentAt: new Date().toISOString(),
      },
    })
  }

  return Response.json({
    ok: true,
    events: events.docs.length,
    window: {
      end,
      label,
      start,
    },
    sent: sentCount,
  })
}
