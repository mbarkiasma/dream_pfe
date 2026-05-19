import ContactFormBlock from '@/components/blocks/contact/ContactFormBlock'
import ContactInfosBlock from '@/components/blocks/contact/ContactInfosBlock'

export const ContactContentBlockComponent = (props: {
  emailsTitleFr?: string
  emailsTitleEn?: string
  emails?: {
    icon?: string | null
    tagFr?: string | null
    tagEn?: string | null
    address?: string | null
    descFr?: string | null
    descEn?: string | null
  }[]
  teamTextFr?: string
  teamTextEn?: string
  teamAvatars?: { initials?: string | null }[]
  faqTitleFr?: string
  faqTitleEn?: string
  faqItems?: {
    qFr?: string | null
    qEn?: string | null
    aFr?: string | null
    aEn?: string | null
  }[]
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 18,
        alignItems: 'start',
      }}
    >
      <ContactInfosBlock {...props} />
      <ContactFormBlock />
    </div>
  )
}
