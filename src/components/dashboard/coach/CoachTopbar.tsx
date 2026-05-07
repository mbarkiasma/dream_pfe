import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'

type CoachTopbarProps = {
  title: string
  description: string
}

export function CoachTopbar({ description, title }: CoachTopbarProps) {
  return (
    <DashboardTopbar
      eyebrow="Espace coach"
      title={title}
      description={description}
    />
  )
}
