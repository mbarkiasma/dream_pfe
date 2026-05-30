import config from '@payload-config'
import { getPayload } from 'payload'
import { getLocale, getTranslations } from 'next-intl/server'

import { StudentMotivationClient } from '@/components/dashboard/student/StudentMotivationClient'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function StudentMotivationPage() {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.student.motivation')
  const locale = await getLocale()

  const announcements = user
    ? await payload.find({
        collection: 'annonce-motivation',
        user,
        overrideAccess: false,
        locale: locale as 'fr' | 'en',
        where: {
          status: {
            equals: 'published',
          },
        },
        depth: 1,
        sort: '-publishedAt',
        limit: 50,
      })
    : { docs: [] }

  const announcementIds = announcements.docs.map((announcement) => announcement.id)
  const reactions =
    user && announcementIds.length > 0
      ? await payload.find({
          collection: 'annonce-motivation-reactions',
          user,
          overrideAccess: false,
          where: {
            announcement: {
              in: announcementIds,
            },
          },
          depth: 0,
          limit: 1000,
        })
      : { docs: [] }

  const reactionSummaryByAnnouncement = reactions.docs.reduce<
    Record<
      string,
      {
        counts: {
          like: number
        }
        myReaction?: 'like'
      }
    >
  >((summary, reaction) => {
    const announcementId =
      typeof reaction.announcement === 'object' ? reaction.announcement.id : reaction.announcement
    const key = String(announcementId)
    const current = summary[key] ?? {
      counts: {
        like: 0,
      },
    }

    current.counts[reaction.reaction] += 1

    const studentId = typeof reaction.student === 'object' ? reaction.student.id : reaction.student

    if (String(studentId) === String(user?.id)) {
      current.myReaction = reaction.reaction
    }

    summary[key] = current

    return summary
  }, {})

  const announcementsWithReactions = announcements.docs.map((announcement) => ({
    ...announcement,
    reactions: reactionSummaryByAnnouncement[String(announcement.id)] ?? {
      counts: { like: 0 },
    },
  }))

  return (
    <div>
      <StudentTopbar
        title={t('topbar.title')}
        description={t('topbar.description')}
      />

      <StudentMotivationClient announcements={announcementsWithReactions as any} />
    </div>
  )
}
