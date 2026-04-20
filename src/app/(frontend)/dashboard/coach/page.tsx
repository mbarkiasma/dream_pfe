import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { CoachStatsCards } from '@/components/dashboard/coach/CoachStatsCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachDashboardPage() {
  return (
    <div>
      <CoachTopbar
        title="Dashboard Coach"
        description="Bienvenue dans votre espace de suivi des étudiants, des exercices et des rendez-vous."
      />

      <CoachStatsCards />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Étudiants à suivre</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                Les étudiants assignés au coach apparaîtront ici avec leur état général,
                leurs exercices en cours et leurs besoins d’accompagnement.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99]">
                  Aucun étudiant
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Exercices récents</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                Les exercices ou tâches les plus récents apparaîtront ici automatiquement.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99]">
                  En attente
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Orientation vers psychologue</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                Les étudiants nécessitant une orientation clinique seront affichés ici pour transmission au psychologue.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                  Aucun cas
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}