'use client'

type PrintPdfButtonProps = {
  analysisId: string | number
}

export function PrintPdfButton({ analysisId }: PrintPdfButtonProps) {
  return (
    <a href={`/api/analysis-pdf/${analysisId}`} className="mindly-btn mindly-btn-primary">
      Télécharger le PDF
    </a>
  )
}
