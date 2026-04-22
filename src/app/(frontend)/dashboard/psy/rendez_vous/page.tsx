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
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
  completed: 'bg-indigo-100 text-indigo-700',
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
  const pendingAppointments = docs.filter((appointment) => appointment.status === 'pending')
  const confirmedAppointments = docs.filter((appointment) => appointment.status === 'confirmed')
  const nextAppointment = confirmedAppointments[0]

  return (
    <div>
      <PsyTopbar
        title="Rendez-vous"
        description="Consultez les demandes des etudiants et organisez les consultations confirmees."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Demandes recues</CardTitle>
            </CardHeader>

            <CardContent>
              {docs.length > 0 ? (
                <div className="space-y-4">
                  {docs.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-2xl border border-violet-100 bg-white/80 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium text-[#6E628F]">
                            <UserRound className="h-4 w-4 text-violet-500" />
                            {getStudentName(appointment.student)}
                          </div>

                          <p className="mt-2 font-semibold text-[#2d1068]">
                            {formatDate(appointment.date)} de {appointment.startTime} a{' '}
                            {appointment.endTime}
                          </p>

                          <p className="mt-2 leading-6 text-[#6E628F]">{appointment.reason}</p>

                          {appointment.status === 'rejected' && appointment.rejectionReason ? (
                            <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
                              <p className="font-semibold">Cause du refus envoyee</p>
                              <p className="mt-1">{appointment.rejectionReason}</p>
                            </div>
                          ) : null}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                statusClasses[appointment.status] || 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {statusLabels[appointment.status] || appointment.status}
                            </span>

                            <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
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
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="rounded-2xl bg-indigo-100 p-3">
                    <CalendarDays className="h-5 w-5 text-indigo-600" />
                  </div>

                  <div>
                    <p className="font-medium text-[#2d1068]">Aucune demande pour le moment</p>
                    <p className="text-sm text-[#7A6A99]">
                      Les demandes envoyees par les etudiants apparaitront ici.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Prochaine consultation</CardTitle>
            </CardHeader>

            <CardContent>
              {nextAppointment ? (
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4">
                  <div className="rounded-2xl bg-emerald-100 p-3">
                    <Clock className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2d1068]">
                      {formatDate(nextAppointment.date)}
                    </p>
                    <p className="text-sm text-[#6E628F]">
                      {nextAppointment.startTime} - {nextAppointment.endTime}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="leading-7 text-[#6E628F]">
                  Aucune consultation n&apos;est encore confirmee pour le moment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Resume</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-2xl font-bold text-[#2d1068]">{pendingAppointments.length}</p>
                  <p className="text-sm text-[#6E628F]">En attente</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-2xl font-bold text-[#2d1068]">
                    {confirmedAppointments.length}
                  </p>
                  <p className="text-sm text-[#6E628F]">Confirmes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
