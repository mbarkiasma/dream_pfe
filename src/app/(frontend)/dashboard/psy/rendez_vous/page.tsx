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
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Demandes recues
              </CardTitle>
            </CardHeader>

            <CardContent>
              {docs.length > 0 ? (
                <div className="space-y-4">
                  {docs.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-2xl border border-border bg-card/80 p-4 dark:border-white/10 dark:bg-white/[0.06]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium text-dream-muted dark:text-white/60">
                            <UserRound className="h-4 w-4 text-dream-accent" />
                            {getStudentName(appointment.student)}
                          </div>

                          <p className="mt-2 font-semibold text-dream-heading dark:text-white">
                            {formatDate(appointment.date)} de {appointment.startTime} a{' '}
                            {appointment.endTime}
                          </p>

                          <p className="mt-2 leading-6 text-dream-muted dark:text-white/65">
                            {appointment.reason}
                          </p>

                          {appointment.status === 'rejected' && appointment.rejectionReason ? (
                            <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">
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

                            <span className="inline-flex rounded-full bg-dream-highlight px-3 py-1 text-xs font-medium text-dream-accent">
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
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.06]">
                  <div className="rounded-2xl bg-indigo-100 p-3 dark:bg-indigo-400/15">
                    <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-200" />
                  </div>

                  <div>
                    <p className="font-medium text-dream-heading dark:text-white">
                      Aucune demande pour le moment
                    </p>
                    <p className="text-sm text-[#7A6A99] dark:text-white/60">
                      Les demandes envoyees par les etudiants apparaitront ici.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Prochaine consultation
              </CardTitle>
            </CardHeader>

            <CardContent>
              {nextAppointment ? (
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                  <div className="rounded-2xl bg-emerald-100 p-3 dark:bg-emerald-400/15">
                    <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-200" />
                  </div>
                  <div>
                    <p className="font-medium text-dream-heading dark:text-white">
                      {formatDate(nextAppointment.date)}
                    </p>
                    <p className="text-sm text-dream-muted dark:text-white/60">
                      {nextAppointment.startTime} - {nextAppointment.endTime}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="leading-7 text-dream-muted dark:text-white/65">
                  Aucune consultation n&apos;est encore confirmee pour le moment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-dream-card backdrop-blur dark:border-white/10 dark:from-white/[0.08] dark:via-white/[0.06] dark:to-violet-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">Resume</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-card/80 p-4 dark:bg-white/[0.06]">
                  <p className="text-2xl font-bold text-dream-heading dark:text-white">
                    {pendingAppointments.length}
                  </p>
                  <p className="text-sm text-dream-muted dark:text-white/60">En attente</p>
                </div>
                <div className="rounded-2xl bg-card/80 p-4 dark:bg-white/[0.06]">
                  <p className="text-2xl font-bold text-dream-heading dark:text-white">
                    {confirmedAppointments.length}
                  </p>
                  <p className="text-sm text-dream-muted dark:text-white/60">Confirmes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
