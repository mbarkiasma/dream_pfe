import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'

type StudentTopbarProps = {
  title: string
  description: string
}

export function StudentTopbar(_props: StudentTopbarProps) {
  return (
    <DashboardTopbar
      title="Espace etudiant"
      description="Suivez vos reves, vos analyses, vos rendez-vous et votre accompagnement dans un espace unifie."
    />
  )
}
