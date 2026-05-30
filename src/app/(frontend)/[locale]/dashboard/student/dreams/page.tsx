import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { StudentDreamsClient } from '@/components/dashboard/student/StudentDreamsClient'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

const WEEKLY_LIMIT = 4

export default async function StudentDreamsPage() {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.student.dreamsPage')
  const locale = await getLocale()

  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - diffToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  const [dreams, dreamsThisWeek] = user
    ? await Promise.all([
        payload.find({
          collection: 'dreams',
          user,
          overrideAccess: false,
          locale: locale as 'fr' | 'en',
          where: {
            user: {
              equals: user.id,
            },
          },
          depth: 1,
          sort: '-createdAt',
          limit: 20,
        }),
        payload.find({
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
          depth: 0,
          limit: 0,
        }),
      ])
    : [{ docs: [], totalDocs: 0 }, { totalDocs: 0 }]

  return (
    <div>
      <StudentTopbar
        title={t('topbar.title')}
        description={t('topbar.description')}
      />

      <StudentDreamsClient
        dreams={dreams.docs}
        weeklyUsed={dreamsThisWeek.totalDocs}
        weeklyLimit={WEEKLY_LIMIT}
      />
    </div>
  )
}
