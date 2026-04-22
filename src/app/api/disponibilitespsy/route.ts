import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload, type Payload } from 'payload'

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const blockingStatuses = ['pending', 'confirmed', 'completed'] as const

type Slot = {
  startTime: string
  endTime: string
}

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTodayValue() {
  return formatDateValue(new Date())
}

function getNextDateValue(date: string) {
  const nextDate = new Date(`${date}T00:00:00`)
  nextDate.setDate(nextDate.getDate() + 1)

  return formatDateValue(nextDate)
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(total: number) {
  const hours = Math.floor(total / 60)
  const minutes = total % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function generateSlots(startTime: string, endTime: string, duration: number) {
  const slots: Slot[] = []
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)

  for (let current = start; current + duration <= end; current += duration) {
    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + duration),
    })
  }

  return slots
}

async function getPsychologist(payload: Payload) {
  const psychologists = await payload.find({
    collection: 'users',
    where: {
      role: {
        equals: 'psy',
      },
    },
    depth: 0,
    limit: 1,
  })

  return psychologists.docs[0]
}

async function getSlotsForDate({
  date,
  payload,
  psychologistId,
}: {
  date: string
  payload: Payload
  psychologistId: number
}) {
  const selectedDate = new Date(`${date}T00:00:00`)
  const dayOfWeek = dayNames[selectedDate.getDay()]

  const availabilities = await payload.find({
    collection: 'psy-availabilities',
    where: {
      and: [
        {
          psychologist: {
            equals: psychologistId,
          },
        },
        {
          dayOfWeek: {
            equals: dayOfWeek,
          },
        },
        {
          isActive: {
            equals: true,
          },
        },
      ],
    },
    depth: 0,
    limit: 20,
  })

  const allSlots = availabilities.docs.flatMap((availability) =>
    generateSlots(availability.startTime, availability.endTime, availability.slotDuration || 30),
  )

  const appointments = await payload.find({
    collection: 'rendez-vous-psy',
    where: {
      and: [
        {
          psychologist: {
            equals: psychologistId,
          },
        },
        {
          date: {
            greater_than_equal: `${date}T00:00:00.000Z`,
          },
        },
        {
          date: {
            less_than: `${getNextDateValue(date)}T00:00:00.000Z`,
          },
        },
        {
          status: {
            in: [...blockingStatuses],
          },
        },
      ],
    },
    depth: 0,
    limit: 100,
  })

  const busyStartTimes = new Set(appointments.docs.map((appointment) => appointment.startTime))
  const slots = allSlots.map((slot) => ({
    ...slot,
    available: !busyStartTimes.has(slot.startTime),
  }))

  return {
    busySlots: busyStartTimes.size,
    dayOfWeek,
    slots,
    totalSlots: allSlots.length,
    availableSlots: slots.filter((slot) => slot.available).length,
  }
}

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const year = Number(searchParams.get('year'))
  const month = Number(searchParams.get('month'))

  const psychologist = await getPsychologist(payload)

  if (!psychologist) {
    return Response.json({ error: 'Aucun psychologue disponible.' }, { status: 404 })
  }

  if (date) {
    const dayData = await getSlotsForDate({
      date,
      payload,
      psychologistId: Number(psychologist.id),
    })
    const isWeekend = dayData.dayOfWeek === 'saturday' || dayData.dayOfWeek === 'sunday'
    const isPast = date < getTodayValue()

    return Response.json({
      psychologistId: psychologist.id,
      date,
      dayOfWeek: dayData.dayOfWeek,
      status: isPast
        ? 'past'
        : isWeekend
          ? 'weekend'
          : dayData.totalSlots === 0
            ? 'closed'
            : dayData.availableSlots === 0
              ? 'full'
              : 'available',
      slots: dayData.slots,
      totalSlots: dayData.totalSlots,
      availableSlots: dayData.availableSlots,
      busySlots: dayData.busySlots,
    })
  }

  if (!year || !month || month < 1 || month > 12) {
    return Response.json({ error: 'Date ou mois requis.' }, { status: 400 })
  }

  const today = getTodayValue()
  const daysInMonth = new Date(year, month, 0).getDate()
  const days = await Promise.all(
    Array.from({ length: daysInMonth }, async (_, index) => {
      const dayNumber = index + 1
      const currentDate = new Date(year, month - 1, dayNumber)
      const dateValue = formatDateValue(currentDate)
      const dayData = await getSlotsForDate({
        date: dateValue,
        payload,
        psychologistId: Number(psychologist.id),
      })
      const isWeekend = dayData.dayOfWeek === 'saturday' || dayData.dayOfWeek === 'sunday'
      const isPast = dateValue < today
      const status = isPast
        ? 'past'
        : isWeekend
          ? 'weekend'
          : dayData.totalSlots === 0
            ? 'closed'
            : dayData.availableSlots === 0
              ? 'full'
              : 'available'

      return {
        date: dateValue,
        day: dayNumber,
        dayOfWeek: dayData.dayOfWeek,
        status,
        totalSlots: dayData.totalSlots,
        availableSlots: dayData.availableSlots,
        busySlots: dayData.busySlots,
      }
    }),
  )

  return Response.json({
    psychologistId: psychologist.id,
    year,
    month,
    days,
  })
}
