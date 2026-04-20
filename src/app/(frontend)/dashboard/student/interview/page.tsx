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
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Entretien en attente</CardTitle>
            </CardHeader>

            <CardContent>
              <InterviewChat />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#2d1068]">Statut</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
                Le statut de l’entretien apparaîtra ici : en attente, commencé ou terminé.
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
              <CardTitle className="text-xl text-[#2d1068]">Résultat futur</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-[#6E628F]">
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
