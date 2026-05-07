import { headers as getHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentCoachingRegistrationClient } from '@/components/dashboard/student/StudentCoachingRegistrationClient'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'

export default async function StudentCoachingEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'etudiant') {
    redirect('/dashboard')
  }

  const { eventId } = await params

  const event = await payload.findByID({
    collection: 'coaching-events',
    id: eventId,
    user,
    overrideAccess: false,
    depth: 1,
  })

  if (!event || event.status !== 'published') {
    notFound()
  }

  const existingRegistration = await payload.find({
    collection: 'coaching-registrations',
    user,
    overrideAccess: false,
    where: {
      and: [
        {
          event: {
            equals: event.id,
          },
        },
        {
          student: {
            equals: user.id,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  return (
    <div>
      <StudentTopbar
        title="Inscription coaching"
        description="Confirmez votre participation a la seance de coaching."
      />

      <StudentCoachingRegistrationClient
        event={event}
        existingRegistration={existingRegistration.docs[0] || null}
      />
    </div>
  )
}
