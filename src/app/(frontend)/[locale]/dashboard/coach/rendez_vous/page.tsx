import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'

import { CoachCoachingEventManager } from '@/components/dashboard/coach/CoachCoachingEventManager'
import { CoachCoachingEventForm } from '@/components/dashboard/coach/CoachingEventForm'
import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function CoachAppointmentsPage() {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.coach.appointments')

  const events = user
    ? await payload.find({
        collection: 'coaching-events',
        user,
        overrideAccess: false,
        where: {
          coach: {
            equals: user.id,
          },
        },
        sort: 'scheduledAt',
        depth: 0,
        limit: 20,
      })
    : { docs: [] }

  return (
    <div>
      <CoachTopbar
        title={t('title')}
        description={t('description')}
      />

      <div className="mb-6">
        <CoachCoachingEventForm />
      </div>

      <Card className="mindly-feature-card">
        <CardHeader className="mindly-feature-header">
          <CardTitle className="mindly-feature-title">{t('scheduledSessions')}</CardTitle>
        </CardHeader>

        <CardContent className="mindly-feature-content">
          <CoachCoachingEventManager initialEvents={events.docs} />
        </CardContent>
      </Card>
    </div>
  )
}
