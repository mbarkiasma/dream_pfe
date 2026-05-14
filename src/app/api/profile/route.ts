import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import type { User } from '@/payload-types'

type PatchBody = {
  firstName?: unknown
  lastName?: unknown
  studentBranch?: unknown
  studentLevel?: unknown
}

const branchLevels = {
  LI: ['LI1', 'LI2', 'LI3'],
  LEA: ['LEA1', 'LEE2', 'LEE3'],
  LPE: ['LPE1', 'LPE2', 'LPE3'],
  PC: ['PC1', 'PC2'],
  MP: ['MP1', 'MP2'],
  LM: ['LMI1', 'LMI2', 'LMI3'],
  LSE: ['LSE1', 'LSE2', 'LSE3'],
  master: ['MR1PHY', 'MP1IASER', 'MP1BIO', 'MR1MATH'],
} as const

type StudentBranch = keyof typeof branchLevels

function cleanName(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isValidStudentBranch(value: string): value is StudentBranch {
  return value in branchLevels
}

function isValidStudentLevel(branch: StudentBranch, value: string) {
  return (branchLevels[branch] as readonly string[]).includes(value)
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
  const studentBranch = cleanName(body.studentBranch)
  const studentLevel = cleanName(body.studentLevel)

  if (!firstName || !lastName) {
    return Response.json({ error: 'Prenom et nom sont obligatoires.' }, { status: 400 })
  }

  if (!isValidStudentBranch(studentBranch) || !isValidStudentLevel(studentBranch, studentLevel)) {
    return Response.json({ error: 'Branche et niveau sont obligatoires.' }, { status: 400 })
  }

  const validStudentBranch = studentBranch as NonNullable<User['studentBranch']>
  const validStudentLevel = studentLevel as NonNullable<User['studentLevel']>

  const updatedUser = await payload.update({
    collection: 'users',
    id: user.id,
    user,
    overrideAccess: false,
    data: {
      firstName,
      lastName,
      studentBranch: validStudentBranch,
      studentLevel: validStudentLevel,
      onboardingStep: 'interview',
    },
  })

  return Response.json({
    user: {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      studentBranch: updatedUser.studentBranch,
      studentLevel: updatedUser.studentLevel,
    },
  })
}
