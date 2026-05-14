'use client'

import { useSignIn, useSignUp, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Loader2, Mail, MailCheck, Moon } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
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

export function LoginClient({ initialMessage = '' }: LoginClientProps) {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const { signIn, fetchStatus } = useSignIn()
  const { signUp } = useSignUp()
  const { setTheme, theme } = useTheme()
  const [email, setEmail] = useState('')
  const [successEmail, setSuccessEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState(initialMessage)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.assign('/auth/redirect')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setTheme('light')
    }
  }, [isLoaded, isSignedIn, setTheme])

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
        setErrorMessage(error.longMessage || error.message || 'Connexion Google impossible.')
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
      setErrorMessage('Veuillez saisir votre adresse email.')
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
              'Email non valide.',
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
              "Impossible d'envoyer le lien magique.",
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

        setErrorMessage(createError.longMessage || createError.message || 'Email non valide.')
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
          linkError.longMessage || linkError.message || "Impossible d'envoyer le lien magique.",
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

  return (
    <main className="login-page">
      <div className="login-theme-switch">
        <span className="login-theme-label">Thème</span>
        <ThemeToggle className="login-theme-toggle" />
      </div>

      <section className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <Moon />
          </div>

          <p className="login-eyebrow">Dream PFE</p>

          <h1 className="login-title">Connectez-vous</h1>

          <p className="login-description">
            Accedez a votre espace personnel avec Google ou un lien magique securise.
          </p>
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
          Continuer avec Google
        </Button>

        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">ou</span>
          <div className="login-divider-line" />
        </div>

        <form className="login-form" onSubmit={handleEmailLinkSubmit}>
          <label className="login-label" htmlFor="login-email">
            Adresse email
          </label>

          <div className="login-input-wrap">
            <Mail className="login-input-icon" />

            <input
              className="login-input"
              disabled={isSubmitting || !signIn || !signUp}
              id="login-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="votre@email.com"
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
              Lien envoye a {successEmail}. Ouvrez votre boite mail pour terminer la connexion.
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
            Recevoir mon lien magique
          </Button>
        </form>
      </section>
    </main>
  )
}
