'use client'

export function PrintPdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-foreground dark:text-background"
    >
      Telecharger / Imprimer en PDF
    </button>
  )
}
