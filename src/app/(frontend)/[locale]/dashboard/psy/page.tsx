import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Brain, ChevronRight, Mail, UserRound } from 'lucide-react'

import type { RendezVousPsy, User } from '@/payload-types'
import { PsyStatsCards } from '@/components/dashboard/psy/PsyStatsCards'
import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

type StudentClinicalSummary = {
  appointmentCount: number
  nextAppointment?: RendezVousPsy
  student: User
  urgentCount: number
}

type BigFiveTraitName =
  | 'Ouverture'
  | 'Conscienciosite'
  | 'Extraversion'
  | 'Agreabilite'
  | 'Neuroticisme'

type BigFiveStat = {
  count: number
  name: BigFiveTraitName
  score: number
}

const bigFiveTraitNames: BigFiveTraitName[] = [
  'Ouverture',
  'Conscienciosite',
  'Extraversion',
  'Agreabilite',
  'Neuroticisme',
]

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

function getAppointmentLabel(appointment: RendezVousPsy | undefined) {
  if (!appointment) return 'Aucune consultation confirmée'

  return `${formatDate(appointment.date)} - ${appointment.startTime}`
}

function buildBigFiveStats(students: User[]): BigFiveStat[] {
  const totals = new Map<BigFiveTraitName, { count: number; total: number }>(
    bigFiveTraitNames.map((name) => [name, { count: 0, total: 0 }]),
  )

  for (const student of students) {
    for (const trait of student.bigFiveProfile?.traits || []) {
      if (!trait?.name || typeof trait.score !== 'number') continue

      const current = totals.get(trait.name)
      if (!current) continue

      current.count += 1
      current.total += trait.score
    }
  }

  return bigFiveTraitNames.map((name) => {
    const current = totals.get(name)
    const count = current?.count || 0

    return {
      count,
      name,
      score: count > 0 && current ? Number((current.total / count).toFixed(1)) : 0,
    }
  })
}

