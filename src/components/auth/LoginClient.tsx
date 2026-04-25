'use client'

import { SignIn, useUser } from '@clerk/nextjs'
import { ArrowRight, LockKeyhole, MailCheck, Moon, ShieldCheck, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function LoginClient() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/auth/redirect')
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#F1E7FF_0%,#F8F3FF_34%,#EEF4FF_70%,#FFF7FB_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <style jsx global>{`
        .dream-login-clerk .cl-footer,
        .dream-login-clerk .cl-footerPages,
        .dream-login-clerk .cl-footerAction,
        .dream-login-clerk .cl-internal-b3fm6y,
        .dream-login-clerk [data-localization-key='signIn.start.actionText'],
        .dream-login-clerk [data-localization-key='signIn.start.actionLink'] {
          display: none !important;
        }

        .dream-login-clerk .cl-cardBox {
          overflow: hidden;
        }
      `}</style>
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

          <section className="dream-login-clerk flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'w-full max-w-[470px]',
                  cardBox: 'w-full rounded-[32px] shadow-none',
                  card: 'w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/80 px-6 py-7 shadow-[0_28px_90px_rgba(82,45,145,0.18)] backdrop-blur-xl sm:px-8',
                  header: 'mb-6 text-left',
                  headerTitle: 'text-[28px] font-bold leading-tight text-[#2d1068]',
                  headerSubtitle: 'mt-2 text-sm leading-6 text-[#6E628F]',
                  socialButtonsBlockButton:
                    'h-12 rounded-2xl border border-violet-100 bg-white text-[#2d1068] shadow-[0_10px_26px_rgba(109,40,217,0.08)] transition hover:bg-[#F8F3FF]',
                  socialButtonsBlockButtonText: 'text-sm font-semibold',
                  dividerLine: 'bg-violet-100',
                  dividerText: 'px-3 text-xs font-medium uppercase tracking-[0.18em] text-[#9A8BB7]',
                  formFieldLabel: 'text-sm font-semibold text-[#2d1068]',
                  formFieldInput:
                    'h-12 rounded-2xl border border-violet-100 bg-white px-4 text-[#2d1068] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition placeholder:text-[#9A8BB7] focus:border-violet-300 focus:ring-4 focus:ring-violet-100',
                  formButtonPrimary:
                    'h-12 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(139,92,246,0.28)] transition hover:opacity-95',
                  footer: 'hidden',
                  footerPages: 'hidden',
                  footerAction: 'hidden',
                  footerActionText: 'text-sm text-[#6E628F]',
                  footerActionLink: 'text-sm font-semibold text-violet-600 hover:text-violet-700',
                  identityPreview: 'rounded-2xl border border-violet-100 bg-[#F8F3FF]',
                  formResendCodeLink: 'font-semibold text-violet-600',
                },
                layout: {
                  socialButtonsPlacement: 'top',
                },
                variables: {
                  borderRadius: '24px',
                  colorBackground: 'rgba(255,255,255,0.82)',
                  colorDanger: '#DC2626',
                  colorInputBackground: '#FFFFFF',
                  colorInputText: '#2d1068',
                  colorPrimary: '#8B5CF6',
                  colorText: '#2d1068',
                  colorTextSecondary: '#6E628F',
                },
              }}
              fallbackRedirectUrl="/auth/redirect"
              forceRedirectUrl="/auth/redirect"
              path="/login"
              routing="path"
            />
          </section>
        </div>
      </div>
    </main>
  )
}
