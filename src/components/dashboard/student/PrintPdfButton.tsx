'use client'

export function PrintPdfButton() {
  return (
    <button type="button" onClick={() => window.print()} className="mindly-btn mindly-btn-primary">
      Télécharger / Imprimer en PDF
    </button>
  )
}