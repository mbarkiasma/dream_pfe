import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import { AlertTriangle, CalendarDays, Clock, Mail, UserRound } from 'lucide-react'

import type { RendezVousPsy, User } from '@/payload-types'
import { PsyStatsCards } from '@/components/dashboard/psy/PsyStatsCards'
import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusLabels: Record<RendezVousPsy['status'], string> = {
  pending: 'En attente',
  confirmed: 'Confirme',
  rejected: 'Refuse',
  cancelled: 'Annule',
  completed: 'Termine',
}

const statusClasses: Record<RendezVousPsy['status'], string> = {
  pending: 'border-border bg-dream-highlight text-dream-accent',
  confirmed: 'border-border bg-white text-dream-accent',
  rejected: 'border-border bg-dream-soft text-dream-accent',
  cancelled: 'border-border bg-white text-dream-muted',
  completed: 'border-border bg-dream-highlight text-dream-accent',
}

type AssignedStudent = {
  user: User
  appointments: RendezVousPsy[]
  nextAppointment?: RendezVousPsy
  pendingCount: number
  urgentCount: number
}

function isUser(value: unknown): value is User {
  return Boolean(value && typeof value === 'object' && 'id' in value && 'email' in value)
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getStudentName(student: User) {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim()

  return fullName || student.email
}

function getStartOfTodayISO() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return today.toISOString()
}

