import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentPsyOrientationClient } from '@/components/dashboard/student/StudentPsyOrientation'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'

export default async function StudentPsyOrientationPage({
  params,
}: {
  params: Promise<{ orientationId: string }>
}) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

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

  return (
    <div>
      <StudentTopbar
        title="Orientation psychologique"
        description="Consultez la recommandation de votre coach et choisissez votre reponse."
      />

      <StudentPsyOrientationClient orientation={orientation} />
    </div>
  )
}
