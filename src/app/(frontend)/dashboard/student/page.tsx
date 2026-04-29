import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { StudentStatsCards } from '@/components/dashboard/student/StudentStatsCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import config from '@payload-config'
import { BarChart3, CalendarDays, ChevronRight, MoonStar } from 'lucide-react'
import Link from 'next/link'
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

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Link
            href="/dashboard/student/dreams"
            className="group block rounded-[32px] outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            <Card className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur transition duration-200 group-hover:-translate-y-1 group-hover:border-violet-200 group-hover:bg-white group-hover:shadow-[0_24px_70px_rgba(109,40,217,0.18)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)] dark:group-hover:bg-white/[0.09]">
              <CardHeader className="flex-row items-center justify-between gap-4 pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[22px] bg-violet-100 text-violet-700 transition group-hover:bg-violet-500 group-hover:text-white dark:bg-violet-500/15 dark:text-violet-200">
                    <MoonStar className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-xl text-[#2d1068] dark:text-foreground">
                    Mon dernier reve
                  </CardTitle>
                </div>
                <span className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold text-violet-700 transition group-hover:bg-violet-50 dark:text-violet-200 dark:group-hover:bg-white/10">
                  Voir
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                {latestDream ? (
                  <div className="space-y-4">
                    <p className="line-clamp-4 text-base leading-8 text-[#6E628F] dark:text-muted-foreground">
                      {latestDream.summary || latestDream.description}
                    </p>
                    <span className="inline-flex rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-semibold text-[#6D28D9] dark:bg-violet-500/15 dark:text-violet-200">
                      Video : {latestDream.videoStatus}
                    </span>
                  </div>
                ) : (
                  <p className="leading-7 text-[#6E628F] dark:text-muted-foreground">
                    Aucun reve enregistre pour le moment.
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="space-y-6">
          <Link
            href="/dashboard/student/analyses"
            className="group block rounded-[32px] outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            <Card className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur transition duration-200 group-hover:-translate-y-1 group-hover:border-violet-200 group-hover:bg-white group-hover:shadow-[0_24px_70px_rgba(109,40,217,0.18)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)] dark:group-hover:bg-white/[0.09]">
              <CardHeader className="flex-row items-center justify-between gap-4 pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[22px] bg-violet-100 text-violet-700 transition group-hover:bg-violet-500 group-hover:text-white dark:bg-violet-500/15 dark:text-violet-200">
                    <BarChart3 className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-xl text-[#2d1068] dark:text-foreground">
                    Analyse IA
                  </CardTitle>
                </div>
                <ChevronRight className="h-4 w-4 text-violet-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </CardHeader>

              <CardContent className="px-6 pb-6">
                {latestAnalysis ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[#2d1068] dark:text-foreground">
                      {latestAnalysis.reference}
                    </p>
                    <p className="line-clamp-4 leading-7 text-[#6E628F] dark:text-muted-foreground">
                      {latestAnalysis.overview || 'Analyse disponible dans votre espace analyses.'}
                    </p>
                    <span className="inline-flex rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-semibold text-[#6D28D9] dark:bg-violet-500/15 dark:text-violet-200">
                      Confiance : {latestAnalysis.niveauConfiance || 'moyen'}
                    </span>
                  </div>
                ) : (
                  <p className="leading-7 text-[#6E628F] dark:text-muted-foreground">
                    Aucune analyse generee pour le moment.
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link
            href="/dashboard/student/rendez_vous"
            className="group block rounded-[32px] outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            <Card className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur transition duration-200 group-hover:-translate-y-1 group-hover:border-violet-200 group-hover:bg-white group-hover:shadow-[0_24px_70px_rgba(109,40,217,0.18)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)] dark:group-hover:bg-white/[0.09]">
              <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[22px] bg-violet-100 text-violet-700 transition group-hover:bg-violet-500 group-hover:text-white dark:bg-violet-500/15 dark:text-violet-200">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-xl text-[#2d1068] dark:text-foreground">
                    Prochain rendez-vous
                  </CardTitle>
                </div>
                <ChevronRight className="h-4 w-4 text-violet-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <p className="leading-7 text-[#6E628F] dark:text-muted-foreground">
                  Aucun rendez-vous planifie pour le moment.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
