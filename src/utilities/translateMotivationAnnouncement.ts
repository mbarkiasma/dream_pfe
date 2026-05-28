import { unstable_cache } from 'next/cache'

type AnnouncementPayload = {
  title: string
  content: string
}

export type TranslatedAnnouncement = {
  title: string
  content: string
}

async function callGroqTranslate(payload: AnnouncementPayload): Promise<AnnouncementPayload> {
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
      max_tokens: 800,
    }),
  })

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`)

  const result = await response.json()
  const raw: string = result?.choices?.[0]?.message?.content?.trim() ?? ''
  const cleaned = raw.replace(/^```json\s*|\s*```$/g, '').trim()

  const parsed = JSON.parse(cleaned) as AnnouncementPayload
  return parsed
}

export async function translateAnnouncementToEnglish(
  announcementId: string | number,
  announcement: AnnouncementPayload,
): Promise<TranslatedAnnouncement> {
  try {
    const cached = unstable_cache(
      () => callGroqTranslate(announcement),
      [`announcement-en-v2-${announcementId}`],
      { revalidate: 60 * 60 * 24 * 7 },
    )

    const translated = await cached()

    return {
      title: translated.title ?? announcement.title,
      content: translated.content ?? announcement.content,
    }
  } catch {
    return {
      title: announcement.title,
      content: announcement.content,
    }
  }
}
