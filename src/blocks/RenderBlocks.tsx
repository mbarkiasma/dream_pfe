import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { LoginBlockComponent } from '@/blocks/LoginBlock/Component'
import LandingHeroBlockComponent from '@/blocks/HeroBlock/Component'
import { SecondBlocAccueilBlock } from '@/blocks/secondBlocAccueil/Component'
import { TroisiemeBlocAccueilBlock } from '@/blocks/thirdBlocAccueil/Component'
import { QuatriemeBlocAccueilBlock } from '@/blocks/quatriemeBlocAccueil/Component'
import { CinquiemeBlocAccueilBlock } from '@/blocks/CinquiemeBlocAccueil/Component'
import { RoleCardsBlock } from '@/blocks/RoleCards/Component'
import { AccompagnementHeroBlockComponent } from '@/blocks/AccompagnementHero/Component'
import { AccompagnementStressBlockComponent } from '@/blocks/AccompagnementStress/Component'
import { AccompagnementProcessBlockComponent } from '@/blocks/AccompagnementProcess/Component'
import { AboutHeroBlockComponent } from '@/blocks/AboutHero/Component'
import { AboutTeamBlockComponent } from '@/blocks/AboutTeam/Component'
import { AboutEthicsBlockComponent } from '@/blocks/AboutEthics/Component'
import { AboutVisionBlockComponent } from '@/blocks/AboutVision/Component'
import { ContactHeroBlockComponent } from '@/blocks/ContactHero/Component'
import { ContactContentBlockComponent } from '@/blocks/ContactContent/Component'
import { FeaturesHeroBlockComponent } from '@/blocks/FeaturesHero/Component'
import { FeaturesTabsBlockComponent } from '@/blocks/FeaturesTabs/Component'
import { FeatureHighlightBlockComponent } from '@/blocks/FeatureHighlight/Component'
import { NutritionBlockComponent } from '@/blocks/Nutrition/Component'

export type LayoutBlock = {
  blockType?: string | null
  id?: string | null
  [key: string]: unknown
}

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  loginBlock: LoginBlockComponent,
  landingHero: LandingHeroBlockComponent,
  secondBlocAccueil: SecondBlocAccueilBlock,
  troisiemeBlocAccueil: TroisiemeBlocAccueilBlock,
  quatriemeBlocAccueil: QuatriemeBlocAccueilBlock,
  cinquiemeBlocAccueil: CinquiemeBlocAccueilBlock,
  roleCards: RoleCardsBlock,
  accompagnementHero: AccompagnementHeroBlockComponent,
  accompagnementStress: AccompagnementStressBlockComponent,
  accompagnementProcess: AccompagnementProcessBlockComponent,
  aboutHero: AboutHeroBlockComponent,
  aboutTeam: AboutTeamBlockComponent,
  aboutEthics: AboutEthicsBlockComponent,
  aboutVision: AboutVisionBlockComponent,
  contactHero: ContactHeroBlockComponent,
  contactContent: ContactContentBlockComponent,
  featuresHero: FeaturesHeroBlockComponent,
  featuresTabs: FeaturesTabsBlockComponent,
  featureHighlight: FeatureHighlightBlockComponent,
  nutrition: NutritionBlockComponent,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'] | LayoutBlock[] | null | undefined
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (!hasBlocks) return null

  return (
    <Fragment>
      {blocks.map((block, index) => {
        const { blockType } = block

        if (blockType && blockType in blockComponents) {
          const Block = blockComponents[blockType as keyof typeof blockComponents]

          if (Block) {
            return (
              <div key={index}>
                {/* @ts-expect-error there may be some mismatch between the expected types here */}
                <Block {...block} disableInnerContainer />
              </div>
            )
          }
        }

        return null
      })}
    </Fragment>
  )
}
