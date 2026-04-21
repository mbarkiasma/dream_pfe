import crypto from 'crypto'

import type {
  AuthStrategy,
  AuthStrategyFunctionArgs,
  AuthStrategyResult,
  Payload,
} from 'payload'

type PayloadAuthUser = NonNullable<AuthStrategyResult['user']>

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

  const existingUserByClerkId = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    where: {
      clerkUserId: {
        equals: userId,
      },
    },
  })

  let payloadUser = existingUserByClerkId.docs[0]

  if (!payloadUser) {
    const existingUserByEmail = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      where: {
        email: {
          equals: email,
        },
      },
    })

    payloadUser = existingUserByEmail.docs[0]
  }

  if (payloadUser) {
    if (!payloadUser.clerkUserId) {
      payloadUser = await payload.update({
        collection: 'users',
        id: payloadUser.id,
        data: {
          clerkUserId: userId,
          firstName: clerkUser.firstName || payloadUser.firstName,
          lastName: clerkUser.lastName || payloadUser.lastName,
        },
      })
    }

    return {
      ...payloadUser,
      collection: 'users',
    } as PayloadAuthUser
  }

  const createdUser = await payload.create({
    collection: 'users',
    data: {
      clerkUserId: userId,
      email,
      password: crypto.randomUUID(),
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      role: 'etudiant',
    },
  })

  return {
    ...createdUser,
    collection: 'users',
  } as PayloadAuthUser
}

async function authenticate({
  payload,
}: AuthStrategyFunctionArgs): Promise<AuthStrategyResult> {
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
