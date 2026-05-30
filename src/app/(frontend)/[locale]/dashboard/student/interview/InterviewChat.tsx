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

const OTHER_INTERACTIVE_VALUE = '__other__'

type ReponseChat = {
  userText?: string
  iaText?: string
  isFinished?: boolean
  analysisData?: unknown
  sessionId?: string
  audioBase64?: string | null
  interactiveQuestion?: InteractiveQuestion | null
}

function normalizeAssistantText(text: string, language: InterviewLanguage = 'fr') {
  const replacement =
    language === 'en'
      ? 'I am your assistant from the MindBloom platform.'
      : 'Je suis votre assistant de la plateforme MindBloom.'

  if (language === 'en' && /L'entretien est termin|Merci pour vos reponses/i.test(text)) {
    return 'The interview is complete. Thank you for your answers.'
  }

  if (
    language === 'en' &&
    /Je suis votre assistant de la plateforme MindBloom|Pouvons-nous commencer/i.test(text)
  ) {
    return 'I am your assistant from the MindBloom platform. I am happy to share this moment with you. Can we start with a short introduction? What do you like to do to relax and feel well?'
  }

  return text
    .replace(
      /Je m'appelle MindBloom[,.]?\s*(?:Je suis|je suis)\s+(?:un|votre)\s+assistant d'entretien psychologique(?:\s+pour etudiants|\s+pour étudiants)?[,.]?/gi,
      replacement,
    )
    .replace(/Je suis votre assistant de la plateforme MindBloom[,.]?/gi, replacement)
    .replace(/Je m'appelle MindBloom[,.]?/gi, replacement)
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
  const [answeredInteractiveQuestions, setAnsweredInteractiveQuestions] = useState<Record<number, boolean>>({})
  const [interactiveOtherAnswers, setInteractiveOtherAnswers] = useState<Record<number, string>>({})
  const [hasAskedRequiredInteractive, setHasAskedRequiredInteractive] = useState(false)
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null)
  const [sessionId] = useState(() => `session-${crypto.randomUUID()}`)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const uiLang: InterviewLanguage = interviewLanguage
  const i18n = {
    toolbarSubtitle:
      uiLang === 'en'
        ? 'Answer simply, one message at a time.'
        : 'Repondez simplement, un message a la fois.',
    readyTitle: uiLang === 'en' ? 'Ready for your interview' : 'Pret pour votre entretien',
    welcomeTitle: uiLang === 'en' ? 'Welcome' : 'Bienvenue',
    readyText:
      uiLang === 'en'
        ? 'Choose the language and voice in the startup window.'
        : 'Choisissez la langue et la voix dans la fenetre de demarrage.',
    welcomeText:
      uiLang === 'en'
        ? 'The assistant is preparing the first question.'
        : "L'assistant prépare la première question.",
    you: uiLang === 'en' ? 'You' : 'Vous',
    copy: uiLang === 'en' ? 'Copy message' : 'Copier le message',
    loading:
      uiLang === 'en'
        ? 'The assistant is preparing a response...'
        : "L'assistant prépare sa réponse...",
    placeholderFinished:
      uiLang === 'en' ? 'The interview is finished.' : "L'entretien est terminé.",
    placeholderSetup:
      uiLang === 'en'
        ? 'Choose the language and voice before starting.'
        : 'Choisissez la langue et la voix avant de commencer.',
    placeholderActive:
      uiLang === 'en'
        ? 'Write your answer here, or use the microphone then edit the transcript...'
        : 'Écrivez ici votre réponse, ou utilisez le micro puis corrigez la transcription...',
    sending: uiLang === 'en' ? 'Sending...' : 'Envoi...',
    send: uiLang === 'en' ? 'Send' : 'Envoyer',
    setupKicker: uiLang === 'en' ? 'Initial interview' : 'Entretien initial',
    chooseLanguage: uiLang === 'en' ? 'Choose language' : 'Choisir la langue',
    chooseVoice: uiLang === 'en' ? 'Choose voice' : 'Choisir la voix',
    chooseLanguageText:
      uiLang === 'en'
        ? 'Select the interview language.'
        : "Sélectionnez la langue de l'entretien.",
    chooseVoiceText:
      uiLang === 'en'
        ? "Select the assistant's voice."
        : "Sélectionnez la voix de l'assistant.",
    french: uiLang === 'en' ? 'French' : 'Français',
    female: uiLang === 'en' ? 'Female' : 'Femme',
    male: uiLang === 'en' ? 'Male' : 'Homme',
    back: uiLang === 'en' ? 'Back' : 'Retour',
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const envoyerMessage = async (
    texteBrut: string,
    afficherDansConversation = true,
    selectedGender = interviewerGender,
    selectedLanguage = uiLang,
  ) => {
    const texte = texteBrut.trim()

    if (!texte || isLoading || isInterviewFinished) return

    const conversationLocale = afficherDansConversation
      ? [...messages, { role: 'user' as const, content: texte }]
      : messages
    const visibleStudentMessageCount = conversationLocale.filter((item) => item.role === 'user').length

    setMessages(conversationLocale)
    setMessage('')
    setMessageMicro('')

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
          interviewLanguage: selectedLanguage,
          interviewerGender: selectedGender,
          studentMessageCount: visibleStudentMessageCount,
          conversationHistory: conversationLocale.map((item) => ({
            role: item.role,
            content: item.content,
          })),
          supportsInteractiveQuestions: true,
          interactiveQuestionMode: 'occasional',
          hasAskedRequiredInteractive,
        }),
      })

      const data: ReponseChat & { error?: string } = await response.json()

      if (data.interactiveQuestion) {
        setHasAskedRequiredInteractive(true)
      }

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'entretien.")
      }

      if (data.iaText) {
        const normalizedIaText =
          data.isFinished && selectedLanguage === 'en'
            ? 'The interview is complete. Thank you for your answers.'
            : normalizeAssistantText(data.iaText, selectedLanguage)

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
        setIsLoading(false)

        if (!data.analysisData) {
          throw new Error(
            selectedLanguage === 'en'
              ? 'The interview ended, but the report was not generated. Please answer one more message so the assistant can complete the analysis.'
              : "L'entretien s'est terminé, mais le rapport n'a pas été généré. Répondez encore à un message pour compléter l'analyse.",
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
                ? [{ role: 'ai' as const, content: normalizeAssistantText(data.iaText, selectedLanguage) }]
                : []),
            ].map((item) => ({
              role: item.role === 'user' ? 'human' : 'ai',
              message: item.content,
              source: 'text',
            })),
            analysisData: data.analysisData,
            locale: selectedLanguage,
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
    await envoyerMessage(message, true, interviewerGender, uiLang)
  }

  const handleSelectLanguage = (language: InterviewLanguage) => {
    setInterviewLanguage(language)
    setSetupStep('voice')
  }

  const handleSelectVoice = async (gender: InterviewerGender) => {
    setInterviewerGender(gender)
    await handleStartInterview(gender, interviewLanguage)
  }

  const handleStartInterview = async (
    selectedGender = interviewerGender,
    selectedLanguage = interviewLanguage,
  ) => {
    setInterviewStarted(true)

    const texte =
      selectedLanguage === 'fr'
        ? `Commence l'entretien maintenant. Reponds uniquement en francais avec une voix ${
            selectedGender === 'female' ? 'feminine' : 'masculine'
          }. Presente-toi brievement en francais, puis pose une seule question courte.`
        : `Start the interview now. Reply only in English with a ${
            selectedGender === 'female' ? 'female' : 'male'
          } voice. Introduce yourself briefly in English, then ask exactly one short question.`

    await envoyerMessage(texte, false, selectedGender, selectedLanguage)
  }

  const handleInteractiveToggle = (
    messageIndex: number,
    value: string,
    type: 'radio' | 'checkbox',
  ) => {
    if (answeredInteractiveQuestions[messageIndex]) return

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
    if (answeredInteractiveQuestions[messageIndex]) return

    const values = interactiveSelections[messageIndex] || []

    if (values.length === 0) return

    const otherAnswer = (interactiveOtherAnswers[messageIndex] || '').trim()

    if (values.includes(OTHER_INTERACTIVE_VALUE) && !otherAnswer) return

    const labels = getInteractiveOptionsWithOther(question, interviewLanguage)
      .filter((option) => values.includes(option.value))
      .map((option) =>
        isOtherInteractiveOption(option)
          ? otherAnswer
          : translateInteractiveOption(option.label, interviewLanguage),
      )
      .filter(Boolean)

    if (labels.length === 0) return

    setAnsweredInteractiveQuestions((prev) => ({
      ...prev,
      [messageIndex]: true,
    }))

    await envoyerMessage(labels.join(', '), true)
  }

  const handleCopyMessage = async (messageIndex: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageIndex(messageIndex)
      window.setTimeout(() => setCopiedMessageIndex(null), 1400)
    } catch {
      setMessageMicro('Copie impossible. Sélectionnez le message manuellement.')
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
            setMessageMicro('Texte transcrit dans la zone de réponse.')
            window.setTimeout(() => setMessageMicro(''), 2500)
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
        error instanceof Error ? error.message : "Impossible d'accéder au microphone.",
      )
    }
  }

  const etat = isInterviewFinished
    ? uiLang === 'en'
      ? 'Interview finished'
      : 'Entretien terminé'
    : !interviewStarted
      ? 'Configuration'
      : isRecording
        ? uiLang === 'en'
          ? 'Mic active'
          : 'Micro actif'
        : isLoading
          ? uiLang === 'en'
            ? 'Processing'
            : 'Traitement en cours'
          : uiLang === 'en'
            ? 'Available'
            : 'Disponible'

  return (
    <div className="interview-shell">
      <section className="interview-card interview-chat-card">
        <div className="interview-chat-toolbar">
          <div>
            <p className="interview-section-title">Discussion</p>
            <p className="interview-section-subtitle">{i18n.toolbarSubtitle}</p>
          </div>
          <div className="interview-status-row">
            <span className="interview-pill">
              <CheckCircle2 className="h-4 w-4" />
              {etat}
            </span>
          </div>
        </div>

        <div className="interview-scroll">
          {messages.length === 0 && !isLoading ? (
            <div className="interview-empty">
              <div className="interview-empty-icon">
                <Bot className="h-5 w-5" />
              </div>
              <p className="interview-empty-title">
                {interviewStarted ? i18n.welcomeTitle : i18n.readyTitle}
              </p>
              <p className="interview-empty-text">
                {interviewStarted ? i18n.welcomeText : i18n.readyText}
              </p>
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
                    {item.role === 'user' ? i18n.you : 'Assistant'}
                  </p>

                  <button
                    type="button"
                    className="interview-copy-button"
                    onClick={() => void handleCopyMessage(index, item.content)}
                    aria-label={i18n.copy}
                    title={i18n.copy}
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
                    disabled={
                      isLoading ||
                      isInterviewFinished ||
                      answeredInteractiveQuestions[index] === true
                    }
                    language={uiLang}
                    messageIndex={index}
                    onOtherChange={(value) =>
                      setInteractiveOtherAnswers((prev) => ({
                        ...prev,
                        [index]: value,
                      }))
                    }
                    onSubmit={() =>
                      void handleSendInteractiveAnswer(index, item.interactiveQuestion!)
                    }
                    onToggle={(value) =>
                      handleInteractiveToggle(index, value, item.interactiveQuestion!.type)
                    }
                    question={item.interactiveQuestion}
                    otherValue={interactiveOtherAnswers[index] || ''}
                    selectedValues={interactiveSelections[index] || []}
                  />
                ) : null}
              </div>
            </div>
          ))}

          {isLoading && !isInterviewFinished ? (
            <div className="interview-message-row interview-message-row-ai">
              <div className="interview-message interview-message-ai">
                <p className="interview-message-label">
                  <Bot className="h-4 w-4" />
                  Assistant
                </p>
                <p className="interview-message-text">{i18n.loading}</p>
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
                aria-label={isRecording ? 'Arreter l’enregistrement' : 'Activer le micro'}
                title={isRecording ? 'Arreter' : 'Micro'}
              >
                {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
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
                      ? i18n.placeholderFinished
                      : !interviewStarted
                        ? i18n.placeholderSetup
                        : i18n.placeholderActive
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
                {isLoading ? i18n.sending : i18n.send}
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
        <section className="interview-card interview-finish-inline" aria-live="polite">
          <div className="interview-finish-icon">
            <CheckCircle2 />
          </div>

          <div className="interview-finish-inline-content">
            <p className="interview-kicker">
              {uiLang === 'en' ? 'Interview finished' : 'Entretien terminé'}
            </p>
            <h3 className="interview-finish-title">
              {uiLang === 'en' ? 'What would you like to do next?' : 'Que voulez-vous faire ?'}
            </h3>
            <p className="interview-finish-text">
              {uiLang === 'en'
                ? 'You can read the last answer above, then go to your dashboard or open your report.'
                : 'Vous pouvez lire la dernière réponse au-dessus, puis accéder au dashboard ou consulter votre rapport.'}
            </p>
          </div>

          <div className="interview-finish-actions">
            <Link href="/dashboard/student" className="interview-space-button">
              <Home className="h-4 w-4" />
              {uiLang === 'en' ? 'Go to my dashboard' : 'Acceder au dashboard'}
            </Link>

            <Link
              href={
                savedAnalysisId
                  ? `/dashboard/student/analyses/${savedAnalysisId}/pdf`
                  : '/dashboard/student/analyses'
              }
              className="interview-report-button"
            >
              <FileText className="h-4 w-4" />
              {uiLang === 'en' ? 'View my report' : 'Voir mon rapport'}
            </Link>
          </div>
        </section>
      ) : null}

      {!interviewStarted ? (
        <div className="interview-setup-overlay" role="dialog" aria-modal="true">
          <div className="interview-setup-modal">
            <div className="interview-setup-icon">
              <Bot className="h-5 w-5" />
            </div>

            <p className="interview-kicker">{i18n.setupKicker}</p>
            <h3 className="interview-setup-title">
              {setupStep === 'language' ? i18n.chooseLanguage : i18n.chooseVoice}
            </h3>
            <p className="interview-setup-text">
              {setupStep === 'language' ? i18n.chooseLanguageText : i18n.chooseVoiceText}
            </p>

            {setupStep === 'language' ? (
              <div className="interview-choice-group interview-setup-choices">
                <ChoiceButton
                  checked={interviewLanguage === 'fr'}
                  label={i18n.french}
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
              <div className="interview-choice-group interview-setup-choices">
                <ChoiceButton
                  checked={interviewerGender === 'female'}
                  label={i18n.female}
                  name="interviewer-gender"
                  onClick={() => void handleSelectVoice('female')}
                />
                <ChoiceButton
                  checked={interviewerGender === 'male'}
                  label={i18n.male}
                  name="interviewer-gender"
                  onClick={() => void handleSelectVoice('male')}
                />

                <button
                  type="button"
                  className="interview-back-button"
                  onClick={() => setSetupStep('language')}
                  disabled={isLoading}
                >
                  {i18n.back}
                </button>
              </div>
            )}
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
  language,
  messageIndex,
  onOtherChange,
  onSubmit,
  onToggle,
  otherValue,
  question,
  selectedValues,
}: {
  disabled: boolean
  language: InterviewLanguage
  messageIndex: number
  onOtherChange: (value: string) => void
  onSubmit: () => void
  onToggle: (value: string) => void
  otherValue: string
  question: InteractiveQuestion
  selectedValues: string[]
}) {
  const isEnglish = language === 'en'
  const options = getInteractiveOptionsWithOther(question, language)
  const isOtherSelected = selectedValues.includes(OTHER_INTERACTIVE_VALUE)
  const isSubmitDisabled =
    disabled || selectedValues.length === 0 || (isOtherSelected && !otherValue.trim())

  return (
    <div className={`interview-interactive ${disabled ? 'interview-interactive-disabled' : ''}`}>
      <p className="interview-interactive-title">
        {question.type === 'checkbox'
          ? isEnglish
            ? 'Choose one or more options'
            : 'Choisissez une ou plusieurs options'
          : isEnglish
            ? 'Choose one option'
            : 'Choisissez une option'}
      </p>
      <div className="interview-interactive-options">
        {options
          .filter((option) => !isFinOption(option))
          .map((option) => {
            const checked = selectedValues.includes(option.value)

            return (
              <label
                key={`${messageIndex}-${option.value}`}
                className={`interview-option-button ${checked ? 'interview-option-button-active' : ''}`}
              >
                <input
                  checked={checked}
                  className="interview-option-native"
                  disabled={disabled}
                  name={`interactive-${messageIndex}`}
                  onChange={() => onToggle(option.value)}
                  type={question.type}
                  value={option.value}
                />
                <span>{translateInteractiveOption(option.label, language)}</span>
              </label>
            )
          })}
      </div>

      {isOtherSelected ? (
        <textarea
          className="interview-other-input"
          disabled={disabled}
          onChange={(event) => onOtherChange(event.target.value)}
          placeholder={isEnglish ? 'Write your answer here...' : 'Ecrivez votre reponse ici...'}
          rows={3}
          value={otherValue}
        />
      ) : null}

      <button
        type="button"
        className="interview-option-submit"
        onClick={onSubmit}
        disabled={isSubmitDisabled}
      >
        {disabled
          ? isEnglish
            ? 'Answer submitted'
            : 'Reponse validee'
          : isEnglish
            ? 'Submit my answer'
            : 'Valider ma reponse'}
      </button>
    </div>
  )
}

function getInteractiveOptionsWithOther(
  question: InteractiveQuestion,
  language: InterviewLanguage,
) {
  const hasOther = question.options.some((option) => isOtherInteractiveOption(option))

  if (hasOther) {
    return question.options.map((option) =>
      isOtherInteractiveOption(option)
        ? {
            label: language === 'en' ? 'Other' : 'Autre',
            value: OTHER_INTERACTIVE_VALUE,
          }
        : option,
    )
  }

  return [
    ...question.options,
    {
      label: language === 'en' ? 'Other' : 'Autre',
      value: OTHER_INTERACTIVE_VALUE,
    },
  ]
}

function translateInteractiveOption(label: string, language: InterviewLanguage) {
  if (language !== 'en') return label

  const normalized = label.toLowerCase()
  const translations: Record<string, string> = {
    'stress ou pression': 'Stress or pressure',
    'organisation ou gestion du temps': 'Organization or time management',
    'relations ou travail en groupe': 'Relationships or group work',
    'motivation ou confiance': 'Motivation or confidence',
    autre: 'Other',
  }

  return translations[normalized] || label
}

function isOtherInteractiveOption(option: { label: string; value: string }) {
  const label = option.label.trim().toLowerCase()
  const value = option.value.trim().toLowerCase()

  return (
    value === OTHER_INTERACTIVE_VALUE ||
    value === 'other' ||
    value === 'autre' ||
    label === 'other' ||
    label === 'autre'
  )
}

function isFinOption(option: { label: string; value: string }) {
  const label = option.label.trim().toLowerCase()
  const value = option.value.trim().toLowerCase()

  return label === '[fin]' || value === '[fin]' || label === 'fin' || value === 'fin'
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
