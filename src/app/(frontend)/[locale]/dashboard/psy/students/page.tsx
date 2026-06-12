import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { getLocale, getTranslations } from 'next-intl/server'
import { AlertTriangle, Clock, Mail, UserRound } from 'lucide-react'

import type { RendezVousPsy, User } from '@/payload-types'
import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { PsyStudentSearch } from '@/components/dashboard/psy/PsyStudentSearch'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

type StudentStatus = 'urgent' | 'pending' | 'active'

type StudentDossier = {
  user: User
  totalSessions: number
  lastAppointmentDate: string | null
  nextAppointment?: RendezVousPsy
  status: StudentStatus
  urgentCount: number
  pendingCount: number
}

function isUser(value: unknown): value is User {
  return Boolean(value && typeof value === 'object' && 'id' in value && 'email' in value)
}

function getStudentName(student: User) {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim()
  return fullName || student.email
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
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

const ACTIVE_STATUSES = new Set(['pending', 'confirmed', 'completed'])

function buildStudentDossiers(appointments: RendezVousPsy[]): StudentDossier[] {
  const students = new Map<number, StudentDossier>()
  const startOfToday = getStartOfTodayISO()

  for (const appointment of appointments) {
    if (!isUser(appointment.student)) continue
    if (!ACTIVE_STATUSES.has(appointment.status ?? '')) continue

    const current: StudentDossier = students.get(appointment.student.id) || {
      user: appointment.student,
      totalSessions: 0,
      lastAppointmentDate: null,
      urgentCount: 0,
      pendingCount: 0,
      status: 'active',
    }

    if (appointment.status === 'confirmed' || appointment.status === 'completed') {
      current.totalSessions += 1
    }

    if (
      appointment.status === 'completed' &&
      (!current.lastAppointmentDate || appointment.date > current.lastAppointmentDate)
    ) {
      current.lastAppointmentDate = appointment.date
    }

    if (appointment.urgency === 'urgent' && appointment.status !== 'completed') {
      current.urgentCount += 1
    }

    if (appointment.status === 'pending') {
      current.pendingCount += 1
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

  for (const dossier of students.values()) {
    if (dossier.urgentCount > 0) dossier.status = 'urgent'
    else if (dossier.pendingCount > 0) dossier.status = 'pending'
    else dossier.status = 'active'
  }

  const order: Record<StudentStatus, number> = { urgent: 0, pending: 1, active: 2 }

  return Array.from(students.values()).sort((a, b) => {
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    return (b.lastAppointmentDate || '').localeCompare(a.lastAppointmentDate || '')
  })
}

export default async function PsyStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.psy.students')
  const d = await getTranslations('dashboard.psy.students.dossiers')
  const locale = await getLocale()

  const appointmentsResult = user
    ? await payload.find({
        collection: 'rendez-vous-psy',
        user,
        overrideAccess: false,
        where: { psychologist: { equals: user.id } },
        depth: 1,
        sort: '-date',
        limit: 100,
      })
    : null

  const { q } = await searchParams
  const query = q?.trim().toLowerCase() ?? ''

  const appointments = (appointmentsResult?.docs || []) as RendezVousPsy[]
  const allDossiers = buildStudentDossiers(appointments)
  const dossiers = query
    ? allDossiers.filter((dossier) => {
        const name = getStudentName(dossier.user).toLowerCase()
        const email = dossier.user.email.toLowerCase()
        return name.includes(query) || email.includes(query)
      })
    : allDossiers

  const urgentCount = dossiers.filter((x) => x.status === 'urgent').length
  const pendingCount = dossiers.filter((x) => x.status === 'pending').length

  const statusLabel: Record<StudentStatus, string> = {
    urgent: d('statusUrgent'),
    pending: d('statusPending'),
    active: d('statusActive'),
  }

  const statusBadge: Record<StudentStatus, string> = {
    urgent: 'mindly-ui-badge mindly-ui-badge-danger',
    pending: 'mindly-ui-badge',
    active: 'mindly-ui-badge',
  }

  return (
    <div className="w-full overflow-x-hidden">
      <PsyTopbar title={t('title')} description={t('description')} />

      <div className="mindly-page-content">
        <article className="mindly-feature-card !overflow-visible">
          <div className="mindly-feature-header">
            <h2 className="mindly-feature-title">{d('title')}</h2>
            <div className="flex flex-wrap items-center gap-2">
              {urgentCount > 0 ? (
                <span className="mindly-ui-badge mindly-ui-badge-danger">
                  {urgentCount} {urgentCount > 1 ? d('urgentPlural') : d('urgent')}
                </span>
              ) : null}
              {pendingCount > 0 ? (
                <span className="mindly-ui-badge">
                  {pendingCount} {d('pending')}
                </span>
              ) : null}
              <span className="mindly-ui-badge">
                {allDossiers.length} {allDossiers.length > 1 ? d('filePlural') : d('file')}
              </span>
            </div>
          </div>

          <div className="mindly-feature-search">
            <PsyStudentSearch
              placeholder={d('searchPlaceholder')}
              suggestions={allDossiers.map((dossier) => ({
                name: getStudentName(dossier.user),
                email: dossier.user.email,
              }))}
            />
          </div>

          <div className="mindly-feature-content">
            {dossiers.length > 0 ? (
              <div className="grid gap-3">
                {dossiers.map((dossier) => (
                  <Link
                    key={dossier.user.id}
                    href="/dashboard/psy/rendez_vous"
                    className="group block w-full rounded-[1.15rem] border border-[var(--mindly-border)] bg-white/80 p-4 transition hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="mindly-feature-icon shrink-0">
                            <UserRound />
                          </div>
                          <div className="min-w-0 overflow-hidden">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="mindly-feature-reference truncate">
                                {getStudentName(dossier.user)}
                              </p>
                              <span className={statusBadge[dossier.status]}>
                                {statusLabel[dossier.status]}
                              </span>
                            </div>
                            <p className="mindly-feature-text mt-0.5 flex items-center gap-1 overflow-hidden">
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              <span className="min-w-0 truncate">{dossier.user.email}</span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 pl-0 sm:pl-12">
                          <span className="mindly-ui-badge">
                            {dossier.totalSessions}{' '}
                            {dossier.totalSessions > 1 ? d('sessionsPlural') : d('sessions')}
                          </span>
                          {dossier.lastAppointmentDate ? (
                            <span className="mindly-ui-badge">
                              {d('lastDate', {
                                date: formatDate(dossier.lastAppointmentDate, locale),
                              })}
                            </span>
                          ) : null}
                          {dossier.urgentCount > 0 ? (
                            <span className="mindly-ui-badge mindly-ui-badge-danger">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              {dossier.urgentCount}{' '}
                              {dossier.urgentCount > 1 ? d('alertsPlural') : d('alerts')}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="w-full rounded-[1.15rem] border border-[var(--mindly-border)] bg-white/80 p-4 sm:w-auto sm:min-w-[200px] sm:shrink-0">
                        <p className="mindly-dashboard-eyebrow flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {d('nextAppointment')}
                        </p>
                        {dossier.nextAppointment ? (
                          <p className="mindly-feature-reference mt-1.5">
                            {formatDate(dossier.nextAppointment.date, locale)}{' '}
                            {d('at')} {dossier.nextAppointment.startTime}
                          </p>
                        ) : (
                          <p className="mindly-feature-text mt-1.5">{d('noConfirmed')}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query ? (
              <div className="student-dreams-latest-box flex items-center gap-3">
                <div className="mindly-feature-icon">
                  <UserRound />
                </div>
                <p className="mindly-feature-text">
                  {d('noResults')} "{q}"
                </p>
              </div>
            ) : (
              <div className="student-dreams-latest-box flex items-center gap-3">
                <div className="mindly-feature-icon">
                  <UserRound />
                </div>
                <div>
                  <p className="mindly-feature-reference">{d('empty')}</p>
                  <p className="mindly-feature-text">{d('emptyDescription')}</p>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
