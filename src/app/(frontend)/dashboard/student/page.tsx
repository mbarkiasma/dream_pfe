import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { StudentStatsCards } from '@/components/dashboard/student/StudentStatsCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  const [dreamsResult, analysesResult, latestDreamResult, latestAnalysisResult] =
    await Promise.all([
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
    ])

  const latestDream = latestDreamResult.docs[0]
  const latestAnalysis = latestAnalysisResult.docs[0]

  return (
    <div>
      <StudentTopbar
        title="Dashboard Etudiant"
        description="Bienvenue dans votre espace personnel de suivi des reves, des analyses et des rendez-vous."
      />

      <StudentStatsCards
        analysesCount={analysesResult.totalDocs}
        appointmentsCount={0}
        dreamsCount={dreamsResult.totalDocs}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Mon dernier reve</CardTitle>
            </CardHeader>

            <CardContent>
              {latestDream ? (
                <div className="space-y-4">
                  <p className="line-clamp-4 leading-7 text-[#6E628F]">
                    {latestDream.summary || latestDream.description}
                  </p>
                  <span className="inline-flex rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-semibold text-[#6D28D9]">
                    Video : {latestDream.videoStatus}
                  </span>
                </div>
              ) : (
                <p className="leading-7 text-[#6E628F]">
                  Aucun reve enregistre pour le moment.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Analyse IA</CardTitle>
            </CardHeader>

            <CardContent>
              {latestAnalysis ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#2d1068]">{latestAnalysis.reference}</p>
                  <p className="line-clamp-4 leading-7 text-[#6E628F]">
                    {latestAnalysis.overview || 'Analyse disponible dans votre espace analyses.'}
                  </p>
                  <span className="inline-flex rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-semibold text-[#6D28D9]">
                    Confiance : {latestAnalysis.niveauConfiance || 'moyen'}
                  </span>
                </div>
              ) : (
                <p className="leading-7 text-[#6E628F]">
                  Aucune analyse generee pour le moment.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Prochain rendez-vous</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                Aucun rendez-vous planifie pour le moment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
