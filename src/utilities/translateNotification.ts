type NotificationItem = {
  id: string | number
  title: string
  message: string
}

async function callGroqTranslateBatch(items: NotificationItem[]): Promise<NotificationItem[]> {
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
            'You are a professional French-to-English translator. You will receive a JSON array of objects with "id", "title", and "message" fields. Translate only the "title" and "message" string values from French to English. Keep "id" unchanged. Return valid JSON array only — no markdown, no code fences, no explanation.',
        },
        {
          role: 'user',
          content: JSON.stringify(items),
        },
      ],
      temperature: 0.1,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`)

  const result = await response.json()
  const raw: string = result?.choices?.[0]?.message?.content?.trim() ?? ''
  const cleaned = raw.replace(/^```json\s*|\s*```$/g, '').trim()

  return JSON.parse(cleaned) as NotificationItem[]
}

export async function translateNotificationsBatch(
  items: NotificationItem[],
): Promise<NotificationItem[]> {
  if (items.length === 0) return items

  try {
    const translated = await callGroqTranslateBatch(items)

    const translatedById = new Map(translated.map((item) => [String(item.id), item]))

    return items.map((original) => {
      const tx = translatedById.get(String(original.id))
      return {
        id: original.id,
        title: tx?.title ?? original.title,
        message: tx?.message ?? original.message,
      }
    })
  } catch {
    return items
  }
}
