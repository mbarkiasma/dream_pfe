import { pdf } from '@react-pdf/renderer'
import config from '@payload-config'
import { getPayload } from 'payload'

import { AnalysisPdfDocument } from '@/components/dashboard/student/AnalysisPdfDocument'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import { getReportWellbeingTheme } from '@/utilities/getReportWellbeingTheme'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type SupportedLocale = 'fr' | 'en'

function formatAnalysisDate(value: string, locale: SupportedLocale) {
  return new Date(value).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params
  const url = new URL(request.url)
  const rawLocale = url.searchParams.get('locale')
  const locale: SupportedLocale = rawLocale === 'en' ? 'en' : 'fr'

  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const analyse = await payload.findByID({
    collection: 'analyse-personnalite',
    id,
    user,
    overrideAccess: false,
    locale,
    fallbackLocale: 'fr',
  })

  if (!analyse) {
    return new Response('Analyse introuvable', { status: 404 })
  }

  const document = (
    <AnalysisPdfDocument
      analyse={analyse}
      date={formatAnalysisDate(analyse.date, locale)}
      reportWellbeing={getReportWellbeingTheme(analyse.traits)}
      locale={locale}
    />
  )
  const stream = await pdf(document).toBuffer()
  const chunks: Buffer[] = []

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const buffer = Buffer.concat(chunks)
  const filename = `${analyse.reference || 'rapport-mindbloom'}.pdf`

  return new Response(buffer, {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(buffer.byteLength),
      'Content-Type': 'application/pdf',
    },
  })
}
