import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'

import { StudentPsyOrientationClient } from '@/components/dashboard/student/StudentPsyOrientation'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function StudentPsyOrientationPage({
  params,
}: {
  params: Promise<{ orientationId: string }>
}) {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'etudiant') {
    redirect('/dashboard')
  }

  const { orientationId } = await params

  const orientation = await payload.findByID({
    collection: 'psy-orientations',
    id: orientationId,
    user,
    overrideAccess: false,
    depth: 1,
  })

  if (!orientation) {
    notFound()
  }

  const t = await getTranslations('dashboard.student.psyOrientation')

  return (
    <div>
      <StudentTopbar
        title={t('pageTitle')}
        description={t('pageDescription')}
      />

      <StudentPsyOrientationClient orientation={orientation} />
    </div>
  )
}
