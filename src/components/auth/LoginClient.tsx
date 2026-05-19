'use client'

import { useSignIn, useSignUp, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  HeartHandshake,
  Languages,
  Loader2,
  Mail,
  MailCheck,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/providers/Theme'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type ClerkFlowError = {
  code?: string
  longMessage?: string
  message?: string
}

type EmailLinkFactor = {
  emailAddressId?: string
  strategy?: string
}

function getFirstClerkError(error: unknown): ClerkFlowError | null {
  if (!error || typeof error !== 'object') return null

  if (
    'errors' in error &&
    Array.isArray((error as { errors?: unknown }).errors) &&
    (error as { errors: unknown[] }).errors.length > 0
  ) {
    return (error as { errors: ClerkFlowError[] }).errors[0]
  }

  return error as ClerkFlowError
}

function getErrorMessage(error: unknown) {
  const clerkError = getFirstClerkError(error)

  if (clerkError) {
    return clerkError.longMessage || clerkError.message || 'Une erreur est survenue.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Une erreur est survenue.'
}

function isAccountNotFoundError(error: unknown) {
  const clerkError = getFirstClerkError(error)

  if (!clerkError) return false

  const message = `${clerkError.longMessage || ''} ${clerkError.message || ''}`.toLowerCase()

  return (
    clerkError.code === 'form_identifier_not_found' ||
    clerkError.code === 'identifier_not_found' ||
    message.includes("couldn't find your account") ||
    message.includes('could not find your account')
  )
}

type LoginClientProps = {
  initialMessage?: string
}

const loginCopy = {
  fr: {
    visualEyebrow: 'Bien-etre et IA',
    visualTitle: 'Bienvenue sur MindBloom.',
    visualText:
      "Retrouve ton espace d'accompagnement dans une interface douce, claire et securisee.",
    secure: 'Acces protege',
    support: 'Suivi bienveillant',
    ai: 'IA integree',
    quickTitle: 'Connexion rapide',
    quickText: 'Google ou lien magique par email.',
    brand: 'MindBloom',
    title: 'Connectez-vous',
    description: 'Accedez a votre espace personnel avec Google ou un lien magique securise.',
    google: 'Continuer avec Google',
    divider: 'ou',
    emailLabel: 'Adresse email',
    emailPlaceholder: 'votre@email.com',
    magicLink: 'Recevoir mon lien magique',
    missingEmail: 'Veuillez saisir votre adresse email.',
    googleError: 'Connexion Google impossible.',
    genericError: 'Une erreur est survenue.',
    invalidEmail: 'Email non valide.',
    magicError: "Impossible d'envoyer le lien magique.",
    successPrefix: 'Lien envoye a',
    successSuffix: 'Ouvrez votre boite mail pour terminer la connexion.',
  },
  en: {
    visualEyebrow: 'Wellness and AI',
    visualTitle: 'Welcome to MindBloom.',
    visualText: 'Open your support space in a calm, clear and secure experience.',
    secure: 'Protected access',
    support: 'Caring support',
    ai: 'Built-in AI',
    quickTitle: 'Quick sign in',
    quickText: 'Google or magic link by email.',
    brand: 'MindBloom',
    title: 'Sign in',
    description: 'Access your personal space with Google or a secure magic link.',
    google: 'Continue with Google',
    divider: 'or',
    emailLabel: 'Email address',
    emailPlaceholder: 'your@email.com',
    magicLink: 'Get my magic link',
    missingEmail: 'Please enter your email address.',
    googleError: 'Google sign in is unavailable.',
    genericError: 'Something went wrong.',
    invalidEmail: 'Invalid email address.',
    magicError: 'Unable to send the magic link.',
    successPrefix: 'Link sent to',
    successSuffix: 'Open your inbox to finish signing in.',
  },
} as const

export function LoginClient({ initialMessage = '' }: LoginClientProps) {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const { signIn, fetchStatus } = useSignIn()
  const { signUp } = useSignUp()
  const { setTheme, theme } = useTheme()
  const { lang, toggleLang } = useLanguage()
  const copy = loginCopy[lang]
  const [email, setEmail] = useState('')
  const [successEmail, setSuccessEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState(initialMessage)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (isLoaded && isSignedIn) {
      window.location.assign('/auth/redirect')
    }
  }, [isLoaded, isSignedIn, router])

  async function handleGoogleSignIn() {
    if (!signIn || !signUp) return

    setErrorMessage('')
    setSuccessEmail('')
    setGoogleLoading(true)

    try {
      const { error } = await signIn.sso({
        strategy: 'oauth_google',
        redirectCallbackUrl: '/sso-callback',
        redirectUrl: '/auth/redirect',
      })

      if (error) {
        setErrorMessage(error.longMessage || error.message || copy.googleError)
        setGoogleLoading(false)
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      setGoogleLoading(false)
    }
  }

  async function handleEmailLinkSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!signIn || !signUp) return

    const cleanEmail = email.trim().toLowerCase()

    setErrorMessage('')
    setSuccessEmail('')
    setInfoMessage('')

    if (!cleanEmail) {
      setErrorMessage(copy.missingEmail)
      return
    }

    setEmailLoading(true)

    try {
      const sendSignUpLink = async (fallbackError?: { longMessage?: string; message?: string }) => {
        await signUp.reset()

        const { error: signUpError } = await signUp.create({
          emailAddress: cleanEmail,
        })

        if (signUpError) {
          setErrorMessage(
            signUpError.longMessage ||
              signUpError.message ||
              fallbackError?.longMessage ||
              fallbackError?.message ||
              copy.invalidEmail,
          )
          return
        }

        const { error: signUpLinkError } = await signUp.verifications.sendEmailLink({
          verificationUrl: `${window.location.origin}/auth/verify-email`,
        })

        if (signUpLinkError) {
          setErrorMessage(
            signUpLinkError.longMessage ||
              signUpLinkError.message ||
              copy.magicError,
          )
          return
        }

        setSuccessEmail(cleanEmail)
        setEmail('')

        void signUp.verifications.waitForEmailLinkVerification().then(async ({ error }) => {
          if (error) return

          const { error: finalizeError } = await signUp.finalize()

          if (!finalizeError) {
            window.location.assign('/auth/redirect')
          }
        })
      }

      await signIn.reset()

      const { error: createError } = await signIn.create({
        identifier: cleanEmail,
      })

      if (createError) {
        if (isAccountNotFoundError(createError)) {
          await sendSignUpLink(createError)
          return
        }

        setErrorMessage(createError.longMessage || createError.message || copy.invalidEmail)
        return
      }

      const emailLinkFactor = (signIn.supportedFirstFactors as EmailLinkFactor[] | null)?.find(
        (factor) => factor.strategy === 'email_link',
      )

      const linkParams = emailLinkFactor?.emailAddressId
        ? {
            emailAddressId: emailLinkFactor.emailAddressId,
            verificationUrl: `${window.location.origin}/auth/verify-email`,
          }
        : {
            emailAddress: cleanEmail,
            verificationUrl: `${window.location.origin}/auth/verify-email`,
          }

      const { error: linkError } = await signIn.emailLink.sendLink(linkParams)

      if (linkError) {
        if (isAccountNotFoundError(linkError)) {
          await sendSignUpLink(linkError)
          return
        }

        setErrorMessage(
          linkError.longMessage || linkError.message || copy.magicError,
        )
        return
      }

      setSuccessEmail(cleanEmail)
      setEmail('')

      void signIn.emailLink.waitForVerification().then(async ({ error }) => {
        if (error) return

        const { error: finalizeError } = await signIn.finalize()

        if (!finalizeError) {
          window.location.assign('/auth/redirect')
        }
      })
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setEmailLoading(false)
    }
  }

  const isClerkBusy = fetchStatus === 'fetching'
  const isSubmitting = googleLoading || emailLoading || isClerkBusy
  const isDark = mounted && theme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <main className="login-page">
      <div className="login-theme-switch">
        <button
          type="button"
          onClick={toggleLang}
          className="login-action-button"
          aria-label={lang === 'fr' ? 'Changer la langue' : 'Change language'}
        >
          <Languages />
          <span>{lang.toUpperCase()}</span>
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="login-action-button login-action-icon"
          aria-label={
            lang === 'fr'
              ? !isDark
                ? 'Activer le mode sombre'
                : 'Activer le mode clair'
              : !isDark
                ? 'Enable dark mode'
                : 'Enable light mode'
          }
        >
          {isDark ? <Sun /> : <Moon />}
        </button>
      </div>

      <div className="login-shell">
        <section className="login-visual" aria-hidden="true">
          <div className="login-visual-badge">
            <Sparkles />
            MindBloom
          </div>

          <div className="login-visual-copy">
            <p className="login-visual-eyebrow">{copy.visualEyebrow}</p>
            <h2 className="login-visual-title">{copy.visualTitle}</h2>
            <p className="login-visual-text">{copy.visualText}</p>
          </div>

          <div className="login-visual-list">
            <div className="login-visual-item">
              <ShieldCheck />
              <span>{copy.secure}</span>
            </div>
            <div className="login-visual-item">
              <HeartHandshake />
              <span>{copy.support}</span>
            </div>
            <div className="login-visual-item">
              <BrainCircuit />
              <span>{copy.ai}</span>
            </div>
          </div>

          <div className="login-visual-card">
            <div className="login-visual-card-icon">
              <Moon />
            </div>
            <div>
              <p>{copy.quickTitle}</p>
              <span>{copy.quickText}</span>
            </div>
          </div>
        </section>

        <section className="login-card">
          <div className="login-header">
            <div className="login-icon">
              <Moon />
            </div>

            <p className="login-eyebrow">{copy.brand}</p>

            <h1 className="login-title">{copy.title}</h1>

            <p className="login-description">{copy.description}</p>
          </div>

          <Button
            variant="outline"
            size="lg"
            disabled={isSubmitting || !signIn}
            onClick={handleGoogleSignIn}
            type="button"
            className="login-google-button"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <span className="login-google-icon">G</span>
            )}
            {copy.google}
          </Button>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">{copy.divider}</span>
            <div className="login-divider-line" />
          </div>

          <form className="login-form" onSubmit={handleEmailLinkSubmit}>
            <label className="login-label" htmlFor="login-email">
              {copy.emailLabel}
            </label>

            <div className="login-input-wrap">
              <Mail className="login-input-icon" />

              <input
                className="login-input"
                disabled={isSubmitting || !signIn || !signUp}
                id="login-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={copy.emailPlaceholder}
                type="email"
                value={email}
              />
            </div>

            <div
              className="login-captcha"
              data-cl-language="fr-FR"
              data-cl-size="flexible"
              data-cl-theme={theme === 'dark' ? 'dark' : 'light'}
              id="clerk-captcha"
            />

            {errorMessage ? (
              <div className="login-alert login-alert-error">
                <AlertCircle />
                {errorMessage}
              </div>
            ) : null}

            {infoMessage ? (
              <div className="login-alert login-alert-info">
                <MailCheck />
                {infoMessage}
              </div>
            ) : null}

            {successEmail ? (
              <div className="login-alert login-alert-success">
                <CheckCircle2 />
                {copy.successPrefix} {successEmail}. {copy.successSuffix}
              </div>
            ) : null}

            <Button
              variant="dream"
              size="lg"
              disabled={isSubmitting || !signIn || !signUp}
              type="submit"
              className="login-submit-button"
            >
              {emailLoading ? <Loader2 className="animate-spin" /> : <MailCheck />}
              {copy.magicLink}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}

