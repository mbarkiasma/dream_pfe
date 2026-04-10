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

    if (!texte || isLoading) return

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

      if (data.isFinished && data.analysisData) {
        await fetch('/api/save-analysis', {
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
    if (isLoading) return

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

  const etat = isRecording ? 'Micro actif' : isLoading ? 'Traitement en cours' : 'Disponible'

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#eef2f7_100%)] shadow-[0_20px_70px_rgba(120,113,108,0.10)]">
        <div className="border-b border-stone-200/80 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                Cabinet D&apos;Entretien
              </p>
              <div>
                <h3 className="font-serif text-2xl text-slate-900">Echange progressif et confidentiel</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Prenez le temps de repondre naturellement. Vous pouvez parler avec le micro,
                  relire la transcription, la corriger, puis envoyer seulement quand vous etes pret.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-medium text-slate-700">
                {etat}
              </div>
              <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-medium text-slate-700">
                {messages.length} echange{messages.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-white/60 bg-white/40 px-6 py-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-slate-200 bg-white/85 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Ecriture
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Repondez librement, avec vos mots, comme dans un vrai entretien.
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white/85 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Voix
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Le micro prepare le texte pour vous, mais vous gardez toujours la main avant l&apos;envoi.
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white/85 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Conseil
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Les exemples concrets aident l&apos;assistant a mieux comprendre votre fonctionnement.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_18px_60px_rgba(120,113,108,0.10)]">
        <div className="mb-4 flex items-center justify-between px-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">Espace de parole</p>
            <p className="text-xs text-slate-500">Un message a la fois, dans un cadre calme et clair.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Assistant Big Five
          </div>
        </div>

        <div className="max-h-[500px] min-h-[360px] space-y-4 overflow-y-auto rounded-[28px] border border-slate-200 bg-white/90 p-5">
          {messages.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-6">
              <p className="font-serif text-xl text-slate-900">Bienvenue</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
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
                    ? 'bg-slate-900 text-slate-50'
                    : 'border border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <p
                  className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    item.role === 'user' ? 'text-slate-300' : 'text-slate-400'
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
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 shadow-sm">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
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
        {messageMicro ? (
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {messageMicro}
          </div>
        ) : null}

        <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(120,113,108,0.10)]">
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => void handleToggleRecording()}
              disabled={isLoading}
              className={`shrink-0 rounded-full px-4 py-3 text-sm font-medium transition ${
                isRecording
                  ? 'bg-rose-700 text-white hover:bg-rose-800'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              } disabled:cursor-not-allowed disabled:bg-slate-200`}
            >
              {isRecording ? 'Arreter' : 'Micro'}
            </button>

            <div className="flex-1 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleSend()
                  }
                }}
                placeholder="Ecrivez ici votre reponse, ou utilisez le micro puis corrigez la transcription..."
                rows={4}
                className="min-h-[96px] w-full resize-none bg-transparent text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={isLoading}
              className="shrink-0 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
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
