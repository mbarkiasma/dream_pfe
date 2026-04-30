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
  const nextAppointment = docs.find((appointment) => appointment.status === 'confirmed')

  return (
    <div>
      <StudentTopbar
        title="Rendez-vous"
        description="Demande un accompagnement adapte avec le psychologue et suis l'etat de tes rendez-vous."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-foreground">
                Demander un rendez-vous
              </CardTitle>
            </CardHeader>

            <CardContent>
              <StudentRendezvousPsyForm />
            </CardContent>
          </Card>

          <Card className="mt-6 rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-foreground">
                Mes demandes
              </CardTitle>
            </CardHeader>

            <CardContent>
              {docs.length > 0 ? (
                <div className="space-y-3">
                  {docs.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-2xl border border-border bg-card/80 p-4 dark:border-white/10 dark:bg-white/[0.05]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-dream-heading dark:text-foreground">
                            {formatDate(appointment.date)} de {appointment.startTime} a{' '}
                            {appointment.endTime}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-dream-muted dark:text-muted-foreground">
                            {appointment.reason}
                          </p>
                          {appointment.status === 'rejected' && appointment.rejectionReason ? (
                            <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">
                              <p className="font-semibold">Cause du refus</p>
                              <p className="mt-1">{appointment.rejectionReason}</p>
                              <p className="mt-2 font-medium">
                                Merci de choisir un autre rendez-vous disponible dans le calendrier.
                              </p>
                            </div>
                          ) : null}
                        </div>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            statusClasses[appointment.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {statusLabels[appointment.status] || appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.05]">
                  <div className="rounded-2xl bg-indigo-100 p-3 dark:bg-indigo-500/15">
                    <CalendarDays className="h-5 w-5 text-indigo-600" />
                  </div>

                  <div>
                    <p className="font-medium text-dream-heading dark:text-foreground">
                      Aucune demande envoyee
                    </p>
                    <p className="text-sm text-[#7A6A99] dark:text-muted-foreground">
                      Tes demandes de rendez-vous apparaitront ici.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-foreground">
                Prochaine seance
              </CardTitle>
            </CardHeader>

            <CardContent>
              {nextAppointment ? (
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                  <div className="rounded-2xl bg-emerald-100 p-3 dark:bg-emerald-500/15">
                    <Clock className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-dream-heading dark:text-foreground">
                      {formatDate(nextAppointment.date)}
                    </p>
                    <p className="text-sm text-dream-muted dark:text-muted-foreground">
                      {nextAppointment.startTime} - {nextAppointment.endTime}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="leading-7 text-dream-muted dark:text-muted-foreground">
                    Aucune seance n&apos;est encore confirmee pour le moment.
                  </p>

                  <div className="mt-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-muted-foreground">
                      Aucun rendez-vous
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(168,85,247,0.10)_100%)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-foreground">
                Informations
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-dream-muted dark:text-muted-foreground">
                Les creneaux affiches viennent directement de l&apos;agenda du psychologue. Une fois
                la demande envoyee, elle reste en attente jusqu&apos;a confirmation.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-dream-highlight px-3 py-1 text-xs font-medium text-dream-accent dark:bg-dream-softer0/15 dark:text-violet-200">
                  Agenda du psychologue
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
