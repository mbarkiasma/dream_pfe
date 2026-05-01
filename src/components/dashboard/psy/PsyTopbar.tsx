import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'

type PsyTopbarProps = {
  title: string
  description: string
}

export function PsyTopbar(_props: PsyTopbarProps) {
  return (
    <DashboardTopbar
      title="Espace psychologue"
      description="Consultez les etudiants, les rendez-vous, les notifications et le suivi clinique depuis un espace unifie."
    />
  )
}
