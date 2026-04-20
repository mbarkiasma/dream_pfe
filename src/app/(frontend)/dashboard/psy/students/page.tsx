import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { PsyStatsCards } from '@/components/dashboard/psy/PsyStatsCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PsyDashboardPage() {
  return (
    <div>
      <PsyTopbar
        title="Dashboard Psychologue"
        description="Bienvenue dans votre espace de suivi clinique des étudiants et des rendez-vous."
      />

      <PsyStatsCards />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Étudiants assignés</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                Les étudiants orientés vers le psychologue apparaîtront ici avec leurs informations
                principales et leur état général.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Rendez-vous</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                Les consultations prévues avec les étudiants seront affichées ici.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Suivi clinique</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                Cette section affichera plus tard les cas nécessitant une attention particulière
                ainsi que les observations générales.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}