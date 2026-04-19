import type { User } from '@/payload-types'

import { querySQL } from './sql-db'

export type MetierDream = {
  id: number
  description: string
  summary?: string | null
  analysis?: string | null
  videoStatus: 'pending' | 'waiting_validation' | 'generating' | 'ready' | 'failed'
  videoUrl?: string | null
  videoAsset?: null
  createdAt: string
  updatedAt: string
}

export type MetierPersonalityAnalysis = {
  id: number
  reference: string
  date: string
  overview?: string | null
  conclusion?: string | null
  forcesDominantes?: string | null
  pointsVigilance?: string | null
  styleRelationnel?: string | null
  traits?: {
    name: string
    score: number
    analysis?: string | null
    interpretation?: string | null
    observedIndicators?: { indicator: string }[]
  }[]
  profilEmotionnel?: {
    dominantEmotion?: string | null
    emotionalStability?: number | null
    emotionalSummary?: string | null
  }
  recommandations?: { text: string }[]
}

function getDisplayName(user: User) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return fullName || user.email.split('@')[0] || user.email
}

function getMetierRole(user: User): 'etudiant' | 'coach' | 'psychologue' | 'admin' {
  if (user.role === 'coach') return 'coach'
  if (user.role === 'psy') return 'psychologue'
  return 'etudiant'
}

export async function ensureMetierUser(user: User) {
  const existing = await querySQL<{ id: string }>(
    `
      select id
      from metier.utilisateur
      where payload_user_id = $1 or login_email = $2
      limit 1
    `,
    [user.id, user.email],
  )

  if (existing.rows[0]) {
    await querySQL(
      `
        update metier.utilisateur
        set payload_user_id = $1,
            nom_prenom = $2,
            role = $3,
            updated_at = now()
        where id = $4
      `,
      [user.id, getDisplayName(user), getMetierRole(user), existing.rows[0].id],
    )

    await ensureRoleSpecificRow(existing.rows[0].id, getMetierRole(user))
    return existing.rows[0].id
  }

  const created = await querySQL<{ id: string }>(
    `
      insert into metier.utilisateur (payload_user_id, nom_prenom, login_email, role)
      values ($1, $2, $3, $4)
      returning id
    `,
    [user.id, getDisplayName(user), user.email, getMetierRole(user)],
  )

  const id = created.rows[0]?.id
  if (!id) throw new Error('Impossible de creer le profil metier utilisateur.')

  await ensureRoleSpecificRow(id, getMetierRole(user))
  return id
}

async function ensureRoleSpecificRow(
  userId: string,
  role: 'etudiant' | 'coach' | 'psychologue' | 'admin',
) {
  const table = role === 'psychologue' ? 'psychologue' : role

  await querySQL(
    `
      insert into metier.${table} (id)
      values ($1)
      on conflict (id) do nothing
    `,
    [userId],
  )
}

