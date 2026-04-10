import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InterviewChat } from './InterviewChat'
export default function StudentInterviewPage() {
  return (
    <div>
      <StudentTopbar
        title="Entretien IA"
        description="Accédez à l’entretien intelligent pour répondre aux questions et lancer l’analyse."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Entretien en attente</CardTitle>
            </CardHeader>

            <CardContent>
              <InterviewChat />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-800">Statut</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Le statut de l’entretien apparaîtra ici : en attente, commencé ou terminé.
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
              <CardTitle className="text-xl text-slate-800">Résultat futur</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-slate-600">
                Les réponses fournies par l’étudiant serviront plus tard à enrichir l’analyse et à
                améliorer l’accompagnement personnalisé.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
