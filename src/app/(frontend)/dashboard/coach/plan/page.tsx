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
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-white">
                Aucun plan disponible
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-dream-muted dark:text-white/65">
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
