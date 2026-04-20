import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { sanitizeCoachingMessage } from '@/lib/coaching'

type VoiceBody = {
  action?: 'stt' | 'tts'
  audioBase64?: string
  text?: string
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as VoiceBody

  if (body.action === 'stt') {
    const googleSttKey = process.env.GOOGLE_STT_KEY?.trim()

    if (!googleSttKey) {
      return Response.json({ error: 'GOOGLE_STT_KEY manquante.' }, { status: 500 })
    }

    if (!body.audioBase64 || typeof body.audioBase64 !== 'string') {
      return Response.json({ error: 'Audio requis.' }, { status: 400 })
    }

    const text = await transcribeAudioWithGoogle(body.audioBase64, googleSttKey)

    return Response.json({ text })
  }

  if (body.action === 'tts') {
    const googleTtsKey = process.env.GOOGLE_TTS_KEY?.trim()
    const text = sanitizeCoachingMessage(body.text)

    if (!googleTtsKey) {
      return Response.json({ error: 'GOOGLE_TTS_KEY manquante.' }, { status: 500 })
    }

    if (!text) {
      return Response.json({ error: 'Texte requis.' }, { status: 400 })
    }

    const audioBase64 = await synthesizeSpeechWithGoogle(text, googleTtsKey)

    return Response.json({ audioBase64 })
  }

  return Response.json({ error: 'Action vocale invalide.' }, { status: 400 })
}

async function transcribeAudioWithGoogle(audioBase64: string, apiKey: string): Promise<string> {
  const audioContent = audioBase64.replace(/^data:audio\/[^;]+;base64,/, '')
  const models = ['latest_long', 'latest_short', 'default']

  for (const model of models) {
    try {
      const response = await fetchWithRetry(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',
              sampleRateHertz: 48000,
              audioChannelCount: 1,
              languageCode: 'fr-FR',
              alternativeLanguageCodes: ['en-US', 'ar-SA'],
              enableAutomaticPunctuation: true,
              model,
              useEnhanced: true,
            },
            audio: {
              content: audioContent,
            },
          }),
        },
        { maxRetries: 0, timeoutMs: 15000 },
      )

      if (!response.ok) {
        continue
      }

      const data = await response.json()
      const text = data.results
        ?.map((item: any) => item.alternatives?.[0]?.transcript || '')
        .join(' ')
        .trim()

      if (text) return text
    } catch {
      // Try the next Google STT model.
    }
  }

  return ''
}

async function synthesizeSpeechWithGoogle(text: string, apiKey: string): Promise<string | null> {
  const speakableText = normalizeTextForSpeech(text)

  const response = await fetchWithRetry(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          text: speakableText.slice(0, 5000),
        },
        voice: {
          languageCode: 'fr-FR',
          name: process.env.GOOGLE_TTS_VOICE || 'fr-FR-Neural2-B',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1,
          pitch: 0,
        },
      }),
    },
    { maxRetries: 1, timeoutMs: 15000 },
  )

  if (!response.ok) {
    return null
  }

  const data = await response.json()

  return data.audioContent || null
}

function normalizeTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/[#[\]{}<>|~^=+*_•]/g, ' ')
    .replace(/[-]{2,}/g, ' ')
    .replace(/[.]{2,}/g, '. ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryOptions: { maxRetries?: number; timeoutMs?: number } = {},
): Promise<Response> {
  const { maxRetries = 1, timeoutMs = 15000 } = retryOptions

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timer)

      if (response.ok) return response

      if (response.status >= 500 && attempt < maxRetries) {
        await wait(1000 * (attempt + 1))
        continue
      }

      return response
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError' && attempt < maxRetries) {
        await wait(1000 * (attempt + 1))
        continue
      }

      throw error
    }
  }

  throw new Error('Echec de la requete externe.')
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
