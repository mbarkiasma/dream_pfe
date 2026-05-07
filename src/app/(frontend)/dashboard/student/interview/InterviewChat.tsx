'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, CheckCircle2, Mic, Send, Sparkles, Square, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
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
        router.replace('/dashboard/student')
        router.refresh()
      }
    } catch (error) {
      const messageErreur = error instanceof Error ? error.message : "Erreur lors de l'entretien."

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

  const suggestedStarters = [
    "Je suis pret a commencer l'entretien.",
    'Je veux parler de ma motivation et de mon stress.',
    'Je prefere repondre etape par etape.',
  ]

  return (
    <div className="interview-shell">
      <section className="interview-card interview-intro">
        <div className="interview-intro-main">
          <div>
            <p className="interview-kicker">Cabinet d'entretien</p>
            <h3 className="interview-intro-title">Echange progressif et confidentiel</h3>
            <p className="interview-intro-text">
              Prenez le temps de repondre naturellement. Vous pouvez utiliser le micro, relire la
              transcription, la corriger, puis envoyer seulement quand vous etes pret.
            </p>
          </div>

          <div className="interview-status-row">
            <span className="interview-pill">
              <CheckCircle2 className="h-4 w-4" />
              {etat}
            </span>
            <span className="interview-pill interview-pill-muted">
              {messages.length} echange{messages.length > 1 ? 's' : ''}
            </span>
            {isSaved ? <span className="interview-pill interview-pill-success">Analyse sauvee</span> : null}
          </div>
        </div>

        <div className="interview-tips-grid">
          <InfoTip
            icon={<Sparkles className="h-4 w-4" />}
            label="Ecriture"
            text="Repondez librement avec vos mots, comme dans un vrai entretien."
          />
          <InfoTip
            icon={<Mic className="h-4 w-4" />}
            label="Voix"
            text="Le micro prepare le texte, mais vous gardez toujours la main avant l'envoi."
          />
          <InfoTip
            icon={<Bot className="h-4 w-4" />}
            label="Conseil"
            text="Les exemples concrets aident l'assistant a mieux comprendre votre situation."
          />
        </div>
      </section>

      <section className="interview-card interview-chat-card">
        <div className="interview-chat-toolbar">
          <div>
            <p className="interview-section-title">Espace de parole</p>
            <p className="interview-section-subtitle">
              Un message a la fois, dans un cadre calme et clair.
            </p>
          </div>
          <span className="interview-chat-label">Assistant Big Five</span>
        </div>

        <div className="interview-scroll">
          {messages.length === 0 ? (
            <div className="interview-empty">
              <div className="interview-empty-icon">
                <Bot className="h-5 w-5" />
              </div>
              <p className="interview-empty-title">Bienvenue</p>
              <p className="interview-empty-text">
                Commencez par un premier message simple, ou utilisez le microphone pour dicter votre
                reponse. L'assistant avancera progressivement pour recueillir les informations
                necessaires a une analyse fiable.
              </p>
              <div className="interview-starters">
                {suggestedStarters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => setMessage(starter)}
                    className="interview-starter"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((item, index) => (
            <div
              key={index}
              className={`interview-message-row ${
                item.role === 'user' ? 'interview-message-row-user' : 'interview-message-row-ai'
              }`}
            >
              <div
                className={`interview-message ${
                  item.role === 'user' ? 'interview-message-user' : 'interview-message-ai'
                }`}
              >
                <p className="interview-message-label">
                  {item.role === 'user' ? (
                    <UserRound className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  {item.role === 'user' ? 'Vous' : 'Assistant'}
                </p>
                <p className="interview-message-text">{item.content}</p>
              </div>
            </div>
          ))}

          {isLoading ? (
            <div className="interview-message-row interview-message-row-ai">
              <div className="interview-message interview-message-ai">
                <p className="interview-message-label">
                  <Bot className="h-4 w-4" />
                  Assistant
                </p>
                <p className="interview-message-text">L'assistant prepare sa reponse...</p>
              </div>
            </div>
          ) : null}

          <div ref={scrollRef} />
        </div>
      </section>

      <section className="interview-shell">
        {isInterviewFinished ? (
          <div className="interview-notice interview-notice-success">
            {isSaved
              ? "L'entretien est termine et l'analyse a ete enregistree dans Payload."
              : "L'entretien est termine. Aucune nouvelle reponse ne peut etre envoyee."}
          </div>
        ) : null}

        {messageMicro ? <div className="interview-notice">{messageMicro}</div> : null}

        <div className="interview-card interview-composer">
          <div className="interview-composer-row">
            <button
              type="button"
              onClick={() => void handleToggleRecording()}
              disabled={isLoading || isInterviewFinished}
              className={`interview-mic-button ${isRecording ? 'interview-mic-button-active' : ''}`}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? 'Arreter' : 'Micro'}
            </button>

            <div className="interview-textarea-wrap">
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
                rows={3}
                disabled={isInterviewFinished}
                className="interview-textarea"
              />
            </div>

            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={isLoading || isInterviewFinished || !message.trim()}
              className="interview-send-button"
            >
              <Send className="h-4 w-4" />
              {isInterviewFinished ? 'Termine' : isLoading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>

          <div className="interview-composer-footer">
            <p>Entree pour envoyer, Shift+Entree pour revenir a la ligne.</p>
            <div className="interview-composer-meta">
              <p>{message.trim().length} caracteres</p>
              <p>{isRecording ? 'Enregistrement en cours' : 'Micro disponible'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function InfoTip({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode
  label: string
  text: string
}) {
  return (
    <div className="interview-tip">
      <p className="interview-tip-label">
        {icon}
        {label}
      </p>
      <p className="interview-tip-text">{text}</p>
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
