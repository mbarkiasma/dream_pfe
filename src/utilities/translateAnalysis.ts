import { unstable_cache } from 'next/cache'
import type { AnalysePersonnalite } from '@/payload-types'

const TO_EN: Record<string, string> = {
  Ouverture: 'Openness',
  Conscienciosite: 'Conscientiousness',
  Extraversion: 'Extraversion',
  Agreabilite: 'Agreeableness',
  Neuroticisme: 'Neuroticism',
}

const TO_FR: Record<string, string> = {
  Openness: 'Ouverture',
  Conscientiousness: 'Conscienciosite',
  Extraversion: 'Extraversion',
  Agreeableness: 'Agreabilite',
  Neuroticism: 'Neuroticisme',
}

export type TranslatedAnalysis = {
  overview: string | null
  conclusion: string | null
  forcesDominantes: string | null
  pointsVigilance: string | null
  styleRelationnel: string | null
  traits: Array<{
    name: string
    analysis: string | null
    interpretation: string | null
    indicators: string[]
  }>
  dominantEmotion: string | null
  emotionalSummary: string | null
  recommandations: string[]
}

type TranslatablePayload = {
  overview?: string | null
  conclusion?: string | null
  forcesDominantes?: string | null
  pointsVigilance?: string | null
  styleRelationnel?: string | null
  traitTexts?: Array<{
    analysis?: string | null
    interpretation?: string | null
    indicators: string[]
  }>
  dominantEmotion?: string | null
  emotionalSummary?: string | null
  recommandations?: string[]
}

type AnalysisInput = Pick<
  AnalysePersonnalite,
  | 'overview'
  | 'conclusion'
  | 'forcesDominantes'
  | 'pointsVigilance'
  | 'styleRelationnel'
  | 'traits'
  | 'profilEmotionnel'
  | 'recommandations'
>

async function callGroqTranslate(
  payload: TranslatablePayload,
  targetLang: 'en' | 'fr',
): Promise<TranslatablePayload> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const systemPrompt =
    targetLang === 'en'
      ? 'You are a professional translator. For every string value in the JSON: if it is in French, translate it to English; if it is already in English, keep it exactly as-is. Preserve the exact JSON structure and all keys unchanged. Only translate string values. Return valid JSON only — no markdown, no code fences, no explanation.'
      : 'You are a professional translator. For every string value in the JSON: if it is in English, translate it to French; if it is already in French, keep it exactly as-is. Preserve the exact JSON structure and all keys unchanged. Only translate string values. Return valid JSON only — no markdown, no code fences, no explanation.'

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GROQ_COACHING_MODEL || 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(payload) },
      ],
      temperature: 0.1,
      max_tokens: 6000,
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`Groq API ${response.status}: ${errText.slice(0, 200)}`)
  }

  const result = await response.json()
  const raw: string = result?.choices?.[0]?.message?.content?.trim() ?? ''
  if (!raw) throw new Error('Groq returned empty content')

  const cleaned = raw.replace(/^```json\s*|\s*```$/g, '').trim()

  let parsed: TranslatablePayload
  try {
    parsed = JSON.parse(cleaned) as TranslatablePayload
  } catch (e) {
    throw new Error(`Groq JSON parse failed: ${String(e)} — raw: ${cleaned.slice(0, 200)}`)
  }
  return parsed
}

function buildPayload(analyse: AnalysisInput): TranslatablePayload {
  return {
    overview: analyse.overview ?? null,
    conclusion: analyse.conclusion ?? null,
    forcesDominantes: analyse.forcesDominantes ?? null,
    pointsVigilance: analyse.pointsVigilance ?? null,
    styleRelationnel: analyse.styleRelationnel ?? null,
    traitTexts: analyse.traits?.map((trait) => ({
      analysis: trait.analysis ?? null,
      interpretation: trait.interpretation ?? null,
      indicators: (trait.observedIndicators ?? []).map((i) => i.indicator ?? '').filter(Boolean),
    })),
    dominantEmotion: analyse.profilEmotionnel?.dominantEmotion ?? null,
    emotionalSummary: analyse.profilEmotionnel?.emotionalSummary ?? null,
    recommandations: (analyse.recommandations ?? []).map((r) => r.text).filter(Boolean) as string[],
  }
}

