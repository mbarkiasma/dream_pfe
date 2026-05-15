'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Home,
  Mic,
  Send,
  Square,
  UserRound,
} from 'lucide-react'
import Link from 'next/link'

type Message = {
  role: 'user' | 'ai'
  content: string
  interactiveQuestion?: InteractiveQuestion | null
}

type InterviewLanguage = 'fr' | 'en'
type InterviewerGender = 'female' | 'male'

type InteractiveQuestion = {
  type: 'radio' | 'checkbox'
  options: {
    label: string
    value: string
  }[]
}

type ReponseChat = {
  userText?: string
  iaText?: string
  isFinished?: boolean
  analysisData?: unknown
  sessionId?: string
  audioBase64?: string | null
  interactiveQuestion?: InteractiveQuestion | null
}

function normalizeAssistantText(text: string) {
  return text
    .replace(
      /Je m'appelle Mindly[,.]?\s*(?:Je suis|je suis)\s+(?:un|votre)\s+assistant d'entretien psychologique(?:\s+pour etudiants|\s+pour étudiants)?[,.]?/gi,
      'Je suis votre assistant de la plateforme Mindly.',
    )
    .replace(/Je m'appelle Mindly[,.]?/gi, 'Je suis votre assistant de la plateforme Mindly.')
}

export function InterviewChat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isInterviewFinished, setIsInterviewFinished] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null)
  const [messageMicro, setMessageMicro] = useState('')
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [setupStep, setSetupStep] = useState<'language' | 'voice'>('language')
  const [interviewLanguage, setInterviewLanguage] = useState<InterviewLanguage>('fr')
  const [interviewerGender, setInterviewerGender] = useState<InterviewerGender>('female')
  const [interactiveSelections, setInteractiveSelections] = useState<Record<number, string[]>>({})
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null)
  const [sessionId] = useState(() => `session-${crypto.randomUUID()}`)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const envoyerMessage = async (
    texteBrut: string,
    afficherDansConversation = true,
    selectedGender = interviewerGender,
  ) => {
    const texte = texteBrut.trim()

    if (!texte || isLoading || isInterviewFinished) return

    const conversationLocale = afficherDansConversation
      ? [...messages, { role: 'user' as const, content: texte }]
      : messages

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
          interviewLanguage,
          interviewerGender: selectedGender,
          studentMessageCount: messages.filter((item) => item.role === 'user').length + 1,
          supportsInteractiveQuestions: true,
          interactiveQuestionMode: 'occasional',
        }),
      })

      const data: ReponseChat & { error?: string } = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'entretien.")
      }

      if (data.iaText) {
        const normalizedIaText = normalizeAssistantText(data.iaText)

        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content: normalizedIaText,
            interactiveQuestion: data.interactiveQuestion || null,
          },
        ])
      }

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
        void audio.play()
      }

      if (data.isFinished) {
        if (!data.analysisData) {
          throw new Error(
            "L'entretien est termine, mais le rapport n'a pas ete genere par le workflow. Attendez quelques secondes puis renvoyez votre derniere reponse.",
          )
        }

        const saveResponse = await fetch('/api/save-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            conversation: [
              ...conversationLocale,
              ...(data.iaText
                ? [{ role: 'ai' as const, content: normalizeAssistantText(data.iaText) }]
                : []),
            ].map((item) => ({
              role: item.role === 'user' ? 'human' : 'ai',
              message: item.content,
              source: 'text',
            })),
            analysisData: data.analysisData,
          }),
        })

        const saveData: { error?: string; id?: string } = await saveResponse.json()

        if (!saveResponse.ok) {
          throw new Error(saveData.error || "Erreur lors de l'enregistrement de l'analyse.")
        }

        setIsSaved(true)
        setSavedAnalysisId(saveData.id || null)
        setIsInterviewFinished(true)
      }
    } catch (error) {
      const messageErreur = error instanceof Error ? error.message : "Erreur lors de l'entretien."

      setMessages((prev) => [...prev, { role: 'ai', content: messageErreur }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    await envoyerMessage(message, true)
  }

  const handleSelectLanguage = (language: InterviewLanguage) => {
    setInterviewLanguage(language)
    setSetupStep('voice')
  }

  const handleSelectVoice = async (gender: InterviewerGender) => {
    setInterviewerGender(gender)
    await handleStartInterview(gender)
  }

  const handleStartInterview = async (selectedGender = interviewerGender) => {
    setInterviewStarted(true)

    const texte =
      interviewLanguage === 'fr'
        ? `Je veux commencer l'entretien en francais avec une voix ${
            selectedGender === 'female' ? 'feminine' : 'masculine'
          }.`
        : `I want to start the interview in English with a ${
            selectedGender === 'female' ? 'female' : 'male'
          } voice.`

    await envoyerMessage(texte, false, selectedGender)
  }

  const handleInteractiveToggle = (
    messageIndex: number,
    value: string,
    type: 'radio' | 'checkbox',
  ) => {
    setInteractiveSelections((prev) => {
      if (type === 'radio') {
        return {
          ...prev,
          [messageIndex]: [value],
        }
      }

      const current = prev[messageIndex] || []
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]

      return {
        ...prev,
        [messageIndex]: next,
      }
    })
  }

  const handleSendInteractiveAnswer = async (
    messageIndex: number,
    question: InteractiveQuestion,
  ) => {
    const values = interactiveSelections[messageIndex] || []

    if (values.length === 0) return

    const labels = question.options
      .filter((option) => values.includes(option.value))
      .map((option) => option.label)

    await envoyerMessage(labels.join(', '), true)
  }

  const handleCopyMessage = async (messageIndex: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageIndex(messageIndex)
      window.setTimeout(() => setCopiedMessageIndex(null), 1400)
    } catch {
      setMessageMicro('Copie impossible. Selectionnez le message manuellement.')
    }
  }

  const handleToggleRecording = async () => {
    if (isLoading || isInterviewFinished || !interviewStarted) return

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
              interviewLanguage,
              interviewerGender,
              supportsInteractiveQuestions: true,
              interactiveQuestionMode: 'occasional',
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
    : !interviewStarted
      ? 'Configuration'
      : isRecording
        ? 'Micro actif'
        : isLoading
          ? 'Traitement en cours'
          : 'Disponible'

  return (
    <div className="interview-shell">
      <section className="interview-card interview-intro">
        <div className="interview-intro-main">
          <div>
            <p className="interview-kicker">Cabinet d&apos;entretien</p>
            <h3 className="interview-intro-title">Echange progressif et confidentiel</h3>
            <p className="interview-intro-text">
              {interviewStarted
                ? 'Repondez naturellement, un message a la fois.'
                : "Choisissez la langue et la voix pour commencer l'entretien."}
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
            {isSaved ? (
              <span className="interview-pill interview-pill-success">Analyse sauvee</span>
            ) : null}
          </div>
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
              <p className="interview-empty-title">
                {interviewStarted
                  ? 'Bienvenue'
                  : setupStep === 'language'
                    ? 'Choix de la langue'
                    : 'Choix de la voix'}
              </p>
              <p className="interview-empty-text">
                {interviewStarted
                  ? "L'assistant prepare la premiere question."
                  : setupStep === 'language'
                    ? "Dans quelle langue voulez-vous faire l'entretien ?"
                    : "Quelle voix voulez-vous entendre pendant l'entretien ?"}
              </p>

              {!interviewStarted ? (
                <div className="interview-setup">
                  {setupStep === 'language' ? (
                    <div className="interview-choice-group">
                      <ChoiceButton
                        checked={interviewLanguage === 'fr'}
                        label="Francais"
                        name="interview-language"
                        onClick={() => handleSelectLanguage('fr')}
                      />
                      <ChoiceButton
                        checked={interviewLanguage === 'en'}
                        label="English"
                        name="interview-language"
                        onClick={() => handleSelectLanguage('en')}
                      />
                    </div>
                  ) : (
                    <div className="interview-choice-group">
                      <ChoiceButton
                        checked={interviewerGender === 'female'}
                        label="Femme"
                        name="interviewer-gender"
                        onClick={() => void handleSelectVoice('female')}
                      />
                      <ChoiceButton
                        checked={interviewerGender === 'male'}
                        label="Homme"
                        name="interviewer-gender"
                        onClick={() => void handleSelectVoice('male')}
                      />

                      <button
                        type="button"
                        className="interview-back-button"
                        onClick={() => setSetupStep('language')}
                        disabled={isLoading}
                      >
                        Retour au choix de langue
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
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
                <div className="interview-message-head">
                  <p className="interview-message-label">
                    {item.role === 'user' ? (
                      <UserRound className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                    {item.role === 'user' ? 'Vous' : 'Assistant'}
                  </p>

                  <button
                    type="button"
                    className="interview-copy-button"
                    onClick={() => void handleCopyMessage(index, item.content)}
                    aria-label="Copier le message"
                    title="Copier le message"
                  >
                    {copiedMessageIndex === index ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="interview-message-text">{item.content}</p>
                {item.interactiveQuestion ? (
                  <InteractiveQuestionBlock
                    disabled={isLoading || isInterviewFinished}
                    messageIndex={index}
                    onSubmit={() =>
                      void handleSendInteractiveAnswer(index, item.interactiveQuestion!)
                    }
                    onToggle={(value) =>
                      handleInteractiveToggle(index, value, item.interactiveQuestion!.type)
                    }
                    question={item.interactiveQuestion}
                    selectedValues={interactiveSelections[index] || []}
                  />
                ) : null}
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
                <p className="interview-message-text">L&apos;assistant prepare sa reponse...</p>
              </div>
            </div>
          ) : null}

          <div ref={scrollRef} />
        </div>
      </section>

      <section className="interview-shell">
        {messageMicro ? <div className="interview-notice">{messageMicro}</div> : null}

        {!isInterviewFinished ? (
          <div className="interview-card interview-composer">
            <div className="interview-composer-row">
              <button
                type="button"
                onClick={() => void handleToggleRecording()}
                disabled={isLoading || isInterviewFinished || !interviewStarted}
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
                      : !interviewStarted
                        ? 'Choisissez la langue et la voix avant de commencer.'
                        : 'Ecrivez ici votre reponse, ou utilisez le micro puis corrigez la transcription...'
                  }
                  rows={3}
                  disabled={isInterviewFinished || !interviewStarted}
                  className="interview-textarea"
                />
              </div>

              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={isLoading || isInterviewFinished || !interviewStarted || !message.trim()}
                className="interview-send-button"
              >
                <Send className="h-4 w-4" />
                {isLoading ? 'Envoi...' : 'Envoyer'}
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
        ) : null}
      </section>

      {isInterviewFinished ? (
        <div className="interview-finish-overlay" role="dialog" aria-modal="true">
          <div className="interview-finish-modal">
            <div className="interview-finish-icon">
              <CheckCircle2 />
            </div>

            <p className="interview-kicker">Entretien termine</p>
            <h3 className="interview-finish-title">Votre rapport est pret</h3>
            <p className="interview-finish-text">
              Votre analyse a ete enregistree. Vous pouvez consulter le rapport maintenant ou
              rejoindre votre espace et y revenir plus tard.
            </p>

            <div className="interview-finish-actions">
              <Link
                href={
                  savedAnalysisId
                    ? `/dashboard/student/analyses/${savedAnalysisId}/pdf`
                    : '/dashboard/student/analyses'
                }
                className={`interview-report-button ${isSaved ? '' : 'interview-report-button-disabled'}`}
                aria-disabled={!isSaved}
                tabIndex={isSaved ? 0 : -1}
              >
                <FileText className="h-4 w-4" />
                Voir mon rapport
              </Link>

              <Link href="/dashboard/student" className="interview-space-button">
                <Home className="h-4 w-4" />
                Acceder a mon espace
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ChoiceButton({
  checked,
  label,
  name,
  onClick,
}: {
  checked: boolean
  label: string
  name: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`interview-choice-button ${checked ? 'interview-choice-button-active' : ''}`}
      onClick={onClick}
    >
      <span className="interview-radio-mark" aria-hidden="true">
        {checked ? <span /> : null}
      </span>
      <span>{label}</span>
      <input checked={checked} name={name} onChange={onClick} type="radio" />
    </button>
  )
}

function InteractiveQuestionBlock({
  disabled,
  messageIndex,
  onSubmit,
  onToggle,
  question,
  selectedValues,
}: {
  disabled: boolean
  messageIndex: number
  onSubmit: () => void
  onToggle: (value: string) => void
  question: InteractiveQuestion
  selectedValues: string[]
}) {
  return (
    <div className="interview-interactive">
      <div className="interview-interactive-options">
        {question.options.map((option) => {
          const checked = selectedValues.includes(option.value)

          return (
            <button
              key={`${messageIndex}-${option.value}`}
              type="button"
              className={`interview-option-button ${checked ? 'interview-option-button-active' : ''}`}
              onClick={() => onToggle(option.value)}
              disabled={disabled}
            >
              <span
                className={
                  question.type === 'checkbox' ? 'interview-checkbox-mark' : 'interview-radio-mark'
                }
                aria-hidden="true"
              >
                {checked ? <span /> : null}
              </span>
              <span>{option.label}</span>
              <input
                checked={checked}
                name={`interactive-${messageIndex}`}
                onChange={() => onToggle(option.value)}
                type={question.type}
                value={option.value}
              />
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="interview-option-submit"
        onClick={onSubmit}
        disabled={disabled || selectedValues.length === 0}
      >
        Valider ma reponse
      </button>
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
