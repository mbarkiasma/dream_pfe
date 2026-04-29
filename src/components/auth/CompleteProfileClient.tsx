'use client'

import { AlertCircle, ArrowRight, Loader2, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type CompleteProfileClientProps = {
  defaultFirstName?: string
  defaultLastName?: string
}

export function CompleteProfileClient({
  defaultFirstName = '',
  defaultLastName = '',
}: CompleteProfileClientProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(defaultFirstName)
  const [lastName, setLastName] = useState(defaultLastName)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()

    setErrorMessage('')

    if (!cleanFirstName || !cleanLastName) {
      setErrorMessage('Veuillez renseigner votre prenom et votre nom.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: cleanFirstName,
          lastName: cleanLastName,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error || 'Profil impossible a mettre a jour.')
      }

      router.replace('/entretien')
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#F1E7FF_0%,#F8F3FF_34%,#EEF4FF_70%,#FFF7FB_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
        <section className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_28px_90px_rgba(82,45,145,0.18)] backdrop-blur-xl sm:p-8">
          <div className="mb-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white shadow-[0_12px_28px_rgba(139,92,246,0.24)]">
              <UserRound className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-500">
              Profil etudiant
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-[#2d1068]">
              Completez votre profil
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#6E628F]">
              Ces informations seront utilisees dans votre dashboard, vos rapports et votre suivi.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-[#2d1068]" htmlFor="firstName">
                  Prenom
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-2xl border border-violet-100 bg-white px-4 text-[#2d1068] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition placeholder:text-[#9A8BB7] focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  disabled={isSubmitting}
                  id="firstName"
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Votre prenom"
                  type="text"
                  value={firstName}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2d1068]" htmlFor="lastName">
                  Nom
                </label>
                <input
                  className="mt-2 h-12 w-full rounded-2xl border border-violet-100 bg-white px-4 text-[#2d1068] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition placeholder:text-[#9A8BB7] focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                  disabled={isSubmitting}
                  id="lastName"
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Votre nom"
                  type="text"
                  value={lastName}
                />
              </div>
            </div>

            {errorMessage ? (
              <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                {errorMessage}
              </div>
            ) : null}

            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(139,92,246,0.28)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
              Continuer vers mon dashboard
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
