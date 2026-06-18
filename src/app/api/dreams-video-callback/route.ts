import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

function getFirstString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim()
  return undefined
}

function normalizeVideoSourceURL(source: string) {
  if (source.startsWith('gs://')) return source
  return source
}

export async function POST(request: Request) {
  const secret = process.env.N8N_CALLBACK_SECRET?.trim()
  const authHeader = request.headers.get('authorization')

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized callback.' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const body = await request.json()
    const {
      dreamId,
      summary,
      analysis,
      videoUrl,
      video_url,
      gcsUri,
      gcs_uri,
      videos,
      operationName,
      operation_name,
      status,
      errorMessage,
      error_message,
    } = body

    if (!dreamId) {
      return Response.json({ error: 'dreamId requis.' }, { status: 400 })
    }

    const rawVideoSource =
      getFirstString(videoUrl) ||
      getFirstString(video_url) ||
      getFirstString(gcsUri) ||
      getFirstString(gcs_uri) ||
      getFirstString(videos?.[0]?.videoUrl) ||
      getFirstString(videos?.[0]?.video_url) ||
      getFirstString(videos?.[0]?.gcsUri) ||
      getFirstString(videos?.[0]?.gcs_uri)

    const normalizedDreamId = Number.isFinite(Number(dreamId)) ? Number(dreamId) : dreamId
    const safeStatus =
      status === 'ready' || status === 'failed' || status === 'generating'
        ? status
        : rawVideoSource
          ? 'ready'
          : 'failed'

    const missingVideoMessage =
      safeStatus === 'failed' && !rawVideoSource
        ? 'Le workflow video a termine sans URL video exploitable.'
        : undefined

    const updatedDream = await payload.update({
      collection: 'dreams',
      id: normalizedDreamId,
      locale: 'fr',
      data: {
        summary: typeof summary === 'string' ? summary : undefined,
        analysis: typeof analysis === 'string' ? analysis : undefined,
        videoUrl: rawVideoSource ? normalizeVideoSourceURL(rawVideoSource) : undefined,
        operationName:
          typeof operationName === 'string'
            ? operationName
            : typeof operation_name === 'string'
              ? operation_name
              : undefined,
        videoStatus: safeStatus,
        errorMessage:
          typeof errorMessage === 'string'
            ? errorMessage
            : typeof error_message === 'string'
              ? error_message
              : missingVideoMessage,
      },
    })

    return Response.json({
      success: true,
      dreamId: updatedDream.id,
      videoStatus: updatedDream.videoStatus,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur interne du callback video.'

    console.error('dreams-video-callback route error:', error)

    return Response.json({ error: message }, { status: 500 })
  }
}
