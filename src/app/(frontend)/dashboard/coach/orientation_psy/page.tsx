import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CoachReferralPage() {
  return (
    <div>
      <CoachTopbar
        title="Orientation psy"
        description="Gerez les etudiants a orienter vers le psychologue lorsque la situation le necessite."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068] dark:text-white">
                Aucune orientation en cours
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F] dark:text-white/65">
                Lorsqu'un etudiant necessite un accompagnement plus clinique, le coach pourra le
                signaler ici pour le transferer vers le psychologue.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
