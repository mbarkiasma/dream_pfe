import { getPayload } from 'payload'
import config from '@payload-config'

import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import { CoachExerciseActions } from '@/components/dashboard/coach/CoachExerciseActions'
import { CoachExerciseForm } from '@/components/dashboard/coach/CoachExerciseForm'
import { getRelationId } from '@/lib/coaching'

function getStudentName(student: unknown) {
  if (!student || typeof student !== 'object') return 'Etudiant'

  const data = student as {
    email?: string | null
    firstName?: string | null
    lastName?: string | null
  }

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim()

  return fullName || data.email || 'Etudiant'
}

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
      return 'Attribue'
    case 'in_progress':
      return 'En cours'
    case 'completed':
      return 'Deja fait'
    case 'reviewed':
      return 'Feedback donne'
    case 'missed':
      return 'Non fait'
    default:
      return status
  }
}

export default async function CoachExercisesPage() {
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })

  const sessions = user
    ? await payload.find({
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
    : { docs: [] }
  const assignedStudents = Array.from(
    sessions.docs
      .reduce((students, session) => {
        const studentId = getRelationId(session.student)

        if (!studentId) return students

        students.set(String(studentId), session.student)

        return students
      }, new Map<string, unknown>())
      .entries(),
  ).map(([id, student]) => ({
    id,
    label: getStudentName(student),
  }))

  const assignedStudentIds = assignedStudents.map((student) => student.id)

  const exercices =
    user && assignedStudentIds.length > 0
      ? await payload.find({
          collection: 'student-exercices',
          user,
          overrideAccess: false,
          where: {
            student: {
              in: assignedStudentIds,
            },
          },
          depth: 1,
          sort: '-createdAt',
          limit: 50,
        })
      : { docs: [] }

  return (
    <div>
      <CoachTopbar
        title="Exercices"
        description="Attribuez des exercices personnalises aux etudiants et suivez leur avancement."
      />

      <div className="mindly-stack-lg">
        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">Attribuer un exercice</CardTitle>
          </CardHeader>
          <CardContent className="mindly-feature-content">
            <CoachExerciseForm students={assignedStudents} />
          </CardContent>
        </Card>

        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">Exercices partages</CardTitle>
          </CardHeader>

          <CardContent className="mindly-feature-content">
            {exercices.docs.length > 0 ? (
              <div className="grid gap-4">
                {exercices.docs.map((exercice) => (
                  <article
                    key={exercice.id}
                    className="rounded-2xl border border-border bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.06]"
                  >
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-dream-heading dark:text-white">
                          {exercice.title}
                        </h2>
                        <p className="mt-1 text-sm text-dream-muted dark:text-white/65">
                          Etudiant : {getStudentName(exercice.student)}
                        </p>
                        <p className="mt-1 text-sm text-dream-muted dark:text-white/65">
                          Donne par : {getCoachName(exercice.coach)}
                        </p>
                      </div>

                      <span className="mindly-ui-badge shrink-0">
                        {getStatusLabel(exercice.status)}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-dream-muted dark:text-white/65">
                      {exercice.instructions}
                    </p>

                    {exercice.reason ? (
                      <p className="mt-3 text-sm leading-6 text-dream-muted dark:text-white/65">
                        Raison : {exercice.reason}
                      </p>
                    ) : null}

                    <p className="mt-3 text-sm text-dream-muted dark:text-white/65">
                      Echeance : {formatDate(exercice.dueDate)}
                    </p>

                    {exercice.studentResponse ? (
                      <div className="mt-4 rounded-2xl bg-white p-4 dark:bg-white/[0.04]">
                        <p className="text-sm font-semibold text-dream-heading dark:text-white">
                          Reponse de l&apos;etudiant
                        </p>
                        <p className="mt-2 text-sm leading-6 text-dream-muted dark:text-white/65">
                          {exercice.studentResponse}
                        </p>
                      </div>
                    ) : null}

                    {exercice.coachFeedback ? (
                      <div className="mt-4 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-100">
                          Feedback du coach
                        </p>
                        <p className="mt-2 text-sm leading-6 text-emerald-700 dark:text-emerald-100/80">
                          {exercice.coachFeedback}
                        </p>
                      </div>
                    ) : null}

                    {String(getRelationId(exercice.coach)) === String(user?.id) &&
                    exercice.status !== 'reviewed' ? (
                      <CoachExerciseActions
                        exercise={{
                          coachFeedback: exercice.coachFeedback,
                          dueDate: exercice.dueDate,
                          id: exercice.id,
                          instructions: exercice.instructions,
                          reason: exercice.reason,
                          status: exercice.status,
                          title: exercice.title,
                        }}
                      />
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mindly-feature-text">Aucun exercice attribue pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
