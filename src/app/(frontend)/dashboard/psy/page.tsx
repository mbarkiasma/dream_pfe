import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import { AlertTriangle, CalendarDays, Clock, UserRound } from 'lucide-react'

import type { RendezVousPsy, User } from '@/payload-types'
import { PsyStatsCards } from '@/components/dashboard/psy/PsyStatsCards'
import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function isUser(value: unknown): value is User {
  return Boolean(value && typeof value === 'object' && 'id' in value && 'email' in value)
}

function getStudentName(student: User) {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim()

  return fullName || student.email
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''

  return new Intl.DateTimeFormat('fr-FR', {
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

export default async function PsyDashboardPage() {
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
  const startOfToday = getStartOfTodayISO()
  const activeStudentIds = new Set(
    appointments
      .filter((appointment) => isUser(appointment.student))
      .map((appointment) => (appointment.student as User).id),
  )
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === 'confirmed' && appointment.date >= startOfToday,
  )
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'pending')
  const urgentAppointments = appointments.filter(
    (appointment) => appointment.urgency === 'urgent' && appointment.status !== 'completed',
  )
  const latestAssignedStudents = Array.from(
    appointments
      .filter((appointment) => isUser(appointment.student))
      .reduce((students, appointment) => {
        const student = appointment.student as User
        if (!students.has(student.id)) students.set(student.id, student)
        return students
      }, new Map<number, User>())
      .values(),
  ).slice(0, 4)

  return (
    <div>
      <PsyTopbar
        title="Dashboard Psychologue"
        description="Bienvenue dans votre espace de suivi clinique des etudiants et des rendez-vous."
      />

      <PsyStatsCards
        stats={[
          {
            label: 'Etudiants assignes',
            value: activeStudentIds.size,
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
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Etudiants assignes
              </CardTitle>
              <Link
                className="text-sm font-semibold text-dream-accent hover:text-dream-accent dark:text-violet-200"
                href="/dashboard/psy/students"
              >
                Voir tout
              </Link>
            </CardHeader>

            <CardContent>
              {latestAssignedStudents.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {latestAssignedStudents.map((student) => (
                    <Link
                      key={student.id}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card/85 p-4 transition hover:bg-dream-softer dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.10]"
                      href="/dashboard/psy/students"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dream-highlight text-dream-accent dark:bg-dream-softer0/15 dark:text-violet-100">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-dream-heading dark:text-white">
                          {getStudentName(student)}
                        </p>
                        <p className="truncate text-sm text-dream-muted dark:text-white/60">
                          {student.email}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.06]">
                  <UserRound className="h-5 w-5 text-dream-accent dark:text-violet-200" />
                  <p className="text-sm text-dream-muted dark:text-white/65">
                    Aucun etudiant assigne pour le moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">Rendez-vous</CardTitle>
            </CardHeader>

            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <Link
                      key={appointment.id}
                      className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15"
                      href="/dashboard/psy/rendez_vous"
                    >
                      <Clock className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-200" />
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

          <Card className="rounded-[28px] border border-border bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-dream-card backdrop-blur dark:border-white/10 dark:from-white/[0.08] dark:via-white/[0.06] dark:to-violet-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Suivi clinique
              </CardTitle>
            </CardHeader>

            <CardContent>
              {urgentAppointments.length > 0 ? (
                <div className="space-y-3">
                  {urgentAppointments.slice(0, 3).map((appointment) => (
                    <Link
                      key={appointment.id}
                      className="block rounded-2xl border border-red-100 bg-red-50 p-3 transition hover:bg-red-100 dark:border-red-400/20 dark:bg-red-500/10"
                      href="/dashboard/psy/rendez_vous"
                    >
                      <p className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-200">
                        <AlertTriangle className="h-4 w-4" />
                        {isUser(appointment.student)
                          ? getStudentName(appointment.student)
                          : 'Etudiant'}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-red-700/80 dark:text-red-100/70">
                        {appointment.reason}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-card/70 p-4 dark:bg-white/[0.06]">
                    <CalendarDays className="h-5 w-5 text-dream-accent dark:text-violet-200" />
                    <p className="text-sm leading-6 text-dream-muted dark:text-white/65">
                      Aucun cas urgent actif.
                    </p>
                  </div>
                  {pendingAppointments.length > 0 ? (
                    <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                      {pendingAppointments.length} demande(s) a traiter
                    </Badge>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
