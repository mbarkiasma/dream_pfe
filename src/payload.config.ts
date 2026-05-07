import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { gcsStorage } from '@payloadcms/storage-gcs'
import { fileURLToPath } from 'url'
import { Header } from '@/Header/config'
import { Footer } from '@/Footer/config'
import { Pages } from './collections/Pages'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { plugins } from './plugins'
import { AnalysePersonnalite } from './collections/AnalysePersonnalite'
import { Dreams } from './collections/Dreams'
import { CoachingSessions } from './collections/CoachingSessions'
import { CoachingMessages } from './collections/CoachingMessages'
import { CoachNotes } from './collections/CoachNotes'
import { PsyAvailabilities } from './collections/PsyAvailabilities'
import { RendezvousPsy } from './collections/RendezvousPsy'
import { Notifications } from './collections/Notifications'
import { AnnonceMotivation } from './collections/AnnonceMotivation'
import { AnnonceMotivationReactions } from './collections/AnnonceMotivationReactions'
import { payloadEndpoints } from './endpoints/payloadEndpoints'
import { CoachingEvents } from './collections/CoachingEvents'
import { CoachingRegistrations } from './collections/CoachingRegistrations'
import { PsyOrientations } from './collections/PsyOrientation'



const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const hasInlineGCSCredentials = Boolean(process.env.GCS_CLIENT_EMAIL && process.env.GCS_PRIVATE_KEY)
const hasRuntimeGCSCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS)
const enableMediaGCSStorage = Boolean(
  process.env.ENABLE_GCS_STORAGE === 'true' &&
  process.env.GCS_BUCKET &&
  process.env.GCS_PROJECT_ID &&
  (hasInlineGCSCredentials || hasRuntimeGCSCredentials),
)
const databaseURL = process.env.DATABASE_URL || ''
const sanitizedDatabaseURL = (() => {
  if (!databaseURL) return ''

  try {
    const url = new URL(databaseURL)
    url.searchParams.delete('sslmode')
    url.searchParams.delete('ssl')
    url.searchParams.delete('sslcert')
    url.searchParams.delete('sslkey')
    url.searchParams.delete('sslrootcert')
    return url.toString()
  } catch {
    return databaseURL
  }
})()
const databaseRequiresSSL =
  /supabase\.com/i.test(databaseURL) ||
  /sslmode=require/i.test(databaseURL) ||
  /[?&]ssl=true/i.test(databaseURL)
const smtpHost = process.env.SMTP_HOST?.trim()
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpSecure = process.env.SMTP_SECURE === 'true'
const smtpUser = process.env.SMTP_USER?.trim()
const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '')

export default buildConfig({
  endpoints: payloadEndpoints,

  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  editor: defaultLexical,
  email: nodemailerAdapter({
    defaultFromAddress:
      process.env.SMTP_FROM_ADDRESS || smtpUser || 'notifications@dream-pfe.local',
    defaultFromName: process.env.SMTP_FROM_NAME || 'Dream PFE',
    transportOptions: smtpHost
      ? {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth:
            smtpUser && smtpPass
              ? {
                  user: smtpUser,
                  pass: smtpPass,
                }
              : undefined,
          tls:
            process.env.SMTP_ALLOW_UNAUTHORIZED === 'true'
              ? {
                  rejectUnauthorized: false,
                }
              : undefined,
        }
      : undefined,
  }),
  db: postgresAdapter({
    blocksAsJSON: true,
    pool: {
      connectionString: sanitizedDatabaseURL,
      ssl: databaseRequiresSSL ? { rejectUnauthorized: false } : undefined,
    },
    push: process.env.NODE_ENV !== 'production',
  }),
  collections: [
    Pages,
    Users,
    Media,
    AnalysePersonnalite,
    Dreams,
    CoachingSessions,
    CoachingMessages,
    CoachNotes,
    PsyAvailabilities,
    RendezvousPsy,
    Notifications,
    AnnonceMotivation,
    AnnonceMotivationReactions,
    CoachingEvents,
    CoachingRegistrations,
    PsyOrientations,
  ],
  globals: [Header, Footer],
  cors: [getServerSideURL()].filter(Boolean),
  plugins: [
    ...plugins,
    gcsStorage({
      enabled: enableMediaGCSStorage,
      collections: {
        media: true,
      },
      bucket: process.env.GCS_BUCKET || '',
      options: {
        apiEndpoint: process.env.GCS_ENDPOINT || undefined,
        credentials:
          process.env.GCS_CLIENT_EMAIL && process.env.GCS_PRIVATE_KEY
            ? {
                client_email: process.env.GCS_CLIENT_EMAIL,
                private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
              }
            : undefined,
        projectId: process.env.GCS_PROJECT_ID,
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
