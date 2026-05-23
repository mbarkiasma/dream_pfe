type ReportTrait = {
  name?: string | null
  score?: number | null
}

export type ReportWellbeingTheme = 'green' | 'orange' | 'rose'

export function getReportWellbeingTheme(traits?: ReportTrait[] | null) {
  const traitScores = getTraitScores(traits)

  if (!traitScores) {
    return {
      score: null,
      theme: 'orange' as ReportWellbeingTheme,
      label: 'Profil en cours d evaluation',
      description: 'Les scores Big Five ne sont pas encore suffisants pour calculer un indice fiable.',
    }
  }

  const emotionalStability = 11 - traitScores.neuroticisme
  const score =
    (traitScores.ouverture +
      traitScores.conscienciosite +
      traitScores.extraversion +
      traitScores.agreabilite +
      emotionalStability) /
    5

  if (score >= 7) {
    return {
      score,
      theme: 'green' as ReportWellbeingTheme,
      label: 'Profil globalement equilibre',
      description:
        'Les traits indiquent un bon niveau de ressources personnelles et une stabilite globale encourageante.',
    }
  }

  if (score >= 5) {
    return {
      score,
      theme: 'orange' as ReportWellbeingTheme,
      label: 'Profil a accompagner',
      description:
        'Le profil montre des forces utiles, avec certains points a soutenir pour ameliorer le confort quotidien.',
    }
  }

  return {
    score,
    theme: 'rose' as ReportWellbeingTheme,
    label: 'Profil sensible',
    description:
      'Le profil indique plusieurs zones de fragilite qui meritent un accompagnement attentif et progressif.',
  }
}

function getTraitScores(traits?: ReportTrait[] | null) {
  if (!traits || traits.length === 0) return null

  const scores = {
    ouverture: findTraitScore(traits, ['ouverture']),
    conscienciosite: findTraitScore(traits, ['conscienciosite', 'conscienciosité']),
    extraversion: findTraitScore(traits, ['extraversion']),
    agreabilite: findTraitScore(traits, ['agreabilite', 'agréabilité']),
    neuroticisme: findTraitScore(traits, ['neuroticisme']),
  }

  if (Object.values(scores).some((score) => score === null)) {
    return null
  }

  return scores as Record<keyof typeof scores, number>
}

function findTraitScore(traits: ReportTrait[], names: string[]) {
  const normalizedNames = names.map(normalizeTraitName)
  const trait = traits.find((item) => normalizedNames.includes(normalizeTraitName(item.name || '')))
  const score = Number(trait?.score)

  if (!Number.isFinite(score)) {
    return null
  }

  return Math.max(1, Math.min(10, score))
}

function normalizeTraitName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}
