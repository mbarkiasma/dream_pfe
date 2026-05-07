import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { CalendarDays, Clock, UserRound } from 'lucide-react'

import { PsyRendezvousActions } from '@/components/dashboard/psy/PsyRendezvousActions'
import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirme',
  rejected: 'Refuse',
  cancelled: 'Annule',
  completed: 'Termine',
}

const statusClasses: Record<string, string> = {
  pending: 'student-dream-status-generating',
  confirmed: 'student-dream-status-ready',
  rejected: 'student-dream-status-failed',
  cancelled: 'student-dream-status-pending',
  completed: 'student-dream-status-ready',
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function getStudentName(student: unknown) {
  if (!student || typeof student !== 'object') return 'Etudiant'

  const data = student as {
    firstName?: string | null
    lastName?: string | null
    email?: string | null
  }
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim()

  return fullName || data.email || 'Etudiant'
}

function getAppointmentDateTime(date: string | null | undefined, startTime: string | null | undefined) {
  if (!date) return Number.POSITIVE_INFINITY

  const appointmentDate = new Date(date)

  if (Number.isNaN(appointmentDate.getTime())) return Number.POSITIVE_INFINITY

  const [hours = '0', minutes = '0'] = (startTime || '00:00').split(':')

  appointmentDate.setHours(Number(hours), Number(minutes), 0, 0)

  return appointmentDate.getTime()
}

export default async function PsyRendezVousPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  const appointments = user
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
        sort: '-createdAt',
        limit: 50,
      })
    : null

  const docs = appointments?.docs || []
  const sortedAppointments = [...docs].sort(
    (a, b) =>
      getAppointmentDateTime(a.date, a.startTime) - getAppointmentDateTime(b.date, b.startTime),
  )
  const pendingAppointments = docs.filter((appointment) => appointment.status === 'pending')
  const confirmedAppointments = docs.filter((appointment) => appointment.status === 'confirmed')
  const now = Date.now()
  const nextAppointment =
    confirmedAppointments
      .filter((appointment) => getAppointmentDateTime(appointment.date, appointment.startTime) >= now)
      .sort(
        (a, b) =>
          getAppointmentDateTime(a.date, a.startTime) - getAppointmentDateTime(b.date, b.startTime),
      )[0] || null

  return (
    <div>
      <PsyTopbar
        title="Rendez-vous"
        description="Consultez les demandes des etudiants et organisez les consultations confirmees."
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">
                Demandes recues
              </CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              {docs.length > 0 ? (
                <div className="mindly-stack-md">
                  {sortedAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="student-dreams-latest-box"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium mindly-feature-text">
                            <UserRound className="h-4 w-4" />
                            {getStudentName(appointment.student)}
                          </div>

                          <p className="mt-2 mindly-feature-reference">
                            {formatDate(appointment.date)} de {appointment.startTime} a{' '}
                            {appointment.endTime}
                          </p>

                          <p className="mt-2 mindly-feature-text">
                            {appointment.reason}
                          </p>

                          {appointment.status === 'rejected' && appointment.rejectionReason ? (
                            <div className="mt-3 rounded-2xl student-dream-status-failed p-3 text-sm">
                              <p className="font-semibold">Cause du refus envoyee</p>
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
                              {appointment.urgency === 'urgent' ? 'Urgente' : 'Normale'}
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
                    <p className="mindly-feature-reference">
                      Aucune demande pour le moment
                    </p>
                    <p className="mindly-feature-text">
                      Les demandes envoyees par les etudiants apparaitront ici.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mindly-stack-lg">
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">
                Prochaine consultation
              </CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              {nextAppointment ? (
                <div className="student-dreams-latest-box flex items-center gap-3">
                  <div className="mindly-feature-icon">
                    <Clock />
                  </div>
                  <div>
                    <p className="mindly-feature-reference">
                      {formatDate(nextAppointment.date)}
                    </p>
                    <p className="mindly-feature-text">
                      {nextAppointment.startTime} - {nextAppointment.endTime}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mindly-feature-text">
                  Aucune consultation n&apos;est encore confirmee pour le moment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">Resume</CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              <div className="grid grid-cols-2 gap-3">
                <div className="student-dreams-latest-box">
                  <p className="mindly-stat-value">
                    {pendingAppointments.length}
                  </p>
                  <p className="mindly-stat-hint">En attente</p>
                </div>
                <div className="student-dreams-latest-box">
                  <p className="mindly-stat-value">
                    {confirmedAppointments.length}
                  </p>
                  <p className="mindly-stat-hint">Confirmes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
