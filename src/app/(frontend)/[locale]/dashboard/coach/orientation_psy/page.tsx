import { getPayload } from 'payload'
import config from '@payload-config'

import type { PsyOrientation, User } from '@/payload-types'
import { CoachPsyOrientationForm } from '@/components/dashboard/coach/CoachPsyOrientationForm'
import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRelationId } from '@/lib/coaching'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

const statusLabels: Record<PsyOrientation['status'], string> = {
  appointment_requested: 'Rendez-vous demande',
  cancelled: 'Annulee',
  pending_student_response: 'En attente etudiant',
  student_accepted: 'Acceptee',
  student_refused: 'Refusee',
}

function isUser(value: unknown): value is User {
  return Boolean(value && typeof value === 'object' && 'id' in value)
}

function getUserName(user: unknown) {
  if (!isUser(user)) return 'Etudiant'

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()

  return fullName || user.email || 'Etudiant'
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default async function CoachReferralPage() {
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })

  const students = await payload.find({
    collection: 'users',
    user,
    overrideAccess: false,
    where: {
      role: {
        equals: 'etudiant',
      },
    },
    depth: 0,
    limit: 200,
    sort: 'firstName',
  })

  const orientations = await payload.find({
    collection: 'psy-orientations',
    user,
    overrideAccess: false,
    where: {
      coach: {
        equals: user?.id,
      },
    },
    depth: 1,
    limit: 50,
    sort: '-createdAt',
  })

  return (
    <div>
      <CoachTopbar
        title="Orientation psy"
        description="Gerez les etudiants a orienter vers le psychologue lorsque la situation le necessite."
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">Orienter un etudiant</CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              <CoachPsyOrientationForm
                students={students.docs.map((student) => ({
                  email: student.email,
                  firstName: student.firstName,
                  id: student.id,
                  lastName: student.lastName,
                }))}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">Historique</CardTitle>
            </CardHeader>

            <CardContent className="mindly-feature-content">
              {orientations.docs.length > 0 ? (
                <div className="mindly-stack-sm">
                  {orientations.docs.map((orientation) => (
                    <div key={orientation.id} className="student-dreams-latest-box">
                      <div className="student-dreams-latest-header">
                        <div>
                          <p className="mindly-feature-reference">
                            {getUserName(orientation.student)}
                          </p>
                          <p className="mindly-feature-text mt-1">
                            {formatDate(orientation.createdAt)}
                          </p>
                        </div>
                        <span className="mindly-ui-badge">
                          {statusLabels[orientation.status] || orientation.status}
                        </span>
                      </div>

                      <p className="mindly-feature-text mt-3">{orientation.reason}</p>

                      {orientation.appointment ? (
                        <p className="mindly-feature-text mt-2">
                          Rendez-vous #{getRelationId(orientation.appointment)}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="mindly-feature-text">
                    Aucune orientation n&apos;a encore ete envoyee.
                  </p>

                  <div className="mt-4">
                    <span className="mindly-ui-badge">Aucune orientation</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
