import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getDisplayName, getRelationId } from '@/lib/coaching'
import { createNotification } from '@/utilities/createNotification'

type UpdateOrientationBody = {
  action?: 'accept' | 'refuse'
  refusalReason?: string
}

function sanitizeText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}
export async function GET(
  request: Request,
  context: {
    params: Promise<{
      orientationId: string
    }>
  },
) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'etudiant') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { orientationId } = await context.params

  const orientation = await payload.findByID({
    collection: 'psy-orientations',
    id: orientationId,
    user,
    overrideAccess: false,
    depth: 1,
  })

  const studentId =
    typeof orientation.student === 'object' ? orientation.student.id : orientation.student

  if (String(studentId) !== String(user.id)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (orientation.status !== 'student_accepted') {
    return Response.json(
      { error: "Cette orientation n'est pas disponible pour un rendez-vous." },
      { status: 409 },
    )
  }

  return Response.json({ orientation })
}


export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      orientationId: string
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
      { error: 'Seul un etudiant peut repondre a cette orientation.' },
      { status: 403 },
    )
  }

  const { orientationId } = await context.params

  const orientation = await payload.findByID({
    collection: 'psy-orientations',
    id: orientationId,
    user,
    overrideAccess: false,
    depth: 1,
  })

  const studentId = getRelationId(orientation.student)

  if (String(studentId) !== String(user.id)) {
    return Response.json({ error: 'Acces refuse.' }, { status: 403 })
  }

  if (orientation.status !== 'pending_student_response') {
    return Response.json(
      { error: 'Vous avez deja repondu a cette orientation.' },
      { status: 409 },
    )
  }

  const body = (await request.json().catch(() => ({}))) as UpdateOrientationBody

  if (body.action === 'refuse') {
    const refusalReason = sanitizeText(body.refusalReason)

    const updatedOrientation = await payload.update({
      collection: 'psy-orientations',
      id: orientation.id,
      user,
      overrideAccess: false,
      data: {
        status: 'student_refused',
        studentRefusalReason: refusalReason,
        studentRespondedAt: new Date().toISOString(),
      },
    })

    const coachId = getRelationId(orientation.coach)

    if (coachId) {
      await createNotification({
        actor: user.id,
        event: 'psy_orientation_refused',
        link: '/dashboard/coach/orientation_psy',
        message: `${getDisplayName(user)} a refuse l'orientation vers le psychologue.`,
        payload,
        recipient: Number(coachId),
        sendEmail: true,
        title: 'Orientation psy refusee',
        type: 'rendezvous',
      })
    }

    return Response.json({ orientation: updatedOrientation })
  }

  if (body.action === 'accept') {
    const updatedOrientation = await payload.update({
      collection: 'psy-orientations',
      id: orientation.id,
      user,
      overrideAccess: false,
      data: {
        status: 'student_accepted',
        studentRespondedAt: new Date().toISOString(),
      },
    })

    const coachId = getRelationId(orientation.coach)

    if (coachId) {
      await createNotification({
        actor: user.id,
        event: 'psy_orientation_accepted',
        link: '/dashboard/coach/orientation_psy',
        message: `${getDisplayName(user)} a accepte l'orientation vers le psychologue et va choisir un rendez-vous.`,
        payload,
        recipient: Number(coachId),
        sendEmail: true,
        title: 'Orientation psy acceptee',
        type: 'rendezvous',
      })
    }

    return Response.json({ orientation: updatedOrientation })
  }

  return Response.json({ error: 'Action invalide.' }, { status: 400 })
}
