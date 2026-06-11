import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'

import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRelationId } from '@/lib/coaching'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

function getPersonName(person: unknown, fallback = 'Étudiant') {
  if (!person || typeof person !== 'object') return fallback
  const data = person as { email?: string | null; firstName?: string | null; lastName?: string | null }
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim()
  return fullName || data.email || fallback
}

function formatDate(value: string | null | undefined, locale: string, fallback: string) {
  if (!value) return fallback
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const STATUS_COLOR: Record<string, string> = {
  completed: 'text-emerald-700 dark:text-emerald-300',
  reviewed: 'text-emerald-700 dark:text-emerald-300',
  missed: 'text-red-600 dark:text-red-400',
  in_progress: 'text-amber-600 dark:text-amber-400',
  assigned: 'text-dream-muted dark:text-white/55',
}

export default async function StudentDossierPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })

  if (!user) redirect('/login')

  const t = await getTranslations('dashboard.coach.studentDossier')
  const locale = await getLocale()

  // Verify the coach has a classic session with this student
  const sessionCheck = await payload.find({
    collection: 'coaching-sessions',
    user,
    overrideAccess: false,
    where: {
      and: [
        { coach: { equals: user.id } },
        { student: { equals: studentId } },
        { mode: { equals: 'classic' } },
      ],
    },
    depth: 1,
    limit: 1,
  })

  if (sessionCheck.docs.length === 0) notFound()

  // Fetch student info from the session
  const studentRaw = sessionCheck.docs[0]?.student
  const studentName = getPersonName(studentRaw)
  const studentEmail =
    studentRaw && typeof studentRaw === 'object'
      ? (studentRaw as { email?: string | null }).email
      : null

  // Fetch all data in parallel
  const [allSessions, exercises, notes] = await Promise.all([
    payload.find({
      collection: 'coaching-sessions',
      user,
      overrideAccess: false,
      where: {
        and: [
          { coach: { equals: user.id } },
          { student: { equals: studentId } },
          { mode: { equals: 'classic' } },
        ],
      },
      depth: 0,
      sort: '-startedAt',
      limit: 50,
    }),
    payload.find({
      collection: 'student-exercices',
      user,
      overrideAccess: false,
      where: { student: { equals: studentId } },
      depth: 0,
      sort: '-assignedAt',
      limit: 100,
    }),
    payload.find({
      collection: 'coach-notes',
      user,
      overrideAccess: false,
      where: { student: { equals: studentId } },
      depth: 0,
      sort: '-createdAt',
      limit: 50,
    }),
  ])

  const totalExercises = exercises.docs.length
  const completedExercises = exercises.docs.filter(
    (e) => e.status === 'completed' || e.status === 'reviewed',
  ).length
  const missedExercises = exercises.docs.filter((e) => e.status === 'missed').length
  const progressPct = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0

  return (
    <div>
      <CoachTopbar
        title={studentName}
        description={studentEmail ?? t('noEmail')}
      />

      <div className="mb-4">
        <Link href="/dashboard/coach/students" className="mindly-ui-badge text-xs">
          ← {t('backToList')}
        </Link>
      </div>

      <div className="mindly-stack-lg">
        {/* Progression */}
        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">{t('progressTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="mindly-feature-content">
            {totalExercises > 0 ? (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-dream-muted dark:text-white/55">
                      {completedExercises}/{totalExercises} {t('exercisesDone')}
                    </span>
                    <span className="text-sm font-semibold text-dream-heading dark:text-white">
                      {progressPct}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/10">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="mindly-ui-badge text-xs text-emerald-700 dark:text-emerald-300">
                      {completedExercises} {t('statusDone')}
                    </span>
                    {missedExercises > 0 ? (
                      <span className="mindly-ui-badge text-xs text-red-600 dark:text-red-400">
                        {missedExercises} {t('statusMissed')}
                      </span>
                    ) : null}
                    {totalExercises - completedExercises - missedExercises > 0 ? (
                      <span className="mindly-ui-badge text-xs">
                        {totalExercises - completedExercises - missedExercises} {t('statusPending')}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  {exercises.docs.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-dream-heading dark:text-white truncate">
                          {exercise.title}
                        </p>
                        {exercise.dueDate ? (
                          <p className="text-xs text-dream-muted dark:text-white/40 mt-0.5">
                            {t('dueDate')} {formatDate(exercise.dueDate, locale, t('noDate'))}
                          </p>
                        ) : null}
                      </div>
                      <span className={`shrink-0 text-xs font-medium ${STATUS_COLOR[exercise.status] ?? STATUS_COLOR.assigned}`}>
                        {exercise.status === 'completed' ? t('statusDone')
                          : exercise.status === 'reviewed' ? t('statusReviewed')
                          : exercise.status === 'missed' ? t('statusMissed')
                          : exercise.status === 'in_progress' ? t('statusInProgress')
                          : t('statusAssigned')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="mindly-feature-text">{t('noExercises')}</p>
            )}
          </CardContent>
        </Card>

        {/* Séances */}
        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">
              {t('sessionsTitle')}
              <span className="ml-2 text-sm font-normal text-dream-muted dark:text-white/40">
                ({allSessions.docs.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="mindly-feature-content">
            {allSessions.docs.length > 0 ? (
              <div className="space-y-2">
                {allSessions.docs.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-dream-heading dark:text-white truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-dream-muted dark:text-white/40 mt-0.5">
                        {formatDate(session.startedAt, locale, t('noDate'))}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-medium ${session.status === 'open' ? 'text-emerald-700 dark:text-emerald-300' : 'text-dream-muted dark:text-white/40'}`}>
                      {session.status === 'open' ? t('sessionOpen') : t('sessionClosed')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mindly-feature-text">{t('noSessions')}</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">
              {t('notesTitle')}
              <span className="ml-2 text-sm font-normal text-dream-muted dark:text-white/40">
                ({notes.docs.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="mindly-feature-content">
            {notes.docs.length > 0 ? (
              <div className="space-y-2">
                {notes.docs.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-border bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-dream-heading dark:text-white truncate">
                        {note.title || t('defaultNote')}
                      </p>
                      <span className="text-xs text-dream-muted dark:text-white/40 shrink-0">
                        {formatDate(note.createdAt, locale, t('noDate'))}
                      </span>
                    </div>
                    {note.content ? (
                      <p className="text-sm text-dream-muted dark:text-white/55 leading-6 whitespace-pre-line line-clamp-3">
                        {note.content}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mindly-feature-text">{t('noNotes')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
