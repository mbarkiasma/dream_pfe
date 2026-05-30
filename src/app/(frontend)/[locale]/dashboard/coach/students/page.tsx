import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRelationId } from '@/lib/coaching'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

type StudentSummary = {
  email?: string | null
  firstName?: string | null
  id: string
  lastName?: string | null
  notesCount: number
  exercisesCount: number
  sessionsCount: number
}

type SharedFollowUpItem = {
  createdAt?: string | null
  details: {
    label: string
    value: string
  }[]
  href: string
  id: string
  meta: string
  studentName: string
  title: string
  type: 'exercise' | 'note' | 'session'
}

const exerciseStatusLabels: Record<string, string> = {
  assigned: 'Attribué',
  completed: 'Terminé',
  in_progress: 'En cours',
  missed: 'Non fait',
  reviewed: 'Corrigé',
}

function getPersonName(person: unknown, fallback = 'Étudiant') {
  if (!person || typeof person !== 'object') return fallback

  const data = person as {
    email?: string | null
    firstName?: string | null
    lastName?: string | null
  }

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim()

  return fullName || data.email || fallback
}

function formatShortDate(value?: string | null) {
  if (!value) return 'Date non précisée'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getStringField(source: unknown, field: string) {
  if (!source || typeof source !== 'object') return null

  const value = (source as Record<string, unknown>)[field]

  return typeof value === 'string' ? value : null
}

function incrementCounter(counters: Map<string, number>, student: unknown) {
  const studentId = getRelationId(student)

  if (!studentId) return

  const key = String(studentId)
  counters.set(key, (counters.get(key) ?? 0) + 1)
}

export default async function CoachStudentsPage() {
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })

  if (!user) {
    redirect('/login')
  }

  const sessions = await payload.find({
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
          mode: {
            equals: 'classic',
          },
        },
      ],
    },
    depth: 1,
    sort: '-createdAt',
    limit: 100,
  })

  const studentsById = new Map<string, unknown>()
  const sessionsCountByStudent = new Map<string, number>()

  sessions.docs.forEach((session) => {
    const studentId = getRelationId(session.student)

    if (!studentId) return

    const key = String(studentId)
    studentsById.set(key, session.student)
    sessionsCountByStudent.set(key, (sessionsCountByStudent.get(key) ?? 0) + 1)
  })

  const studentIds = Array.from(studentsById.keys())

  const [notes, exercises] =
    studentIds.length > 0
      ? await Promise.all([
          payload.find({
            collection: 'coach-notes',
            user,
            overrideAccess: false,
            where: {
              student: {
                in: studentIds,
              },
            },
            depth: 0,
            limit: 200,
          }),
          payload.find({
            collection: 'student-exercices',
            user,
            overrideAccess: false,
            where: {
              student: {
                in: studentIds,
              },
            },
            depth: 0,
            limit: 200,
          }),
        ])
      : [{ docs: [] }, { docs: [] }]

  const notesCountByStudent = new Map<string, number>()
  const exercisesCountByStudent = new Map<string, number>()

  notes.docs.forEach((note) => incrementCounter(notesCountByStudent, note.student))
  exercises.docs.forEach((exercise) => incrementCounter(exercisesCountByStudent, exercise.student))

  const students: StudentSummary[] = Array.from(studentsById.entries()).map(([id, student]) => {
    const data =
      student && typeof student === 'object'
        ? (student as {
            email?: string | null
            firstName?: string | null
            lastName?: string | null
          })
        : {}

    return {
      email: data.email,
      firstName: data.firstName,
      id,
      lastName: data.lastName,
      notesCount: notesCountByStudent.get(id) ?? 0,
      exercisesCount: exercisesCountByStudent.get(id) ?? 0,
      sessionsCount: sessionsCountByStudent.get(id) ?? 0,
    }
  })

  const latestSharedFollowUp: SharedFollowUpItem[] = [
    ...sessions.docs.map((session) => {
      const studentId = getRelationId(session.student)
      const student = studentId ? studentsById.get(String(studentId)) : session.student
      const status = getStringField(session, 'status')

      return {
        createdAt: getStringField(session, 'createdAt') || getStringField(session, 'startedAt'),
        details: [
          { label: 'Étudiant', value: getPersonName(student) },
          { label: 'Type', value: 'Session de coaching classique' },
          { label: 'Statut', value: status === 'closed' ? 'Clôturée' : 'Ouverte' },
          {
            label: 'Date',
            value: formatShortDate(getStringField(session, 'startedAt') || session.createdAt),
          },
        ],
        href: '/dashboard/coach/coaching',
        id: `session-${session.id}`,
        meta: `Session ${status === 'closed' ? 'clôturée' : 'ouverte'}`,
        studentName: getPersonName(student),
        title: getStringField(session, 'title') || 'Session de coaching',
        type: 'session' as const,
      }
    }),
    ...notes.docs.map((note) => {
      const studentId = getRelationId(note.student)
      const student = studentId ? studentsById.get(String(studentId)) : note.student

      return {
        createdAt: getStringField(note, 'createdAt'),
        details: [
          { label: 'Étudiant', value: getPersonName(student) },
          { label: 'Type', value: 'Note partagée' },
          { label: 'Titre', value: getStringField(note, 'title') || 'Note de suivi' },
          { label: 'Contenu', value: getStringField(note, 'content') || 'Aucun contenu renseigné' },
          { label: 'Date', value: formatShortDate(note.createdAt) },
        ],
        href: '/dashboard/coach/coaching',
        id: `note-${note.id}`,
        meta: 'Note partagée',
        studentName: getPersonName(student),
        title: getStringField(note, 'title') || 'Note de suivi',
        type: 'note' as const,
      }
    }),
    ...exercises.docs.map((exercise) => {
      const studentId = getRelationId(exercise.student)
      const student = studentId ? studentsById.get(String(studentId)) : exercise.student
      const status = getStringField(exercise, 'status') || 'assigned'

      return {
        createdAt: getStringField(exercise, 'createdAt') || getStringField(exercise, 'assignedAt'),
        details: [
          { label: 'Étudiant', value: getPersonName(student) },
          { label: 'Type', value: 'Exercice attribué' },
          { label: 'Statut', value: exerciseStatusLabels[status] || 'Exercice' },
          {
            label: 'Consignes',
            value: getStringField(exercise, 'instructions') || 'Aucune consigne renseignée',
          },
          {
            label: 'Échéance',
            value: formatShortDate(getStringField(exercise, 'dueDate')),
          },
        ],
        href: '/dashboard/coach/exercices',
        id: `exercise-${exercise.id}`,
        meta: exerciseStatusLabels[status] || 'Exercice',
        studentName: getPersonName(student),
        title: getStringField(exercise, 'title') || 'Exercice attribué',
        type: 'exercise' as const,
      }
    }),
  ]
    .sort((left, right) => {
      const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0
      const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0

      return rightDate - leftDate
    })
    .slice(0, 6)

  return (
    <div>
      <CoachTopbar
        title="Étudiants assignés"
        description="Consultez les profils des étudiants suivis par le coach."
      />

      <div className="mindly-stack-lg">
        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">
              {students.length > 0 ? 'Mes étudiants' : 'Aucun étudiant assigné'}
            </CardTitle>
          </CardHeader>

          <CardContent className="mindly-feature-content">
            {students.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {students.map((student) => (
                  <article
                    key={student.id}
                    className="rounded-2xl border border-border bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-dream-heading dark:text-white">
                          {getPersonName(student)}
                        </h2>
                        {student.email ? (
                          <p className="mt-1 truncate text-sm text-dream-muted dark:text-white/65">
                            {student.email}
                          </p>
                        ) : null}
                      </div>
                      <span className="mindly-ui-badge shrink-0">
                        {student.sessionsCount} session{student.sessionsCount > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white p-4 dark:bg-white/[0.04]">
                        <p className="text-2xl font-bold text-dream-heading dark:text-white">
                          {student.notesCount}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-dream-muted dark:text-white/65">
                          Notes partagées
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 dark:bg-white/[0.04]">
                        <p className="text-2xl font-bold text-dream-heading dark:text-white">
                          {student.exercisesCount}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-dream-muted dark:text-white/65">
                          Exercices
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link className="mindly-ui-badge" href="/dashboard/coach/coaching">
                        Voir les notes
                      </Link>
                      <Link className="mindly-ui-badge" href="/dashboard/coach/exercices">
                        Voir exercices
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <>
                <p className="mindly-feature-text">
                  Les étudiants apparaissent ici quand ils démarrent une session de coaching
                  classique avec vous.
                </p>

                <div className="mt-4">
                  <span className="mindly-ui-badge">Aucun étudiant</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">Suivi partagé</CardTitle>
          </CardHeader>

          <CardContent className="mindly-feature-content">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                <p className="text-2xl font-bold text-dream-heading dark:text-white">
                  {sessions.docs.length}
                </p>
                <p className="mt-1 text-xs font-semibold text-dream-muted dark:text-white/65">
                  Sessions classiques
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                <p className="text-2xl font-bold text-dream-heading dark:text-white">
                  {notes.docs.length}
                </p>
                <p className="mt-1 text-xs font-semibold text-dream-muted dark:text-white/65">
                  Notes partagées
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                <p className="text-2xl font-bold text-dream-heading dark:text-white">
                  {exercises.docs.length}
                </p>
                <p className="mt-1 text-xs font-semibold text-dream-muted dark:text-white/65">
                  Exercices attribués
                </p>
              </div>
            </div>

            {latestSharedFollowUp.length > 0 ? (
              <div className="mt-5 space-y-3">
                {latestSharedFollowUp.map((item) => (
                  <details
                    key={item.id}
                    className="group rounded-2xl border border-border bg-white transition open:border-violet-300 open:bg-violet-50/50 dark:border-white/10 dark:bg-white/[0.04] dark:open:bg-white/[0.08]"
                  >
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-dream-heading dark:text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-dream-muted dark:text-white/65">
                          {item.studentName} - {item.meta}
                        </p>
                      </div>

                      <span className="flex shrink-0 items-center gap-3">
                        <span className="mindly-ui-badge">{formatShortDate(item.createdAt)}</span>
                        <span className="text-lg leading-none text-violet-500 transition group-open:rotate-180">
                          v
                        </span>
                      </span>
                    </summary>

                    <div className="border-t border-border px-4 pb-4 pt-3 dark:border-white/10">
                      <dl className="grid gap-3 md:grid-cols-2">
                        {item.details.map((detail) => (
                          <div
                            key={`${item.id}-${detail.label}`}
                            className="rounded-2xl bg-white p-3 dark:bg-white/[0.04]"
                          >
                            <dt className="text-xs font-bold uppercase text-dream-muted dark:text-white/50">
                              {detail.label}
                            </dt>
                            <dd className="mt-1 whitespace-pre-line text-sm font-semibold text-dream-heading dark:text-white">
                              {detail.value}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <Link className="mt-3 inline-flex mindly-ui-badge" href={item.href}>
                        Ouvrir la page
                      </Link>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <p className="mt-5 mindly-feature-text">
                Aucun suivi partagé n'est encore disponible pour vos étudiants assignés.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
