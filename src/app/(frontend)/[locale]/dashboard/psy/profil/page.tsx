import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Mail, UserRound } from 'lucide-react'

import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRelationId } from '@/lib/coaching'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

function getDisplayName(user: {
  email?: string | null
  firstName?: string | null
  lastName?: string | null
}) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()

  return fullName || user.email || 'Psychologue'
}

export default async function PsyProfilPage() {
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })

  if (!user) {
    redirect('/login')
  }

  const appointments = await payload.find({
    collection: 'rendez-vous-psy',
    user,
    overrideAccess: false,
    where: {
      psychologist: {
        equals: user.id,
      },
    },
    depth: 0,
    limit: 100,
  })

  const orientations = await payload.find({
    collection: 'psy-orientations',
    user,
    overrideAccess: false,
    where: {
      status: {
        in: ['appointment_requested', 'student_accepted'],
      },
    },
    depth: 0,
    limit: 100,
  })

  const assignedStudentCount = new Set(
    appointments.docs
      .map((appointment) => getRelationId(appointment.student))
      .filter((studentId) => studentId !== null)
      .map(String),
  ).size
  const pendingAppointments = appointments.docs.filter(
    (appointment) => appointment.status === 'pending',
  ).length
  const confirmedAppointments = appointments.docs.filter(
    (appointment) => appointment.status === 'confirmed',
  ).length
  const displayName = getDisplayName(user)
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div>
      <PsyTopbar
        title="Mon profil"
        description="Consultez vos informations générales et les paramètres liés à votre activité."
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Card className="mindly-feature-card overflow-hidden border-white/80 shadow-dream-card-lg dark:border-white/10">
            <CardHeader className="mindly-feature-header border-b border-border/70 bg-white/80 backdrop-blur dark:bg-white/[0.04]">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[30px] bg-[var(--mindly-primary)] text-3xl font-black text-white shadow-dream-card-lg ring-8 ring-violet-100/70 dark:ring-white/10">
                    {initials || <UserRound className="h-8 w-8" />}
                  </div>
                  <div>
                    <p className="mindly-feature-reference">Profil psychologue</p>
                    <CardTitle className="mt-2 text-3xl font-black text-dream-heading dark:text-white">
                      {displayName}
                    </CardTitle>
                    <p className="mt-2 flex items-center gap-2 text-sm text-dream-muted dark:text-white/65">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="break-all">{user.email || 'Non renseigné'}</span>
                    </p>
                  </div>
                </div>

                <span className="mindly-ui-badge self-start md:self-center">Compte actif</span>
              </div>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.06]">
                  <p className="mindly-feature-reference">Nom complet</p>
                  <p className="mt-2 text-lg font-semibold text-dream-heading dark:text-white">
                    {displayName}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.06]">
                  <p className="mindly-feature-reference">Email</p>
                  <p className="mt-2 break-words text-lg font-semibold text-dream-heading dark:text-white">
                    {user.email || 'Non renseigné'}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.06]">
                  <p className="mindly-feature-reference">Rôle</p>
                  <p className="mt-2 text-lg font-semibold text-dream-heading dark:text-white">
                    Psychologue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mindly-stack-lg">
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">Activite</CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              <div className="mindly-stack-sm">
                <span className="mindly-ui-badge">{assignedStudentCount} etudiant(s)</span>
                <span className="mindly-ui-badge">{appointments.totalDocs} rendez-vous</span>
                <span className="mindly-ui-badge">{confirmedAppointments} confirme(s)</span>
                <span className="mindly-ui-badge">{pendingAppointments} en attente</span>
                <span className="mindly-ui-badge">{orientations.totalDocs} orientation(s)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
