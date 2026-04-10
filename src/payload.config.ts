import { mongooseAdapter } from '@payloadcms/db-mongodb'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { Header } from '@/Header/config'
import { Footer } from '@/Footer/config'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { plugins } from './plugins'
import { AnalysePersonnalite } from './collections/AnalysePersonnalite'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  endpoints: [
    {
      path: '/chat',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await (req as Request).json()
        const { textMessage, audioBase64, sessionId, sttOnly } = body

        let userText = typeof textMessage === 'string' ? textMessage.trim() : ''

        if (!userText && audioBase64) {
          const googleSttKey = process.env.GOOGLE_STT_KEY?.trim()

          if (!googleSttKey) {
            return Response.json({ error: 'GOOGLE_STT_KEY manquante.' }, { status: 500 })
          }

          userText = await transcrireAudioAvecGoogle(audioBase64, googleSttKey)
        }

        if (sttOnly === true) {
          return Response.json({
            userText,
            sessionId: sessionId || `session-${req.user.id}`,
          })
        }

        if (!userText) {
          return Response.json({ error: 'Message vide.' }, { status: 400 })
        }

        const n8nChatUrl = process.env.N8N_CHAT_URL?.trim()

        if (!n8nChatUrl) {
          return Response.json({ error: 'N8N_CHAT_URL manquante.' }, { status: 500 })
        }

        const n8nResponse = await fetch(n8nChatUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatInput: userText,
            sessionId: sessionId || `session-${req.user.id}`,
          }),
        })

        if (!n8nResponse.ok) {
          return Response.json(
            { error: `Erreur n8n (${n8nResponse.status}).` },
            { status: 502 },
          )
        }

        const n8nRawText = await n8nResponse.text()

        let n8nData: any = {}

        try {
          n8nData = JSON.parse(n8nRawText)
        } catch {
          n8nData = { output: n8nRawText }
        }

        const iaText =
          n8nData.output ||
          n8nData.texte ||
          n8nData.text ||
          n8nData.message ||
          n8nData.response ||
          ''

        const isFinished = n8nData.isFinished || iaText.includes('[FIN]') || false
        const cleanText = iaText.replace('[FIN]', '').trim()
        const analysisData = isFinished ? extraireAnalysisData(n8nData) : null

        let audioBase64Reponse: string | null = null

        if (cleanText && !isFinished) {
          const googleTtsKey = process.env.GOOGLE_TTS_KEY?.trim()

          if (googleTtsKey) {
            audioBase64Reponse = await genererAudioAvecGoogle(cleanText, googleTtsKey)
          }
        }

        return Response.json({
          userText,
          iaText: cleanText,
          isFinished,
          sessionId: sessionId || `session-${req.user.id}`,
          analysisData,
          audioBase64: audioBase64Reponse,
        })
      },
    },
    {
      path: '/save-analysis',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await (req as Request).json()
        const { sessionId, conversation, analysisData } = body

        if (!analysisData) {
          return Response.json({ error: 'analysisData requis.' }, { status: 400 })
        }

        const analysis = typeof analysisData === 'string' ? JSON.parse(analysisData) : analysisData
        const traits = Array.isArray(analysis?.traits) ? analysis.traits : []
        const recs = Array.isArray(analysis?.recommendations)
          ? analysis.recommendations
          : []
        const resumeExecutif = analysis?.executive_summary || {}
        const donneesProfilEmotionnel = analysis?.emotional_profile || {}
        const now = new Date()
        const reference = `BIG5-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString(36).toUpperCase()}`

        const doc = await req.payload.create({
          collection: 'analyse-personnalite',
          data: {
            reference: analysis.reference || reference,
            user: req.user.id,
            date: now.toISOString(),
            niveauConfiance: 'moyen',
            sessionId: sessionId || '',
            conversation: Array.isArray(conversation)
              ? conversation.map((msg: any) => ({
                  role: msg.role || 'human',
                  message: msg.text || msg.message || '',
                  time: msg.time || '',
                  emotion: msg.emotion || null,
                  emotionScore:
                    typeof msg.emotionScore === 'number' ? msg.emotionScore : null,
                  source: msg.source || 'text',
                }))
              : [],
            traits: traits.map((trait: any) => ({
              name: trait.name,
              score: Math.max(1, Math.min(10, Number(trait.score || 5))),
              analysis: trait.analysis || '',
              interpretation: trait.interpretation || '',
              confidence: trait.confidence || 'moyen',
              confidenceReason: trait.confidence_reason || trait.confidenceReason || '',
              observedIndicators: Array.isArray(trait.observed_indicators)
                ? trait.observed_indicators.map((indicator: string) => ({
                    indicator,
                  }))
                : Array.isArray(trait.observedIndicators)
                  ? trait.observedIndicators.map((indicator: any) => ({
                      indicator:
                        typeof indicator === 'string'
                          ? indicator
                          : indicator?.indicator || '',
                    }))
                  : [],
            })),
            profilEmotionnel: {
              dominantEmotion: donneesProfilEmotionnel.dominant_emotion || '',
              emotionalStability: Number(donneesProfilEmotionnel.emotional_stability || 5),
              emotionalSummary: donneesProfilEmotionnel.emotional_summary || '',
            },
            overview: resumeExecutif.overview || '',
            forcesDominantes: resumeExecutif.dominant_strengths || '',
            pointsVigilance: resumeExecutif.watch_points || '',
            styleRelationnel: resumeExecutif.relational_style || '',
            recommandations: recs.map((recommendation: any) => ({
              text: typeof recommendation === 'string' ? recommendation : recommendation?.text || '',
            })),
            conclusion: analysis?.conclusion || '',
          },
        })

        return Response.json({
          success: true,
          id: doc.id,
          reference: doc.reference,
        })
      },
    },
  ],


  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  collections: [Pages, Users, Media, AnalysePersonnalite],
  globals: [Header, Footer],
  cors: [getServerSideURL()].filter(Boolean),
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})

