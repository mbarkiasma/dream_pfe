import { Search, Plus } from 'lucide-react'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent } from '@/components/ui/card'

const dreamTags = ['Tous', 'Cauchemar', 'Fantaisie', 'Examens', 'Aventure', 'Stress']

export default function StudentDreamsPage() {
  return (
    <div>
      <StudentTopbar
        title="Mes rêves"
        description="Consulte et organise les rêves enregistrés dans votre journal."
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">Rechercher un rêve...</span>
        </div>

        <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-4 py-3 text-sm font-medium text-white shadow-md transition hover:opacity-95">
          <Plus className="h-4 w-4" />
          Nouveau rêve
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {dreamTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-white/80 px-4 py-2 text-sm text-slate-500 shadow-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_8px_30px_rgba(148,163,184,0.12)]">
        <CardContent className="p-6">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            <div className="flex h-44 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#c7d2fe] via-[#ddd6fe] to-[#e0e7ff] shadow-inner">
              <p className="px-4 text-center text-sm font-medium text-slate-500">
                Aucun visuel disponible
              </p>
            </div>

            <div>
              <div className="mb-3">
                <h3 className="text-2xl font-semibold text-slate-800">
                  Aucun rêve enregistré
                </h3>
                <p className="mt-1 text-sm text-slate-500">--</p>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                  Journal vide
                </span>
              </div>

              <p className="leading-7 text-slate-600">
                Les rêves ajoutés par l’étudiant apparaîtront ici automatiquement dans cette liste.
              </p>

              <div className="mt-5">
                <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
                  En attente de contenu
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}