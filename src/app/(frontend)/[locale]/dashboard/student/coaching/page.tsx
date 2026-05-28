import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'

import { StudentCoachingClient } from '@/components/dashboard/student/StudentCoachingClient'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function StudentCoachingPage() {
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })
  const t = await getTranslations('dashboard.student.coaching')

  const sessions = user
    ? await payload.find({
        collection: 'coaching-sessions',
        user,
        overrideAccess: false,
        where: {
          student: {
            equals: user.id,
          },
        },
        depth: 1,
        sort: '-createdAt',
        limit: 30,
      })
    : { docs: [] }

  return (
    <div>
      <StudentTopbar
        title={t('topbar.title')}
        description={t('topbar.description')}
      />

      <StudentCoachingClient initialSessions={sessions.docs as any} />
    </div>
  )
}
