import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

type PatchBody = {
  firstName?: unknown
  lastName?: unknown
}

function cleanName(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function PATCH(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'etudiant') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as PatchBody
  const firstName = cleanName(body.firstName)
  const lastName = cleanName(body.lastName)

  if (!firstName || !lastName) {
    return Response.json({ error: 'Prenom et nom sont obligatoires.' }, { status: 400 })
  }

  const updatedUser = await payload.update({
    collection: 'users',
    id: user.id,
    user,
    overrideAccess: false,
    data: {
      firstName,
      lastName,
      onboardingStep: 'interview',
    },
  })

  return Response.json({
    user: {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
    },
  })
}
