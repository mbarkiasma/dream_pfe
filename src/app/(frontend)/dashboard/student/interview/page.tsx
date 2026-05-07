import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { InterviewChat } from './InterviewChat'

export default function StudentInterviewPage() {
  return (
    <div>
      <StudentTopbar
        title="Entretien IA"
        description="Accedez a l'entretien intelligent pour repondre aux questions et lancer l'analyse."
      />

      <div className="interview-dashboard-layout">
        <div>
          <section className="interview-card">
            <div className="interview-card-header">
              <h2 className="interview-card-title">Entretien en attente</h2>
            </div>

            <div className="interview-card-body">
              <InterviewChat />
            </div>
          </section>
        </div>

        <aside className="interview-side">
          <section className="interview-card interview-side-card">
            <h2 className="interview-card-title">Statut</h2>
            <p className="interview-side-text">
                Le statut de l'entretien apparaitra ici : en attente, commence ou termine.
            </p>

            <span className="interview-badge">En attente</span>
          </section>

          <section className="interview-card interview-side-card">
            <h2 className="interview-card-title">Resultat futur</h2>
            <p className="interview-side-text">
                Les reponses fournies par l'etudiant serviront plus tard a enrichir l'analyse et a
                ameliorer l'accompagnement personnalise.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
