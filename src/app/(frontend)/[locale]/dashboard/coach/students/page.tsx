import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'

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

function formatShortDate(value: string | null | undefined, locale: string, fallback: string) {
  if (!value) return fallback

  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
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

  const t = await getTranslations('dashboard.coach.students')
  const locale = await getLocale()

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
          { label: t('student'), value: getPersonName(student) },
          { label: t('type'), value: t('typeSession') },
          { label: t('status'), value: status === 'closed' ? t('statusClosed') : t('statusOpen') },
          {
            label: t('date'),
            value: formatShortDate(getStringField(session, 'startedAt') || session.createdAt, locale, t('dateNotSpecified')),
          },
        ],
        href: '/dashboard/coach/coaching',
        id: `session-${session.id}`,
        meta: status === 'closed' ? t('metaClosed') : t('metaOpen'),
        studentName: getPersonName(student),
        title: getStringField(session, 'title') || t('defaultSession'),
        type: 'session' as const,
      }
    }),
    ...notes.docs.map((note) => {
      const studentId = getRelationId(note.student)
      const student = studentId ? studentsById.get(String(studentId)) : note.student

      return {
        createdAt: getStringField(note, 'createdAt'),
        details: [
          { label: t('student'), value: getPersonName(student) },
          { label: t('type'), value: t('typeNote') },
          { label: t('titleLabel'), value: getStringField(note, 'title') || t('defaultNote') },
          { label: t('content'), value: getStringField(note, 'content') || t('noContent') },
          { label: t('date'), value: formatShortDate(note.createdAt, locale, t('dateNotSpecified')) },
        ],
        href: '/dashboard/coach/coaching',
        id: `note-${note.id}`,
        meta: t('metaNote'),
        studentName: getPersonName(student),
        title: getStringField(note, 'title') || t('defaultNote'),
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
          { label: t('student'), value: getPersonName(student) },
          { label: t('type'), value: t('typeExercise') },
          {
            label: t('status'),
            value: status === 'assigned' ? t('statusAssigned')
              : status === 'completed' ? t('statusCompleted')
              : status === 'in_progress' ? t('statusInProgress')
              : status === 'missed' ? t('statusMissed')
              : t('statusReviewed'),
          },
          {
            label: t('instructions'),
            value: getStringField(exercise, 'instructions') || t('noInstructions'),
          },
          {
            label: t('dueDate'),
            value: formatShortDate(getStringField(exercise, 'dueDate'), locale, t('dateNotSpecified')),
          },
        ],
        href: '/dashboard/coach/exercices',
        id: `exercise-${exercise.id}`,
        meta: status === 'assigned' ? t('statusAssigned')
          : status === 'completed' ? t('statusCompleted')
          : status === 'in_progress' ? t('statusInProgress')
          : status === 'missed' ? t('statusMissed')
          : t('statusReviewed'),
        studentName: getPersonName(student),
        title: getStringField(exercise, 'title') || t('defaultExercise'),
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
      <CoachTopbar title={t('title')} description={t('description')} />

      <div className="mindly-stack-lg">
        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">
              {students.length > 0 ? t('myStudents') : t('noStudents')}
            </CardTitle>
          </CardHeader>

          <CardContent className="mindly-feature-content">
            {students.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {students.map((student) => (
                  <article
                    key={student.id}
                    className="student-dreams-latest-box"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="mindly-feature-reference">{getPersonName(student)}</p>
                        {student.email ? (
                          <p className="mindly-feature-text mt-1">{student.email}</p>
                        ) : null}
                      </div>
                      <span className="mindly-ui-badge shrink-0">
                        {student.sessionsCount} {student.sessionsCount > 1 ? t('sessionsPlural') : t('sessions')}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="mindly-ui-badge">{student.notesCount} {t('sharedNotes').toLowerCase()}</span>
                      <span className="mindly-ui-badge">{student.exercisesCount} {t('exercises').toLowerCase()}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link className="mindly-ui-badge" href="/dashboard/coach/coaching">
                        {t('seeNotes')}
                      </Link>
                      <Link className="mindly-ui-badge" href="/dashboard/coach/exercices">
                        {t('seeExercises')}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <>
                <p className="mindly-feature-text">{t('emptyDescription')}</p>
                <div className="mt-4">
                  <span className="mindly-ui-badge">{t('emptyBadge')}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">{t('sharedFollowUp')}</CardTitle>
          </CardHeader>

          <CardContent className="mindly-feature-content">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="student-dreams-latest-box">
                <p className="mindly-stat-value">
                  {sessions.docs.length}
                </p>
                <p className="mindly-feature-text mt-1">
                  {t('classicSessions')}
                </p>
              </div>

              <div className="student-dreams-latest-box">
                <p className="mindly-stat-value">
                  {notes.docs.length}
                </p>
                <p className="mindly-feature-text mt-1">
                  {t('sharedNotes')}
                </p>
              </div>

              <div className="student-dreams-latest-box">
                <p className="mindly-stat-value">
                  {exercises.docs.length}
                </p>
                <p className="mindly-feature-text mt-1">
                  {t('assignedExercises')}
                </p>
              </div>
            </div>

            {latestSharedFollowUp.length > 0 ? (
              <div className="mt-5 space-y-3">
                {latestSharedFollowUp.map((item) => (
                  <details
                    key={item.id}
                    className="student-dreams-latest-box group"
                  >
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="mindly-feature-reference">{item.title}</p>
                        <p className="mindly-feature-text mt-1">
                          {item.studentName} — {item.meta}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="mindly-ui-badge">{formatShortDate(item.createdAt, locale, t('dateNotSpecified'))}</span>
                        <span className="mindly-feature-text transition group-open:rotate-180 inline-block">▾</span>
                      </span>
                    </summary>

                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {item.details.map((detail) => (
                        <div key={`${item.id}-${detail.label}`} className="student-dreams-latest-box">
                          <p className="mindly-dashboard-eyebrow">{detail.label}</p>
                          <p className="mindly-feature-text mt-1 whitespace-pre-line">{detail.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <Link className="mindly-ui-badge" href={item.href}>
                        {t('openPage')}
                      </Link>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <p className="mt-5 mindly-feature-text">{t('noSharedFollowUp')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
