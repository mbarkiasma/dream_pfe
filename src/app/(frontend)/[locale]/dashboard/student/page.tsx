import { StudentDashboardContent } from '@/components/dashboard/student/StudentDashboardContent'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function StudentDashboardPage() {
  const { user } = await getAuthenticatedDashboardUser()

  if (!user) {
    redirect('/login')
  }

  const payload = await getPayload({ config })

  const [dreamsResult, analysesResult, latestDreamResult, latestAnalysisResult] = await Promise.all(
    [
      payload.count({
        collection: 'dreams',
        user,
        overrideAccess: false,
        where: {
          user: {
            equals: user.id,
          },
        },
      }),
      payload.count({
        collection: 'analyse-personnalite',
        user,
        overrideAccess: false,
        where: {
          user: {
            equals: user.id,
          },
        },
      }),
      payload.find({
        collection: 'dreams',
        user,
        overrideAccess: false,
        depth: 0,
        limit: 1,
        sort: '-createdAt',
        where: {
          user: {
            equals: user.id,
          },
        },
        select: {
          createdAt: true,
          description: true,
          summary: true,
          videoStatus: true,
        },
      }),
      payload.find({
        collection: 'analyse-personnalite',
        user,
        overrideAccess: false,
        depth: 0,
        limit: 1,
        sort: '-date',
        where: {
          user: {
            equals: user.id,
          },
        },
        select: {
          date: true,
          niveauConfiance: true,
          overview: true,
          reference: true,
        },
      }),
    ],
  )

  const latestDream = latestDreamResult.docs[0]
  const latestAnalysis = latestAnalysisResult.docs[0]

  return (
    <StudentDashboardContent
      analysesCount={analysesResult.totalDocs}
      appointmentsCount={0}
      dreamsCount={dreamsResult.totalDocs}
      latestDream={latestDream}
      latestAnalysis={latestAnalysis}
    />
  )
}
