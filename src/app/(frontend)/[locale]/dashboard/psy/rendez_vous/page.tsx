import config from '@payload-config'
import { getPayload } from 'payload'
import { CalendarDays, Clock, UserRound } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import { PsyRendezvousActions } from '@/components/dashboard/psy/PsyRendezvousActions'
import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

const statusClasses: Record<string, string> = {
  pending: 'student-dream-status-generating',
  confirmed: 'student-dream-status-ready',
  rejected: 'student-dream-status-failed',
  cancelled: 'student-dream-status-pending',
  completed: 'student-dream-status-ready',
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return ''

  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function getStudentName(student: unknown, fallback: string) {
  if (!student || typeof student !== 'object') return fallback

  const data = student as {
    firstName?: string | null
    lastName?: string | null
    email?: string | null
  }
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim()

  return fullName || data.email || fallback
}

function getAppointmentDateTime(
  date: string | null | undefined,
  startTime: string | null | undefined,
) {
  if (!date) return Number.POSITIVE_INFINITY

  const appointmentDate = new Date(date)

  if (Number.isNaN(appointmentDate.getTime())) return Number.POSITIVE_INFINITY

  const [hours = '0', minutes = '0'] = (startTime || '00:00').split(':')

  appointmentDate.setHours(Number(hours), Number(minutes), 0, 0)

  return appointmentDate.getTime()
}

export default async function PsyRendezVousPage() {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.psy.rendezVous')
  const locale = await getLocale()

  const appointments = user
    ? await payload.find({
        collection: 'rendez-vous-psy',
        user,
        overrideAccess: false,
        where: { psychologist: { equals: user.id } },
        depth: 1,
        sort: '-createdAt',
        limit: 50,
      })
    : null

  const docs = appointments?.docs || []
  const pendingAppointments = docs.filter((a) => a.status === 'pending')
  const confirmedAppointments = docs.filter((a) => a.status === 'confirmed')
  const now = Date.now()
  const nextAppointment =
    confirmedAppointments
      .filter((a) => getAppointmentDateTime(a.date, a.startTime) >= now)
      .sort(
        (a, b) =>
          getAppointmentDateTime(a.date, a.startTime) - getAppointmentDateTime(b.date, b.startTime),
      )[0] || null

  const statusLabels: Record<string, string> = {
    pending: t('status.pending'),
    confirmed: t('status.confirmed'),
    rejected: t('status.rejected'),
    cancelled: t('status.cancelled'),
    completed: t('status.completed'),
  }

  return (
    <div>
      <PsyTopbar title={t('title')} description={t('description')} />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">{t('requests.title')}</CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              {docs.length > 0 ? (
                <div className="mindly-stack-md">
                  {docs.map((appointment) => (
                    <div key={appointment.id} className="student-dreams-latest-box">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium mindly-feature-text">
                            <UserRound className="h-4 w-4" />
                            {getStudentName(appointment.student, t('student'))}
                          </div>

                          <p className="mt-2 mindly-feature-reference">
                            {formatDate(appointment.date, locale)}{' '}
                            {t('requests.from', {
                              start: appointment.startTime ?? '',
                              end: appointment.endTime ?? '',
                            })}
                          </p>

                          <p className="mt-2 mindly-feature-text">{appointment.reason}</p>

                          {appointment.status === 'rejected' && appointment.rejectionReason ? (
                            <div className="mt-3 rounded-2xl student-dream-status-failed p-3 text-sm">
                              <p className="font-semibold">{t('requests.rejectionLabel')}</p>
                              <p className="mt-1">{appointment.rejectionReason}</p>
                            </div>
                          ) : null}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span
                              className={`student-dream-status student-dream-status-small ${
                                statusClasses[appointment.status] || 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {statusLabels[appointment.status] || appointment.status}
                            </span>

                            <span className="mindly-ui-badge">
                              {appointment.urgency === 'urgent'
                                ? t('requests.urgencyUrgent')
                                : t('requests.urgencyNormal')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <PsyRendezvousActions
                        appointmentId={appointment.id}
                        status={appointment.status}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="student-dreams-latest-box flex items-center gap-3">
                  <div className="mindly-feature-icon">
                    <CalendarDays />
                  </div>

                  <div>
                    <p className="mindly-feature-reference">{t('requests.empty')}</p>
                    <p className="mindly-feature-text">{t('requests.emptyHint')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mindly-stack-lg">
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">{t('next.title')}</CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              {nextAppointment ? (
                <div className="student-dreams-latest-box flex items-center gap-3">
                  <div className="mindly-feature-icon">
                    <Clock />
                  </div>
                  <div>
                    <p className="mindly-feature-reference">
                      {formatDate(nextAppointment.date, locale)}
                    </p>
                    <p className="mindly-feature-text">
                      {nextAppointment.startTime} - {nextAppointment.endTime}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mindly-feature-text">{t('next.empty')}</p>
              )}
            </CardContent>
          </Card>

          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">{t('summary.title')}</CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              <div className="grid grid-cols-2 gap-3">
                <div className="student-dreams-latest-box">
                  <p className="mindly-stat-value">{pendingAppointments.length}</p>
                  <p className="mindly-stat-hint">{t('summary.pending')}</p>
                </div>
                <div className="student-dreams-latest-box">
                  <p className="mindly-stat-value">{confirmedAppointments.length}</p>
                  <p className="mindly-stat-hint">{t('summary.confirmed')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
