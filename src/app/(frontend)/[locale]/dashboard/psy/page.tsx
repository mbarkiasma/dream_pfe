import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { getLocale, getTranslations } from 'next-intl/server'
import { AlertTriangle, CalendarDays, ChevronRight, Clock, UserRound } from 'lucide-react'

import type { RendezVousPsy, User } from '@/payload-types'
import { PsyStatsCards } from '@/components/dashboard/psy/PsyStatsCards'
import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

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

function getEndOfTodayISO() {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return today.toISOString()
}

export default async function PsyDashboardPage() {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.psy.dashboard')
  const locale = await getLocale()

  const appointmentsResult = user
    ? await payload.find({
        collection: 'rendez-vous-psy',
        user,
        overrideAccess: false,
        where: { psychologist: { equals: user.id } },
        depth: 1,
        sort: '-createdAt',
        limit: 100,
      })
    : null

  const appointments = (appointmentsResult?.docs || []) as RendezVousPsy[]
  const startOfToday = getStartOfTodayISO()
  const endOfToday = getEndOfTodayISO()

  const activeStudentIds = new Set(
    appointments
      .filter((a) => isUser(a.student))
      .map((a) => (a.student as User).id),
  )

  const todayAppointments = appointments.filter(
    (a) => a.status === 'confirmed' && a.date >= startOfToday && a.date <= endOfToday,
  )

  const pendingAppointments = appointments.filter((a) => a.status === 'pending')

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'confirmed' && a.date >= startOfToday,
  )

  const urgentAppointments = appointments.filter(
    (a) => a.urgency === 'urgent' && a.status !== 'completed',
  )

  return (
    <div>
      <PsyTopbar title={t('title')} description={t('description')} />

      <PsyStatsCards
        stats={[
          {
            icon: UserRound,
            label: t('stats.students'),
            value: activeStudentIds.size,
            hint: t('stats.studentsHint'),
          },
          {
            icon: CalendarDays,
            label: t('stats.todayAppointments'),
            value: todayAppointments.length,
            hint: t('stats.todayAppointmentsHint'),
          },
          {
            icon: ChevronRight,
            label: t('stats.upcoming'),
            value: upcomingAppointments.length,
            hint: t('stats.upcomingHint'),
          },
        ]}
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <article className="mindly-feature-card">
            <div className="mindly-feature-header">
              <h2 className="mindly-feature-title">{t('agenda.title')}</h2>
              <span className="mindly-ui-badge">
                {todayAppointments.length}{' '}
                {locale === 'fr'
                  ? todayAppointments.length > 1
                    ? 'consultations'
                    : 'consultation'
                  : todayAppointments.length > 1
                    ? 'consultations'
                    : 'consultation'}
              </span>
            </div>

            <div className="mindly-feature-content">
              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <Link
                      key={appointment.id}
                      href="/dashboard/psy/rendez_vous"
                      className="student-dreams-latest-box group flex items-center gap-4 transition hover:-translate-y-0.5"
                    >
                      <div className="mindly-feature-icon shrink-0">
                        <Clock />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mindly-feature-reference">
                          {isUser(appointment.student)
                            ? getStudentName(appointment.student)
                            : 'Étudiant'}
                        </p>
                        <p className="mindly-feature-text">{appointment.startTime}</p>
                      </div>
                      {appointment.urgency === 'urgent' ? (
                        <span className="mindly-ui-badge mindly-ui-badge-danger shrink-0">
                          {t('agenda.urgent')}
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="student-dreams-latest-box flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-[var(--mindly-primary)]" />
                  <p className="mindly-feature-text">{t('agenda.empty')}</p>
                </div>
              )}
            </div>
          </article>
        </div>

        <div className="mindly-stack-lg">
          <Link href="/dashboard/psy/rendez_vous" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <h2 className="mindly-feature-title">{t('alerts.title')}</h2>
                <span className="mindly-feature-action">
                  {t('alerts.see')} <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                {urgentAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {urgentAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="student-dreams-latest-box">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--mindly-primary)]" />
                          <p className="mindly-feature-reference">
                            {isUser(appointment.student)
                              ? getStudentName(appointment.student)
                              : 'Étudiant'}
                          </p>
                        </div>
                        {appointment.reason ? (
                          <p className="mindly-feature-text mt-1 line-clamp-2">
                            {appointment.reason}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mindly-feature-text">{t('alerts.empty')}</p>
                )}
              </div>
            </article>
          </Link>

          <Link href="/dashboard/psy/rendez_vous" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <h2 className="mindly-feature-title">{t('pendingSection.title')}</h2>
                <span className="mindly-feature-action">
                  {t('pendingSection.see')} <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                {pendingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {pendingAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="student-dreams-latest-box">
                        <p className="mindly-feature-reference">
                          {isUser(appointment.student)
                            ? getStudentName(appointment.student)
                            : 'Étudiant'}
                        </p>
                        <p className="mindly-feature-text mt-1">
                          {t('pendingSection.requestDate', {
                            date: formatDate(appointment.date, locale),
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mindly-feature-text">{t('pendingSection.empty')}</p>
                )}
              </div>
            </article>
          </Link>
        </div>
      </div>
    </div>
  )
}
