import { CheckCircle2, Clock3, NotebookPen } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'

import { StudentExerciseCheckinForm } from '@/components/dashboard/student/StudentExerciseCheckinForm'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import { translateExerciseToEnglish } from '@/utilities/translateExercise'

function getCoachName(coach: unknown): string {
  if (!coach || typeof coach !== 'object') return ''

  const data = coach as {
    email?: string | null
    firstName?: string | null
    lastName?: string | null
  }
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim()

  return fullName || data.email || ''
}

export default async function StudentCheckinPage() {
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })
  const t = await getTranslations('dashboard.student.checkin')
  const locale = await getLocale()

  function formatDate(value?: string | null) {
    if (!value) return t('noDueDate')

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  }

  const statusLabels: Record<string, string> = {
    assigned: t('status.assigned'),
    in_progress: t('status.in_progress'),
    completed: t('status.completed'),
    reviewed: t('status.reviewed'),
    missed: t('status.missed'),
  }

  function getStatusLabel(status: string) {
    return statusLabels[status] ?? status
  }

  const exercises = user
    ? await payload.find({
        collection: 'student-exercices',
        user,
        overrideAccess: false,
        where: {
          student: {
            equals: user.id,
          },
        },
        depth: 1,
        sort: '-createdAt',
        limit: 50,
      })
    : { docs: [] }

  const now = Date.now()
  const overdueExerciseIds = exercises.docs
    .filter((exercise) => {
      if (exercise.status !== 'assigned' && exercise.status !== 'in_progress') return false
      if (!exercise.dueDate) return false

      const dueTime = new Date(exercise.dueDate).getTime()

      return Number.isFinite(dueTime) && dueTime <= now
    })
    .map((exercise) => exercise.id)

  if (user && overdueExerciseIds.length > 0) {
    await Promise.all(
      overdueExerciseIds.map((id) =>
        payload.update({
          collection: 'student-exercices',
          id,
          user,
          overrideAccess: false,
          data: {
            status: 'missed',
          },
        }),
      ),
    )
  }

  const overdueIds = new Set(overdueExerciseIds.map(String))
  const displayedExercises = exercises.docs.map((exercise) => ({
    ...exercise,
    status: overdueIds.has(String(exercise.id)) ? 'missed' : exercise.status,
  }))

  const translationsMap = locale === 'en' && displayedExercises.length > 0
    ? new Map(
        await Promise.all(
          displayedExercises.map(async (exercise) => {
            const tx = await translateExerciseToEnglish(exercise.id, {
              title: exercise.title,
              instructions: exercise.instructions,
              reason: exercise.reason,
              coachFeedback: exercise.coachFeedback,
            })
            return [String(exercise.id), tx] as const
          }),
        ),
      )
    : null

  const sentCount = displayedExercises.filter((exercise) => exercise.status === 'completed').length
  const reviewedCount = displayedExercises.filter((exercise) => exercise.status === 'reviewed').length
  const finishedCount = sentCount + reviewedCount
  const todoCount = Math.max(displayedExercises.length - finishedCount, 0)
  const progressPercent =
    displayedExercises.length > 0
      ? Math.round((reviewedCount / displayedExercises.length) * 100)
      : 0

  return (
    <div>
      <StudentTopbar
        title={t('topbar.title')}
        description={t('topbar.description')}
      />

      <section className="mindly-card mb-6 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--mindly-primary)]">
              {t('progressTitle')}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--mindly-text-strong)]">
              {progressPercent}%
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--mindly-text-soft)]">
              {t('progressHint')}
            </p>
          </div>

          <div className="w-full md:max-w-md">
            <div
              className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.08]"
              aria-label={t('progressAriaLabel', { percent: progressPercent })}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs font-medium text-[var(--mindly-text-soft)]">
              <span>0%</span>
              <span>{t('progressCounter', { reviewed: reviewedCount, total: displayedExercises.length })}</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="mindly-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--mindly-primary-soft-3)] text-[var(--mindly-primary)]">
            <NotebookPen className="h-5 w-5" />
          </div>
          <p className="text-sm text-[var(--mindly-text-soft)]">{t('statReceived')}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--mindly-text-strong)]">
            {displayedExercises.length}
          </p>
        </article>

        <article className="mindly-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--mindly-primary-soft-3)] text-[var(--mindly-primary)]">
            <Clock3 className="h-5 w-5" />
          </div>
          <p className="text-sm text-[var(--mindly-text-soft)]">{t('statTodo')}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--mindly-text-strong)]">{todoCount}</p>
        </article>

        <article className="mindly-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--mindly-primary-soft-3)] text-[var(--mindly-primary)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="text-sm text-[var(--mindly-text-soft)]">{t('statDone')}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--mindly-text-strong)]">
            {finishedCount}
          </p>
        </article>
      </div>

      <div className="mindly-stack-lg">
        {displayedExercises.length > 0 ? (
          displayedExercises.map((exercise) => {
            const completed = exercise.status === 'completed' || exercise.status === 'reviewed'
            const missed = exercise.status === 'missed'
            const tx = translationsMap?.get(String(exercise.id))

            return (
              <article key={exercise.id} className="mindly-feature-card">
                <div className="mindly-feature-header">
                  <div>
                    <h2 className="mindly-feature-title">{tx?.title ?? exercise.title}</h2>
                    {getCoachName(exercise.coach) ? (
                      <p className="mt-2 text-sm text-dream-muted dark:text-white/65">
                        {t('coachLabel', { name: getCoachName(exercise.coach) })}
                      </p>
                    ) : null}
                  </div>

                  <span className="mindly-ui-badge">{getStatusLabel(exercise.status)}</span>
                </div>

                <div className="mindly-feature-content">
                  <p className="text-sm text-dream-muted dark:text-white/65">
                    {t('dueLabel', { date: formatDate(exercise.dueDate) })}
                  </p>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.06]">
                    <p className="text-sm font-semibold text-dream-heading dark:text-white">
                      {t('instructionsTitle')}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-dream-muted dark:text-white/65">
                      {tx?.instructions ?? exercise.instructions}
                    </p>
                  </div>

                  {(tx?.reason ?? exercise.reason) ? (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.06]">
                      <p className="text-sm font-semibold text-dream-heading dark:text-white">
                        {t('reasonTitle')}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-dream-muted dark:text-white/65">
                        {tx?.reason ?? exercise.reason}
                      </p>
                    </div>
                  ) : null}

                  <StudentExerciseCheckinForm
                    completed={completed}
                    exerciseId={exercise.id}
                    missed={missed}
                  />

                  {(tx?.coachFeedback ?? exercise.coachFeedback) ? (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-100">
                        {t('feedbackTitle')}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-emerald-700 dark:text-emerald-100/80">
                        {tx?.coachFeedback ?? exercise.coachFeedback}
                      </p>
                    </div>
                  ) : completed ? (
                    <div className="mt-4 rounded-2xl bg-sky-50 p-4 dark:bg-sky-500/10">
                      <p className="text-sm font-semibold text-sky-800 dark:text-sky-100">
                        {t('awaitingFeedbackTitle')}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-sky-700 dark:text-sky-100/80">
                        {t('awaitingFeedbackText')}
                      </p>
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })
        ) : (
          <section className="mindly-feature-card">
            <div className="mindly-feature-content">
              <p className="mindly-feature-text">
                {t('empty')}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
