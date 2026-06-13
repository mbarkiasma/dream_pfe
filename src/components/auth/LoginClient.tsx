'use client'

import { useClerk, useSignIn, useSignUp, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo/Logo'
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  HeartHandshake,
  Globe,
  Loader2,
  Mail,
  MailCheck,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react'
import { useTheme } from '@/providers/Theme'
import { usePathname, useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'

type ClerkFlowError = {
  code?: string
  longMessage?: string
  message?: string
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

function getErrorMessage(error: unknown, fallbackMessage: string) {
  const clerkError = getFirstClerkError(error)

  if (clerkError) {
    return clerkError.longMessage || clerkError.message || fallbackMessage
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
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

function isMissingActiveSessionError(error: unknown) {
  const clerkError = getFirstClerkError(error)
  const message = `${clerkError?.longMessage || ''} ${clerkError?.message || ''}`.toLowerCase()

  return message.includes('supply an active session') || message.includes('active session')
}

function waitForClerkAttempt() {
  return new Promise((resolve) => window.setTimeout(resolve, 250))
}

type LoginClientProps = {
  initialMessage?: string
  shouldSwitchAccount?: boolean
}

const loginCopy = {
  fr: {
    visualEyebrow: 'Bien-être et IA',
    visualTitle: 'Bienvenue sur MindBloom.',
    visualText:
      "Retrouve ton espace d'accompagnement dans une interface douce, claire et sécurisée.",
    secure: 'Accès protégé',
    support: 'Suivi bienveillant',
    ai: 'IA intégrée',
    quickTitle: 'Connexion rapide',
    quickText: 'Google ou lien magique par email.',
    brand: 'MindBloom',
    title: 'Connectez-vous',
    description: 'Accédez à votre espace personnel avec Google ou un lien magique sécurisé.',
    google: 'Continuer avec Google',
    googleLoading: 'Connexion avec Google...',
    divider: 'ou',
    emailLabel: 'Adresse email',
    emailPlaceholder: 'votre@email.com',
    magicLink: 'Recevoir mon lien magique',
    missingEmail: 'Veuillez saisir votre adresse email.',
    googleError: 'Connexion Google impossible.',
    genericError: 'Une erreur est survenue.',
    invalidEmail: 'Email non valide.',
    magicError: "Impossible d'envoyer le lien magique.",
    successPrefix: 'Lien envoyé à',
    successSuffix: 'Ouvrez votre boîte mail pour terminer la connexion.',
    themeDarkAria: 'Activer le mode sombre',
    themeLightAria: 'Activer le mode clair',
    switchLanguage: 'Changer de langue',
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
    googleLoading: 'Connecting with Google...',
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
    themeDarkAria: 'Enable dark mode',
    themeLightAria: 'Enable light mode',
    switchLanguage: 'Switch language',
  },
} as const

export function LoginClient({
  initialMessage = '',
  shouldSwitchAccount = false,
}: LoginClientProps) {
  const { signOut } = useClerk()
  const { isLoaded, isSignedIn } = useUser()
  const { signIn, fetchStatus } = useSignIn()
  const { signUp } = useSignUp()
  const { setTheme, theme } = useTheme()
  const locale = useLocale() as 'fr' | 'en'
  const router = useRouter()
  const pathname = usePathname()
  const redirectPath = `/${locale}/auth/redirect`
  const loginPath = `/${locale}/login?switchAccount=1`
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const verifyEmailUrl = `${origin}/${locale}/auth/verify-email`
  const ssoCallbackPath = `/${locale}/sso-callback`
  const copy = loginCopy[locale] ?? loginCopy.fr
  const [email, setEmail] = useState('')
  const [successEmail, setSuccessEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState(initialMessage)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
     
    const suppressClerkChannelNoise = (event: PromiseRejectionEvent) => {
      const msg = String(event.reason?.message ?? event.reason ?? '')
      if (msg.includes('message channel closed') || msg.includes('listener indicated')) {
        event.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', suppressClerkChannelNoise)
    return () => window.removeEventListener('unhandledrejection', suppressClerkChannelNoise)
  }, [])

  useEffect(() => {
    setMounted(true)

    if (isLoaded && isSignedIn && shouldSwitchAccount) {
      void signOut({ redirectUrl: loginPath })
      return
    }

    if (isLoaded && isSignedIn) {
      window.location.assign(redirectPath)
    }
  }, [isLoaded, isSignedIn, shouldSwitchAccount, signOut])

  async function handleGoogleSignIn() {
    setErrorMessage('')
    setSuccessEmail('')
    setGoogleLoading(true)


    // Reset loading when user returns to the tab (popup cancelled / redirect failed)
    const resetOnFocus = () => setGoogleLoading(false)
    window.addEventListener('focus', resetOnFocus, { once: true })

    try {
      // Use the global Clerk browser instance directly — the v7 SignInFutureResource.sso()
      // has an incomplete implementation (marked TODO in source) and silently no-ops.
      // The underlying SignInResource.authenticateWithRedirect() reliably handles the redirect.
      const clerkGlobal = (window as any).Clerk
      const clientSignIn = clerkGlobal?.client?.signIn
      if (!clientSignIn?.authenticateWithRedirect) {
        throw new Error('Clerk not ready')
      }
      await clientSignIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${origin}${ssoCallbackPath}`,
        redirectUrlComplete: `${origin}${redirectPath}`,
      })
      window.removeEventListener('focus', resetOnFocus)
      setGoogleLoading(false)
    } catch (error) {
      window.removeEventListener('focus', resetOnFocus)
      setErrorMessage(getErrorMessage(error, copy.googleError))
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
          verificationUrl: verifyEmailUrl,
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
            window.location.assign(redirectPath)
          }
        })
      }

      const { error: signInCreateError } = await signIn.create({
        identifier: cleanEmail,
      })

      if (signInCreateError) {
        if (isAccountNotFoundError(signInCreateError)) {
          await sendSignUpLink(signInCreateError)
          return
        }

        setErrorMessage(
          signInCreateError.longMessage || signInCreateError.message || copy.magicError,
        )
        return
      }

      await waitForClerkAttempt()

      let { error: linkError } = await signIn.emailLink.sendLink({
        emailAddress: cleanEmail,
        verificationUrl: verifyEmailUrl,
      })

      if (linkError && isMissingActiveSessionError(linkError)) {
        await waitForClerkAttempt()

        const retry = await signIn.emailLink.sendLink({
          emailAddress: cleanEmail,
          verificationUrl: verifyEmailUrl,
        })

        linkError = retry.error
      }

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
    } catch (error) {
      setErrorMessage(getErrorMessage(error, copy.genericError))
    } finally {
      setEmailLoading(false)
    }
  }

  const isClerkBusy = fetchStatus === 'fetching'
  const isSubmitting = googleLoading || emailLoading || isClerkBusy
  const isGoogleDisabled = googleLoading || emailLoading
  const isDark = mounted && theme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const switchLanguage = () => {
    router.replace(pathname, { locale: locale === 'fr' ? 'en' : 'fr' })
  }

  return (
    <main className="login-page">
      <div className="login-theme-switch flex gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] text-[var(--mindly-primary)] transition duration-150 hover:-translate-y-px hover:border-[var(--mindly-primary-light)] hover:bg-[var(--mindly-surface)] hover:text-[var(--mindly-primary-dark)]"
          aria-label={!isDark ? copy.themeDarkAria : copy.themeLightAria}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={switchLanguage}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-glass)] text-[var(--mindly-primary)] transition duration-150 hover:-translate-y-px hover:border-[var(--mindly-primary-light)] hover:bg-[var(--mindly-surface)] hover:text-[var(--mindly-primary-dark)]"
          aria-label={copy.switchLanguage}
          title={`${locale.toUpperCase()} — ${copy.switchLanguage}`}
        >
          <Globe className="h-4 w-4" />
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
            <Logo className="h-10 w-auto mx-auto mb-2" />

            <h1 className="login-title">{copy.title}</h1>

            <p className="login-description">{copy.description}</p>
          </div>

          <Button
            variant="outline"
            size="lg"
            disabled={isGoogleDisabled}
            onClick={handleGoogleSignIn}
            type="button"
            className={`login-google-button ${googleLoading ? 'login-google-button-loading' : ''}`}
          >
            {googleLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <span className="login-google-icon">G</span>
            )}
            {googleLoading ? copy.googleLoading : copy.google}
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
                disabled={isSubmitting || !isLoaded}
                id="login-email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={copy.emailPlaceholder}
                type="email"
                value={email}
              />
            </div>

            <div
              className="login-captcha"
              data-cl-language={locale === 'fr' ? 'fr-FR' : 'en-US'}
              data-cl-size="flexible"
              data-cl-theme={isDark ? 'dark' : 'light'}
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
              disabled={isSubmitting || !isLoaded}
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

