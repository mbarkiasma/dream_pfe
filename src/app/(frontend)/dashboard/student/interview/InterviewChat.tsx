'use client'

import { useEffect, useRef, useState } from 'react'

type Message = {
  role: 'user' | 'ai'
  content: string
}

type ReponseChat = {
  userText?: string
  iaText?: string
  isFinished?: boolean
  analysisData?: unknown
  sessionId?: string
  audioBase64?: string | null
}

export function InterviewChat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isInterviewFinished, setIsInterviewFinished] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [messageMicro, setMessageMicro] = useState('')
  const [sessionId] = useState(() => `session-${crypto.randomUUID()}`)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    const texte = message.trim()

    if (!texte || isLoading || isInterviewFinished) return

    const conversationLocale = [...messages, { role: 'user' as const, content: texte }]

    setMessages(conversationLocale)
    setMessage('')

    try {
      setIsLoading(true)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textMessage: texte,
          sessionId,
        }),
      })

      const data: ReponseChat & { error?: string } = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'entretien.")
      }

      if (data.iaText) {
        setMessages((prev) => [...prev, { role: 'ai', content: data.iaText as string }])
      }

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
        void audio.play()
      }

      if (data.isFinished) {
        setIsInterviewFinished(true)
      }

      if (data.isFinished && data.analysisData) {
        const saveResponse = await fetch('/api/save-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            conversation: [
              ...conversationLocale,
              ...(data.iaText ? [{ role: 'ai' as const, content: data.iaText }] : []),
            ].map((item) => ({
              role: item.role === 'user' ? 'human' : 'ai',
              message: item.content,
              source: 'text',
            })),
            analysisData: data.analysisData,
          }),
        })

        const saveData: { error?: string } = await saveResponse.json()

        if (!saveResponse.ok) {
          throw new Error(saveData.error || "Erreur lors de l'enregistrement de l'analyse.")
        }

        setIsSaved(true)
      }
    } catch (error) {
      const messageErreur =
        error instanceof Error ? error.message : "Erreur lors de l'entretien."

      setMessages((prev) => [...prev, { role: 'ai', content: messageErreur }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleRecording = async () => {
    if (isLoading || isInterviewFinished) return

    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }

    try {
      setMessageMicro('')

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })

      audioChunksRef.current = []
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        try {
          setIsLoading(true)
          setMessageMicro('Transcription en cours...')

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const audioBase64 = await convertirAudioEnBase64(audioBlob)

          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audioBase64,
              sessionId,
              sttOnly: true,
            }),
          })

          const data: ReponseChat & { error?: string } = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Erreur de transcription.')
          }

          if (data.userText) {
            setMessage(data.userText)
            setMessageMicro("Texte transcrit. Vous pouvez le modifier avant l'envoi.")
          } else {
            setMessageMicro('Aucun texte detecte.')
          }
        } catch (error) {
          setMessageMicro(
            error instanceof Error ? error.message : 'Erreur pendant la transcription.',
          )
        } finally {
          setIsLoading(false)
          stream.getTracks().forEach((track) => track.stop())
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setMessageMicro('Enregistrement...')
    } catch (error) {
      setMessageMicro(
        error instanceof Error ? error.message : "Impossible d'acceder au microphone.",
      )
    }
  }

  const etat = isInterviewFinished
    ? 'Entretien termine'
    : isRecording
      ? 'Micro actif'
      : isLoading
        ? 'Traitement en cours'
        : 'Disponible'

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,#ffffff_0%,#FDF7FF_48%,#F3ECFF_100%)] shadow-[0_22px_70px_rgba(109,40,217,0.14)] backdrop-blur">
        <div className="border-b border-white/70 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7A6A99]">
                Cabinet D&apos;Entretien
              </p>
              <div>
                <h3 className="text-2xl font-bold tracking-[-0.02em] text-[#2d1068]">
                  Echange progressif et confidentiel
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6E628F]">
                  Prenez le temps de repondre naturellement. Vous pouvez parler avec le micro,
                  relire la transcription, la corriger, puis envoyer seulement quand vous etes pret.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs font-semibold text-[#6D28D9] shadow-sm">
                {etat}
              </div>
              <div className="rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs font-semibold text-[#6E628F] shadow-sm">
                {messages.length} echange{messages.length > 1 ? 's' : ''}
              </div>
              {isSaved ? (
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700">
                  Analyse enregistree
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-white/60 bg-white/45 px-6 py-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-white/70 bg-white/75 p-4 shadow-[0_10px_30px_rgba(109,40,217,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9B6BFF]">
              Ecriture
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6E628F]">
              Repondez librement, avec vos mots, comme dans un vrai entretien.
            </p>
          </div>
          <div className="rounded-[22px] border border-white/70 bg-white/75 p-4 shadow-[0_10px_30px_rgba(109,40,217,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9B6BFF]">
              Voix
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6E628F]">
              Le micro prepare le texte pour vous, mais vous gardez toujours la main avant l&apos;envoi.
            </p>
          </div>
          <div className="rounded-[22px] border border-white/70 bg-white/75 p-4 shadow-[0_10px_30px_rgba(109,40,217,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9B6BFF]">
              Conseil
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6E628F]">
              Les exemples concrets aident l&apos;assistant a mieux comprendre votre fonctionnement.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#FDF7FF_100%)] p-4 shadow-[0_18px_60px_rgba(109,40,217,0.12)] backdrop-blur">
        <div className="mb-4 flex items-center justify-between px-2">
          <div>
            <p className="text-sm font-semibold text-[#2d1068]">Espace de parole</p>
            <p className="text-xs text-[#7A6A99]">Un message a la fois, dans un cadre calme et clair.</p>
          </div>
          <div className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-semibold text-[#6D28D9]">
            Assistant Big Five
          </div>
        </div>

        <div className="max-h-[500px] min-h-[360px] space-y-4 overflow-y-auto rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-inner">
          {messages.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#D8C7FF] bg-[#F8F3FF]/80 p-6">
              <p className="text-xl font-bold text-[#2d1068]">Bienvenue</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6E628F]">
                Commencez par un premier message simple, ou utilisez le microphone pour dicter votre
                reponse. L&apos;assistant avancera progressivement pour recueillir les informations
                necessaires a une analyse fiable.
              </p>
            </div>
          ) : null}

          {messages.map((item, index) => (
            <div
              key={index}
              className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[86%] rounded-[24px] px-4 py-3 shadow-sm ${
                  item.role === 'user'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-[0_12px_28px_rgba(109,40,217,0.18)]'
                    : 'border border-white/80 bg-white text-[#2d1068] shadow-[0_10px_28px_rgba(109,40,217,0.08)]'
                }`}
              >
                <p
                  className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    item.role === 'user' ? 'text-white/75' : 'text-[#9B6BFF]'
                  }`}
                >
                  {item.role === 'user' ? 'Vous' : 'Assistant'}
                </p>
                <p className="text-sm leading-7">{item.content}</p>
              </div>
            </div>
          ))}

          {isLoading ? (
            <div className="flex justify-start">
              <div className="rounded-[24px] border border-white/80 bg-white px-4 py-3 text-[#2d1068] shadow-[0_10px_28px_rgba(109,40,217,0.08)]">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9B6BFF]">
                  Assistant
                </p>
                <p className="text-sm leading-7">L&apos;assistant prepare sa reponse...</p>
              </div>
            </div>
          ) : null}

          <div ref={scrollRef} />
        </div>
      </section>

      <section className="space-y-3">
        {isInterviewFinished ? (
          <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {isSaved
              ? "L'entretien est termine et l'analyse a ete enregistree dans Payload."
              : "L'entretien est termine. Aucune nouvelle reponse ne peut etre envoyee."}
          </div>
        ) : null}

        {messageMicro ? (
          <div className="rounded-[22px] border border-white/70 bg-white/75 px-4 py-3 text-sm text-[#6E628F] shadow-[0_10px_30px_rgba(109,40,217,0.08)]">
            {messageMicro}
          </div>
        ) : null}

        <div className="rounded-[30px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_55px_rgba(109,40,217,0.12)] backdrop-blur">
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => void handleToggleRecording()}
              disabled={isLoading || isInterviewFinished}
              className={`shrink-0 rounded-full px-4 py-3 text-sm font-medium transition ${
                isRecording
                  ? 'bg-rose-700 text-white hover:bg-rose-800'
                  : 'bg-[#F3ECFF] text-[#6D28D9] hover:bg-[#E9DDFF]'
              } disabled:cursor-not-allowed disabled:bg-slate-200`}
            >
              {isRecording ? 'Arreter' : 'Micro'}
            </button>

            <div className="flex-1 rounded-[24px] border border-[#E6DAFF] bg-[#FBF8FF] px-4 py-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleSend()
                  }
                }}
                placeholder={
                  isInterviewFinished
                    ? "L'entretien est termine."
                    : 'Ecrivez ici votre reponse, ou utilisez le micro puis corrigez la transcription...'
                }
                rows={4}
                disabled={isInterviewFinished}
                className="min-h-[96px] w-full resize-none bg-transparent text-sm leading-7 text-[#2d1068] outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={isLoading || isInterviewFinished}
              className="shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(109,40,217,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {isInterviewFinished ? 'Termine' : isLoading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-[#EEE5FF] pt-3 text-xs text-[#9A8BB7] sm:flex-row sm:items-center sm:justify-between">
            <p>Entree pour envoyer, Shift+Entree pour revenir a la ligne.</p>
            <div className="flex items-center gap-3">
              <p>{message.trim().length} caracteres</p>
              <p>{isRecording ? 'Enregistrement en cours' : 'Micro disponible'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function convertirAudioEnBase64(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Conversion audio impossible.'))
      }
    }

    reader.onerror = () => reject(new Error('Lecture audio impossible.'))
    reader.readAsDataURL(audioBlob)
  })
}
