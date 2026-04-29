import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachPlanPage() {
  return (
    <div>
      <CoachTopbar
        title="Plan coaching"
        description="Definissez et consultez les objectifs, l'organisation et les axes de travail des etudiants."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-white">
                Aucun plan disponible
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F] dark:text-white/65">
                Les plans de coaching construits pour les etudiants apparaitront ici, avec les
                objectifs lies a l'organisation, la gestion du stress, la motivation ou les soft
                skills.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
