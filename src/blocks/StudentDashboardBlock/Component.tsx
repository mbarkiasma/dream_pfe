import Link from 'next/link'
import { CalendarDays, FileText, Home, Moon, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StudentDashboardBlockProps = {
  title?: string
  welcomeMessage?: string
}

const stats = [
  { label: 'Mes rêves', value: '--', hint: 'Données dynamiques' },
  { label: 'Mes analyses', value: '--', hint: 'Données dynamiques' },
  { label: 'Rendez-vous', value: '--', hint: 'Données dynamiques' },
]

export default function StudentDashboardBlockComponent({
  title,
  welcomeMessage,
}: StudentDashboardBlockProps) {
  return (
    <section className="min-h-screen w-full bg-[#edf2ff] p-4 md:p-6">
      <div className="flex min-h-[calc(100vh-2rem)] w-full gap-6 md:min-h-[calc(100vh-3rem)]">
        <aside className="hidden min-h-full w-24 flex-col items-center rounded-[32px] bg-gradient-to-b from-[#7c83fd] via-[#8b8ff8] to-[#a5b4fc] py-6 shadow-[0_20px_60px_rgba(124,131,253,0.25)] md:flex">
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <Link
              href="/dashboard-tudiant"
              title="Dashboard"
              className="rounded-2xl bg-white/25 p-3 text-white transition hover:bg-white/35"
            >
              <Home className="h-5 w-5" />
            </Link>

            <button
              type="button"
              title="Mes rêves"
              className="cursor-default rounded-2xl bg-white/20 p-3 text-white/90"
            >
              <Moon className="h-5 w-5" />
            </button>

            <button
              type="button"
              title="Mes analyses"
              className="cursor-default rounded-2xl bg-white/20 p-3 text-white/90"
            >
              <FileText className="h-5 w-5" />
            </button>

            <button
              type="button"
              title="Rendez-vous"
              className="cursor-default rounded-2xl bg-white/20 p-3 text-white/90"
            >
              <CalendarDays className="h-5 w-5" />
            </button>
          </div>
        </aside>

        <div className="min-h-full flex-1 rounded-[36px] border border-white/50 bg-white/55 p-5 shadow-[0_20px_80px_rgba(148,163,184,0.15)] backdrop-blur-xl md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              {title || 'Dashboard Étudiant'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
              {welcomeMessage ||
                'Bienvenue dans votre espace personnel de suivi des rêves et du bien-être.'}
            </p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stats.map((item) => (
              <Card
                key={item.label}
                className="rounded-[24px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]"
              >
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-800">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)] xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-slate-800">Mon dernier rêve</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="mb-5 flex h-56 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#c7d2fe] via-[#ddd6fe] to-[#e0e7ff] shadow-inner">
                  <p className="text-sm font-medium text-slate-500">
                    Aucun rêve enregistré pour le moment
                  </p>
                </div>

                <h3 className="text-2xl font-semibold text-slate-800">Aucun contenu</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Les données apparaîtront après l’ajout de vos rêves.
                </p>

                <p className="mt-4 leading-7 text-slate-600">
                  Cette section affichera automatiquement le dernier rêve enregistré par l’étudiant.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-slate-800">Analyse IA</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                      En attente
                    </span>
                  </div>

                  <p className="leading-7 text-slate-600">
                    Les analyses seront générées et affichées ici automatiquement après traitement.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-slate-800">Prochain rendez-vous</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-lg font-semibold text-slate-800">Aucun rendez-vous planifié</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Les séances confirmées apparaîtront ici automatiquement.
                  </p>
                  <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    En attente
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-white/60 bg-gradient-to-br from-white to-violet-50 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-slate-800">Conseil du jour</CardTitle>
                </CardHeader>

                <CardContent className="flex items-start gap-3">
                  <div className="rounded-2xl bg-violet-100 p-2">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                  </div>
                  <p className="leading-7 text-slate-600">
                    Note tes émotions du matin pour mieux comprendre le lien entre ton état intérieur et tes rêves.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}