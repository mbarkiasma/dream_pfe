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
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Étudiants à suivre</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Les étudiants assignés au coach apparaîtront ici avec leur état général,
                leurs exercices en cours et leurs besoins d’accompagnement.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  Aucun étudiant
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Exercices récents</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Les exercices ou tâches les plus récents apparaîtront ici automatiquement.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  En attente
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white to-violet-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Orientation vers psychologue</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
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