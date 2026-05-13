import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { createNotification } from '@/utilities/createNotification'

type CreateExerciseBody = {
  dueDate?: string
  instructions?: string
  reason?: string
  studentId?: string | number
  title?: string
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
      { error: 'Seul un coach peut attribuer un exercice.' },
      { status: 403 },
    )
  }

  const body = (await request.json().catch(() => ({}))) as CreateExerciseBody

  const title = sanitizeText(body.title)
  const instructions = sanitizeText(body.instructions)
  const reason = sanitizeText(body.reason)
  const studentId = Number(body.studentId)
  const dueDate = sanitizeText(body.dueDate)

  if (!title || !instructions || !body.studentId || !dueDate) {
    return Response.json(
      { error: 'Titre, consignes, etudiant et echeance sont obligatoires.' },
      { status: 400 },
    )
  }

  if (!Number.isFinite(studentId)) {
    return Response.json({ error: 'Etudiant invalide.' }, { status: 400 })
  }

  const existingSession = await payload.find({
    collection: 'coaching-sessions',
    user,
    overrideAccess: false,
    where: {
      and: [
        {
          coach: {
            equals: user.id,
          },
        },
        {
          student: {
            equals: studentId,
          },
        },
        {
          mode: {
            equals: 'classic',
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  if (existingSession.totalDocs === 0) {
    return Response.json(
      { error: "Vous pouvez attribuer un exercice uniquement a un etudiant deja accompagne." },
      { status: 403 },
    )
  }

  const exercise = await payload.create({
    collection: 'student-exercices',
    user,
    overrideAccess: false,
    data: {
      title,
      instructions,
      reason,
      student: studentId,
      coach: user.id,
      status: 'assigned',
      dueDate,
      assignedAt: new Date().toISOString(),
    },
  })

  try {
    await createNotification({
      actor: user.id,
      event: 'student_exercise_assigned',
      link: '/dashboard/student/checkin',
      message: `Votre coach vous a attribue un nouvel exercice: ${title}. Pensez a faire votre check-in apres l'avoir realise.`,
      payload,
      recipient: studentId,
      sendEmail: true,
      title: 'Nouvel exercice a realiser',
      type: 'coaching',
    })
  } catch (error) {
    console.error('Failed to create exercise notification:', error)
  }

  return Response.json({ exercise })
}
