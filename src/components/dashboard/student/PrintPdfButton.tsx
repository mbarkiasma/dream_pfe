'use client'

import { useLocale, useTranslations } from 'next-intl'

type PrintPdfButtonProps = {
  analysisId: string | number
}

export function PrintPdfButton({ analysisId }: PrintPdfButtonProps) {
  const t = useTranslations('dashboard.student.analyses')
  const locale = useLocale()

  return (
    <a href={`/api/analysis-pdf/${analysisId}?locale=${locale}`} className="mindly-btn mindly-btn-primary">
      {t('downloadPdf')}
    </a>
  )
}
