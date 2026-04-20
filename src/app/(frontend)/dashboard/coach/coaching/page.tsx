import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { CoachCoachingClient } from '@/components/dashboard/coach/CoachCoachingClient'
import { CoachTopbar } from '@/components/dashboard/coach/CoachTopbar'

export default async function CoachCoachingPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  const sessions = user
    ? await payload.find({
        collection: 'coaching-sessions',
        user,
        overrideAccess: false,
        where: {
          coach: {
            equals: user.id,
          },
        },
        depth: 1,
        sort: '-createdAt',
        limit: 50,
      })
    : { docs: [] }

  return (
    <div>
      <CoachTopbar
        title="Sessions de coaching"
        description="Suivez les conversations classiques, repondez aux etudiants et enregistrez les notes de suivi."
      />

      <CoachCoachingClient initialSessions={sessions.docs as any} />
    </div>
  )
}
