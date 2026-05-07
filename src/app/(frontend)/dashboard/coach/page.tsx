import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { AnalysePersonnalite, CoachingEvent, CoachingSession, User } from '@/payload-types'
import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { CoachStatsCards } from '@/components/dashboard/coach/CoachStatsCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRelationId } from '@/lib/coaching'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

type StudentSummary = {
  email?: string | null
  id: string | number
  name: string
  source: string
}

function isUser(value: unknown): value is User {
  return Boolean(value && typeof value === 'object' && 'id' in value)
}

function getStudentName(student: User) {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim()

  return fullName || student.email || 'Etudiant'
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Date non renseignee'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function addStudent(
  students: Map<string, StudentSummary>,
  student: unknown,
  source: string,
) {
  const studentId = getRelationId(student)

  if (!studentId || students.has(String(studentId))) return

  if (isUser(student)) {
    students.set(String(studentId), {
      email: student.email,
      id: studentId,
      name: getStudentName(student),
      source,
    })
    return
  }

  students.set(String(studentId), {
    id: studentId,
    name: `Etudiant #${studentId}`,
    source,
  })
}

function getUpcomingEvents(events: CoachingEvent[]) {
  const now = Date.now()

  return events.filter((event) => {
    if (event.status !== 'published') return false

    return new Date(event.scheduledAt).getTime() >= now
  })
}

export default async function CoachDashboardPage() {
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
      coach: {
        equals: user.id,
      },
    },
    depth: 1,
    sort: '-createdAt',
    limit: 100,
  })

  const events = await payload.find({
    collection: 'coaching-events',
    user,
    overrideAccess: false,
    where: {
      coach: {
        equals: user.id,
      },
    },
    depth: 0,
    sort: 'scheduledAt',
    limit: 100,
  })

  const eventIds = events.docs.map((event) => event.id)

  const registrations =
    eventIds.length > 0
      ? await payload.find({
          collection: 'coaching-registrations',
          user,
          overrideAccess: false,
          where: {
            event: {
              in: eventIds,
            },
          },
          depth: 1,
          sort: '-registeredAt',
          limit: 100,
        })
      : { docs: [] }

  const students = new Map<string, StudentSummary>()

  sessions.docs.forEach((session) =>
    addStudent(students, (session as CoachingSession).student, 'Session classique'),
  )
  registrations.docs.forEach((registration) =>
    addStudent(students, registration.student, 'Inscription seance'),
  )

  const studentList = Array.from(students.values()).slice(0, 5)
  const studentIds = Array.from(students.keys())
  const upcomingEvents = getUpcomingEvents(events.docs as CoachingEvent[])

  const orientationAnalyses =
    studentIds.length > 0
      ? await payload.find({
          collection: 'analyse-personnalite',
          user,
          overrideAccess: false,
          where: {
            and: [
              {
                user: {
                  in: studentIds,
                },
              },
              {
                niveauConfiance: {
                  equals: 'modere',
                },
              },
            ],
          },
          depth: 1,
          sort: '-date',
          limit: 5,
        })
      : { docs: [] }

  return (
    <div>
      <CoachTopbar
        title="Dashboard Coach"
        description="Bienvenue dans votre espace de suivi des etudiants, des exercices et des rendez-vous."
      />

      <CoachStatsCards
        activeExercisesCount={0}
        assignedStudentsCount={students.size}
        orientationCasesCount={orientationAnalyses.docs.length}
        upcomingEventsCount={upcomingEvents.length}
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">Etudiants a suivre</CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              {studentList.length > 0 ? (
                <div className="mindly-stack-sm">
                  {studentList.map((student) => (
                    <div key={student.id} className="student-dreams-latest-box">
                      <div className="student-dreams-latest-header">
                        <div>
                          <p className="mindly-feature-reference">{student.name}</p>
                          <p className="mindly-feature-text mt-1">
                            {student.email || 'Email non renseigne'}
                          </p>
                        </div>
                        <span className="mindly-ui-badge">{student.source}</span>
                      </div>
                    </div>
                  ))}

                  <Link href="/dashboard/coach/students" className="mindly-ui-badge w-fit">
                    Voir les etudiants
                  </Link>
                </div>
              ) : (
                <>
                  <p className="mindly-feature-text">
                    Aucun etudiant n&apos;est encore rattache a vos sessions ou seances.
                  </p>

                  <div className="mt-4">
                    <span className="mindly-ui-badge">Aucun etudiant</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mindly-stack-lg">
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">Exercices recents</CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              <p className="mindly-feature-text">
                Aucun exercice n&apos;est encore attribue. Le module exercices pourra etre connecte a
                une collection dediee lorsque vous commencerez cette partie.
              </p>

              <div className="mt-4">
                <span className="mindly-ui-badge">0 exercice actif</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">Orientation vers psychologue</CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              {orientationAnalyses.docs.length > 0 ? (
                <div className="mindly-stack-sm">
                  {(orientationAnalyses.docs as AnalysePersonnalite[]).map((analyse) => (
                    <div key={analyse.id} className="student-dreams-latest-box">
                      <p className="mindly-feature-reference">
                        {isUser(analyse.user) ? getStudentName(analyse.user) : 'Etudiant'}
                      </p>
                      <p className="mindly-feature-text mt-1">
                        Analyse du {formatDate(analyse.date)}
                      </p>
                      <span className="mindly-ui-badge mt-3">Confiance moderee</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="mindly-feature-text">
                    Aucun cas prioritaire detecte parmi les etudiants suivis pour le moment.
                  </p>

                  <div className="mt-4">
                    <span className="mindly-ui-badge">Aucun cas</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
