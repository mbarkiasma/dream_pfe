import ContactHeroBlock from '@/components/blocks/contact/ContactHeroBlock'

export const ContactHeroBlockComponent = (props: {
  brand?: string
  titleFr?: string
  titleEn?: string
  descriptionFr?: string
  descriptionEn?: string
  stats?: {
    icon?: string | null
    value?: string | null
    labelFr?: string | null
    labelEn?: string | null
  }[]
}) => {
  return <ContactHeroBlock {...props} />
}