export default async function PsyDashboardPage() {
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
  const startOfToday = getStartOfTodayISO()
  const activeStudentIds = new Set(
    appointments
      .filter((appointment) => isUser(appointment.student))
      .map((appointment) => (appointment.student as User).id),
  )
  const activeStudents = Array.from(
    appointments.reduce((students, appointment) => {
      if (isUser(appointment.student)) {
        students.set(String(appointment.student.id), appointment.student)
      }

      return students
    }, new Map<string, User>()).values(),
  )
  const bigFiveStats = buildBigFiveStats(activeStudents)
  const studentsWithBigFive = activeStudents.filter(
    (student) => (student.bigFiveProfile?.traits || []).length > 0,
  ).length
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === 'confirmed' && appointment.date >= startOfToday,
  )
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'pending')
  const urgentAppointments = appointments.filter(
    (appointment) => appointment.urgency === 'urgent' && appointment.status !== 'completed',
  )
  const studentSummaries = Array.from(
    appointments.reduce((students, appointment) => {
      if (!isUser(appointment.student)) return students

      const student = appointment.student
      const key = String(student.id)
      const current =
        students.get(key) ||
        ({
          appointmentCount: 0,
          student,
          urgentCount: 0,
        } satisfies StudentClinicalSummary)

      current.appointmentCount += 1
      if (appointment.urgency === 'urgent' && appointment.status !== 'completed') {
        current.urgentCount += 1
      }

      if (appointment.status === 'confirmed' && appointment.date >= startOfToday) {
        const currentTime = current.nextAppointment
          ? new Date(current.nextAppointment.date).getTime()
          : Number.POSITIVE_INFINITY
        const appointmentTime = new Date(appointment.date).getTime()

        if (appointmentTime < currentTime) {
          current.nextAppointment = appointment
        }
      }

      students.set(key, current)

      return students
    }, new Map<string, StudentClinicalSummary>()).values(),
  )
    .sort((a, b) => {
      if (b.urgentCount !== a.urgentCount) return b.urgentCount - a.urgentCount

      const aTime = a.nextAppointment
        ? new Date(a.nextAppointment.date).getTime()
        : Number.POSITIVE_INFINITY
      const bTime = b.nextAppointment
        ? new Date(b.nextAppointment.date).getTime()
        : Number.POSITIVE_INFINITY

      return aTime - bTime
    })
    .slice(0, 5)

  const upcomingPreview = upcomingAppointments.slice(0, 3)
  const urgentPreview = urgentAppointments.slice(0, 3)

  return (
    <div>
      <PsyTopbar
        title="Dashboard Psychologue"
        description="Bienvenue dans votre espace de suivi clinique des étudiants et des rendez-vous."
      />

      <PsyStatsCards
        stats={[
          {
            label: 'Étudiants assignés',
            value: activeStudentIds.size,
            hint: 'Suivi clinique',
          },
          {
            label: 'Rendez-vous prévus',
            value: upcomingAppointments.length,
            hint: 'Consultations',
          },
          {
            label: 'Cas en attente',
            value: pendingAppointments.length,
            hint: 'À traiter',
          },
          {
            icon: Brain,
            label: 'Profils Big Five',
            value: studentsWithBigFive,
            hint: 'Analyses stockees',
          },
        ]}
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Link href="/dashboard/psy/students" className="mindly-feature-link">
            <article className="mindly-feature-card psy-students-card">
              <div className="mindly-feature-header">
                <h2 className="mindly-feature-title">Étudiants assignés</h2>
                <span className="mindly-feature-action">
                  Voir
                  <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                {studentSummaries.length > 0 ? (
                  <div className="psy-student-list">
                    {studentSummaries.map((summary) => (
                      <div key={summary.student.id} className="psy-student-row">
                        <span className="psy-student-avatar">
                          <UserRound />
                        </span>

                        <div className="psy-student-info">
                          <p className="mindly-feature-reference">
                            {getStudentName(summary.student)}
                          </p>
                          <p className="psy-student-email">
                            <Mail />
                            {summary.student.email}
                          </p>
                          <div className="psy-student-badges">
                            <span className="mindly-ui-badge">
                              {summary.appointmentCount} rendez-vous
                            </span>
                            {summary.urgentCount > 0 ? (
                              <span className="mindly-ui-badge mindly-ui-badge-danger">
                                {summary.urgentCount} urgent
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="psy-student-next">
                          <p className="psy-section-eyebrow">Prochaine consultation</p>
                          <p className="mindly-feature-text">
                            {getAppointmentLabel(summary.nextAppointment)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mindly-feature-text">Aucun étudiant assigné pour le moment.</p>
                )}
              </div>
            </article>
          </Link>
        </div>

        <div className="mindly-stack-lg">
          <article className="mindly-feature-card">
            <div className="mindly-feature-header">
              <h2 className="mindly-feature-title">Statistiques Big Five</h2>
              <span className="mindly-ui-badge">
                {studentsWithBigFive} profil{studentsWithBigFive > 1 ? 's' : ''}
              </span>
            </div>

            <div className="mindly-feature-content">
              {studentsWithBigFive > 0 ? (
                <div className="space-y-3">
                  {bigFiveStats.map((trait) => (
                    <div key={trait.name} className="student-dreams-latest-box">
                      <div className="flex items-center justify-between gap-3">
                        <p className="mindly-feature-reference">{trait.name}</p>
                        <span className="mindly-ui-badge">{trait.score}/10</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--mindly-bg-strong)]">
                        <div
                          className="h-full rounded-full bg-[var(--mindly-primary)]"
                          style={{ width: `${Math.min(100, trait.score * 10)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="student-dreams-latest-box flex items-center gap-3">
                  <Brain className="h-5 w-5 text-[var(--mindly-primary)]" />
                  <p className="mindly-feature-text">
                    Les moyennes Big Five apparaîtront après les entretiens des étudiants.
                  </p>
                </div>
              )}
            </div>
          </article>

          <Link href="/dashboard/psy/rendez_vous" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <h2 className="mindly-feature-title">Rendez-vous</h2>
                <span className="mindly-feature-action">
                  Voir
                  <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                {upcomingPreview.length > 0 ? (
                  <div className="psy-priority-list">
                    {upcomingPreview.map((appointment) => (
                      <div key={appointment.id} className="psy-priority-row">
                        <p className="mindly-feature-reference">
                          {isUser(appointment.student)
                            ? getStudentName(appointment.student)
                            : 'Étudiant'}
                        </p>
                        <p className="mindly-feature-text">
                          {formatDate(appointment.date)} - {appointment.startTime}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mindly-feature-text">Aucune consultation pour le moment.</p>
                )}
              </div>
            </article>
          </Link>

          <Link href="/dashboard/psy/rendez_vous" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <h2 className="mindly-feature-title">Suivi clinique</h2>
                <span className="mindly-feature-action">
                  Voir
                  <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                {urgentPreview.length > 0 ? (
                  <div className="psy-priority-list">
                    {urgentPreview.map((appointment) => (
                      <div key={appointment.id} className="psy-priority-row psy-priority-row-urgent">
                        <p className="mindly-feature-reference">
                          {isUser(appointment.student)
                            ? getStudentName(appointment.student)
                            : 'Étudiant'}
                        </p>
                        <p className="mindly-feature-text line-clamp-3">{appointment.reason}</p>
                        <span className="mindly-ui-badge mindly-ui-badge-danger">Urgent</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mindly-stack-sm">
                    <p className="mindly-feature-text">Aucun cas urgent actif.</p>
                    {pendingAppointments.length > 0 ? (
                      <span className="mindly-ui-badge">
                        {pendingAppointments.length} demande
                        {pendingAppointments.length > 1 ? 's' : ''} à traiter
                      </span>
                    ) : (
                      <span className="mindly-ui-badge">Aucun cas</span>
                    )}
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
