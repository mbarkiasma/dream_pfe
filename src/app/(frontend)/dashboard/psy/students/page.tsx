import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { AlertTriangle, CalendarDays, Clock, Mail, UserRound } from 'lucide-react'

import type { RendezVousPsy, User } from '@/payload-types'
import { PsyStatsCards } from '@/components/dashboard/psy/PsyStatsCards'
import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

type AssignedStudent = {
  user: User
  appointments: RendezVousPsy[]
  nextAppointment?: RendezVousPsy
  pendingCount: number
  urgentCount: number
}

function isUser(value: unknown): value is User {
  return Boolean(value && typeof value === 'object' && 'id' in value && 'email' in value)
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getStudentName(student: User) {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim()

  return fullName || student.email
}

function getStartOfTodayISO() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return today.toISOString()
}

function buildAssignedStudents(appointments: RendezVousPsy[]): AssignedStudent[] {
  const students = new Map<number, AssignedStudent>()
  const startOfToday = getStartOfTodayISO()

  for (const appointment of appointments) {
    if (!isUser(appointment.student)) continue

    const current = students.get(appointment.student.id) || {
      user: appointment.student,
      appointments: [],
      pendingCount: 0,
      urgentCount: 0,
    }

    current.appointments.push(appointment)

    if (appointment.status === 'pending') {
      current.pendingCount += 1
    }

    if (appointment.urgency === 'urgent' && appointment.status !== 'completed') {
      current.urgentCount += 1
    }

    if (
      appointment.status === 'confirmed' &&
      appointment.date >= startOfToday &&
      (!current.nextAppointment || appointment.date < current.nextAppointment.date)
    ) {
      current.nextAppointment = appointment
    }

    students.set(appointment.student.id, current)
  }

  return Array.from(students.values()).sort((a, b) => {
    const aDate = a.nextAppointment?.date || a.appointments[0]?.date || ''
    const bDate = b.nextAppointment?.date || b.appointments[0]?.date || ''

    return bDate.localeCompare(aDate)
  })
}

export default async function PsyStudentsPage() {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()

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
  const assignedStudents = buildAssignedStudents(appointments)
  const startOfToday = getStartOfTodayISO()
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === 'confirmed' && appointment.date >= startOfToday,
  )
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'pending')
  const urgentAppointments = appointments.filter(
    (appointment) => appointment.urgency === 'urgent' && appointment.status !== 'completed',
  )

  return (
    <div>
      <PsyTopbar
        title="Etudiants assignes"
        description="Consultez les etudiants orientes vers le suivi psychologique."
      />

      <PsyStatsCards
        stats={[
          {
            label: 'Etudiants assignes',
            value: assignedStudents.length,
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
          <article className="mindly-feature-card">
            <div className="mindly-feature-header">
              <h2 className="mindly-feature-title">Etudiants assignes</h2>
              <span className="mindly-ui-badge">
                {assignedStudents.length} dossier{assignedStudents.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="mindly-feature-content">
              {assignedStudents.length > 0 ? (
                <div className="grid gap-3">
                  {assignedStudents.map((item) => (
                    <Link
                      key={item.user.id}
                      href="/dashboard/psy/rendez_vous"
                      className="student-dreams-latest-box group block transition hover:-translate-y-0.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="mindly-feature-icon">
                              <UserRound />
                            </div>
                            <div>
                              <p className="mindly-feature-reference">
                                {getStudentName(item.user)}
                              </p>
                              <p className="mindly-feature-text mt-1 flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                {item.user.email}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="mindly-ui-badge">
                              {item.appointments.length} rendez-vous
                            </span>
                            {item.pendingCount > 0 ? (
                              <span className="mindly-ui-badge">
                                {item.pendingCount} en attente
                              </span>
                            ) : null}
                            {item.urgentCount > 0 ? (
                              <span className="mindly-ui-badge">
                                {item.urgentCount} urgent
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="student-dreams-latest-box min-w-[190px]">
                          <p className="mindly-dashboard-eyebrow">
                            Prochaine consultation
                          </p>
                          {item.nextAppointment ? (
                            <p className="mindly-feature-reference mt-2">
                              {formatDate(item.nextAppointment.date)} a{' '}
                              {item.nextAppointment.startTime}
                            </p>
                          ) : (
                            <p className="mindly-feature-text mt-2">
                              Aucune consultation confirmee
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="student-dreams-latest-box flex items-center gap-3">
                  <div className="mindly-feature-icon">
                    <UserRound />
                  </div>
                  <div>
                    <p className="mindly-feature-reference">
                      Aucun etudiant assigne
                    </p>
                    <p className="mindly-feature-text">
                      Les etudiants apparaitront ici apres une demande de rendez-vous.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>

        <div className="mindly-stack-lg">
          <article className="mindly-feature-card">
            <div className="mindly-feature-header">
              <h2 className="mindly-feature-title">Rendez-vous</h2>
            </div>

            <div className="mindly-feature-content">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 4).map((appointment) => (
                    <Link
                      key={appointment.id}
                      className="student-dreams-latest-box flex items-start gap-3 transition hover:-translate-y-0.5"
                      href="/dashboard/psy/rendez_vous"
                    >
                      <Clock className="mt-0.5 h-4 w-4 text-[var(--mindly-primary)]" />
                      <div>
                        <p className="mindly-feature-reference">
                          {isUser(appointment.student)
                            ? getStudentName(appointment.student)
                            : 'Etudiant'}
                        </p>
                        <p className="mindly-feature-text">
                          {formatDate(appointment.date)} - {appointment.startTime}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mindly-feature-text">
                  Aucune consultation confirmee pour le moment.
                </p>
              )}
            </div>
          </article>

          <article className="mindly-feature-card">
            <div className="mindly-feature-header">
              <h2 className="mindly-feature-title">Suivi clinique</h2>
            </div>

            <div className="mindly-feature-content">
              {urgentAppointments.length > 0 ? (
                <div className="space-y-3">
                  {urgentAppointments.slice(0, 4).map((appointment) => (
                    <Link
                      key={appointment.id}
                      className="student-dreams-latest-box block transition hover:-translate-y-0.5"
                      href="/dashboard/psy/rendez_vous"
                    >
                      <p className="flex items-center gap-2 text-sm font-semibold text-[var(--mindly-primary)]">
                        <AlertTriangle className="h-4 w-4" />
                        {isUser(appointment.student)
                          ? getStudentName(appointment.student)
                          : 'Etudiant'}
                      </p>
                      <p className="mindly-feature-text mt-1">
                        {appointment.reason}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="student-dreams-latest-box flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-[var(--mindly-primary)]" />
                  <p className="mindly-feature-text">
                    Aucun cas urgent actif. Les demandes urgentes seront affichees ici.
                  </p>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
