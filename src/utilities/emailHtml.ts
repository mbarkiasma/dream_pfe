const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
const LOGO_URL = `${SITE_URL}/mindbloom-logo.svg`

type EmailOptions = {
  title: string
  body: string
  ctaHref?: string
  ctaLabel?: string
  footer?: string
}

export function buildEmailHtml({ title, body, ctaHref, ctaLabel, footer }: EmailOptions): string {
  const logoBlock = `<img src="${LOGO_URL}" alt="MindBloom" width="160" style="display:block;height:auto;max-width:160px;margin-bottom:20px;" />`

  const ctaBlock = ctaHref
    ? `<a href="${ctaHref}" style="display:inline-block;background:#6d28d9;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:15px;">${ctaLabel ?? 'Ouvrir la plateforme'}</a>`
    : ''

  const footerBlock = `<p style="font-size:12px;color:#7b6b9a;margin-top:20px;">${footer ?? 'Cet email a été envoyé automatiquement par MindBloom.'}</p>`

  return [
    '<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#24114f;line-height:1.6;">',
    '<div style="padding:28px;border:1px solid #eee7ff;border-radius:16px;background:#fbf8ff;">',
    logoBlock,
    `<h2 style="margin:0 0 12px;color:#2d1068;font-size:22px;">${title}</h2>`,
    `<p style="font-size:15px;margin:0 0 20px;">${body}</p>`,
    ctaBlock,
    '</div>',
    footerBlock,
    '</div>',
  ].join('')
}
