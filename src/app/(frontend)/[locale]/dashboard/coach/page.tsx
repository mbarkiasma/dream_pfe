import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ChevronRight } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import type { CoachingEvent, CoachingSession, PsyOrientation, User } from '@/payload-types'
import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { CoachStatsCards } from '@/components/dashboard/coach/CoachStatsCards'
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

  return fullName || student.email || 'Étudiant'
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return ''

  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
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
    name: `Étudiant #${studentId}`,
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

  const t = await getTranslations('dashboard.coach.dashboard')
  const locale = await getLocale()

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
    addStudent(students, registration.student, 'Inscription séance'),
  )

  const studentList = Array.from(students.values()).slice(0, 5)
  const upcomingEvents = getUpcomingEvents(events.docs as CoachingEvent[])

  const orientations = user
    ? await payload.find({
        collection: 'psy-orientations',
        user,
        overrideAccess: false,
        where: { coach: { equals: user.id } },
        depth: 1,
        sort: '-createdAt',
        limit: 3,
      })
    : { docs: [] }

  return (
    <div>
      <CoachTopbar title={t('title')} description={t('description')} />

      <CoachStatsCards
        activeExercisesCount={0}
        assignedStudentsCount={students.size}
        orientationCasesCount={orientations.docs.length}
        upcomingEventsCount={upcomingEvents.length}
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Link href="/dashboard/coach/students" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <h2 className="mindly-feature-title">{t('students.title')}</h2>
                <span className="mindly-feature-action">
                  {t('students.see')}
                  <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                {studentList.length > 0 ? (
                  <div className="mindly-stack-sm">
                    {studentList.map((student) => (
                      <div key={student.id} className="student-dreams-latest-box">
                        <div className="student-dreams-latest-header">
                          <div>
                            <p className="mindly-feature-reference">{student.name}</p>
                            <p className="mindly-feature-text mt-1">
                              {student.email || t('students.emailEmpty')}
                            </p>
                          </div>
                          <span className="mindly-ui-badge">{student.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="mindly-feature-text">{t('students.empty')}</p>
                    <div className="mt-4">
                      <span className="mindly-ui-badge">{t('students.emptyBadge')}</span>
                    </div>
                  </>
                )}
              </div>
            </article>
          </Link>
        </div>

        <div className="mindly-stack-lg">
          <Link href="/dashboard/coach/exercices" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <h2 className="mindly-feature-title">{t('exercises.title')}</h2>
                <span className="mindly-feature-action">
                  {t('exercises.see')}
                  <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                <p className="mindly-feature-text">{t('exercises.empty')}</p>
                <div className="mt-4">
                  <span className="mindly-ui-badge">{t('exercises.emptyBadge')}</span>
                </div>
              </div>
            </article>
          </Link>

          <Link href="/dashboard/coach/orientation_psy" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <h2 className="mindly-feature-title">{t('orientation.title')}</h2>
                <span className="mindly-feature-action">
                  {t('orientation.see')}
                  <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                {orientations.docs.length > 0 ? (
                  <div className="mindly-stack-sm">
                    {(orientations.docs as PsyOrientation[]).map((orientation) => {
                      const studentName =
                        isUser(orientation.student)
                          ? getStudentName(orientation.student)
                          : 'Étudiant'
                      return (
                        <div key={orientation.id} className="student-dreams-latest-box">
                          <p className="mindly-feature-reference">{studentName}</p>
                          <p className="mindly-feature-text mt-1">
                            {formatDate(orientation.createdAt, locale)}
                          </p>
                          <span className="mindly-ui-badge mt-3">
                            {orientation.status === 'appointment_requested'
                              ? 'RDV demandé'
                              : orientation.status === 'student_accepted'
                                ? 'Acceptée'
                                : orientation.status === 'student_refused'
                                  ? 'Refusée'
                                  : orientation.status === 'cancelled'
                                    ? 'Annulée'
                                    : 'En attente'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <>
                    <p className="mindly-feature-text">{t('orientation.empty')}</p>
                    <div className="mt-4">
                      <span className="mindly-ui-badge">{t('orientation.emptyBadge')}</span>
                    </div>
                  </>
                )}
              </div>
            </article>
          </Link>
        </div>
      </div>
    </div>
  )
}
