import config from '@payload-config'
import { getPayload } from 'payload'
import { CalendarDays, Clock } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import { StudentRendezvousPsyForm } from '@/components/dashboard/student/StudentRendezvousPsyForm'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

function getAppointmentDateTime(date: string | null | undefined, startTime: string | null | undefined) {
  if (!date) return Number.POSITIVE_INFINITY

  const appointmentDate = new Date(date)

  if (Number.isNaN(appointmentDate.getTime())) return Number.POSITIVE_INFINITY

  const [hours = '0', minutes = '0'] = (startTime || '00:00').split(':')

  appointmentDate.setHours(Number(hours), Number(minutes), 0, 0)

  return appointmentDate.getTime()
}

export default async function StudentAppointmentsPage() {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.student.appointments')
  const locale = await getLocale()

  const statusLabels: Record<string, string> = {
    pending: t('status.pending'),
    confirmed: t('status.confirmed'),
    rejected: t('status.rejected'),
    cancelled: t('status.cancelled'),
    completed: t('status.completed'),
  }

  const statusClasses: Record<string, string> = {
    pending: 'student-appointments-status-pending',
    confirmed: 'student-appointments-status-confirmed',
    rejected: 'student-appointments-status-rejected',
    cancelled: 'student-appointments-status-cancelled',
    completed: 'student-appointments-status-completed',
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return ''

    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value))
  }

  const appointments = user
    ? await payload.find({
        collection: 'rendez-vous-psy',
        user,
        overrideAccess: false,
        where: {
          student: {
            equals: user.id,
          },
        },
        depth: 1,
        sort: '-createdAt',
        limit: 20,
      })
    : null

  const docs = appointments?.docs || []
  const requestAppointments = docs
  const chronologicalAppointments = [...docs].sort(
    (a, b) =>
      getAppointmentDateTime(a.date, a.startTime) - getAppointmentDateTime(b.date, b.startTime),
  )
  const now = Date.now()
  const nextAppointment =
    chronologicalAppointments.find(
      (appointment) =>
        appointment.status === 'confirmed' &&
        getAppointmentDateTime(appointment.date, appointment.startTime) >= now,
    ) || null

  return (
    <div>
      <StudentTopbar
        title={t('topbar.title')}
        description={t('topbar.description')}
      />

      <div className="student-appointments-grid">
        <div className="student-appointments-main">
          <Card className="student-appointments-card">
            <CardHeader className="student-appointments-card-header">
              <CardTitle className="student-appointments-title">
                {t('requestCard')}
              </CardTitle>
            </CardHeader>

            <CardContent className="student-appointments-card-content">
              <StudentRendezvousPsyForm />
            </CardContent>
          </Card>

          <Card className="student-appointments-card">
            <CardHeader className="student-appointments-card-header">
              <CardTitle className="student-appointments-title">{t('myRequestsCard')}</CardTitle>
            </CardHeader>

            <CardContent className="student-appointments-card-content">
              {docs.length > 0 ? (
                <div className="student-appointments-list">
                  {requestAppointments.map((appointment) => (
                    <div key={appointment.id} className="student-appointments-request">
                      <div className="student-appointments-request-header">
                        <div>
                          <p className="student-appointments-request-title">
                            {t('timeRange', {
                              date: formatDate(appointment.date),
                              start: appointment.startTime,
                              end: appointment.endTime,
                            })}
                          </p>

                          <p className="student-appointments-request-reason">
                            {appointment.reason}
                          </p>

                          {appointment.status === 'rejected' && appointment.rejectionReason ? (
                            <div className="student-appointments-rejection">
                              <p className="student-appointments-rejection-title">
                                {t('rejectionTitle')}
                              </p>
                              <p className="student-appointments-rejection-text">
                                {appointment.rejectionReason}
                              </p>
                              <p className="student-appointments-rejection-help">
                                {t('rejectionHelp')}
                              </p>
                            </div>
                          ) : null}
                        </div>

                        <span
                          className={`student-appointments-status ${
                            statusClasses[appointment.status] ||
                            'student-appointments-status-cancelled'
                          }`}
                        >
                          {statusLabels[appointment.status] || appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="student-appointments-empty">
                  <div className="student-appointments-empty-icon">
                    <CalendarDays />
                  </div>

                  <div>
                    <p className="student-appointments-empty-title">{t('emptyTitle')}</p>
                    <p className="student-appointments-empty-text">{t('emptyText')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="student-appointments-side">
          <Card className="student-appointments-card">
            <CardHeader className="student-appointments-card-header">
              <CardTitle className="student-appointments-title">{t('nextSession')}</CardTitle>
            </CardHeader>

            <CardContent className="student-appointments-card-content">
              {nextAppointment ? (
                <div className="student-appointments-next">
                  <div className="student-appointments-next-icon">
                    <Clock />
                  </div>
                  <div>
                    <p className="student-appointments-next-title">
                      {formatDate(nextAppointment.date)}
                    </p>
                    <p className="student-appointments-next-text">
                      {nextAppointment.startTime} - {nextAppointment.endTime}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="student-appointments-text">{t('noNextSession')}</p>

                  <div className="mt-4">
                    <span className="student-appointments-badge">{t('noAppointmentBadge')}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="student-appointments-card-soft">
            <CardHeader className="student-appointments-card-header">
              <CardTitle className="student-appointments-title">{t('infoTitle')}</CardTitle>
            </CardHeader>

            <CardContent className="student-appointments-card-content">
              <p className="student-appointments-text">{t('infoText')}</p>

              <div className="mt-4">
                <span className="student-appointments-badge">{t('scheduleBadge')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
