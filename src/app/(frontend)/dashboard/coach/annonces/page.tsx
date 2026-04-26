import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import { CoachAnnouncementsClient } from '@/components/dashboard/coach/CoachAnnonce'
import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'

export default async function CoachAnnouncementsPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  const announcements = user
    ? await payload.find({
        collection: 'annonce-motivation',
        user,
        overrideAccess: false,
        where: {
          author: {
            equals: user.id,
          },
        },
        sort: '-createdAt',
        limit: 30,
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
          depth: 1,
          sort: '-createdAt',
          limit: 1000,
        })
      : { docs: [] }

  const reactionsByAnnouncement = reactions.docs.reduce<
    Record<
      string,
      Array<{
        createdAt?: string
        id: string | number
        student: unknown
      }>
    >
  >((summary, reaction) => {
    const announcementId =
      typeof reaction.announcement === 'object' ? reaction.announcement.id : reaction.announcement
    const key = String(announcementId)

    summary[key] = [
      ...(summary[key] ?? []),
      {
        createdAt: reaction.createdAt,
        id: reaction.id,
        student: reaction.student,
      },
    ]

    return summary
  }, {})

  const announcementsWithReactions = announcements.docs.map((announcement) => {
    const likes = reactionsByAnnouncement[String(announcement.id)] ?? []

    return {
      ...announcement,
      reactions: {
        likeCount: likes.length,
        students: likes,
      },
    }
  })

  return (
    <div>
      <CoachTopbar
        title="Annonces de motivation"
        description="Publiez des contenus de motivation destines aux etudiants."
      />

      <CoachAnnouncementsClient initialAnnouncements={announcementsWithReactions as any} />
    </div>
  )
}
