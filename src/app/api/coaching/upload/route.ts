import { headers as getHeaders } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const MAX_SIZE = 10 * 1024 * 1024 // 10 Mo
const UPLOAD_DIR = process.env.COACHING_UPLOAD_DIR || '/tmp/mindbloom-coaching-uploads'

function sanitizeFilename(filename: string) {
  const extension = path.extname(filename).toLowerCase().slice(0, 12)
  const basename = path
    .basename(filename, extension)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return `${basename || 'fichier'}-${randomUUID()}${extension || '.bin'}`
}

export async function POST(request: Request) {
  const { getPayload } = await import('payload')
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file || !file.size) {
    return Response.json({ error: 'Fichier requis.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'Fichier trop volumineux (max 10 Mo).' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const storedFilename = sanitizeFilename(file.name)
  const diskPath = path.join(UPLOAD_DIR, storedFilename)
  const publicUrl = `/api/coaching/files/${encodeURIComponent(storedFilename)}`

  await mkdir(UPLOAD_DIR, { recursive: true })
  await writeFile(diskPath, buffer)

  return Response.json({
    id: storedFilename,
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    url: publicUrl,
  })
}
