import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InterviewChat } from './InterviewChat'

export default function StudentInterviewPage() {
  return (
    <div>
      <StudentTopbar
        title="Entretien IA"
        description="Accedez a l'entretien intelligent pour repondre aux questions et lancer l'analyse."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-foreground">
                Entretien en attente
              </CardTitle>
            </CardHeader>

            <CardContent>
              <InterviewChat />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-foreground">Statut</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-dream-muted dark:text-muted-foreground">
                Le statut de l'entretien apparaitra ici : en attente, commence ou termine.
              </p>

              <div className="mt-4">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-[#7A6A99] dark:bg-white/10 dark:text-muted-foreground">
                  En attente
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-border bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(168,85,247,0.10)_100%)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-dream-heading dark:text-foreground">
                Resultat futur
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-dream-muted dark:text-muted-foreground">
                Les reponses fournies par l'etudiant serviront plus tard a enrichir l'analyse et a
                ameliorer l'accompagnement personnalise.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
