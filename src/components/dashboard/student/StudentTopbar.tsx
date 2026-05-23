import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'

type StudentTopbarProps = {
  title?: string
  description?: string
}

export function StudentTopbar({
  title = 'Espace étudiant',
  description = 'Suivez vos reves, vos analyses, vos rendez-vous et votre accompagnement dans un espace unifie.',
}: StudentTopbarProps) {
  return <DashboardTopbar title={title} description={description} />
}
