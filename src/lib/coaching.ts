import type { User } from '@/payload-types'

export type CoachingMode = 'classic' | 'smart'
export type CoachingSenderRole = 'ai' | 'coach' | 'student'

export function getRelationId(value: unknown): string | number | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: string | number }).id

    return typeof id === 'string' || typeof id === 'number' ? id : null
  }

  return null
}

export function isSameId(left: unknown, right: unknown): boolean {
  const leftId = getRelationId(left)
  const rightId = getRelationId(right)

  return leftId !== null && rightId !== null && String(leftId) === String(rightId)
}

export function getDisplayName(user: User | null | undefined): string {
  const firstName = typeof user?.firstName === 'string' ? user.firstName.trim() : ''
  const lastName = typeof user?.lastName === 'string' ? user.lastName.trim() : ''
  const fullName = `${firstName} ${lastName}`.trim()

  return fullName || user?.email || 'Utilisateur'
}

export function sanitizeCoachingMessage(content: unknown): string {
  if (typeof content !== 'string') return ''

  return content.replace(/\s+/g, ' ').trim().slice(0, 3000)
}
