import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'

type CoachTopbarProps = {
  title: string
  description: string
}

export function CoachTopbar(_props: CoachTopbarProps) {
  return (
    <DashboardTopbar
      title="Espace coach"
      description="Pilotez le suivi des etudiants, les sessions, les exercices, les rendez-vous et les annonces depuis un espace unifie."
    />
  )
}
