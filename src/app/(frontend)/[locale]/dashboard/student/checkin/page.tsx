import { CheckCircle2, Clock3, NotebookPen } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentExerciseCheckinForm } from '@/components/dashboard/student/StudentExerciseCheckinForm'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

function getCoachName(coach: unknown) {
  if (!coach || typeof coach !== 'object') return 'Coach'

  const data = coach as {
    email?: string | null
    firstName?: string | null
    lastName?: string | null
  }
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim()

  return fullName || data.email || 'Coach'
}

function formatDate(value?: string | null) {
  if (!value) return 'Sans echeance'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'assigned':
      return 'A faire'
    case 'in_progress':
      return 'En cours'
    case 'completed':
      return 'Envoye'
    case 'reviewed':
      return 'Corrige'
    case 'missed':
      return 'Non fait'
    default:
      return status
  }
}

export default async function StudentCheckinPage() {
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })

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
        title="Ma progression"
        description="Suivez votre evolution selon les exercices donnes par votre coach et valides apres feedback."
      />

      <section className="mindly-card mb-6 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--mindly-primary)]">
              Progression globale
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--mindly-text-strong)]">
              {progressPercent}%
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--mindly-text-soft)]">
              La barre avance quand votre coach valide un exercice avec un feedback.
            </p>
          </div>

          <div className="w-full md:max-w-md">
            <div
              className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.08]"
              aria-label={`Progression globale ${progressPercent}%`}
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
              <span>{reviewedCount} exercices valides sur {displayedExercises.length}</span>
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
          <p className="text-sm text-[var(--mindly-text-soft)]">Exercices recus</p>
          <p className="mt-2 text-2xl font-bold text-[var(--mindly-text-strong)]">
            {displayedExercises.length}
          </p>
        </article>

        <article className="mindly-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--mindly-primary-soft-3)] text-[var(--mindly-primary)]">
            <Clock3 className="h-5 w-5" />
          </div>
          <p className="text-sm text-[var(--mindly-text-soft)]">A faire</p>
          <p className="mt-2 text-2xl font-bold text-[var(--mindly-text-strong)]">{todoCount}</p>
        </article>

        <article className="mindly-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--mindly-primary-soft-3)] text-[var(--mindly-primary)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="text-sm text-[var(--mindly-text-soft)]">Exercices termines</p>
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

            return (
              <article key={exercise.id} className="mindly-feature-card">
                <div className="mindly-feature-header">
                  <div>
                    <h2 className="mindly-feature-title">{exercise.title}</h2>
                    <p className="mt-2 text-sm text-dream-muted dark:text-white/65">
                      Coach : {getCoachName(exercise.coach)}
                    </p>
                  </div>

                  <span className="mindly-ui-badge">{getStatusLabel(exercise.status)}</span>
                </div>

                <div className="mindly-feature-content">
                  <p className="text-sm text-dream-muted dark:text-white/65">
                    Echeance : {formatDate(exercise.dueDate)}
                  </p>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.06]">
                    <p className="text-sm font-semibold text-dream-heading dark:text-white">
                      Consignes
                    </p>
                    <p className="mt-2 text-sm leading-6 text-dream-muted dark:text-white/65">
                      {exercise.instructions}
                    </p>
                  </div>

                  {exercise.reason ? (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.06]">
                      <p className="text-sm font-semibold text-dream-heading dark:text-white">
                        Pourquoi cet exercice
                      </p>
                      <p className="mt-2 text-sm leading-6 text-dream-muted dark:text-white/65">
                        {exercise.reason}
                      </p>
                    </div>
                  ) : null}

                  <StudentExerciseCheckinForm
                    completed={completed}
                    exerciseId={exercise.id}
                    missed={missed}
                  />

                  {exercise.coachFeedback ? (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-100">
                        Feedback du coach
                      </p>
                      <p className="mt-2 text-sm leading-6 text-emerald-700 dark:text-emerald-100/80">
                        {exercise.coachFeedback}
                      </p>
                    </div>
                  ) : completed ? (
                    <div className="mt-4 rounded-2xl bg-sky-50 p-4 dark:bg-sky-500/10">
                      <p className="text-sm font-semibold text-sky-800 dark:text-sky-100">
                        En attente du feedback du coach
                      </p>
                      <p className="mt-2 text-sm leading-6 text-sky-700 dark:text-sky-100/80">
                        Votre exercice est envoye. La progression augmentera apres validation du coach.
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
                Aucun exercice ne vous a encore ete attribue. Vous recevrez une notification quand
                votre coach vous proposera un exercice personnalise.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
