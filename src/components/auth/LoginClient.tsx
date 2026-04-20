'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'

type LoginResponse = {
  user?: {
    role?: string | null
  }
  errors?: { message?: string }[]
  message?: string
}

function getDashboardPath(role: string | null | undefined) {
  if (role === 'coach') return '/dashboard/coach'
  if (role === 'psy') return '/dashboard/psy'
  return '/dashboard/student'
}

export function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const urlError = searchParams.get('error')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError('Email et mot de passe sont obligatoires.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as LoginResponse

      if (!response.ok) {
        throw new Error(
          data.errors?.[0]?.message || data.message || 'Email ou mot de passe incorrect.',
        )
      }

      router.push(getDashboardPath(data.user?.role))
      router.refresh()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Connexion impossible.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#F1E7FF_0%,#F8F3FF_34%,#EEF4FF_70%,#FFF7FB_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_440px] lg:items-center">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-[#6D28D9] shadow-[0_12px_34px_rgba(109,40,217,0.10)]">
                <ShieldCheck className="h-4 w-4" />
                Espace securise Dream
              </div>
              <h1 className="text-5xl font-bold leading-tight text-[#2d1068]">
                Connectez-vous a votre espace d'accompagnement.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-[#6E628F]">
                Une seule page pour acceder au dashboard etudiant, coach ou psychologue selon le
                role du compte.
              </p>
            </div>
          </section>

          <section className="rounded-[36px] border border-white/70 bg-white/75 p-6 shadow-[0_30px_90px_rgba(109,40,217,0.18)] backdrop-blur-xl md:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#9B6BFF]">
                Connexion
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#2d1068]">Bienvenue</h2>
              <p className="mt-2 text-sm leading-6 text-[#7A6A99]">
                Entrez les informations du compte a tester.
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#4B3F72]">Email</span>
                <span className="flex items-center gap-3 rounded-[22px] border border-violet-100 bg-white/85 px-4 py-3 text-[#4B3F72] focus-within:border-violet-300">
                  <Mail className="h-5 w-5 text-[#9B6BFF]" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#A99BC5]"
                    placeholder="coach@example.com"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#4B3F72]">
                  Mot de passe
                </span>
                <span className="flex items-center gap-3 rounded-[22px] border border-violet-100 bg-white/85 px-4 py-3 text-[#4B3F72] focus-within:border-violet-300">
                  <LockKeyhole className="h-5 w-5 text-[#9B6BFF]" />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#A99BC5]"
                    placeholder="Votre mot de passe"
                  />
                </span>
              </label>

              {error || urlError ? (
                <p className="rounded-[20px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                  {error || 'Lien invalide ou session expiree. Reconnectez-vous.'}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_34px_rgba(139,92,246,0.28)] transition hover:from-violet-600 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
