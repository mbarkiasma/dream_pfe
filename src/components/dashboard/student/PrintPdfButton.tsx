'use client'

import { useTranslations } from 'next-intl'

type PrintPdfButtonProps = {
  analysisId: string | number
}

export function PrintPdfButton({ analysisId }: PrintPdfButtonProps) {
  const t = useTranslations('dashboard.student.analyses')

  return (
    <a href={`/api/analysis-pdf/${analysisId}`} className="mindly-btn mindly-btn-primary">
      {t('downloadPdf')}
    </a>
  )
}