async function transcrireAudioAvecGoogle(audioBase64: string, cleApi: string): Promise<string> {
  const contenuAudio = audioBase64.replace(/^data:audio\/[^;]+;base64,/, '')

  const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${cleApi}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'fr-FR',
        alternativeLanguageCodes: ['en-US'],
        enableAutomaticPunctuation: true,
      },
      audio: {
        content: contenuAudio,
      },
    }),
  })

  if (!response.ok) {
    throw new Error('Erreur STT Google.')
  }

  const data = await response.json()
  const transcription = data.results?.map((item: any) => item.alternatives?.[0]?.transcript || '').join(' ').trim()

  if (!transcription) {
    throw new Error('Aucun texte détecté dans l audio.')
  }

  return transcription
}

async function genererAudioAvecGoogle(texte: string, cleApi: string): Promise<string | null> {
  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${cleApi}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        text: texte,
      },
      voice: {
        languageCode: 'fr-FR',
        name: 'fr-FR-Neural2-B',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    }),
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return data.audioContent || null
}

function extraireAnalysisData(n8nData: any): any {
  if (n8nData?.analysisData && typeof n8nData.analysisData === 'object') {
    return n8nData.analysisData
  }

  if (n8nData?.analysis && typeof n8nData.analysis === 'object') {
    return n8nData.analysis
  }

  if (n8nData?.result && typeof n8nData.result === 'object') {
    return n8nData.result
  }

  if (n8nData?.data && typeof n8nData.data === 'object') {
    return n8nData.data
  }

  if (n8nData?.report && typeof n8nData.report === 'object') {
    return n8nData.report
  }

  if (Array.isArray(n8nData?.traits)) {
    return n8nData
  }

  const clesPossibles = ['analysisData', 'analysis', 'result', 'data', 'report']

  for (const cle of clesPossibles) {
    const valeur = n8nData?.[cle]

    if (typeof valeur === 'string') {
      try {
        const nettoye = valeur
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim()

        const premiereAccolade = nettoye.indexOf('{')
        const derniereAccolade = nettoye.lastIndexOf('}')

        if (premiereAccolade !== -1 && derniereAccolade > premiereAccolade) {
          const parse = JSON.parse(nettoye.slice(premiereAccolade, derniereAccolade + 1))
          if (parse && (Array.isArray(parse.traits) || parse.analysisData || parse.executive_summary)) {
            return parse
          }
        }
      } catch {
        // ignore parse failures and continue probing
      }
    }
  }

  return null
}
