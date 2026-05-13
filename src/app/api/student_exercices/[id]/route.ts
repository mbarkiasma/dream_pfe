import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getDisplayName, getRelationId } from '@/lib/coaching'
import { createNotification } from '@/utilities/createNotification'

type UpdateExerciseBody = {
  checked?: boolean
  coachFeedback?: string
  dueDate?: string
  instructions?: string
  reason?: string
  title?: string
}

function sanitizeText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string
    }>
  },
) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = (await request.json().catch(() => ({}))) as UpdateExerciseBody

  if (user.role === 'coach') {
    const title = sanitizeText(body.title)
    const instructions = sanitizeText(body.instructions)
    const reason = sanitizeText(body.reason)
    const coachFeedback = sanitizeText(body.coachFeedback)
    const dueDate = sanitizeText(body.dueDate)

    if (!title || !instructions || !dueDate) {
      return Response.json(
        { error: 'Titre, consignes et echeance sont obligatoires.' },
        { status: 400 },
      )
    }

    const exercise = await payload.findByID({
      collection: 'student-exercices',
      id,
      user,
      overrideAccess: false,
      depth: 0,
    })

    if (exercise.status === 'completed' || exercise.status === 'reviewed') {
      return Response.json(
        { error: 'Un exercice deja confirme ne peut plus etre modifie.' },
        { status: 409 },
      )
    }

    const updatedExercise = await payload.update({
      collection: 'student-exercices',
      id: exercise.id,
      user,
      overrideAccess: false,
      data: {
        coachFeedback,
        dueDate,
        instructions,
        reason,
        title,
      },
    })

    return Response.json({ exercise: updatedExercise })
  }

  if (user.role !== 'etudiant') {
    return Response.json({ error: 'Action non autorisee.' }, { status: 403 })
  }

  if (body.checked !== true) {
    return Response.json({ error: 'Vous devez confirmer la realisation.' }, { status: 400 })
  }

  const exercise = await payload.findByID({
    collection: 'student-exercices',
    id,
    user,
    overrideAccess: false,
    depth: 1,
  })

  const coachId = getRelationId(exercise.coach)
  const dueTime = exercise.dueDate ? new Date(exercise.dueDate).getTime() : Number.POSITIVE_INFINITY

  if (
    Number.isFinite(dueTime) &&
    dueTime <= Date.now() &&
    exercise.status !== 'completed' &&
    exercise.status !== 'reviewed'
  ) {
    await payload.update({
      collection: 'student-exercices',
      id,
      user,
      overrideAccess: false,
      data: {
        status: 'missed',
      },
    })

    return Response.json(
      { error: "L'echeance est depassee, l'exercice est marque non fait." },
      { status: 409 },
    )
  }

  const updatedExercise = await payload.update({
    collection: 'student-exercices',
    id,
    user,
    overrideAccess: false,
    data: {
      completedAt: new Date().toISOString(),
      status: 'completed',
      studentResponse: 'Check-in confirme par l etudiant.',
    },
  })

  if (coachId) {
    try {
      await createNotification({
        actor: user.id,
        event: 'student_exercise_completed',
        link: '/dashboard/coach/exercices',
        message: `${getDisplayName(user)} a termine l'exercice "${exercise.title}" et a envoye son check-in.`,
        payload,
        recipient: Number(coachId),
        sendEmail: true,
        title: 'Check-in exercice recu',
        type: 'coaching',
      })
    } catch (error) {
      console.error('Failed to create exercise completion notification:', error)
    }
  }

  return Response.json({ exercise: updatedExercise })
}

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{
      id: string
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
      { error: 'Seul un coach peut supprimer un exercice.' },
      { status: 403 },
    )
  }

  const { id } = await context.params
  const exercise = await payload.findByID({
    collection: 'student-exercices',
    id,
    user,
    overrideAccess: false,
    depth: 0,
  })

  if (exercise.status === 'completed' || exercise.status === 'reviewed') {
    return Response.json(
      { error: 'Un exercice deja confirme ne peut plus etre supprime.' },
      { status: 409 },
    )
  }

  await payload.delete({
    collection: 'student-exercices',
    id,
    user,
    overrideAccess: false,
  })

  return Response.json({ success: true })
}
