import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import { StudentMotivationClient } from '@/components/dashboard/student/StudentMotivationClient'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'

export default async function StudentMotivationPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  const announcements = user
    ? await payload.find({
        collection: 'annonce-motivation',
        user,
        overrideAccess: false,
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
      counts: {
        like: 0,
      },
    },
  }))

  return (
    <div>
      <StudentTopbar
        title="Motivation"
        description="Consultez les annonces et contenus de motivation publies par les coachs."
      />

      <StudentMotivationClient announcements={announcementsWithReactions as any} />
    </div>
  )
}
