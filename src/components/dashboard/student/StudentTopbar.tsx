'use client'

import { useTranslations } from 'next-intl'
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar'

type StudentTopbarProps = {
  title?: string
  description?: string
}

export function StudentTopbar({ title, description }: StudentTopbarProps) {
  const t = useTranslations('dashboard.student.topbar')

  return (
    <DashboardTopbar
      title={title ?? t('title')}
      description={description ?? t('description')}
    />
  )
}
