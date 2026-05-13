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

  const todoCount = displayedExercises.filter(
    (exercise) => exercise.status === 'assigned' || exercise.status === 'in_progress',
  ).length
  const completedCount = displayedExercises.filter(
    (exercise) => exercise.status === 'completed' || exercise.status === 'reviewed',
  ).length

  return (
    <div>
      <StudentTopbar
        title="Check-in exercices"
        description="Consultez les exercices donnes par votre coach, realisez-les puis envoyez votre suivi."
      />

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
          <p className="text-sm text-[var(--mindly-text-soft)]">Check-ins envoyes</p>
          <p className="mt-2 text-2xl font-bold text-[var(--mindly-text-strong)]">
            {completedCount}
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
