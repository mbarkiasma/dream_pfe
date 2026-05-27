import { getPayload } from 'payload'
import config from '@payload-config'

function getCronSecret(request: Request) {
  const header = request.headers.get('authorization')
  return header?.replace('Bearer ', '')
}

function yearsAgo(years: number) {
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - years)
  return cutoff.toISOString()
}

function getUserExpirationCutoff(user: { studentBranch?: string | null }) {
  if (user.studentBranch === 'master') {
    return yearsAgo(2)
  }

  return yearsAgo(3)
}

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET
  const secret = getCronSecret(request)

  if (expectedSecret && secret !== expectedSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  const settings = await payload.findGlobal({
    slug: 'account-retention-settings',
    depth: 0,
  })

  if (!settings || settings.enabled !== true) {
    return Response.json({ ok: true, message: 'account retention disabled' })
  }

  const targetRoles = Array.isArray(settings.targetRoles) && settings.targetRoles.length
    ? settings.targetRoles
    : ['etudiant']

  const action = settings.action === 'delete' ? 'delete' : 'deactivate'

  const users = await payload.find({
    collection: 'users',
    where: {
      and: [
        { role: { in: targetRoles } },
        {
          or: [
            { isActive: { equals: true } },
            { isActive: { exists: false } },
          ],
        },
      ],
    },
    depth: 0,
    limit: 1000,
  })

  const expiredUsers = users.docs.filter((user) => {
    const cutoff = getUserExpirationCutoff(user)

    if (!user.createdAt) return false
    if (user.createdAt > cutoff) return false

    return true
  })

  let processed = 0
  let errors: Array<{ id: string; message: string }> = []

  for (const user of expiredUsers) {
    try {
      if (action === 'deactivate') {
        await payload.update({
          collection: 'users',
          id: String(user.id),
          data: {
            isActive: false,
            deactivatedAt: new Date().toISOString(),
          },
          depth: 0,
        })
      } else {
        await payload.delete({
          collection: 'users',
          id: String(user.id),
          depth: 0,
        })
      }
      processed += 1
    } catch (error) {
      errors.push({
        id: String(user.id),
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return Response.json({
    ok: true,
    action,
    processed,
    totalCandidates: users.docs.length,
    expired: expiredUsers.length,
    errors,
  })
}
