import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentCoachingClient } from '@/components/dashboard/student/StudentCoachingClient'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function StudentCoachingPage() {
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })

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
        title="Smart coaching"
        description="Choisissez un accompagnement immediat par IA ou une session classique avec un coach humain."
      />

      <StudentCoachingClient initialSessions={sessions.docs as any} />
    </div>
  )
}
