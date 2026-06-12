import crypto from 'crypto'

import type { AuthStrategy, AuthStrategyFunctionArgs, AuthStrategyResult, Payload } from 'payload'

type PayloadAuthUser = NonNullable<AuthStrategyResult['user']>

function getConfiguredAdminEmails() {
  return [process.env.ADMIN_EMAIL, process.env.ADMIN_EMAILS]
    .filter(Boolean)
    .flatMap((value) => value?.split(',') ?? [])
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

function isConfiguredAdminEmail(email: string) {
  return getConfiguredAdminEmails().includes(email.toLowerCase())
}

async function repairMissingUsersColumn(error: unknown): Promise<boolean> {
  const message = error instanceof Error ? error.message : String(error)

  if (!message.toLowerCase().includes('is_active') || !message.toLowerCase().includes('does not exist')) {
    return false
  }

  const { querySQL } = await import('../../lib/sql-db')

  console.warn('Repairing missing users.is_active column from auth flow')
  await querySQL('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true')

  return true
}

async function runWithSchemaRepair<T>(callback: () => Promise<T>): Promise<T> {
  try {
    return await callback()
  } catch (error) {
    if (await repairMissingUsersColumn(error)) {
      return await callback()
    }

    throw error
  }
}

async function getUserIsActive(payload: Payload, id: string | number): Promise<boolean | undefined> {
  const user = await runWithSchemaRepair(() =>
    payload.findByID({
      collection: 'users',
      id: String(id),
      depth: 0,
      overrideAccess: true,
      select: {
        isActive: true,
      },
    }),
  )

  return user?.isActive as boolean | undefined
}

async function getOrCreatePayloadUser({
  payload,
}: {
  payload: Payload
}): Promise<PayloadAuthUser | null> {
  const { auth, currentUser } = await import('@clerk/nextjs/server')
  const { userId } = await auth()
  const clerkUser = await currentUser()

  if (!userId || !clerkUser) {
    return null
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress

  if (!email) {
    return null
  }

  const shouldBeAdmin = isConfiguredAdminEmail(email)

  const existingUserByClerkId = await runWithSchemaRepair(() =>
    payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        firstName: true,
        lastName: true,
        onboardingStep: true,
        role: true,
      },
      where: {
        clerkUserId: {
          equals: userId,
        },
      },
    }),
  )

  let payloadUser = existingUserByClerkId.docs[0]

  if (!payloadUser) {
    const existingUserByEmail = await runWithSchemaRepair(() =>
      payload.find({
        collection: 'users',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        select: {
          id: true,
          clerkUserId: true,
          email: true,
          firstName: true,
          lastName: true,
          onboardingStep: true,
          role: true,
        },
        where: {
          email: {
            equals: email,
          },
        },
      }),
    )

    payloadUser = existingUserByEmail.docs[0]
  }

  if (payloadUser) {
    const shouldSyncClerkProfile =
      !payloadUser.clerkUserId ||
      (!payloadUser.firstName && clerkUser.firstName) ||
      (!payloadUser.lastName && clerkUser.lastName) ||
      (shouldBeAdmin && payloadUser.role !== 'admin')

    if (shouldSyncClerkProfile) {
      payloadUser = await runWithSchemaRepair(() =>
        payload.update({
          collection: 'users',
          id: payloadUser.id,
          overrideAccess: true,
          data: {
            clerkUserId: userId,
            firstName: clerkUser.firstName || payloadUser.firstName,
            lastName: clerkUser.lastName || payloadUser.lastName,
            role: shouldBeAdmin ? 'admin' : payloadUser.role,
          },
        }),
      )
    }

    const isActive = await getUserIsActive(payload, payloadUser.id)

    if (isActive === false) {
      return null
    }

    return {
      ...payloadUser,
      collection: 'users',
    } as PayloadAuthUser
  }

  const createdUser = await runWithSchemaRepair(() =>
    payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        clerkUserId: userId,
        email,
        password: crypto.randomUUID(),
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        onboardingStep: 'profile',
        role: shouldBeAdmin ? 'admin' : 'etudiant',
      },
    }),
  )

  return {
    ...createdUser,
    collection: 'users',
  } as PayloadAuthUser
}

async function authenticate({ payload }: AuthStrategyFunctionArgs): Promise<AuthStrategyResult> {
  const user = await getOrCreatePayloadUser({ payload })

  if (!user) {
    return { user: null }
  }

  return { user }
}

export const clerkAuthStrategy: AuthStrategy = {
  name: 'clerk-auth-strategy',
  authenticate,
}
