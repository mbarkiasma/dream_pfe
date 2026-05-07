import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { CalendarDays, Clock } from 'lucide-react'

import { StudentRendezvousPsyForm } from '@/components/dashboard/student/StudentRendezvousPsyForm'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirme',
  rejected: 'Refuse',
  cancelled: 'Annule',
  completed: 'Termine',
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

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

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
  const { user } = await payload.auth({ headers: await getHeaders() })

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
  const sortedAppointments = [...docs].sort(
    (a, b) =>
      getAppointmentDateTime(a.date, a.startTime) - getAppointmentDateTime(b.date, b.startTime),
  )
  const now = Date.now()
  const nextAppointment =
    sortedAppointments.find(
      (appointment) =>
        appointment.status === 'confirmed' &&
        getAppointmentDateTime(appointment.date, appointment.startTime) >= now,
    ) || null

  return (
    <div>
      <StudentTopbar
        title="Rendez-vous"
        description="Demande un accompagnement adapte avec le psychologue et suis l'etat de tes rendez-vous."
      />

      <div className="student-appointments-grid">
        <div className="student-appointments-main">
          <Card className="student-appointments-card">
            <CardHeader className="student-appointments-card-header">
              <CardTitle className="student-appointments-title">
                Demander un rendez-vous
              </CardTitle>
            </CardHeader>

            <CardContent className="student-appointments-card-content">
              <StudentRendezvousPsyForm />
            </CardContent>
          </Card>

          <Card className="student-appointments-card">
            <CardHeader className="student-appointments-card-header">
              <CardTitle className="student-appointments-title">Mes demandes</CardTitle>
            </CardHeader>

            <CardContent className="student-appointments-card-content">
              {docs.length > 0 ? (
                <div className="student-appointments-list">
                  {sortedAppointments.map((appointment) => (
                    <div key={appointment.id} className="student-appointments-request">
                      <div className="student-appointments-request-header">
                        <div>
                          <p className="student-appointments-request-title">
                            {formatDate(appointment.date)} de {appointment.startTime} a{' '}
                            {appointment.endTime}
                          </p>

                          <p className="student-appointments-request-reason">
                            {appointment.reason}
                          </p>

                          {appointment.status === 'rejected' && appointment.rejectionReason ? (
                            <div className="student-appointments-rejection">
                              <p className="student-appointments-rejection-title">
                                Cause du refus
                              </p>
                              <p className="student-appointments-rejection-text">
                                {appointment.rejectionReason}
                              </p>
                              <p className="student-appointments-rejection-help">
                                Merci de choisir un autre rendez-vous disponible dans le calendrier.
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
                    <p className="student-appointments-empty-title">Aucune demande envoyee</p>
                    <p className="student-appointments-empty-text">
                      Tes demandes de rendez-vous apparaitront ici.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="student-appointments-side">
          <Card className="student-appointments-card">
            <CardHeader className="student-appointments-card-header">
              <CardTitle className="student-appointments-title">Prochaine seance</CardTitle>
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
                  <p className="student-appointments-text">
                    Aucune seance n&apos;est encore confirmee pour le moment.
                  </p>

                  <div className="mt-4">
                    <span className="student-appointments-badge">Aucun rendez-vous</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="student-appointments-card-soft">
            <CardHeader className="student-appointments-card-header">
              <CardTitle className="student-appointments-title">Informations</CardTitle>
            </CardHeader>

            <CardContent className="student-appointments-card-content">
              <p className="student-appointments-text">
                Les creneaux affiches viennent directement de l&apos;agenda du psychologue. Une fois
                la demande envoyee, elle reste en attente jusqu&apos;a confirmation.
              </p>

              <div className="mt-4">
                <span className="student-appointments-badge">Agenda du psychologue</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
