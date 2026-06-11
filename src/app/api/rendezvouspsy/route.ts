import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import type { PsyOrientation } from '@/payload-types'
import { createNotification } from '@/utilities/createNotification'

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const blockingStatuses = ['pending', 'confirmed', 'completed'] as const

type AppointmentBody = {
  date?: string
  orientationId?: string | number
  reason?: string
  startTime?: string
}


type UpdateAppointmentBody = {
  id?: string | number
  modality?: 'presentiel' | 'en_ligne'
  rejectionReason?: string
  status?: 'confirmed' | 'rejected' | 'cancelled' | 'completed'
  teamsJoinUrl?: string
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

function isPastSlot(date: string, startTime: string) {
  const slotDate = new Date(`${date}T${startTime}:00`)

  return slotDate.getTime() <= Date.now()
}

function getUserName(user: { email?: string; firstName?: string | null; lastName?: string | null }) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return fullName || user.email || 'Un utilisateur'
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
  let reason = body.reason?.trim() || ''
  const orientationId = body.orientationId
  let urgency: 'normal' | 'urgent' = 'normal'
  let orientation: PsyOrientation | null = null

  if (!date || !startTime) {
    return Response.json(
      { error: 'Date et heure sont requises.' },
      { status: 400 },
    )
  }

  if (orientationId) {
    orientation = await payload.findByID({
      collection: 'psy-orientations',
      id: orientationId,
      user,
      overrideAccess: false,
      depth: 1,
    })

    const orientationStudentId =
      typeof orientation.student === 'object' ? orientation.student.id : orientation.student

    if (String(orientationStudentId) !== String(user.id)) {
      return Response.json({ error: 'Orientation invalide.' }, { status: 403 })
    }

    if (orientation.status !== 'student_accepted') {
      return Response.json(
        { error: "Cette orientation n'est pas disponible pour une prise de rendez-vous." },
        { status: 409 },
      )
    }

    urgency = 'urgent'
    reason = orientation.reason.trim()
  }

  if (!reason) {
    return Response.json(
      { error: 'Le motif est requis.' },
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
  const availableSlots = allSlots.filter(
    (slot) => !busyStartTimes.has(slot.startTime) && !isPastSlot(date, slot.startTime),
  )
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
      orientation: orientation?.id,
      date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      reason,
      urgency,
      status: 'pending',
    },
  })

  if (orientation) {
    await payload.update({
      collection: 'psy-orientations',
      id: orientation.id,
      user,
      overrideAccess: false,
      data: {
        appointment: appointment.id,
        status: 'appointment_requested',
      },
    })
  }

  try {
    await createNotification({
      actor: user.id,
      event: 'rendezvous_created',
      link: '/dashboard/psy/rendez_vous',
      message: orientation
        ? `${getUserName(user)} a demande un rendez-vous urgent suite a une orientation du coach. Date: ${date} a ${selectedSlot.startTime}.`
        : `${getUserName(user)} a demande un rendez-vous le ${date} a ${selectedSlot.startTime}.`,
      payload,
      recipient: psychologist.id,
      sendEmail: true,
      title: 'Nouvelle demande de rendez-vous',
      type: 'rendezvous',
    })
  } catch (error) {
    console.error('Failed to create rendez-vous notification:', error)
  }

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
  const modality = body.modality
  const teamsJoinUrl = body.teamsJoinUrl?.trim()

  if (!appointmentId || !status) {
    return Response.json({ error: 'Rendez-vous et statut requis.' }, { status: 400 })
  }

  if (status === 'rejected' && !rejectionReason) {
    return Response.json({ error: 'La cause du refus est requise.' }, { status: 400 })
  }

  if (status === 'confirmed' && !modality) {
    return Response.json({ error: 'La modalite est requise pour confirmer.' }, { status: 400 })
  }

  if (status === 'confirmed' && modality === 'en_ligne' && !teamsJoinUrl) {
    return Response.json({ error: 'Le lien Teams est requis pour un rendez-vous en ligne.' }, { status: 400 })
  }

  const appointment = await payload.findByID({
    collection: 'rendez-vous-psy',
    id: appointmentId,
    user,
    overrideAccess: false,
    depth: 1,
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
      ...(status === 'confirmed' && {
        modality,
        teamsJoinUrl: modality === 'en_ligne' ? teamsJoinUrl : '',
      }),
    } as Record<string, unknown>,
  })

  const studentId =
    typeof appointment.student === 'object' ? appointment.student.id : appointment.student

  // Queue the Teams reminder job 10 min before the appointment (only for online confirmed appointments)
  if (status === 'confirmed' && modality === 'en_ligne' && teamsJoinUrl && appointment.date && appointment.startTime) {
    try {
      const studentObj = typeof appointment.student === 'object' ? appointment.student : null
      const studentEmail = studentObj && 'email' in studentObj ? (studentObj as { email?: string }).email : null
      const studentFirstName = studentObj && 'firstName' in studentObj ? (studentObj as { firstName?: string | null }).firstName : null
      const studentLastName = studentObj && 'lastName' in studentObj ? (studentObj as { lastName?: string | null }).lastName : null
      const studentName = [studentFirstName, studentLastName].filter(Boolean).join(' ').trim() || studentEmail || 'Etudiant'

      if (studentEmail) {
        // Parse appointment date (stored as ISO) + startTime (HH:MM) → exact datetime
        const apptBase = new Date(appointment.date)
        const [hours, minutes] = appointment.startTime.split(':').map(Number)
        const apptDateTime = new Date(
          apptBase.getUTCFullYear(),
          apptBase.getUTCMonth(),
          apptBase.getUTCDate(),
          hours,
          minutes,
          0,
          0,
        )
        const reminderTime = new Date(apptDateTime.getTime() - 10 * 60 * 1000)

        if (reminderTime > new Date()) {
          await payload.jobs.queue({
            task: 'sendPsyReminder',
            waitUntil: reminderTime,
            input: {
              appointmentId: String(appointmentId),
              studentEmail,
              studentName,
              teamsUrl: teamsJoinUrl,
              appointmentDate: appointment.date,
              startTime: appointment.startTime,
            },
          })
        }
      }
    } catch (err) {
      console.error('Failed to queue psy reminder job:', err)
    }
  }

  const statusLabels: Record<NonNullable<UpdateAppointmentBody['status']>, string> = {
    cancelled: 'annulé',
    completed: 'terminé',
    confirmed: 'confirmé',
    rejected: 'refusé',
  }

  function formatApptDate(dateStr: string) {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  try {
    const formattedDate = formatApptDate(appointment.date)

    const notifMessage = (() => {
      if (status === 'rejected') {
        return `Votre rendez-vous psy a été refusé. Motif : ${rejectionReason}.`
      }
      if (status === 'confirmed' && modality === 'en_ligne') {
        return `Votre rendez-vous psy du ${formattedDate} à ${appointment.startTime} est confirmé. Il se tiendra en ligne via Microsoft Teams. Vous recevrez le lien de connexion par email 10 minutes avant la séance.`
      }
      if (status === 'confirmed' && modality === 'presentiel') {
        return `Votre rendez-vous psy du ${formattedDate} à ${appointment.startTime} est confirmé. Il se tiendra en présentiel.`
      }
      return `Votre rendez-vous psy du ${formattedDate} à ${appointment.startTime} est ${statusLabels[status]}.`
    })()

    await createNotification({
      actor: user.id,
      event: `rendezvous_${status}`,
      link: '/dashboard/student/rendez_vous',
      linkLabel: 'Voir mes rendez-vous',
      message: notifMessage,
      payload,
      recipient: studentId,
      sendEmail: true,
      title: `Rendez-vous psy ${statusLabels[status]}`,
      type: 'rendezvous',
    })
  } catch (error) {
    console.error('Failed to create rendez-vous status notification:', error)
  }

  return Response.json({
    success: true,
    appointment: updatedAppointment,
  })
}
