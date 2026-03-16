import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { AuthBlockComponent } from '@/blocks/AuthBlock/Component'
import { LoginBlockComponent } from '@/blocks/LoginBlock/Component'
import EntretienBlockComponent from './EntretienBlock/Component'
import LandingHeroBlockComponent from '@/blocks/HeroBlock/Component'
import { SecondBlocAccueilBlock } from '@/blocks/secondBlocAccueil/Component'
import { TroisiemeBlocAccueilBlock } from '@/blocks/thirdBlocAccueil/Component'
import { QuatriemeBlocAccueilBlock } from '@/blocks/quatriemeBlocAccueil/Component'
import { CinquiemeBlocAccueilBlock } from '@/blocks/cinquiemeBlocAccueil/Component'
const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  authBlock: AuthBlockComponent,
  loginBlock: LoginBlockComponent,
  entretienBlock: EntretienBlockComponent,
  landingHero: LandingHeroBlockComponent,
  secondBlocAccueil: SecondBlocAccueilBlock,
  troisiemeBlocAccueil: TroisiemeBlocAccueilBlock,
  quatriemeBlocAccueil: QuatriemeBlocAccueilBlock,
  cinquiemeBlocAccueil: CinquiemeBlocAccueilBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout']
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