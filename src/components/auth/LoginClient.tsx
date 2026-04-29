'use client'

import { useSignIn, useSignUp, useUser } from '@clerk/nextjs'
import { AlertCircle, CheckCircle2, Loader2, Mail, MailCheck, Moon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'errors' in error &&
    Array.isArray((error as { errors?: unknown }).errors)
  ) {
    const firstError = (error as { errors: Array<{ longMessage?: string; message?: string }> })
      .errors[0]

    return firstError?.longMessage || firstError?.message || 'Une erreur est survenue.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Une erreur est survenue.'
}

function isAccountNotFoundError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const clerkError = error as { code?: string; longMessage?: string; message?: string }
  const message = `${clerkError.longMessage || ''} ${clerkError.message || ''}`.toLowerCase()

  return (
    clerkError.code === 'form_identifier_not_found' ||
    clerkError.code === 'identifier_not_found' ||
    message.includes("couldn't find your account") ||
    message.includes('could not find your account')
  )
}

export function LoginClient() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const { signIn, fetchStatus } = useSignIn()
  const { signUp } = useSignUp()
  const [email, setEmail] = useState('')
  const [successEmail, setSuccessEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  useEffect(() => {
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

    if (!signIn) return

    const cleanEmail = email.trim().toLowerCase()

    setErrorMessage('')
    setSuccessEmail('')

    if (!cleanEmail) {
      setErrorMessage('Veuillez saisir votre adresse email.')
      return
    }

    setEmailLoading(true)

    try {
      const sendSignUpLink = async (fallbackError?: { longMessage?: string; message?: string }) => {
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
      }

      const { error: createError } = await signIn.create({
        identifier: cleanEmail,
        signUpIfMissing: true,
      })

      if (createError) {
        if (isAccountNotFoundError(createError)) {
          await sendSignUpLink(createError)
          return
        }

        setErrorMessage(createError.longMessage || createError.message || 'Email non valide.')
        return
      }

      const { error: linkError } = await signIn.emailLink.sendLink({
        emailAddress: cleanEmail,
        verificationUrl: `${window.location.origin}/auth/verify-email`,
      })

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
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#f4ecff_0%,#fbf8ff_46%,#f7f2ff_100%)] px-4 py-8 sm:px-6">
      <section className="w-full max-w-[460px] rounded-[32px] border border-violet-100/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(124,58,237,0.12)] backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-400 text-white shadow-[0_18px_36px_rgba(167,139,250,0.34)]">
            <Moon className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-400">
            Dream PFE
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-[#2d1068]">
            Connectez-vous
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#6E628F]">
            Accedez a votre espace personnel avec Google ou un lien magique securise.
          </p>
        </div>

        <button
          className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-violet-100 bg-white text-sm font-semibold text-[#2d1068] shadow-[0_12px_30px_rgba(139,92,246,0.08)] transition hover:border-violet-200 hover:bg-[#fbf8ff] focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting || !signIn}
          onClick={handleGoogleSignIn}
          type="button"
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-lg font-bold text-[#4285F4]">
              G
            </span>
          )}
          Continuer avec Google
        </button>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-violet-100" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#9A8BB7]">
            ou
          </span>
          <div className="h-px flex-1 bg-violet-100/80" />
        </div>

        <form className="space-y-4" onSubmit={handleEmailLinkSubmit}>
          <label className="block text-sm font-semibold text-[#2d1068]" htmlFor="login-email">
            Adresse email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9A8BB7]" />
            <input
              className="h-12 w-full rounded-2xl border border-violet-100 bg-white pl-12 pr-4 text-[#2d1068] outline-none shadow-[0_8px_22px_rgba(139,92,246,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] transition placeholder:text-[#A99AC5] focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              disabled={isSubmitting || !signIn}
              id="login-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="votre@email.com"
              type="email"
              value={email}
            />
          </div>

          <div
            className="flex justify-center"
            data-cl-language="fr-FR"
            data-cl-size="flexible"
            data-cl-theme="light"
            id="clerk-captcha"
          />

          {errorMessage ? (
            <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              {errorMessage}
            </div>
          ) : null}

          {successEmail ? (
            <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              Lien envoye a {successEmail}. Ouvrez votre boite mail pour terminer la connexion.
            </div>
          ) : null}

          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-violet-500 to-fuchsia-400 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(167,139,250,0.32)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting || !signIn}
            type="submit"
          >
            {emailLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MailCheck className="h-5 w-5" />
            )}
            Recevoir mon lien magique
          </button>
        </form>
      </section>
    </main>
  )
}
