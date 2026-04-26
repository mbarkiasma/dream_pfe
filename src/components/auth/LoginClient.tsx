'use client'

import { useSignIn, useUser } from '@clerk/nextjs'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  MailCheck,
  Moon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
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

export function LoginClient() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const { signIn, fetchStatus } = useSignIn()
  const [email, setEmail] = useState('')
  const [successEmail, setSuccessEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/auth/redirect')
    }
  }, [isLoaded, isSignedIn, router])

  async function handleGoogleSignIn() {
    if (!signIn) return

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
      const { error: createError } = await signIn.create({
        identifier: cleanEmail,
        signUpIfMissing: true,
      })

      if (createError) {
        setErrorMessage(createError.longMessage || createError.message || 'Email non valide.')
        return
      }

      const { error: linkError } = await signIn.emailLink.sendLink({
        emailAddress: cleanEmail,
        verificationUrl: `${window.location.origin}/auth/verify-email`,
      })

      if (linkError) {
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
          router.replace('/auth/redirect')
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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#F1E7FF_0%,#F8F3FF_34%,#EEF4FF_70%,#FFF7FB_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_470px] lg:items-center">
          <section className="relative mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-semibold text-[#6D28D9] shadow-[0_12px_34px_rgba(109,40,217,0.10)] backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Espace securise Dream
            </div>

            <h1 className="text-4xl font-bold leading-tight text-[#2d1068] sm:text-5xl lg:text-6xl">
              Votre espace d'accompagnement, pret quand vous l'etes.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-[#6E628F] sm:text-lg lg:mx-0">
              Connectez-vous avec Google ou recevez un lien magique par email pour rejoindre votre
              dashboard personnel.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
              {[
                { icon: Moon, label: 'Reves', text: 'Suivi clair' },
                { icon: MailCheck, label: 'Magic link', text: 'Email securise' },
                { icon: LockKeyhole, label: 'Roles', text: 'Acces protege' },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <div
                    className="rounded-[24px] border border-white/70 bg-white/65 p-4 text-left shadow-[0_16px_42px_rgba(109,40,217,0.09)] backdrop-blur"
                    key={item.label}
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white shadow-[0_10px_24px_rgba(139,92,246,0.22)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-[#2d1068]">{item.label}</p>
                    <p className="mt-1 text-sm text-[#7A6A99]">{item.text}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 hidden items-center gap-3 text-sm font-medium text-[#6E628F] lg:flex">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Clerk authentifie, Payload protege votre espace.
              <ArrowRight className="h-4 w-4 text-violet-500" />
            </div>
          </section>

          <section className="flex justify-center">
            <div className="w-full max-w-[470px] rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_28px_90px_rgba(82,45,145,0.18)] backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white shadow-[0_12px_28px_rgba(139,92,246,0.24)]">
                  <Moon className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-bold leading-tight text-[#2d1068]">
                  Connexion Dream PFE
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6E628F]">
                  Choisissez Google ou recevez un lien magique sécurisé.
                </p>
              </div>

              <button
                className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-violet-100 bg-white text-sm font-semibold text-[#2d1068] shadow-[0_10px_26px_rgba(109,40,217,0.08)] transition hover:bg-[#F8F3FF] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting || !signIn}
                onClick={handleGoogleSignIn}
                type="button"
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                ) : (
                  <span className="text-lg font-bold text-[#4285F4]">G</span>
                )}
                Continuer avec Google
              </button>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-violet-100" />
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#9A8BB7]">
                  ou
                </span>
                <div className="h-px flex-1 bg-violet-100" />
              </div>

              <form className="space-y-4" onSubmit={handleEmailLinkSubmit}>
                <label className="block text-sm font-semibold text-[#2d1068]" htmlFor="login-email">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9A8BB7]" />
                  <input
                    className="h-12 w-full rounded-2xl border border-violet-100 bg-white pl-12 pr-4 text-[#2d1068] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition placeholder:text-[#9A8BB7] focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                    disabled={isSubmitting || !signIn}
                    id="login-email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="votre@email.com"
                    type="email"
                    value={email}
                  />
                </div>

                {errorMessage ? (
                  <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    {errorMessage}
                  </div>
                ) : null}

                {successEmail ? (
                  <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    Lien envoyé à {successEmail}. Ouvrez votre boite mail pour terminer la connexion.
                  </div>
                ) : null}

                <button
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(139,92,246,0.28)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting || !signIn}
                  type="submit"
                >
                  {emailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MailCheck className="h-5 w-5" />}
                  Recevoir mon lien magique
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
