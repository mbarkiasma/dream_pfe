import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = Object.freeze({
  firstName: 'Test',
  lastName: 'User',
  role: 'etudiant' as const,
  email: 'dev+e2e@payloadcms.com',
  password: 'TestUser123!',
})

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Start from a clean state so tests stay deterministic.
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  await payload.create({
    collection: 'users',
    data: testUser,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
