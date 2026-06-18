import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const UPLOAD_DIR = process.env.COACHING_UPLOAD_DIR || '/tmp/mindbloom-coaching-uploads'

type RouteContext = {
  params: Promise<{
    filename: string
  }>
}

function getContentType(filename: string) {
  const extension = path.extname(filename).toLowerCase()

  if (extension === '.png') return 'image/png'
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  if (extension === '.webp') return 'image/webp'
  if (extension === '.gif') return 'image/gif'
  if (extension === '.pdf') return 'application/pdf'
  if (extension === '.txt') return 'text/plain; charset=utf-8'
  if (extension === '.doc') return 'application/msword'
  if (extension === '.docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  if (extension === '.xls') return 'application/vnd.ms-excel'
  if (extension === '.xlsx') {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }
  if (extension === '.zip') return 'application/zip'

  return 'application/octet-stream'
}

export async function GET(_: Request, context: RouteContext) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { filename } = await context.params
  const safeFilename = path.basename(decodeURIComponent(filename))
  const uploadDir = path.resolve(UPLOAD_DIR)
  const filePath = path.resolve(uploadDir, safeFilename)

  if (!filePath.startsWith(`${uploadDir}${path.sep}`)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const file = await readFile(filePath)

    return new Response(file, {
      headers: {
        'Cache-Control': 'private, max-age=3600',
        'Content-Type': getContentType(safeFilename),
      },
    })
  } catch {
    return new Response('File not found', { status: 404 })
  }
}
