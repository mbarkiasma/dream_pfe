import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { CoachCoachingEventManager } from '@/components/dashboard/coach/CoachCoachingEventManager'
import { CoachCoachingEventForm } from '@/components/dashboard/coach/CoachingEventForm'
import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function CoachAppointmentsPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

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
        title="Rendez-vous"
        description="Planifiez et gerez les seances de coaching avec les etudiants."
      />

      <div className="mb-6">
        <CoachCoachingEventForm />
      </div>

      <Card className="mindly-feature-card">
        <CardHeader className="mindly-feature-header">
          <CardTitle className="mindly-feature-title">Seances planifiees</CardTitle>
        </CardHeader>

        <CardContent className="mindly-feature-content">
          <CoachCoachingEventManager initialEvents={events.docs} />
        </CardContent>
      </Card>
    </div>
  )
}