export async function getMetierDreamsForUser(user: User) {
  const metierUserId = await ensureMetierUser(user)

  const result = await querySQL<{
    ref_reve: string
    description: string
    created_at: string
    updated_at: string
    resume_reve: string | null
    recommandations: unknown
    feedback_etudiant: string | null
    url_video: string | null
    etat: boolean | null
    video_status: MetierDream['videoStatus'] | null
  }>(
    `
      select
        r.ref_reve::text,
        r.description,
        r.created_at::text,
        r.updated_at::text,
        a.resume_reve,
        a.recommandations,
        a.feedback_etudiant,
        v.url_video,
        v.etat,
        r.video_status
      from metier.reve r
      left join lateral (
        select resume_reve, recommandations, feedback_etudiant
        from metier.analyse_ai_reve
        where reve_id = r.ref_reve
        order by created_at desc
        limit 1
      ) a on true
      left join metier.video_ia_reve v on v.reve_id = r.ref_reve
      where r.etudiant_id = $1
      order by r.created_at desc
      limit 50
    `,
    [metierUserId],
  )

  return result.rows.map((row): MetierDream => {
    const recommendations = Array.isArray(row.recommandations)
      ? row.recommandations.map((item) => String(item)).join('\n')
      : ''

    return {
      id: Number(row.ref_reve),
      description: row.description,
      summary: row.resume_reve,
      analysis: row.feedback_etudiant || recommendations || null,
      videoStatus: row.url_video
        ? 'ready'
        : row.video_status || (row.resume_reve ? 'waiting_validation' : 'pending'),
      videoUrl: row.url_video,
      videoAsset: null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  })
}

export async function countMetierDreamsThisWeek(user: User, startOfWeek: Date) {
  const metierUserId = await ensureMetierUser(user)
  const result = await querySQL<{ total: string }>(
    `
      select count(*)::text as total
      from metier.reve
      where etudiant_id = $1
      and created_at >= $2
    `,
    [metierUserId, startOfWeek.toISOString()],
  )

  return Number(result.rows[0]?.total ?? 0)
}

export async function createMetierDream(user: User, description: string) {
  const metierUserId = await ensureMetierUser(user)
  const result = await querySQL<{ id: string }>(
    `
      insert into metier.reve (etudiant_id, date, description, video_status)
      values ($1, current_date, $2, 'pending')
      returning ref_reve::text as id
    `,
    [metierUserId, description],
  )

  return Number(result.rows[0]?.id)
}

export async function updateMetierDreamAnalysis({
  analysis,
  dreamId,
  summary,
  videoStatus = 'waiting_validation',
}: {
  analysis?: string
  dreamId: number
  summary?: string
  videoStatus?: MetierDream['videoStatus']
}) {
  await updateMetierDreamStatus(dreamId, videoStatus)

  if (!summary && !analysis) return

  await querySQL(
    `
      insert into metier.analyse_ai_reve (reve_id, resume_reve, recommandations, feedback_etudiant)
      values ($1, $2, '[]'::jsonb, $3)
    `,
    [dreamId, summary || null, analysis || null],
  )
}

export async function updateMetierDreamStatus(
  dreamId: number,
  videoStatus: MetierDream['videoStatus'],
) {
  await querySQL(
    `
      update metier.reve
      set video_status = $2,
          updated_at = now()
      where ref_reve = $1
    `,
    [dreamId, videoStatus],
  )
}

export async function updateMetierDreamVideo({
  dreamId,
  videoUrl,
}: {
  dreamId: number
  videoUrl: string
}) {
  await querySQL(
    `
      insert into metier.video_ia_reve (reve_id, url_video, etat)
      values ($1, $2, true)
      on conflict (reve_id)
      do update set
        url_video = excluded.url_video,
        etat = true,
        updated_at = now()
    `,
    [dreamId, videoUrl],
  )

  await updateMetierDreamStatus(dreamId, 'ready')
}

export async function deleteMetierDream(user: User, dreamId: number) {
  const metierUserId = await ensureMetierUser(user)
  await querySQL(
    `
      delete from metier.reve
      where ref_reve = $1 and etudiant_id = $2
    `,
    [dreamId, metierUserId],
  )
}

export async function getMetierDreamForUser(user: User, dreamId: number) {
  const metierUserId = await ensureMetierUser(user)
  const result = await querySQL<{
    description: string
    id: string
    summary: string | null
    video_status: MetierDream['videoStatus'] | null
  }>(
    `
      select
        r.ref_reve::text as id,
        r.description,
        r.video_status,
        a.resume_reve as summary
      from metier.reve r
      left join lateral (
        select resume_reve
        from metier.analyse_ai_reve
        where reve_id = r.ref_reve
        order by created_at desc
        limit 1
      ) a on true
      where r.ref_reve = $1 and r.etudiant_id = $2
      limit 1
    `,
    [dreamId, metierUserId],
  )

  return result.rows[0] || null
}

export async function getMetierPersonalityAnalysesForUser(user: User) {
  const metierUserId = await ensureMetierUser(user)
  const result = await querySQL<{
    id_analyse_pers: string
    resume_personalite: string | null
    date: string
    recommandations: unknown
  }>(
    `
      select id_analyse_pers::text, resume_personalite, date::text, recommandations
      from metier.analyse_ai_personalite
      where etudiant_id = $1
      order by date desc, created_at desc
      limit 20
    `,
    [metierUserId],
  )

  return result.rows.map((row) => mapPersonalityAnalysis(row))
}

export async function getMetierPersonalityAnalysisById(user: User, id: number) {
  const metierUserId = await ensureMetierUser(user)
  const result = await querySQL<{
    id_analyse_pers: string
    resume_personalite: string | null
    date: string
    recommandations: unknown
  }>(
    `
      select id_analyse_pers::text, resume_personalite, date::text, recommandations
      from metier.analyse_ai_personalite
      where id_analyse_pers = $1 and etudiant_id = $2
      limit 1
    `,
    [id, metierUserId],
  )

  return result.rows[0] ? mapPersonalityAnalysis(result.rows[0]) : null
}

function mapPersonalityAnalysis(row: {
  id_analyse_pers: string
  resume_personalite: string | null
  date: string
  recommandations: unknown
}): MetierPersonalityAnalysis {
  const recommendations = Array.isArray(row.recommandations)
    ? row.recommandations.map((item) => ({
        text: typeof item === 'string' ? item : JSON.stringify(item),
      }))
    : []

  return {
    id: Number(row.id_analyse_pers),
    reference: `PERS-${row.id_analyse_pers}`,
    date: row.date,
    overview: row.resume_personalite,
    conclusion: row.resume_personalite,
    recommandations: recommendations,
    traits: [],
    profilEmotionnel: {},
  }
}
