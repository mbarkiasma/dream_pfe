import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'

type PsyTopbarProps = {
  title: string
  description: string
}

export function PsyTopbar({ description, title }: PsyTopbarProps) {
  return (
    <DashboardTopbar
      eyebrow="Espace psy"
      title={title}
      description={description}
    />
  )
}
