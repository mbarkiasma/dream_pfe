import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import { AlertTriangle, CalendarDays, ChevronRight, Clock, UserRound } from 'lucide-react'

import type { RendezVousPsy, User } from '@/payload-types'
import { PsyStatsCards } from '@/components/dashboard/psy/PsyStatsCards'
import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'

function isUser(value: unknown): value is User {
  return Boolean(value && typeof value === 'object' && 'id' in value && 'email' in value)
}

function getStudentName(student: User) {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim()

  return fullName || student.email
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getStartOfTodayISO() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return today.toISOString()
}

export default async function PsyDashboardPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  const appointmentsResult = user
    ? await payload.find({
        collection: 'rendez-vous-psy',
        user,
        overrideAccess: false,
        where: {
          psychologist: {
            equals: user.id,
          },
        },
        depth: 1,
        sort: '-date',
        limit: 100,
      })
    : null

  const appointments = (appointmentsResult?.docs || []) as RendezVousPsy[]
  const startOfToday = getStartOfTodayISO()
  const activeStudentIds = new Set(
    appointments
      .filter((appointment) => isUser(appointment.student))
      .map((appointment) => (appointment.student as User).id),
  )
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === 'confirmed' && appointment.date >= startOfToday,
  )
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'pending')
  const urgentAppointments = appointments.filter(
    (appointment) => appointment.urgency === 'urgent' && appointment.status !== 'completed',
  )
  const latestAssignedStudents = Array.from(
    appointments
      .filter((appointment) => isUser(appointment.student))
      .reduce((students, appointment) => {
        const student = appointment.student as User
        if (!students.has(student.id)) students.set(student.id, student)
        return students
      }, new Map<number, User>())
      .values(),
  ).slice(0, 4)
  const latestStudent = latestAssignedStudents[0]

  return (
    <div>
      <PsyTopbar
        title="Dashboard Psychologue"
        description="Bienvenue dans votre espace de suivi clinique des etudiants et des rendez-vous."
      />

      <PsyStatsCards
        stats={[
          {
            label: 'Etudiants assignes',
            value: activeStudentIds.size,
            hint: 'Suivi clinique',
          },
          {
            label: 'Rendez-vous prevus',
            value: upcomingAppointments.length,
            hint: 'Consultations',
          },
          {
            label: 'Cas en attente',
            value: pendingAppointments.length,
            hint: 'A traiter',
          },
        ]}
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Link href="/dashboard/psy/students" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <div className="mindly-feature-heading">
                  <span className="mindly-feature-icon">
                    <UserRound />
                  </span>
                  <h2 className="mindly-feature-title">Etudiants assignes</h2>
                </div>

                <span className="mindly-feature-action">
                  Voir
                  <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                {latestStudent ? (
                  <div className="mindly-stack-md">
                    <p className="mindly-feature-reference">{getStudentName(latestStudent)}</p>
                    <p className="mindly-feature-text">{latestStudent.email}</p>
                    <span className="mindly-ui-badge">
                      {activeStudentIds.size} etudiant{activeStudentIds.size > 1 ? 's' : ''}
                    </span>
                  </div>
                ) : (
                  <p className="mindly-feature-text">Aucun etudiant assigne pour le moment.</p>
                )}
              </div>
            </article>
          </Link>
        </div>

        <div className="mindly-stack-lg">
          <Link href="/dashboard/psy/rendez_vous" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <div className="mindly-feature-heading">
                  <span className="mindly-feature-icon">
                    <CalendarDays />
                  </span>
                  <h2 className="mindly-feature-title">Rendez-vous</h2>
                </div>

                <ChevronRight className="mindly-feature-chevron" />
              </div>

              <div className="mindly-feature-content">
                {upcomingAppointments.length > 0 ? (
                  <div className="mindly-stack-sm">
                    <p className="mindly-feature-reference">
                      {isUser(upcomingAppointments[0].student)
                        ? getStudentName(upcomingAppointments[0].student)
                        : 'Etudiant'}
                    </p>
                    <p className="mindly-feature-text">
                      {formatDate(upcomingAppointments[0].date)} - {upcomingAppointments[0].startTime}
                    </p>
                    <span className="mindly-ui-badge">
                      {upcomingAppointments.length} consultation
                      {upcomingAppointments.length > 1 ? 's' : ''}
                    </span>
                  </div>
                ) : (
                  <p className="mindly-feature-text">
                    Aucune consultation confirmee pour le moment.
                  </p>
                )}
              </div>
            </article>
          </Link>

          <Link href="/dashboard/psy/rendez_vous" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <div className="mindly-feature-heading">
                  <span className="mindly-feature-icon">
                    <AlertTriangle />
                  </span>
                  <h2 className="mindly-feature-title">Suivi clinique</h2>
                </div>

                <ChevronRight className="mindly-feature-chevron" />
              </div>

              <div className="mindly-feature-content">
                {urgentAppointments.length > 0 ? (
                  <div className="mindly-stack-sm">
                    <p className="mindly-feature-reference">
                      {isUser(urgentAppointments[0].student)
                        ? getStudentName(urgentAppointments[0].student)
                        : 'Etudiant'}
                    </p>
                    <p className="mindly-feature-text line-clamp-3">
                      {urgentAppointments[0].reason}
                    </p>
                    <span className="mindly-ui-badge">
                      {urgentAppointments.length} urgent
                    </span>
                  </div>
                ) : (
                  <div className="mindly-stack-sm">
                    <p className="mindly-feature-text">Aucun cas urgent actif.</p>
                    {pendingAppointments.length > 0 ? (
                      <span className="mindly-ui-badge">
                        {pendingAppointments.length} demande
                        {pendingAppointments.length > 1 ? 's' : ''} a traiter
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </article>
          </Link>
        </div>
      </div>
    </div>
  )
}
