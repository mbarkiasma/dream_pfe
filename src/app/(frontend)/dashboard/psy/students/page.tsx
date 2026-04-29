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
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  cancelled: 'border-slate-200 bg-slate-50 text-slate-600',
  completed: 'border-indigo-200 bg-indigo-50 text-indigo-700',
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

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-white">
                Etudiants assignes
              </CardTitle>
            </CardHeader>

            <CardContent>
              {assignedStudents.length > 0 ? (
                <div className="space-y-4">
                  {assignedStudents.map((item) => (
                    <div
                      key={item.user.id}
                      className="rounded-2xl border border-violet-100 bg-white/85 p-4 dark:border-white/10 dark:bg-white/[0.06]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-100">
                              <UserRound className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#2d1068] dark:text-white">
                                {getStudentName(item.user)}
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-sm text-[#6E628F] dark:text-white/60">
                                <Mail className="h-3.5 w-3.5" />
                                {item.user.email}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Badge className="border-violet-200 bg-violet-50 text-violet-700">
                              {item.appointments.length} rendez-vous
                            </Badge>
                            {item.pendingCount > 0 ? (
                              <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                                {item.pendingCount} en attente
                              </Badge>
                            ) : null}
                            {item.urgentCount > 0 ? (
                              <Badge className="border-red-200 bg-red-50 text-red-700">
                                {item.urgentCount} urgent
                              </Badge>
                            ) : null}
                          </div>
                        </div>

                        <div className="min-w-[180px] rounded-2xl bg-[#F8F3FF] p-3 dark:bg-white/[0.06]">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9B6BFF]">
                            Prochaine consultation
                          </p>
                          {item.nextAppointment ? (
                            <p className="mt-2 text-sm font-medium text-[#2d1068] dark:text-white">
                              {formatDate(item.nextAppointment.date)} a{' '}
                              {item.nextAppointment.startTime}
                            </p>
                          ) : (
                            <p className="mt-2 text-sm text-[#6E628F] dark:text-white/60">
                              Aucune consultation confirmee
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.06]">
                  <div className="rounded-2xl bg-violet-100 p-3 dark:bg-violet-400/15">
                    <UserRound className="h-5 w-5 text-violet-600 dark:text-violet-200" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2d1068] dark:text-white">
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

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-white">Rendez-vous</CardTitle>
            </CardHeader>

            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 4).map((appointment) => (
                    <Link
                      key={appointment.id}
                      className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15"
                      href="/dashboard/psy/rendez_vous"
                    >
                      <Clock className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-200" />
                      <div>
                        <p className="text-sm font-medium text-[#2d1068] dark:text-white">
                          {isUser(appointment.student)
                            ? getStudentName(appointment.student)
                            : 'Etudiant'}
                        </p>
                        <p className="text-xs text-[#6E628F] dark:text-white/60">
                          {formatDate(appointment.date)} - {appointment.startTime}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="leading-7 text-[#6E628F] dark:text-white/65">
                  Aucune consultation confirmee pour le moment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:from-white/[0.08] dark:via-white/[0.06] dark:to-violet-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-white">
                Suivi clinique
              </CardTitle>
            </CardHeader>

            <CardContent>
              {urgentAppointments.length > 0 ? (
                <div className="space-y-3">
                  {urgentAppointments.slice(0, 4).map((appointment) => (
                    <Link
                      key={appointment.id}
                      className="block rounded-2xl border border-red-100 bg-red-50 p-3 transition hover:bg-red-100 dark:border-red-400/20 dark:bg-red-500/10 dark:hover:bg-red-500/15"
                      href="/dashboard/psy/rendez_vous"
                    >
                      <p className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-200">
                        <AlertTriangle className="h-4 w-4" />
                        {isUser(appointment.student)
                          ? getStudentName(appointment.student)
                          : 'Etudiant'}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-red-700/80 dark:text-red-100/70">
                        {appointment.reason}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 dark:bg-white/[0.06]">
                  <CalendarDays className="h-5 w-5 text-violet-600 dark:text-violet-200" />
                  <p className="text-sm leading-6 text-[#6E628F] dark:text-white/65">
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
