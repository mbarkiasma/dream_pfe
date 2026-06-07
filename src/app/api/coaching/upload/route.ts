import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

const MAX_SIZE = 10 * 1024 * 1024 // 10 Mo

export async function POST(request: Request) {
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

  const media = await payload.create({
    collection: 'media',
    data: {
      alt: file.name,
      owner: user.id,
    },
    file: {
      data: buffer,
      mimetype: file.type || 'application/octet-stream',
      name: file.name,
      size: file.size,
    },
  })

  return Response.json({
    id: media.id,
    filename: media.filename,
    mimeType: media.mimeType,
    url: media.url,
  })
}
