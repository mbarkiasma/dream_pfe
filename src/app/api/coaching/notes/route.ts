import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getDisplayName, getRelationId, isSameId, sanitizeCoachingMessage } from '@/lib/coaching'
import { createNotification } from '@/utilities/createNotification'

type SaveNoteBody = {
  content?: string
  noteId?: string
  sessionId?: string
  title?: string
}

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'coach') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return Response.json({ error: 'Session requise.' }, { status: 400 })
  }

  const session = await payload.findByID({
    collection: 'coaching-sessions',
    id: sessionId,
    depth: 0,
    user,
    overrideAccess: false,
  })

  if (!isSameId(session.coach, user.id)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const notes = await payload.find({
    collection: 'coach-notes',
    user,
    overrideAccess: false,
    where: {
      session: {
        equals: session.id,
      },
    },
    depth: 0,
    sort: '-createdAt',
    limit: 20,
  })

  return Response.json({ notes: notes.docs })
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'coach') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as SaveNoteBody
  const content = sanitizeCoachingMessage(body.content)
  const title = sanitizeCoachingMessage(body.title) || 'Note de suivi'

  if (!body.sessionId || !content) {
    return Response.json({ error: 'Session et contenu requis.' }, { status: 400 })
  }

  const session = await payload.findByID({
    collection: 'coaching-sessions',
    id: body.sessionId,
    depth: 0,
    user,
    overrideAccess: false,
  })

  if (!isSameId(session.coach, user.id)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const studentId = Number(getRelationId(session.student))

  if (!Number.isFinite(studentId)) {
    return Response.json({ error: 'Etudiant introuvable.' }, { status: 400 })
  }

  const note = await payload.create({
    collection: 'coach-notes',
    user,
    overrideAccess: false,
    data: {
      title,
      session: session.id,
      student: studentId,
      coach: user.id,
      content,
    },
  })

  try {
    await createNotification({
      actor: user.id,
      event: 'coach_note_created',
      link: '/dashboard/student/coaching',
      message: `${getDisplayName(user)} a ajoute une note de suivi a votre accompagnement.`,
      payload,
      recipient: studentId,
      sendEmail: true,
      title: 'Nouvelle note de suivi',
      type: 'coaching',
    })
  } catch (error) {
    console.error('Failed to create coach note notification:', error)
  }

  return Response.json({ note })
}

export async function PATCH(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'coach') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as SaveNoteBody
  const content = sanitizeCoachingMessage(body.content)
  const title = sanitizeCoachingMessage(body.title)

  if (!body.noteId || !content) {
    return Response.json({ error: 'Note et contenu requis.' }, { status: 400 })
  }

  const existingNote = await payload.findByID({
    collection: 'coach-notes',
    id: body.noteId,
    depth: 0,
    user,
    overrideAccess: false,
  })

  if (!isSameId(existingNote.coach, user.id)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const note = await payload.update({
    collection: 'coach-notes',
    id: existingNote.id,
    user,
    overrideAccess: false,
    data: {
      ...(title ? { title } : {}),
      content,
    },
  })

  return Response.json({ note })
}

export async function DELETE(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'coach') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const noteId = searchParams.get('noteId')

  if (!noteId) {
    return Response.json({ error: 'Note requise.' }, { status: 400 })
  }

  const existingNote = await payload.findByID({
    collection: 'coach-notes',
    id: noteId,
    depth: 0,
    user,
    overrideAccess: false,
  })

  if (!isSameId(existingNote.coach, user.id)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await payload.delete({
    collection: 'coach-notes',
    id: existingNote.id,
    user,
    overrideAccess: false,
  })

  return Response.json({ success: true })
}
