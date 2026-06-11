import type { Endpoint, File } from 'payload'

import { createNotification } from '@/utilities/createNotification'
import { getServerSideURL } from '@/utilities/getURL'

const getDreamsVideoCallbackUrl = (): string => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_URL?.trim() ||
    process.env.__NEXT_PRIVATE_ORIGIN?.trim() ||
    getServerSideURL()

  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')

  if (
    normalizedBaseUrl.startsWith('http://localhost') &&
    process.env.NODE_ENV === 'production'
  ) {
    console.warn(
      'Using localhost as callback host in production. Set NEXT_PUBLIC_SERVER_URL to a public URL reachable from n8n.',
    )
  }

  return `${normalizedBaseUrl}/api/dreams-video-callback`
}

type NormalizedBigFiveTrait = {
  name: BigFiveTraitName
  score: number
  analysis: string
  interpretation: string
  confidence: 'eleve' | 'moyen' | 'faible'
  confidenceReason: string
  observedIndicators: {
    indicator: string
  }[]
}

type BigFiveTraitName =
  | 'Ouverture'
  | 'Conscienciosite'
  | 'Extraversion'
  | 'Agreabilite'
  | 'Neuroticisme'

export const payloadEndpoints: Endpoint[] = [
  // Gere le chat d'entretien, la transcription audio et les reponses IA en temps reel.
  {
    path: '/chat',
    method: 'post',
    handler: async (req) => {
      if (!req.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await (req as Request).json()
      const {
        textMessage,
        audioBase64,
        sessionId,
        sttOnly,
        interviewLanguage,
        interviewerGender,
        studentMessageCount,
        conversationHistory,
        supportsInteractiveQuestions,
        interactiveQuestionMode,
        hasAskedRequiredInteractive,
      } = body

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

      const prevAiMessages = (Array.isArray(conversationHistory) ? conversationHistory : [])
        .filter((m: any) => m?.role === 'ai')
      const applicationAnswerDetected =
        detectApplicationLanguage(userText) &&
        prevAiMessages.some((m: any) => detectApplicationQuestion(String(m?.content || '')))

      let n8nResponse: Response

      try {
        n8nResponse = await fetch(n8nChatUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assistantName: 'MindBloom',
            chatInput: userText,
            sessionId: sessionId || `session-${req.user.id}`,
            interviewLanguage: interviewLanguage === 'en' ? 'en' : 'fr',
            interviewerGender: interviewerGender === 'male' ? 'male' : 'female',
            studentMessageCount:
              typeof studentMessageCount === 'number' ? studentMessageCount : undefined,
            conversationHistory: Array.isArray(conversationHistory)
              ? conversationHistory
                  .map((message: any) => ({
                    role: message?.role === 'ai' ? 'ai' : 'user',
                    content: String(message?.content || message?.message || '').trim(),
                  }))
                  .filter((message: { content: string }) => message.content)
              : [],
            supportsInteractiveQuestions: supportsInteractiveQuestions === true,
            interactiveQuestionMode:
              interactiveQuestionMode === 'occasional' ? 'occasional' : 'text',
            hasAskedRequiredInteractive: hasAskedRequiredInteractive === true,
            applicationAnswerDetected,
          }),
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Impossible de contacter le workflow d'entretien."

        console.error('Erreur appel n8n chat:', message)

        return Response.json(
          {
            error:
              "Impossible de contacter le workflow n8n. Vérifiez que n8n est démarré et que N8N_CHAT_URL est correct.",
          },
          { status: 502 },
        )
      }

      if (!n8nResponse.ok) {
        return Response.json({ error: `Erreur n8n (${n8nResponse.status}).` }, { status: 502 })
      }

      const n8nRawText = await n8nResponse.text()

      let n8nData: any = {}

      try {
        n8nData = JSON.parse(n8nRawText)
      } catch {
        n8nData = { output: n8nRawText }
      }

      if (Array.isArray(n8nData)) {
        n8nData = n8nData[0] || {}
      }

      const iaText =
        n8nData.output || n8nData.texte || n8nData.text || n8nData.message || n8nData.response || ''
      const embeddedInteractive = extraireQuestionInteractiveDepuisTexte(iaText)
      const iaTextNettoye = embeddedInteractive?.output || retirerJsonInteractifDuTexte(iaText)

      const rawIsFinished = n8nData.isFinished || iaTextNettoye.includes('[FIN]') || false
      const analysisData = rawIsFinished ? extraireAnalysisData(n8nData) : null
      const isPrematureFinish = rawIsFinished && !analysisData
      const isFinished = rawIsFinished && Boolean(analysisData)
      const rawCleanText = isPrematureFinish
        ? interviewLanguage === 'en'
          ? 'Before finishing, could you share one recent situation where you had to make an important study-related decision?'
          : "Avant de terminer, pouvez-vous me parler d'une situation r\u00e9cente o\u00f9 vous avez d\u00fb prendre une d\u00e9cision importante li\u00e9e \u00e0 vos \u00e9tudes ?"
        : normaliserTexteAssistant(
            iaTextNettoye.replace(/\[FIN\]/gi, ''),
            interviewLanguage === 'en' ? 'en' : 'fr',
          ).trim()
      // Guard against n8n looping the same closing question after the student already answered it
      const isLoopedApplicationQuestion =
        !isFinished && applicationAnswerDetected && detectApplicationQuestion(rawCleanText)
      const cleanText = isLoopedApplicationQuestion
        ? interviewLanguage === 'en'
          ? "Thank you for sharing that. Is there anything else you'd like to add before we conclude our interview?"
          : "Merci pour votre réponse. Y a-t-il quelque chose d'autre que vous souhaiteriez partager avant de conclure notre entretien ?"
        : rawCleanText
      const interactiveQuestion =
        isFinished
          ? null
          : extraireQuestionInteractive(n8nData) ||
            embeddedInteractive?.interactiveQuestion ||
            creerQuestionInteractiveSecours({
              interviewLanguage: interviewLanguage === 'en' ? 'en' : 'fr',
              studentMessageCount:
                typeof studentMessageCount === 'number' ? studentMessageCount : undefined,
              supportsInteractiveQuestions: supportsInteractiveQuestions === true,
              conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
              userText,
            })

      let audioBase64Reponse: string | null = null

      if (cleanText && !isFinished) {
        const googleTtsKey = process.env.GOOGLE_TTS_KEY?.trim()

        if (googleTtsKey) {
          audioBase64Reponse = await genererAudioAvecGoogle(
            cleanText,
            googleTtsKey,
            interviewLanguage === 'en' ? 'en' : 'fr',
            interviewerGender === 'male' ? 'male' : 'female',
          )
        }
      }

      return Response.json({
        userText,
        iaText: cleanText,
        isFinished,
        sessionId: sessionId || `session-${req.user.id}`,
        analysisData,
        interactiveQuestion,
        audioBase64: audioBase64Reponse,
      })
    },
  },
  // Enregistre le rapport final d'analyse de personnalite genere apres la conversation.
  {
    path: '/complete-interview',
    method: 'post',
    handler: async (req) => {
      if (!req.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (req.user.role !== 'etudiant') {
        return Response.json(
          { error: 'Seuls les etudiants peuvent terminer un entretien initial.' },
          { status: 403 },
        )
      }

      await req.payload.update({
        collection: 'users',
        id: req.user.id,
        req,
        data: {
          onboardingStep: 'completed',
        },
      })

      return Response.json({ success: true })
    },
  },
  {
    path: '/save-analysis',
    method: 'post',
    handler: async (req) => {
      if (!req.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (req.user.role !== 'etudiant') {
        return Response.json(
          { error: 'Seuls les etudiants peuvent enregistrer une analyse de personnalite.' },
          { status: 403 },
        )
      }

      try {
        const body = await (req as Request).json()
        const { sessionId, conversation, analysisData, locale = 'fr' } = body

        if (!analysisData) {
          return Response.json({ error: 'analysisData requis.' }, { status: 400 })
        }

        const analysis = typeof analysisData === 'string' ? JSON.parse(analysisData) : analysisData
        const traits = Array.isArray(analysis?.traits) ? analysis.traits : []

        if (traits.length < 5) {
          return Response.json(
            { error: 'Rapport Big Five incomplet: les 5 traits sont requis.' },
            { status: 400 },
          )
        }

        const recs = Array.isArray(analysis?.recommendations) ? analysis.recommendations : []
        const resumeExecutif = analysis?.executive_summary || {}
        const donneesProfilEmotionnel = analysis?.emotional_profile || {}
        const now = new Date()
        const reference = `BIG5-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString(36).toUpperCase()}`
        const normalizedTraits: NormalizedBigFiveTrait[] = traits.map((trait: any) => ({
          name: normaliserNomTrait(trait.name),
          score: Math.max(1, Math.min(10, Number(trait.score || 5))),
          analysis: trait.analysis || '',
          interpretation: trait.interpretation || '',
          confidence: normaliserConfianceTrait(trait.confidence),
          confidenceReason: trait.confidence_reason || trait.confidenceReason || '',
          observedIndicators: Array.isArray(trait.observed_indicators)
            ? trait.observed_indicators.map((indicator: string) => ({
                indicator,
              }))
            : Array.isArray(trait.observedIndicators)
              ? trait.observedIndicators.map((indicator: any) => ({
                  indicator: typeof indicator === 'string' ? indicator : indicator?.indicator || '',
                }))
              : [],
        }))

        const doc = await req.payload.create({
          collection: 'analyse-personnalite',
          req,
          locale: (locale === 'en' ? 'en' : 'fr') as 'fr' | 'en',
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
                  emotionScore: typeof msg.emotionScore === 'number' ? msg.emotionScore : null,
                  source: msg.source || 'text',
                }))
              : [],
            traits: normalizedTraits,
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
              text:
                typeof recommendation === 'string' ? recommendation : recommendation?.text || '',
            })),
            conclusion: analysis?.conclusion || '',
          },
        })

        // Translate and store the other locale automatically
        try {
          const primaryLocale = (locale === 'en' ? 'en' : 'fr') as 'fr' | 'en'
          const otherLocale: 'fr' | 'en' = primaryLocale === 'fr' ? 'en' : 'fr'
          const groqApiKey = process.env.GROQ_API_KEY?.trim()

          if (groqApiKey) {
            const translateDirection =
              primaryLocale === 'fr'
                ? 'Translate all string values from French to English.'
                : 'Translate all string values from English to French.'

            const textPayload = {
              overview: resumeExecutif.overview || '',
              conclusion: analysis?.conclusion || '',
              forcesDominantes: resumeExecutif.dominant_strengths || '',
              pointsVigilance: resumeExecutif.watch_points || '',
              styleRelationnel: resumeExecutif.relational_style || '',
              traitTexts: normalizedTraits.map((t) => ({
                analysis: t.analysis || '',
                interpretation: t.interpretation || '',
                confidenceReason: t.confidenceReason || '',
                indicators: t.observedIndicators.map((i) => i.indicator).filter(Boolean),
              })),
              dominantEmotion: donneesProfilEmotionnel.dominant_emotion || '',
              emotionalSummary: donneesProfilEmotionnel.emotional_summary || '',
              recommandations: recs
                .map((r: any) => (typeof r === 'string' ? r : r?.text || ''))
                .filter(Boolean),
            }

            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: process.env.GROQ_COACHING_MODEL || 'llama-3.1-8b-instant',
                messages: [
                  {
                    role: 'system',
                    content: `You are a professional translator. ${translateDirection} Preserve the exact JSON structure and all keys unchanged. Return valid JSON only — no markdown, no code fences, no explanation.`,
                  },
                  { role: 'user', content: JSON.stringify(textPayload) },
                ],
                temperature: 0.1,
                max_tokens: 3000,
              }),
            })

            if (groqResponse.ok) {
              const groqResult = await groqResponse.json()
              const raw: string = groqResult?.choices?.[0]?.message?.content?.trim() ?? ''
              const cleaned = raw.replace(/^```json\s*|\s*```$/g, '').trim()
              const translated = JSON.parse(cleaned)

              await req.payload.update({
                collection: 'analyse-personnalite',
                id: doc.id,
                req,
                locale: otherLocale,
                data: {
                  overview: translated.overview || '',
                  forcesDominantes: translated.forcesDominantes || '',
                  pointsVigilance: translated.pointsVigilance || '',
                  styleRelationnel: translated.styleRelationnel || '',
                  conclusion: translated.conclusion || '',
                  profilEmotionnel: {
                    dominantEmotion: translated.dominantEmotion || '',
                    emotionalStability: Number(donneesProfilEmotionnel.emotional_stability || 5),
                    emotionalSummary: translated.emotionalSummary || '',
                  },
                  recommandations: (doc.recommandations ?? []).map((docRec: any, i: number) => ({
                    id: docRec.id,
                    text: (Array.isArray(translated.recommandations) ? translated.recommandations[i] : '') || '',
                  })),
                  traits: (doc.traits ?? []).map((docTrait: any, i: number) => ({
                    id: docTrait.id,
                    analysis: translated.traitTexts?.[i]?.analysis || '',
                    interpretation: translated.traitTexts?.[i]?.interpretation || '',
                    confidenceReason: translated.traitTexts?.[i]?.confidenceReason || '',
                    observedIndicators: (docTrait.observedIndicators ?? []).map(
                      (docIndicator: any, j: number) => ({
                        id: docIndicator.id,
                        indicator: translated.traitTexts?.[i]?.indicators?.[j] || '',
                      }),
                    ),
                  })),
                },
              })
            }
          }
        } catch (translationError) {
          console.error('Auto-translation to other locale failed (non-blocking):', translationError)
        }

        await req.payload.update({
          collection: 'users',
          id: req.user.id,
          req,
          data: {
            bigFiveProfile: {
              analysisId: doc.id,
              date: now.toISOString(),
              traits: normalizedTraits.map((trait) => ({
                name: trait.name,
                score: trait.score,
                confidence: trait.confidence,
              })),
            },
            onboardingStep: 'completed',
          },
        })

        try {
          await createNotification({
            actor: req.user.id,
            event: 'personality_analysis_created',
            link: `/dashboard/student/analyses/${doc.id}/pdf`,
            message: `Votre analyse de personnalite ${doc.reference} est prete.`,
            payload: req.payload,
            recipient: req.user.id,
            req,
            sendEmail: true,
            title: 'Analyse de personnalite prete',
            type: 'analyse',
          })
        } catch (error) {
          console.error('Failed to create analysis notification:', error)
        }

        return Response.json({
          success: true,
          id: doc.id,
          reference: doc.reference,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur lors de l'enregistrement."

        return Response.json({ error: message }, { status: 500 })
      }
    },
  },
  // Cree un reve, l'envoie au workflow n8n d'analyse et initialise son statut.
  {
    path: '/dreams-submit',
    method: 'post',
    handler: async (req) => {
      if (!req.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await (req as Request).json()
      const { description, locale: dreamLocale = 'fr' } = body
      const primaryDreamLocale = dreamLocale === 'en' ? 'en' : 'fr'

      if (!description || typeof description !== 'string' || !description.trim()) {
        return Response.json({ error: 'Description requise.' }, { status: 400 })
      }

      const n8nDreamWebhookUrl = process.env.N8N_DREAM_WEBHOOK_URL?.trim()

      if (!n8nDreamWebhookUrl) {
        return Response.json({ error: 'N8N_DREAM_WEBHOOK_URL manquante.' }, { status: 500 })
      }

      const now = new Date()
      const day = now.getDay()
      const diffToMonday = day === 0 ? 6 : day - 1

      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - diffToMonday)
      startOfWeek.setHours(0, 0, 0, 0)

      const dreamsThisWeek = await req.payload.find({
        collection: 'dreams',
        user: req.user,
        overrideAccess: false,
        where: {
          and: [
            {
              user: {
                equals: req.user.id,
              },
            },
            {
              createdAt: {
                greater_than_equal: startOfWeek.toISOString(),
              },
            },
          ],
        },
        limit: 0,
      })

      if (dreamsThisWeek.totalDocs >= 4) {
        return Response.json(
          {
            error: 'Limite atteinte: 4 reves maximum par semaine.',
            used: dreamsThisWeek.totalDocs,
            limit: 4,
          },
          { status: 429 },
        )
      }

      const trimmedDescription = description.trim()

      const dream = await req.payload.create({
        collection: 'dreams',
        req,
        locale: primaryDreamLocale,
        data: {
          user: req.user.id,
          description: trimmedDescription,
          videoStatus: 'pending',
        },
      })

      const callbackSecret = process.env.N8N_CALLBACK_SECRET?.trim()
      const callbackUrl = getDreamsVideoCallbackUrl()

      const n8nResponse = await fetch(n8nDreamWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamId: dream.id,
          dream: trimmedDescription,
          description: trimmedDescription,
          text: trimmedDescription,
          input: trimmedDescription,
          userId: req.user.id,
          locale: primaryDreamLocale,
          callbackUrl,
          callbackSecret,
        }),
      })

      if (!n8nResponse.ok) {
        await req.payload.update({
          collection: 'dreams',
          id: dream.id,
          req,
          data: {
            videoStatus: 'failed',
            errorMessage: `Erreur n8n (${n8nResponse.status})`,
          },
        })

        return Response.json(
          {
            error: `Erreur n8n (${n8nResponse.status}).`,
          },
          { status: 502 },
        )
      }

      let n8nData: any = {}

      try {
        n8nData = await n8nResponse.json()
      } catch {
        n8nData = {}
      }

      const summary = typeof n8nData?.summary === 'string' ? n8nData.summary.trim() : ''
      const analysis =
        typeof n8nData?.analysis === 'string' && n8nData.analysis.trim()
          ? n8nData.analysis.trim()
          : typeof n8nData?.output === 'string'
            ? n8nData.output.trim()
            : ''
      const videoStatus =
        n8nData?.videoStatus === 'waiting_validation' ? 'waiting_validation' : 'pending'

      const otherLocale: 'fr' | 'en' = primaryDreamLocale === 'fr' ? 'en' : 'fr'
      const groqKeyDesc = process.env.GROQ_API_KEY?.trim()

      // Unified translation function with retry (up to 3 attempts, exponential backoff)
      async function translate(
        text: string,
        targetLang: 'fr' | 'en',
        maxTokens = 1000,
      ): Promise<string> {
        if (!groqKeyDesc || !text.trim()) return text
        const instruction =
          targetLang === 'fr'
            ? `Translate the following text to French. Rules: (1) If already entirely in French, return it EXACTLY unchanged. (2) Translate EVERY sentence — do NOT omit or summarize any part. (3) Preserve ALL emojis exactly where they are. (4) Preserve ALL line breaks exactly. (5) Return ONLY the translated text, nothing else.`
            : `Translate the following text to English. Rules: (1) If already entirely in English, return it EXACTLY unchanged. (2) Translate EVERY sentence — do NOT omit or summarize any part. (3) Preserve ALL emojis exactly where they are. (4) Preserve ALL line breaks exactly. (5) Return ONLY the translated text, nothing else.`
        // Use a stronger model for long texts (analysis)
        const model =
          maxTokens > 1000 ? 'llama-3.3-70b-versatile' : 'llama-3.3-70b-versatile'

        for (let attempt = 0; attempt < 3; attempt++) {
          if (attempt > 0) await new Promise((r) => setTimeout(r, 600 * attempt))
          try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${groqKeyDesc}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: instruction },
                  { role: 'user', content: text },
                ],
                temperature: 0.1,
                max_tokens: maxTokens,
              }),
            })
            if (res.ok) {
              const r = await res.json()
              const result = r?.choices?.[0]?.message?.content?.trim()
              if (result) return result
            }
          } catch { /* retry */ }
        }
        return text // all 3 attempts failed — return original as last resort
      }

      // Translate all fields sequentially (2 at a time) to avoid Groq rate-limiting
      const descriptionFr = await translate(trimmedDescription, 'fr', 2000)
      const descriptionEn = await translate(trimmedDescription, 'en', 2000)
      const [summaryFr, summaryEn] = await Promise.all([
        translate(summary, 'fr', 2000),
        translate(summary, 'en', 2000),
      ])
      const [analysisFr, analysisEn] = await Promise.all([
        translate(analysis, 'fr', 4000),
        translate(analysis, 'en', 4000),
      ])

      // Save primary locale
      await req.payload.update({
        collection: 'dreams',
        id: dream.id,
        req,
        locale: primaryDreamLocale,
        data: {
          description: primaryDreamLocale === 'fr' ? descriptionFr : descriptionEn,
          summary: primaryDreamLocale === 'fr' ? summaryFr : summaryEn,
          analysis: primaryDreamLocale === 'fr' ? analysisFr : analysisEn,
          videoStatus,
          errorMessage: '',
        },
      })

      // Save other locale
      const updatedDream = await req.payload.update({
        collection: 'dreams',
        id: dream.id,
        req,
        locale: otherLocale,
        data: {
          description: otherLocale === 'fr' ? descriptionFr : descriptionEn,
          summary: otherLocale === 'fr' ? summaryFr : summaryEn,
          analysis: otherLocale === 'fr' ? analysisFr : analysisEn,
          errorMessage: '',
        },
      })

      return Response.json({
        success: true,
        message: 'Reve envoye au workflow avec succes.',
        dreamId: updatedDream.id,
        videoStatus,
        summary,
        analysis,
      })
    },
  },
  // Recoit le retour de n8n apres generation video pour mettre a jour le reve et les medias.
  {
    path: '/dreams-video-callback',
    method: 'post',
    handler: async (req) => {
      try {
        const secret = process.env.N8N_CALLBACK_SECRET
        const authHeader = req.headers.get('authorization')

        if (!secret || authHeader !== `Bearer ${secret}`) {
          return Response.json({ error: 'Unauthorized callback.' }, { status: 401 })
        }

        const body = await (req as Request).json()
      const {
        dreamId,
        summary,
        analysis,
        videoUrl,
        video_url,
        gcsUri,
        gcs_uri,
        videos,
        operationName,
        operation_name,
        status,
        errorMessage,
        error_message,
      } = body

      if (!dreamId) {
        return Response.json({ error: 'dreamId requis.' }, { status: 400 })
      }

      const rawVideoSource =
        getFirstString(videoUrl) ||
        getFirstString(video_url) ||
        getFirstString(gcsUri) ||
        getFirstString(gcs_uri) ||
        getFirstString(videos?.[0]?.videoUrl) ||
        getFirstString(videos?.[0]?.video_url) ||
        getFirstString(videos?.[0]?.gcsUri) ||
        getFirstString(videos?.[0]?.gcs_uri)
      const playableVideoURL = rawVideoSource ? normalizeVideoSourceURL(rawVideoSource) : undefined
      const normalizedDreamId = Number.isFinite(Number(dreamId)) ? Number(dreamId) : dreamId
      const safeStatus =
        status === 'ready' || status === 'failed' || status === 'generating'
          ? status
          : rawVideoSource
            ? 'ready'
            : 'failed'
      const missingVideoMessage =
        safeStatus === 'failed' && !rawVideoSource
          ? 'Le workflow video a termine sans URL video exploitable.'
          : undefined

      const dream = await req.payload.findByID({
        collection: 'dreams',
        id: normalizedDreamId,
        depth: 0,
      })

      const ownerId = typeof dream.user === 'object' ? dream.user.id : dream.user
      const currentVideoAssetId =
        dream.videoAsset && typeof dream.videoAsset === 'object'
          ? dream.videoAsset.id
          : dream.videoAsset || null

      let uploadedVideoURL: string | undefined
      let uploadedVideoAssetId: number | undefined
      let uploadErrorMessage: string | undefined

      if (safeStatus === 'ready' && playableVideoURL?.startsWith('http')) {
        try {
          if (currentVideoAssetId) {
            await req.payload.delete({
              collection: 'media',
              id: currentVideoAssetId,
              req,
            })
          }

          const remoteVideoFile = await fetchRemoteFile({
            fallbackName: `${normalizedDreamId}.mp4`,
            url: playableVideoURL,
          })

          const uploadedVideo = await req.payload.create({
            collection: 'media',
            data: {
              alt: `Video du reve ${normalizedDreamId}`,
              owner: ownerId,
              dream: normalizedDreamId,
              sourceUrl: rawVideoSource,
            },
            file: remoteVideoFile,
            req,
          })

          uploadedVideoURL = uploadedVideo.url || undefined
          uploadedVideoAssetId = uploadedVideo.id
        } catch (error) {
          uploadErrorMessage =
            error instanceof Error
              ? error.message
              : 'Impossible de sauvegarder la video dans Media.'
        }
      }

      // Save in FR (n8n generates in FR)
      const updatedDream = await req.payload.update({
        collection: 'dreams',
        id: normalizedDreamId,
        req,
        locale: 'fr',
        data: {
          summary: typeof summary === 'string' ? summary : undefined,
          analysis: typeof analysis === 'string' ? analysis : undefined,
          videoUrl: uploadedVideoURL || playableVideoURL || rawVideoSource,
          videoAsset: uploadedVideoAssetId,
          operationName:
            typeof operationName === 'string'
              ? operationName
              : typeof operation_name === 'string'
                ? operation_name
                : undefined,
          videoStatus: safeStatus,
          errorMessage:
            typeof errorMessage === 'string'
              ? errorMessage
              : typeof error_message === 'string'
                ? error_message
                : uploadErrorMessage || missingVideoMessage,
        },
      })

      // Translate summary/analysis FR→EN automatically
      try {
        const groqApiKey = process.env.GROQ_API_KEY?.trim()
        const callbackSummary = typeof summary === 'string' ? summary : ''
        const callbackAnalysis = typeof analysis === 'string' ? analysis : ''

        // Translate summary (plain text) and analysis (JSON) separately for reliability
        let enSummary: string | undefined
        let enAnalysis: string | undefined

        if (groqApiKey && callbackSummary) {
          const sumRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: process.env.GROQ_COACHING_MODEL || 'llama-3.1-8b-instant',
              messages: [
                { role: 'system', content: 'Translate the following text from French to English. Return only the translated text, no explanation, no preamble.' },
                { role: 'user', content: callbackSummary },
              ],
              temperature: 0.1,
              max_tokens: 800,
            }),
          })
          if (sumRes.ok) {
            const r = await sumRes.json()
            enSummary = r?.choices?.[0]?.message?.content?.trim() || undefined
          }
        }

        if (groqApiKey && callbackAnalysis) {
          const anaRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${groqApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: process.env.GROQ_COACHING_MODEL || 'llama-3.1-8b-instant',
              messages: [
                { role: 'system', content: 'Translate the following text from French to English. Return only the translated text. Preserve ALL emojis exactly as-is. Preserve ALL line breaks exactly as-is. No explanation, no preamble.' },
                { role: 'user', content: callbackAnalysis },
              ],
              temperature: 0.1,
              max_tokens: 4000,
            }),
          })
          if (anaRes.ok) {
            const r = await anaRes.json()
            enAnalysis = r?.choices?.[0]?.message?.content?.trim() || undefined
          }
        }

        if (enSummary || enAnalysis) {
          await req.payload.update({
            collection: 'dreams',
            id: normalizedDreamId,
            req,
            locale: 'en',
            data: {
              summary: enSummary,
              analysis: enAnalysis,
            },
          })
        }
      } catch (translationError) {
        console.error('Dream callback translation failed (non-blocking):', translationError)
      }

      return Response.json({
        success: true,
        dreamId: updatedDream.id,
        videoStatus: updatedDream.videoStatus,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erreur interne du callback video.'

      console.error('dreams-video-callback error:', error)

      return Response.json({ error: message }, { status: 500 })
    }
    },
  },
  // Valide le resume d'un reve puis declenche le workflow n8n de generation video.
  {
    path: '/dreams-validate/:id',
    method: 'post',
    handler: async (req) => {
      if (!req.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const dreamId = typeof req.routeParams?.id === 'string' ? req.routeParams.id : undefined

      if (!dreamId) {
        return Response.json({ error: 'dreamId requis.' }, { status: 400 })
      }

      const dream = await req.payload.findByID({
        collection: 'dreams',
        id: dreamId,
        depth: 0,
      })

      const ownerId = typeof dream.user === 'object' ? dream.user.id : dream.user

      if (ownerId !== req.user.id) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (dream.videoStatus !== 'waiting_validation') {
        return Response.json(
          { error: "Ce reve n'est pas en attente de validation." },
          { status: 400 },
        )
      }

      const n8nDreamVideoStartUrl = process.env.N8N_DREAM_VIDEO_START_URL?.trim()

      if (!n8nDreamVideoStartUrl) {
        return Response.json({ error: 'N8N_DREAM_VIDEO_START_URL manquante.' }, { status: 500 })
      }

      let summary = (dream.summary ?? '').toString().trim()

      if (!summary) {
        try {
          const fallback = await (req.payload.find as any)({
            collection: 'dreams',
            where: { id: { equals: dreamId } },
            locale: 'en',
            depth: 0,
            limit: 1,
            overrideAccess: true,
          })
          summary = (fallback?.docs?.[0]?.summary ?? '').toString().trim()
        } catch {
          // locale fallback failed — continue with empty summary
        }
      }

      if (!summary) {
        return Response.json(
          { error: 'Aucun resume valide disponible pour lancer la video.' },
          { status: 400 },
        )
      }

      const callbackSecret = process.env.N8N_CALLBACK_SECRET?.trim()
      const callbackUrl = getDreamsVideoCallbackUrl()

      const generatingDream = await req.payload.update({
        collection: 'dreams',
        id: dreamId,
        req,
        data: {
          videoStatus: 'generating',
          errorMessage: '',
        },
      })

      const n8nResponse = await fetch(n8nDreamVideoStartUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamId: dream.id,
          summary,
          callbackUrl,
          callbackSecret,
        }),
      })

      if (!n8nResponse.ok) {
        await req.payload.update({
          collection: 'dreams',
          id: dreamId,
          req,
          data: {
            videoStatus: 'failed',
            errorMessage: `Erreur n8n video (${n8nResponse.status}).`,
          },
        })

        return Response.json(
          { error: `Erreur n8n video (${n8nResponse.status}).` },
          { status: 502 },
        )
      }

      return Response.json({
        success: true,
        dreamId: generatingDream.id,
        videoStatus: generatingDream.videoStatus,
      })
    },
  },
  // Regenere une nouvelle analyse et un nouveau resume pour un reve non encore valide.
  {
    path: '/dreams-regenerate/:id',
    method: 'post',
    handler: async (req) => {
      if (!req.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const dreamId = typeof req.routeParams?.id === 'string' ? req.routeParams.id : undefined

      if (!dreamId) {
        return Response.json({ error: 'dreamId requis.' }, { status: 400 })
      }

      const dream = await req.payload.findByID({
        collection: 'dreams',
        id: dreamId,
        depth: 0,
      })

      const ownerId = typeof dream.user === 'object' ? dream.user.id : dream.user

      if (ownerId !== req.user.id) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (dream.videoStatus !== 'waiting_validation') {
        return Response.json(
          { error: 'Ce reve ne peut pas etre regenere dans son etat actuel.' },
          { status: 400 },
        )
      }

      const n8nDreamWebhookUrl = process.env.N8N_DREAM_WEBHOOK_URL?.trim()

      if (!n8nDreamWebhookUrl) {
        return Response.json({ error: 'N8N_DREAM_WEBHOOK_URL manquante.' }, { status: 500 })
      }

      let description = (dream.description ?? '').toString().trim()

      if (!description) {
        try {
          const fallback = await (req.payload.find as any)({
            collection: 'dreams',
            where: { id: { equals: dreamId } },
            locale: 'en',
            depth: 0,
            limit: 1,
            overrideAccess: true,
          })
          description = (fallback?.docs?.[0]?.description ?? '').toString().trim()
        } catch {
          // locale fallback failed — continue with empty description
        }
      }

      if (!description) {
        return Response.json({ error: 'Description du reve introuvable.' }, { status: 400 })
      }

      const callbackSecret = process.env.N8N_CALLBACK_SECRET?.trim()
      const callbackUrl = getDreamsVideoCallbackUrl()

      const n8nResponse = await fetch(n8nDreamWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamId: dream.id,
          dream: description,
          description,
          text: description,
          input: description,
          userId: req.user.id,
          callbackUrl,
          callbackSecret,
        }),
      })

      if (!n8nResponse.ok) {
        return Response.json({ error: `Erreur n8n (${n8nResponse.status}).` }, { status: 502 })
      }

      let n8nData: any = {}

      try {
        n8nData = await n8nResponse.json()
      } catch {
        n8nData = {}
      }

      const summary = typeof n8nData?.summary === 'string' ? n8nData.summary.trim() : ''
      const analysis =
        typeof n8nData?.analysis === 'string' && n8nData.analysis.trim()
          ? n8nData.analysis.trim()
          : typeof n8nData?.output === 'string'
            ? n8nData.output.trim()
            : ''
      const videoStatus =
        n8nData?.videoStatus === 'waiting_validation' ? 'waiting_validation' : 'pending'

      const updatedDream = await req.payload.update({
        collection: 'dreams',
        id: dreamId,
        req,
        data: {
          summary,
          analysis,
          videoStatus,
          errorMessage: '',
        },
      })

      return Response.json({
        success: true,
        dreamId: updatedDream.id,
        videoStatus: updatedDream.videoStatus,
        summary: updatedDream.summary,
        analysis: updatedDream.analysis,
      })
    },
  },

  // Supprime un reve de l'etudiant ainsi que la video associee si elle existe.
  {
    path: '/dreams-delete/:id',
    method: 'delete',
    handler: async (req) => {
      if (!req.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const dreamId = typeof req.routeParams?.id === 'string' ? req.routeParams.id : undefined

      if (!dreamId) {
        return Response.json({ error: 'dreamId requis.' }, { status: 400 })
      }

      let dream: Awaited<ReturnType<typeof req.payload.findByID<'dreams'>>> | null = null
      try {
        dream = await req.payload.findByID({
          collection: 'dreams',
          id: dreamId,
          overrideAccess: true,
          depth: 0,
        })
      } catch {
        return Response.json({ error: 'Rêve introuvable.' }, { status: 404 })
      }

      if (!dream) {
        return Response.json({ error: 'Rêve introuvable.' }, { status: 404 })
      }

      const ownerId = typeof dream.user === 'object' ? dream.user.id : dream.user
      if (String(ownerId) !== String(req.user.id)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      const currentVideoAssetId =
        dream.videoAsset && typeof dream.videoAsset === 'object'
          ? dream.videoAsset.id
          : dream.videoAsset || null

      if (currentVideoAssetId) {
        try {
          await req.payload.delete({ collection: 'media', id: currentVideoAssetId, req })
        } catch { /* non-blocking */ }
      }

      await req.payload.delete({
        collection: 'dreams',
        id: dreamId,
        overrideAccess: true,
        req,
      })

      return Response.json({ success: true })
    },
  },
]

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
  const transcription = data.results
    ?.map((item: any) => item.alternatives?.[0]?.transcript || '')
    .join(' ')
    .trim()

  if (!transcription) {
    throw new Error('Aucun texte détecté dans l audio.')
  }

  return transcription
}

