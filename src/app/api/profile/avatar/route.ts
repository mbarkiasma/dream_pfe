import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData().catch(() => null)
  const file = formData?.get('file')

  if (!file || !(file instanceof Blob)) {
    return Response.json({ error: 'Fichier requis.' }, { status: 400 })
  }

  const mimeType = file.type
  if (!mimeType.startsWith('image/')) {
    return Response.json({ error: 'Le fichier doit être une image.' }, { status: 400 })
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return Response.json({ error: 'Image trop volumineuse (5 Mo max).' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const originalName = (file as File).name || `avatar-${user.id}.jpg`
  const extension = originalName.split('.').pop() || 'jpg'
  const fileName = `avatar-${user.id}-${Date.now()}.${extension}`

  const media = await payload.create({
    collection: 'media',
    data: {
      alt: `Avatar de ${user.firstName || user.email}`,
      owner: user.id,
    },
    file: {
      data: Buffer.from(arrayBuffer),
      mimetype: mimeType,
      name: fileName,
      size: file.size,
    },
    req: { user } as any,
  })

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { avatar: media.id },
    req: { user } as any,
  })

  return Response.json({ url: media.url })
}
