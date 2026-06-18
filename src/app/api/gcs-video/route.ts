import { Storage } from '@google-cloud/storage'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

function getGCSStorage() {
  const clientEmail = process.env.GCS_CLIENT_EMAIL
  const privateKey = process.env.GCS_PRIVATE_KEY?.trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\\n/g, '\n')
  const projectId = process.env.GCS_PROJECT_ID

  if (clientEmail && privateKey) {
    return new Storage({ credentials: { client_email: clientEmail, private_key: privateKey }, projectId })
  }

  return new Storage({ projectId })
}

function getPublicGCSURL(bucket: string, path: string) {
  return `https://storage.googleapis.com/${encodeURIComponent(bucket)}/${path
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')}`
}

function copyHeader(source: Headers, target: Record<string, string>, name: string) {
  const value = source.get(name)
  if (value) target[name] = value
}

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const bucket = searchParams.get('bucket')
  const path = searchParams.get('path')

  if (!bucket || !path) {
    return new Response('Missing bucket or path', { status: 400 })
  }

  const requestRange = request.headers.get('range')
  const publicResponse = await fetch(getPublicGCSURL(bucket, path), {
    headers: requestRange ? { Range: requestRange } : undefined,
  })

  if (publicResponse.ok || publicResponse.status === 206) {
    const responseHeaders: Record<string, string> = {
      'Cache-Control': 'private, max-age=3600',
      'Content-Type': publicResponse.headers.get('content-type') || 'video/mp4',
    }

    copyHeader(publicResponse.headers, responseHeaders, 'accept-ranges')
    copyHeader(publicResponse.headers, responseHeaders, 'content-length')
    copyHeader(publicResponse.headers, responseHeaders, 'content-range')

    return new Response(publicResponse.body, {
      headers: responseHeaders,
      status: publicResponse.status,
    })
  }

  if (publicResponse.status === 404) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const storage = getGCSStorage()
    const file = storage.bucket(bucket).file(path)
    const [exists] = await file.exists()

    if (!exists) {
      return new Response('Not found', { status: 404 })
    }

    const [metadata] = await file.getMetadata()
    const contentType = (metadata.contentType as string | undefined) || 'video/mp4'
    const contentLength = metadata.size ? String(metadata.size) : undefined

    const stream = file.createReadStream()
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => controller.enqueue(chunk))
        stream.on('end', () => controller.close())
        stream.on('error', (err) => controller.error(err))
      },
    })

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
    }
    if (contentLength) headers['Content-Length'] = contentLength

    return new Response(webStream, { headers })
  } catch (error) {
    console.error('gcs-video error:', error)
    return new Response('Failed to fetch video', { status: 500 })
  }
}
