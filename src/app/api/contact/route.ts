import nodemailer from 'nodemailer'

type ContactBody = {
  prenom?: string
  nom?: string
  email?: string
  subject?: string
  message?: string
}

const recipientEmail = 'adminpfe0@gmail.com'

const subjectLabels: Record<string, string> = {
  access: "Probleme d'acces",
  bug: 'Bug technique',
  general: 'Question generale',
  partner: 'Partenariat',
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getSubmittedAt(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Tunis',
  }).format(new Date())
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ContactBody
  const prenom = body.prenom?.trim() ?? ''
  const nom = body.nom?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  const subject = body.subject?.trim() ?? 'general'
  const message = body.message?.trim() ?? ''

  if (!prenom || !nom || !isValidEmail(email) || message.length < 10) {
    return Response.json({ error: 'Formulaire invalide.' }, { status: 400 })
  }

  const smtpHost = process.env.SMTP_HOST?.trim()
  const smtpPort = Number(process.env.SMTP_PORT || 587)
  const smtpSecure = process.env.SMTP_SECURE === 'true'
  const smtpUser = process.env.SMTP_USER?.trim()
  const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, '')
  const fromAddress = process.env.SMTP_FROM_ADDRESS || smtpUser
  const fromName = process.env.SMTP_FROM_NAME || 'MindBloom'

  if (!smtpHost || !fromAddress) {
    return Response.json({ error: 'Configuration email manquante.' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
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
  })

  const safeName = escapeHtml(`${prenom} ${nom}`)
  const safeEmail = escapeHtml(email)
  const safeSubject = escapeHtml(subjectLabels[subject] ?? subject)
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />')
  const submittedAt = getSubmittedAt()
  const safeSubmittedAt = escapeHtml(submittedAt)
  const replyHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    `Re: votre message MindBloom - ${subjectLabels[subject] ?? subject}`,
  )}`

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: recipientEmail,
    replyTo: email,
    subject: `MindBloom | ${subjectLabels[subject] ?? subject} | ${prenom} ${nom}`,
    text: [
      'Nouveau message depuis MindBloom',
      `Envoye le: ${submittedAt}`,
      `Nom: ${prenom} ${nom}`,
      `Email: ${email}`,
      `Sujet: ${subjectLabels[subject] ?? subject}`,
      '',
      message,
    ].join('\n'),
    html: `
      <div style="margin:0; padding:0; background:#f7f3ff;">
        <div style="max-width:680px; margin:0 auto; padding:28px 18px; font-family:Arial, Helvetica, sans-serif; color:#2f2254;">
          <div style="background:#ffffff; border:1px solid #e3d8ff; border-radius:22px; overflow:hidden; box-shadow:0 18px 42px rgba(137,94,248,.12);">
            <div style="padding:24px 26px; background:linear-gradient(135deg,#895ef8,#a987ff); color:#ffffff;">
              <p style="margin:0 0 8px; font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; opacity:.9;">MindBloom</p>
              <h1 style="margin:0; font-size:24px; line-height:1.25;">Nouveau message de contact</h1>
              <p style="margin:10px 0 0; font-size:14px; opacity:.92;">${safeSubject} · ${safeSubmittedAt}</p>
            </div>

            <div style="padding:24px 26px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-bottom:20px;">
                <tr>
                  <td style="padding:12px 14px; background:#f4efff; border-radius:14px 0 0 14px; width:110px; font-size:13px; font-weight:700; color:#6f4dd7;">Nom</td>
                  <td style="padding:12px 14px; background:#f4efff; border-radius:0 14px 14px 0; font-size:14px;">${safeName}</td>
                </tr>
                <tr><td colspan="2" style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 14px; background:#f4efff; border-radius:14px 0 0 14px; width:110px; font-size:13px; font-weight:700; color:#6f4dd7;">Email</td>
                  <td style="padding:12px 14px; background:#f4efff; border-radius:0 14px 14px 0; font-size:14px;"><a href="mailto:${safeEmail}" style="color:#5b2be3; text-decoration:none; font-weight:700;">${safeEmail}</a></td>
                </tr>
                <tr><td colspan="2" style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 14px; background:#f4efff; border-radius:14px 0 0 14px; width:110px; font-size:13px; font-weight:700; color:#6f4dd7;">Sujet</td>
                  <td style="padding:12px 14px; background:#f4efff; border-radius:0 14px 14px 0; font-size:14px;">${safeSubject}</td>
                </tr>
              </table>

              <div style="margin:0 0 22px;">
                <p style="margin:0 0 8px; font-size:12px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#6f4dd7;">Message</p>
                <div style="padding:18px; border-radius:16px; background:#fbf9ff; border:1px solid #e9e1ff; font-size:15px; line-height:1.7; white-space:normal;">
                  ${safeMessage}
                </div>
              </div>

              <a href="${replyHref}" style="display:inline-block; padding:13px 20px; border-radius:999px; background:linear-gradient(135deg,#895ef8,#a987ff); color:#ffffff; text-decoration:none; font-size:14px; font-weight:700;">
                Repondre a ${safeName}
              </a>

              <p style="margin:20px 0 0; font-size:12px; line-height:1.6; color:#7b6b9a;">
                Cet email a ete envoye automatiquement depuis le formulaire de contact MindBloom.
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  })

  return Response.json({ ok: true })
}