function buildAssignedStudents(appointments: RendezVousPsy[]): AssignedStudent[] {
  const students = new Map<number, AssignedStudent>()
  const startOfToday = getStartOfTodayISO()

  for (const appointment of appointments) {
    if (!isUser(appointment.student)) continue

    const current = students.get(appointment.student.id) || {
      user: appointment.student,
      appointments: [],
      pendingCount: 0,
      urgentCount: 0,
    }

    current.appointments.push(appointment)

    if (appointment.status === 'pending') {
      current.pendingCount += 1
    }

    if (appointment.urgency === 'urgent' && appointment.status !== 'completed') {
      current.urgentCount += 1
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

  return Array.from(students.values()).sort((a, b) => {
    const aDate = a.nextAppointment?.date || a.appointments[0]?.date || ''
    const bDate = b.nextAppointment?.date || b.appointments[0]?.date || ''

    return bDate.localeCompare(aDate)
  })
}

export default async function PsyStudentsPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

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
  const assignedStudents = buildAssignedStudents(appointments)
  const startOfToday = getStartOfTodayISO()
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === 'confirmed' && appointment.date >= startOfToday,
  )
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'pending')
  const urgentAppointments = appointments.filter(
    (appointment) => appointment.urgency === 'urgent' && appointment.status !== 'completed',
  )

  return (
    <div>
      <PsyTopbar
        title="Etudiants assignes"
        description="Consultez les etudiants orientes vers le suivi psychologique."
      />

      <PsyStatsCards
        stats={[
          {
            label: 'Etudiants assignes',
            value: assignedStudents.length,
            hint: 'Suivi clinique',
          },
          {
            label: 'Rendez-vous prevus',
            value: upcomingAppointments.length,
            hint: 'Consultations',
          },
          {
            label: 'Cas en attente',
            value: pendingAppointments.length,
            hint: 'A traiter',
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="xl:col-span-2">
          <Card className="overflow-hidden rounded-[32px] border border-border bg-card/85 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="border-b border-border/70 bg-white/65 pb-4 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-dream-accent">
                    Suivi clinique
                  </p>
                  <CardTitle className="mt-1 text-2xl text-dream-heading dark:text-white">
                    Etudiants assignes
                  </CardTitle>
                </div>
                <Badge className="border-border bg-dream-highlight text-dream-accent">
                  {assignedStudents.length} dossier{assignedStudents.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {assignedStudents.length > 0 ? (
                <div className="grid gap-3">
                  {assignedStudents.map((item) => (
                    <Link
                      key={item.user.id}
                      href="/dashboard/psy/rendez_vous"
                      className="group block rounded-[26px] border border-border bg-card/90 p-4 shadow-[0_10px_30px_rgba(109,40,217,0.06)] transition hover:-translate-y-0.5 hover:border-border hover:bg-dream-softer hover:shadow-[0_18px_50px_rgba(109,40,217,0.12)] dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.09]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-[22px] bg-dream-highlight text-dream-accent transition group-hover:bg-dream-softer0 group-hover:text-white dark:bg-dream-softer0/15 dark:text-violet-100">
                              <UserRound className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-dream-heading dark:text-white">
                                {getStudentName(item.user)}
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-sm text-dream-muted dark:text-white/60">
                                <Mail className="h-3.5 w-3.5" />
                                {item.user.email}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Badge className="border-border bg-dream-softer text-dream-accent">
                              {item.appointments.length} rendez-vous
                            </Badge>
                            {item.pendingCount > 0 ? (
                              <Badge className="border-border bg-dream-highlight text-dream-accent">
                                {item.pendingCount} en attente
                              </Badge>
                            ) : null}
                            {item.urgentCount > 0 ? (
                              <Badge className="border-border bg-white text-dream-accent">
                                {item.urgentCount} urgent
                              </Badge>
                            ) : null}
                          </div>
                        </div>

                        <div className="min-w-[190px] rounded-[22px] border border-border bg-dream-soft p-3 dark:border-white/10 dark:bg-white/[0.06]">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dream-accent">
                            Prochaine consultation
                          </p>
                          {item.nextAppointment ? (
                            <p className="mt-2 text-sm font-medium text-dream-heading dark:text-white">
                              {formatDate(item.nextAppointment.date)} a{' '}
                              {item.nextAppointment.startTime}
                            </p>
                          ) : (
                            <p className="mt-2 text-sm text-dream-muted dark:text-white/60">
                              Aucune consultation confirmee
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-[24px] border border-border bg-dream-softer p-5 dark:border-white/10 dark:bg-white/[0.06]">
                  <div className="rounded-2xl bg-dream-highlight p-3 dark:bg-violet-400/15">
                    <UserRound className="h-5 w-5 text-dream-accent dark:text-violet-200" />
                  </div>
                  <div>
                    <p className="font-medium text-dream-heading dark:text-white">
                      Aucun etudiant assigne
                    </p>
                    <p className="text-sm text-[#7A6A99] dark:text-white/60">
                      Les etudiants apparaitront ici apres une demande de rendez-vous.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="rounded-[30px] border border-border bg-card/85 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">Rendez-vous</CardTitle>
            </CardHeader>

            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 4).map((appointment) => (
                    <Link
                      key={appointment.id}
                      className="flex items-start gap-3 rounded-[22px] border border-border bg-dream-softer p-3 transition hover:border-border hover:bg-dream-highlight dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.10]"
                      href="/dashboard/psy/rendez_vous"
                    >
                      <Clock className="mt-0.5 h-4 w-4 text-dream-accent dark:text-violet-200" />
                      <div>
                        <p className="text-sm font-medium text-dream-heading dark:text-white">
                          {isUser(appointment.student)
                            ? getStudentName(appointment.student)
                            : 'Etudiant'}
                        </p>
                        <p className="text-xs text-dream-muted dark:text-white/60">
                          {formatDate(appointment.date)} - {appointment.startTime}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="leading-7 text-dream-muted dark:text-white/65">
                  Aucune consultation confirmee pour le moment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border border-border bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-dream-card backdrop-blur dark:border-white/10 dark:from-white/[0.08] dark:via-white/[0.06] dark:to-violet-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Suivi clinique
              </CardTitle>
            </CardHeader>

            <CardContent>
              {urgentAppointments.length > 0 ? (
                <div className="space-y-3">
                  {urgentAppointments.slice(0, 4).map((appointment) => (
                    <Link
                      key={appointment.id}
                      className="block rounded-[22px] border border-border bg-card/80 p-3 transition hover:border-border hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.10]"
                      href="/dashboard/psy/rendez_vous"
                    >
                      <p className="flex items-center gap-2 text-sm font-semibold text-dream-accent dark:text-violet-200">
                        <AlertTriangle className="h-4 w-4" />
                        {isUser(appointment.student)
                          ? getStudentName(appointment.student)
                          : 'Etudiant'}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-dream-muted dark:text-white/70">
                        {appointment.reason}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-[22px] border border-border bg-card/70 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                  <CalendarDays className="h-5 w-5 text-dream-accent dark:text-violet-200" />
                  <p className="text-sm leading-6 text-dream-muted dark:text-white/65">
                    Aucun cas urgent actif. Les demandes urgentes seront affichees ici.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