function shapeResult(
  analyse: AnalysisInput,
  translated: TranslatablePayload,
  nameMap: Record<string, string>,
): TranslatedAnalysis {
  return {
    overview: translated.overview ?? null,
    conclusion: translated.conclusion ?? null,
    forcesDominantes: translated.forcesDominantes ?? null,
    pointsVigilance: translated.pointsVigilance ?? null,
    styleRelationnel: translated.styleRelationnel ?? null,
    traits: (analyse.traits ?? []).map((trait, i) => ({
      name: nameMap[trait.name] ?? trait.name,
      analysis: translated.traitTexts?.[i]?.analysis ?? trait.analysis ?? null,
      interpretation: translated.traitTexts?.[i]?.interpretation ?? trait.interpretation ?? null,
      indicators: translated.traitTexts?.[i]?.indicators ?? [],
    })),
    dominantEmotion: translated.dominantEmotion ?? null,
    emotionalSummary: translated.emotionalSummary ?? null,
    recommandations: (translated.recommandations as string[]) ?? [],
  }
}

function shapeFallback(analyse: AnalysisInput, nameMap: Record<string, string>): TranslatedAnalysis {
  return {
    overview: analyse.overview ?? null,
    conclusion: analyse.conclusion ?? null,
    forcesDominantes: analyse.forcesDominantes ?? null,
    pointsVigilance: analyse.pointsVigilance ?? null,
    styleRelationnel: analyse.styleRelationnel ?? null,
    traits: (analyse.traits ?? []).map((trait) => ({
      name: nameMap[trait.name] ?? trait.name,
      analysis: trait.analysis ?? null,
      interpretation: trait.interpretation ?? null,
      indicators: (trait.observedIndicators ?? []).map((i) => i.indicator ?? '').filter(Boolean),
    })),
    dominantEmotion: analyse.profilEmotionnel?.dominantEmotion ?? null,
    emotionalSummary: analyse.profilEmotionnel?.emotionalSummary ?? null,
    recommandations: (analyse.recommandations ?? []).map((r) => r.text).filter(Boolean) as string[],
  }
}

// Stable module-level cached function — analysisId + lang form a unique per-report key.
// The payload is passed as an arg so Next.js can hash it, but the tag is what lets us
// identify and reason about cache entries. Reports are immutable so 7-day TTL is safe.
const cachedGroqTranslate = unstable_cache(
  async (analysisId: string, payload: TranslatablePayload, targetLang: 'en' | 'fr') =>
    callGroqTranslate(payload, targetLang),
  ['analysis-translate-v4'],
  { revalidate: 60 * 60 * 24 * 7 },
)

export async function translateAnalysisToEnglish(
  analysisId: string | number,
  analyse: AnalysisInput,
): Promise<TranslatedAnalysis> {
  const payload = buildPayload(analyse)
  try {
    const translated = await cachedGroqTranslate(String(analysisId), payload, 'en')
    return shapeResult(analyse, translated, TO_EN)
  } catch (err) {
    console.error(`[translateAnalysisToEnglish] id=${analysisId} — Groq failed:`, err)
    return shapeFallback(analyse, TO_EN)
  }
}

export async function translateAnalysisToFrench(
  analysisId: string | number,
  analyse: AnalysisInput,
): Promise<TranslatedAnalysis> {
  const payload = buildPayload(analyse)
  try {
    const translated = await cachedGroqTranslate(String(analysisId), payload, 'fr')
    return shapeResult(analyse, translated, TO_FR)
  } catch (err) {
    console.error(`[translateAnalysisToFrench] id=${analysisId} — Groq failed:`, err)
    return shapeFallback(analyse, TO_FR)
  }
}
