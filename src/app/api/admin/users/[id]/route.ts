import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { hasRole } from '@/access/roles'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!hasRole(user, ['admin'])) {
    return Response.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
  }

  await payload.delete({
    collection: 'users',
    id,
    overrideAccess: false,
    user,
  })

  return Response.json({ success: true })
}
