import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const blockingStatuses = ['pending', 'confirmed', 'completed'] as const

type AppointmentBody = {
  date?: string
  startTime?: string
  reason?: string
  urgency?: 'normal' | 'urgent'
}

type UpdateAppointmentBody = {
  id?: string | number
  rejectionReason?: string
  status?: 'confirmed' | 'rejected' | 'cancelled' | 'completed'
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
  const slots: { startTime: string; endTime: string }[] = []
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

function getNextDateValue(date: string) {
  const nextDate = new Date(`${date}T00:00:00`)
  nextDate.setDate(nextDate.getDate() + 1)
  const year = nextDate.getFullYear()
  const month = String(nextDate.getMonth() + 1).padStart(2, '0')
  const day = String(nextDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'etudiant') {
    return Response.json(
      { error: 'Seul un etudiant peut demander un rendez-vous.' },
      { status: 403 },
    )
  }

  const body = (await request.json().catch(() => ({}))) as AppointmentBody
  const date = body.date?.trim()
  const startTime = body.startTime?.trim()
  const reason = body.reason?.trim()
  const urgency = body.urgency === 'urgent' ? 'urgent' : 'normal'

  if (!date || !startTime || !reason) {
    return Response.json(
      { error: 'Date, heure et motif sont requis.' },
      { status: 400 },
    )
  }

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

  const psychologist = psychologists.docs[0]

  if (!psychologist) {
    return Response.json({ error: 'Aucun psychologue disponible.' }, { status: 404 })
  }

  const selectedDate = new Date(`${date}T00:00:00`)
  const dayOfWeek = dayNames[selectedDate.getDay()]

  const availabilities = await payload.find({
    collection: 'psy-availabilities',
    where: {
      and: [
        {
          psychologist: {
            equals: psychologist.id,
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
            equals: psychologist.id,
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
  const availableSlots = allSlots.filter((slot) => !busyStartTimes.has(slot.startTime))
  const selectedSlot = availableSlots.find((slot) => slot.startTime === startTime)

  if (!selectedSlot) {
    return Response.json(
      { error: 'Ce creneau n’est plus disponible.' },
      { status: 409 },
    )
  }

  const appointment = await payload.create({
    collection: 'rendez-vous-psy',
    user,
    overrideAccess: false,
    data: {
      title: `Rendez-vous psy - ${date} ${selectedSlot.startTime}`,
      student: user.id,
      psychologist: psychologist.id,
      date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      reason,
      urgency,
      status: 'pending',
    },
  })

  return Response.json({
    success: true,
    appointment,
  })
}

export async function PATCH(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'psy') {
    return Response.json(
      { error: 'Seul le psychologue peut modifier un rendez-vous.' },
      { status: 403 },
    )
  }

  const body = (await request.json().catch(() => ({}))) as UpdateAppointmentBody
  const appointmentId = body.id
  const rejectionReason = body.rejectionReason?.trim()
  const status = body.status

  if (!appointmentId || !status) {
    return Response.json({ error: 'Rendez-vous et statut requis.' }, { status: 400 })
  }

  if (status === 'rejected' && !rejectionReason) {
    return Response.json({ error: 'La cause du refus est requise.' }, { status: 400 })
  }

  const appointment = await payload.findByID({
    collection: 'rendez-vous-psy',
    id: appointmentId,
    user,
    overrideAccess: false,
    depth: 0,
  })

  const psychologistId =
    typeof appointment.psychologist === 'object'
      ? appointment.psychologist.id
      : appointment.psychologist

  if (psychologistId !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updatedAppointment = await payload.update({
    collection: 'rendez-vous-psy',
    id: appointmentId,
    user,
    overrideAccess: false,
    data: {
      rejectionReason: status === 'rejected' ? rejectionReason : '',
      status,
    },
  })

  return Response.json({
    success: true,
    appointment: updatedAppointment,
  })
}
