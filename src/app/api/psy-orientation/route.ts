import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getDisplayName } from '@/lib/coaching'
import { createNotification } from '@/utilities/createNotification'

type CreateOrientationBody = {
  observation?: string
  reason?: string
  studentId?: string | number
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
      { error: 'Seul un coach peut orienter un étudiant vers le psychologue.' },
      { status: 403 },
    )
  }

  const body = (await request.json().catch(() => ({}))) as CreateOrientationBody
  const studentId = body.studentId
  const reason = sanitizeText(body.reason)
  const observation = sanitizeText(body.observation)

  if (!studentId || !reason) {
    return Response.json(
      { error: "L'étudiant et le motif d'orientation sont obligatoires." },
      { status: 400 },
    )
  }

  const student = await payload.findByID({
    collection: 'users',
    id: studentId,
    user,
    overrideAccess: false,
    depth: 0,
  })

  if (student.role !== 'etudiant') {
    return Response.json({ error: "L'utilisateur sélectionné n'est pas un étudiant." }, { status: 400 })
  }

  const existing = await payload.find({
    collection: 'psy-orientations',
    user,
    overrideAccess: false,
    where: {
      and: [
        {
          student: {
            equals: student.id,
          },
        },
        {
          coach: {
            equals: user.id,
          },
        },
        {
          status: {
            equals: 'pending_student_response',
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  if (existing.docs[0]) {
    return Response.json(
      { error: 'Une orientation est déjà en attente pour cet étudiant.' },
      { status: 409 },
    )
  }

  const orientation = await payload.create({
    collection: 'psy-orientations',
    user,
    overrideAccess: false,
    data: {
      title: `Orientation psy - ${getDisplayName(student)}`,
      student: student.id,
      coach: user.id,
      reason,
      observation,
      status: 'pending_student_response',
    },
  })

  await createNotification({
    actor: user.id,
    event: 'psy_orientation_created',
    link: `/dashboard/student/orientations/${orientation.id}`,
    message: `${getDisplayName(user)} vous recommande de prendre rendez-vous avec un psychologue. Vous pouvez accepter ou refuser cette orientation.`,
    payload,
    recipient: Number(student.id),
    sendEmail: true,
    title: 'Orientation vers psychologue recommandée',
    type: 'rendezvous',
  })

  return Response.json({ orientation })
}
