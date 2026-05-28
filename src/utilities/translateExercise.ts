import { unstable_cache } from 'next/cache'

type ExercisePayload = {
  title: string
  instructions?: string | null
  reason?: string | null
  coachFeedback?: string | null
}

export type TranslatedExercise = {
  title: string
  instructions: string | null
  reason: string | null
  coachFeedback: string | null
}

async function callGroqTranslate(payload: ExercisePayload): Promise<ExercisePayload> {
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
      max_tokens: 400,
    }),
  })

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`)

  const result = await response.json()
  const raw: string = result?.choices?.[0]?.message?.content?.trim() ?? ''
  const cleaned = raw.replace(/^```json\s*|\s*```$/g, '').trim()

  return JSON.parse(cleaned) as ExercisePayload
}

export async function translateExerciseToEnglish(
  exerciseId: string | number,
  exercise: ExercisePayload,
): Promise<TranslatedExercise> {
  try {
    const cached = unstable_cache(
      () => callGroqTranslate(exercise),
      [`exercise-en-v2-${exerciseId}`],
      { revalidate: 60 * 60 * 24 * 7 },
    )

    const translated = await cached()

    return {
      title: translated.title ?? exercise.title,
      instructions: translated.instructions ?? exercise.instructions ?? null,
      reason: translated.reason ?? exercise.reason ?? null,
      coachFeedback: translated.coachFeedback ?? exercise.coachFeedback ?? null,
    }
  } catch {
    return {
      title: exercise.title,
      instructions: exercise.instructions ?? null,
      reason: exercise.reason ?? null,
      coachFeedback: exercise.coachFeedback ?? null,
    }
  }
}
