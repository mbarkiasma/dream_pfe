import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { StudentDreamsClient } from '@/components/dashboard/student/StudentDreamsClient'

const WEEKLY_LIMIT = 4

export default async function StudentDreamsPage() {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - diffToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  const dreams = user
    ? await payload.find({
        collection: 'dreams',
        user,
        overrideAccess: false,
        where: {
          user: {
            equals: user.id,
          },
        },
        depth: 1,
        sort: '-createdAt',
        limit: 50,
      })
    : { docs: [], totalDocs: 0 }

  const dreamsThisWeek = user
    ? await payload.find({
        collection: 'dreams',
        user,
        overrideAccess: false,
        where: {
          and: [
            {
              user: {
                equals: user.id,
              },
            },
            {
              createdAt: {
                greater_than_equal: startOfWeek.toISOString(),
              },
            },
          ],
        },
        limit: 0,
      })
    : { totalDocs: 0 }

  return (
    <div>
      <StudentTopbar
        title="Mes reves"
        description="Racontez vos reves, suivez leur generation video et revivez chaque scene dans un espace elegant et personnel."
      />

      <StudentDreamsClient
        dreams={dreams.docs}
        weeklyUsed={dreamsThisWeek.totalDocs}
        weeklyLimit={WEEKLY_LIMIT}
      />
    </div>
  )
}
