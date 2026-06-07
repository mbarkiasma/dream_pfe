import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'

import { CoachCoachingClient } from '@/components/dashboard/coach/CoachCoachingClient'
import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function CoachCoachingPage() {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.coach.coaching')

  const sessions = user
    ? await payload.find({
        collection: 'coaching-sessions',
        user,
        overrideAccess: false,
        where: {
          coach: {
            equals: user.id,
          },
        },
        depth: 1,
        sort: '-createdAt',
        limit: 50,
      })
    : { docs: [] }

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <CoachTopbar title={t('title')} description={t('description')} />

      <CoachCoachingClient initialSessions={sessions.docs as any} />
    </div>
  )
}
