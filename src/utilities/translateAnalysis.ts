import { unstable_cache } from 'next/cache'
import type { AnalysePersonnalite } from '@/payload-types'

const TRAIT_NAME_MAP: Record<string, string> = {
  Ouverture: 'Openness',
  Conscienciosite: 'Conscientiousness',
  Extraversion: 'Extraversion',
  Agreabilite: 'Agreeableness',
  Neuroticisme: 'Neuroticism',
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

async function callGroqTranslate(payload: TranslatablePayload): Promise<TranslatablePayload> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GROQ_COACHING_MODEL || 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional French-to-English translator. Translate every string value in the JSON from French to English. Preserve the exact JSON structure and all keys unchanged. Only translate string values. Return valid JSON only — no markdown, no code fences, no explanation.',
        },
        {
          role: 'user',
          content: JSON.stringify(payload),
        },
      ],
      temperature: 0.1,
      max_tokens: 3000,
    }),
  })

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`)

  const result = await response.json()
  const raw: string = result?.choices?.[0]?.message?.content?.trim() ?? ''
  const cleaned = raw.replace(/^```json\s*|\s*```$/g, '').trim()

  return JSON.parse(cleaned) as TranslatablePayload
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

export async function translateAnalysisToEnglish(
  analysisId: string | number,
  analyse: AnalysisInput,
): Promise<TranslatedAnalysis> {
  const payload: TranslatablePayload = {
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
    recommandations: (analyse.recommandations ?? []).map((r) => r.text).filter(Boolean),
  }

  try {
    const cached = unstable_cache(
      () => callGroqTranslate(payload),
      [`analysis-en-v2-${analysisId}`],
      { revalidate: 60 * 60 * 24 * 7 },
    )

    const translated = await cached()

    return {
      overview: translated.overview ?? null,
      conclusion: translated.conclusion ?? null,
      forcesDominantes: translated.forcesDominantes ?? null,
      pointsVigilance: translated.pointsVigilance ?? null,
      styleRelationnel: translated.styleRelationnel ?? null,
      traits: (analyse.traits ?? []).map((trait, i) => ({
        name: TRAIT_NAME_MAP[trait.name] ?? trait.name,
        analysis: translated.traitTexts?.[i]?.analysis ?? trait.analysis ?? null,
        interpretation: translated.traitTexts?.[i]?.interpretation ?? trait.interpretation ?? null,
        indicators: translated.traitTexts?.[i]?.indicators ?? [],
      })),
      dominantEmotion: translated.dominantEmotion ?? null,
      emotionalSummary: translated.emotionalSummary ?? null,
      recommandations: translated.recommandations ?? [],
    }
  } catch {
    return {
      overview: analyse.overview ?? null,
      conclusion: analyse.conclusion ?? null,
      forcesDominantes: analyse.forcesDominantes ?? null,
      pointsVigilance: analyse.pointsVigilance ?? null,
      styleRelationnel: analyse.styleRelationnel ?? null,
      traits: (analyse.traits ?? []).map((trait) => ({
        name: TRAIT_NAME_MAP[trait.name] ?? trait.name,
        analysis: trait.analysis ?? null,
        interpretation: trait.interpretation ?? null,
        indicators: (trait.observedIndicators ?? []).map((i) => i.indicator ?? '').filter(Boolean),
      })),
      dominantEmotion: analyse.profilEmotionnel?.dominantEmotion ?? null,
      emotionalSummary: analyse.profilEmotionnel?.emotionalSummary ?? null,
      recommandations: (analyse.recommandations ?? []).map((r) => r.text).filter(Boolean),
    }
  }
}
