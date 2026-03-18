import Link from 'next/link'
import {
  CalendarDays,
  FileText,
  Home,
  Moon,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StudentDreamsBlockProps = {
  title?: string
  description?: string
}

const dreams = [
  {
    title: 'Aucun rêve enregistré',
    date: '--',
    tags: ['Journal vide'],
    summary:
      'Les rêves ajoutés par l’étudiant apparaîtront ici automatiquement dans cette liste.',
  },
]

export default function StudentDreamsBlockComponent({
  title,
  description,
}: StudentDreamsBlockProps) {
  return (
    <section className="min-h-screen w-full bg-[#edf2ff] p-4 md:p-6">
      <div className="flex min-h-[calc(100vh-2rem)] w-full gap-6 md:min-h-[calc(100vh-3rem)]">
        <aside className="hidden min-h-full w-24 flex-col items-center rounded-[32px] bg-gradient-to-b from-[#7c83fd] via-[#8b8ff8] to-[#a5b4fc] py-6 shadow-[0_20px_60px_rgba(124,131,253,0.25)] md:flex">
          <div className="flex flex-1 flex-col items-center justify-center gap-5">
            <Link
              href="/dashboard-tudiant"
              title="Dashboard"
              className="rounded-2xl bg-white/20 p-3 text-white transition hover:bg-white/30"
            >
              <Home className="h-5 w-5" />
            </Link>

            <Link
              href="/mes-rves"
              title="Mes rêves"
              className="rounded-2xl bg-white/25 p-3 text-white transition hover:bg-white/35"
            >
              <Moon className="h-5 w-5" />
            </Link>

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

        <div className="grid min-h-full flex-1 gap-6 xl:grid-cols-[1fr_320px]">
          <div className="rounded-[36px] border border-white/50 bg-white/55 p-5 shadow-[0_20px_80px_rgba(148,163,184,0.15)] backdrop-blur-xl md:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                  {title || 'Mes rêves'}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
                  {description ||
                    'Consulte et organise les rêves enregistrés dans votre journal.'}
                </p>
              </div>

              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:opacity-95">
                <Plus className="h-4 w-4" />
                Nouveau rêve
              </button>
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
              <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">Rechercher un rêve...</span>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/85 px-4 py-3 text-sm text-slate-500 shadow-sm">
                Tous les tags
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/85 px-4 py-3 text-sm text-slate-500 shadow-sm">
                Toutes les émotions
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              {['Tous', 'Cauchemar', 'Fantaisie', 'Examens', 'Aventure', 'Stress'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/80 px-4 py-2 text-sm text-slate-500 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="space-y-5">
              {dreams.map((dream, index) => (
                <Card
                  key={`${dream.title}-${index}`}
                  className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]"
                >
                  <CardContent className="p-5">
                    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                      <div className="flex h-44 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#c7d2fe] via-[#ddd6fe] to-[#e0e7ff] shadow-inner">
                        <p className="px-4 text-center text-sm font-medium text-slate-500">
                          Aucun visuel disponible
                        </p>
                      </div>

                      <div>
                        <div className="mb-3">
                          <h3 className="text-2xl font-semibold text-slate-800">
                            {dream.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">{dream.date}</p>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                          {dream.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <p className="leading-7 text-slate-600">{dream.summary}</p>

                        <div className="mt-5">
                          <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
                            En attente de contenu
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] border border-white/50 bg-gradient-to-br from-[#7c83fd] via-[#8b8ff8] to-[#a5b4fc] p-5 text-white shadow-[0_20px_60px_rgba(124,131,253,0.25)] md:p-6">
            <div className="mb-6 rounded-[24px] bg-white/10 p-5 backdrop-blur">
              <h2 className="text-xl font-semibold">Aperçu des rêves</h2>
              <p className="mt-2 text-sm text-white/80">
                Cette zone affichera des statistiques automatiques lorsque le backend sera prêt.
              </p>
            </div>

            <div className="space-y-5">
              <div className="rounded-[24px] bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-white/80">Rêves ce mois</p>
                <p className="mt-2 text-3xl font-bold">--</p>
              </div>

              <div className="rounded-[24px] bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-white/80">Cauchemars</p>
                <p className="mt-2 text-3xl font-bold">--</p>
              </div>

              <div className="rounded-[24px] bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-white/80">Émotion fréquente</p>
                <p className="mt-2 text-2xl font-semibold">--</p>
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-indigo-600 shadow-sm transition hover:bg-slate-50">
                <Sparkles className="h-4 w-4" />
                Voir les analyses
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}