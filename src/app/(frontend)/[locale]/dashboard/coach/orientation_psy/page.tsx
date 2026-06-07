import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'

import type { User } from '@/payload-types'
import { CoachPsyOrientationForm } from '@/components/dashboard/coach/CoachPsyOrientationForm'
import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRelationId } from '@/lib/coaching'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'


function isUser(value: unknown): value is User {
  return Boolean(value && typeof value === 'object' && 'id' in value)
}

function getUserName(user: unknown) {
  if (!isUser(user)) return 'Étudiant'

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()

  return fullName || user.email || 'Étudiant'
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
  const t = await getTranslations('dashboard.coach.orientationPsy')

  const sessions = user
    ? await payload.find({
        collection: 'coaching-sessions',
        user,
        overrideAccess: false,
        where: { coach: { equals: user.id } },
        depth: 1,
        limit: 200,
      })
    : { docs: [] }

  const assignedStudentIds = [
    ...new Set(
      sessions.docs
        .map((s) => {
          const student = s.student
          return student && typeof student === 'object' && 'id' in student
            ? String(student.id)
            : typeof student === 'number' || typeof student === 'string'
              ? String(student)
              : null
        })
        .filter((id): id is string => id !== null),
    ),
  ]

  const students =
    assignedStudentIds.length > 0
      ? await payload.find({
          collection: 'users',
          user,
          overrideAccess: false,
          where: { id: { in: assignedStudentIds } },
          depth: 0,
          limit: 200,
          sort: 'firstName',
        })
      : { docs: [] }

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
      <CoachTopbar title={t('title')} description={t('description')} />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Card className="mindly-feature-card">
            <CardHeader className="mindly-feature-header">
              <CardTitle className="mindly-feature-title">{t('formTitle')}</CardTitle>
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
              <CardTitle className="mindly-feature-title">{t('historyTitle')}</CardTitle>
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
                          {orientation.status === 'appointment_requested' ? t('statusAppointmentRequested')
                            : orientation.status === 'cancelled' ? t('statusCancelled')
                            : orientation.status === 'pending_student_response' ? t('statusPendingStudent')
                            : orientation.status === 'student_accepted' ? t('statusAccepted')
                            : t('statusRefused')}
                        </span>
                      </div>

                      <p className="mindly-feature-text mt-3">{orientation.reason}</p>

                      {orientation.appointment ? (
                        <p className="mindly-feature-text mt-2">
                          {t('appointmentRef', { id: getRelationId(orientation.appointment) })}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="mindly-feature-text">{t('noHistory')}</p>
                  <div className="mt-4">
                    <span className="mindly-ui-badge">{t('noHistoryBadge')}</span>
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