async function genererAudioAvecGoogle(
  texte: string,
  cleApi: string,
  language: 'fr' | 'en',
  gender: 'female' | 'male',
): Promise<string | null> {
  const voice =
    language === 'en'
      ? {
          languageCode: 'en-US',
          name: gender === 'male' ? 'en-US-Neural2-D' : 'en-US-Neural2-F',
        }
      : {
          languageCode: 'fr-FR',
          name: gender === 'male' ? 'fr-FR-Neural2-B' : 'fr-FR-Neural2-A',
        }

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${cleApi}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          text: texte,
        },
        voice,
        audioConfig: {
          audioEncoding: 'MP3',
        },
      }),
    },
  )

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
          if (
            parse &&
            (Array.isArray(parse.traits) || parse.analysisData || parse.executive_summary)
          ) {
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

function extraireQuestionInteractive(n8nData: any) {
  const source =
    n8nData?.interactiveQuestion ||
    n8nData?.questionInteractive ||
    n8nData?.question ||
    n8nData?.ui ||
    null

  const type = source?.type || n8nData?.questionType || n8nData?.inputType
  const options = source?.options || n8nData?.options || n8nData?.choices

  if ((type !== 'radio' && type !== 'checkbox') || !Array.isArray(options)) {
    return null
  }

  const normalizedOptions = options
    .map((option: any) => {
      if (typeof option === 'string') {
        return {
          label: option,
          value: option,
        }
      }

      return {
        label: String(option?.label || option?.text || option?.value || ''),
        value: String(option?.value || option?.label || option?.text || ''),
      }
    })
    .filter((option: { label: string; value: string }) => option.label && option.value)
    .filter((option: { label: string; value: string }) => {
      const label = option.label.trim().toLowerCase()
      const value = option.value.trim().toLowerCase()

      return label !== '[fin]' && value !== '[fin]' && label !== 'fin' && value !== 'fin'
    })

  if (normalizedOptions.length === 0) {
    return null
  }

  return {
    type,
    options: normalizedOptions,
  }
}

function extraireQuestionInteractiveDepuisTexte(texte: string) {
  if (!texte || !texte.includes('interactiveQuestion')) {
    return null
  }

  const debut = texte.indexOf('{')
  const fin = texte.lastIndexOf('}')

  if (debut === -1 || fin <= debut) {
    return null
  }

  try {
    const parsed = JSON.parse(texte.slice(debut, fin + 1))
    const interactiveQuestion = extraireQuestionInteractive(parsed)

    if (!interactiveQuestion) {
      return null
    }

    return {
      output:
        typeof parsed.output === 'string'
          ? parsed.output
          : typeof parsed.message === 'string'
            ? parsed.message
            : retirerJsonInteractifDuTexte(texte),
      interactiveQuestion,
    }
  } catch {
    return null
  }
}

function retirerJsonInteractifDuTexte(texte: string) {
  if (!texte || !texte.includes('interactiveQuestion')) {
    return texte
  }

  const debut = texte.indexOf('{')
  const fin = texte.lastIndexOf('}')

  if (debut === -1 || fin <= debut) {
    return texte
  }

  return `${texte.slice(0, debut)}${texte.slice(fin + 1)}`.trim()
}

function creerQuestionInteractiveSecours({}: {
  interviewLanguage?: 'fr' | 'en'
  studentMessageCount?: number
  supportsInteractiveQuestions?: boolean
  conversationHistory?: Array<{ role: string; content: string }>
  userText?: string
}) {
  // Les questions interactives sont entièrement générées par l'agent n8n selon le contexte.
  return null
}

function normaliserTexteAssistant(texte: string, langue: 'fr' | 'en' = 'fr'): string {
  const remplacement =
    langue === 'en'
      ? 'I am your assistant from the MindBloom platform.'
      : 'Je suis votre assistant de la plateforme MindBloom.'

  if (langue === 'en' && /L'entretien est termin|Merci pour vos r(?:e|é)ponses/i.test(texte)) {
    return 'The interview is complete. Thank you for your answers.'
  }

  if (
    langue === 'en' &&
    /Je suis votre assistant de la plateforme MindBloom|Pouvons-nous commencer/i.test(texte)
  ) {
    return 'I am your assistant from the MindBloom platform. I am happy to share this moment with you. Can we start with a short introduction? What do you like to do to relax and feel well?'
  }

  return texte
    .replace(
      /Je m'appelle MindBloom[,.]?\s*(?:Je suis|je suis)\s+(?:un|votre)\s+assistant d'entretien psychologique(?:\s+pour etudiants|\s+pour étudiants)?[,.]?/gi,
      remplacement,
    )
    .replace(/Je suis votre assistant de la plateforme MindBloom[,.]?/gi, remplacement)
    .replace(/Je m'appelle MindBloom[,.]?/gi, remplacement)
    .replace(/\[(?:nom|name|assistant_name|assistant name)\]/gi, 'MindBloom')
    .replace(/\{\{\s*(?:nom|name|assistant_name|assistant name)\s*\}\}/gi, 'MindBloom')
}

function normaliserNomTrait(nom: string): BigFiveTraitName {
  const nomNettoye = (nom || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const correspondances: Record<string, BigFiveTraitName> = {
    Ouverture: 'Ouverture',
    Conscienciosite: 'Conscienciosite',
    Extraversion: 'Extraversion',
    Agreabilite: 'Agreabilite',
    Neuroticisme: 'Neuroticisme',
  }

  return correspondances[nomNettoye] || 'Ouverture'
}

function normaliserConfianceTrait(confiance: string): 'eleve' | 'moyen' | 'faible' {
  const valeur = (confiance || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (valeur === 'eleve' || valeur === 'faible') {
    return valeur
  }

  return 'moyen'
}

function normalizeLoopText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function detectApplicationQuestion(text: string): boolean {
  const n = normalizeLoopText(text)
  return (
    n.includes('exemple concret de ce que vous allez appliquer dans les prochains jours') ||
    n.includes('concrete example of how you will apply')
  )
}

function detectApplicationLanguage(text: string): boolean {
  const n = normalizeLoopText(text)
  if (n.length < 25) return false
  return (
    n.includes('planning') ||
    n.includes('creneaux') ||
    n.includes('je vais faire') ||
    n.includes('je vais appliquer') ||
    n.includes('je vais organiser') ||
    n.includes('prochains jours') ||
    n.includes('i will') ||
    n.includes('i plan to') ||
    n.includes('i am going to')
  )
}

function getFirstString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  if (Array.isArray(value)) {
    return value
      .find((item): item is string => typeof item === 'string' && item.trim().length > 0)
      ?.trim()
  }

  return undefined
}

function normalizeVideoSourceURL(source: string): string {
  if (!source.startsWith('gs://')) {
    return source
  }

  const withoutProtocol = source.slice('gs://'.length)
  const slashIndex = withoutProtocol.indexOf('/')

  if (slashIndex === -1) {
    return source
  }

  const bucket = withoutProtocol.slice(0, slashIndex)
  const objectPath = withoutProtocol.slice(slashIndex + 1)

  return `https://storage.googleapis.com/${bucket}/${objectPath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')}`
}

async function fetchRemoteFile({
  fallbackName,
  url,
}: {
  fallbackName: string
  url: string
}): Promise<File> {
  const response = await fetch(url, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error(`Impossible de telecharger la video distante (${response.status}).`)
  }

  const contentType = response.headers.get('content-type') || 'video/mp4'
  const arrayBuffer = await response.arrayBuffer()
  const fileNameFromURL = url.split('/').pop()?.split('?')[0]

  return {
    name: fileNameFromURL || fallbackName,
    data: Buffer.from(arrayBuffer),
    mimetype: contentType,
    size: arrayBuffer.byteLength,
  }
}

