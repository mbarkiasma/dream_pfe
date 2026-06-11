import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'

import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRelationId } from '@/lib/coaching'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

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

export default async function CoachStudentsPage() {
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })

  if (!user) {
    redirect('/login')
  }

  const t = await getTranslations('dashboard.coach.students')

  const sessions = await payload.find({
    collection: 'coaching-sessions',
    user,
    overrideAccess: false,
    where: {
      and: [
        { coach: { equals: user.id } },
        { mode: { equals: 'classic' } },
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

  const exercises =
    studentIds.length > 0
      ? await payload.find({
          collection: 'student-exercices',
          user,
          overrideAccess: false,
          where: { student: { in: studentIds } },
          depth: 0,
          limit: 500,
        })
      : { docs: [] }

  const exercisesCountByStudent = new Map<string, number>()
  const exercisesCompletedByStudent = new Map<string, number>()
  const exercisesMissedByStudent = new Map<string, number>()

  exercises.docs.forEach((exercise) => {
    const studentId = getRelationId(exercise.student)
    if (!studentId) return
    const key = String(studentId)
    exercisesCountByStudent.set(key, (exercisesCountByStudent.get(key) ?? 0) + 1)
    if (exercise.status === 'completed' || exercise.status === 'reviewed') {
      exercisesCompletedByStudent.set(key, (exercisesCompletedByStudent.get(key) ?? 0) + 1)
    } else if (exercise.status === 'missed') {
      exercisesMissedByStudent.set(key, (exercisesMissedByStudent.get(key) ?? 0) + 1)
    }
  })

  const students = Array.from(studentsById.entries()).map(([id, student]) => {
    const total = exercisesCountByStudent.get(id) ?? 0
    const completed = exercisesCompletedByStudent.get(id) ?? 0
    const missed = exercisesMissedByStudent.get(id) ?? 0
    return {
      id,
      name: getPersonName(student),
      sessionsCount: sessionsCountByStudent.get(id) ?? 0,
      exercisesTotal: total,
      exercisesCompleted: completed,
      exercisesMissed: missed,
      progressPct: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  })

  return (
    <div>
      <CoachTopbar title={t('title')} description={t('description')} />

      <Card className="mindly-feature-card">
        <CardHeader className="mindly-feature-header">
          <CardTitle className="mindly-feature-title">
            {students.length > 0 ? t('myStudents') : t('noStudents')}
          </CardTitle>
        </CardHeader>

        <CardContent className="mindly-feature-content">
          {students.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {students.map((student) => (
                <Link
                  key={student.id}
                  href={`/dashboard/coach/students/${student.id}`}
                  className="student-dreams-latest-box flex flex-col gap-3 hover:border-dream-accent/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="mindly-feature-reference truncate">{student.name}</p>
                    <span className="mindly-ui-badge shrink-0 text-xs">
                      {student.sessionsCount} {student.sessionsCount > 1 ? t('sessionsPlural') : t('sessions')}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-dream-muted dark:text-white/55">{t('progress')}</span>
                      <span className="text-xs font-semibold text-dream-heading dark:text-white">
                        {student.exercisesCompleted}/{student.exercisesTotal}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-white/10">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${student.progressPct}%` }}
                      />
                    </div>
                    {student.exercisesMissed > 0 ? (
                      <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                        {student.exercisesMissed} {t('exercisesMissed')}
                      </p>
                    ) : null}
                  </div>

                  <p className="text-xs text-dream-muted dark:text-white/40">{t('openDossier')} →</p>
                </Link>
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
    </div>
  )
}
