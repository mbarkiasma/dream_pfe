import { PublicBlocksPage } from '@/components/pages/PublicBlocksPage'
import { publicPageConfigs } from '@/components/pages/publicPageConfigs'

export default async function PageNosServices() {
  return <PublicBlocksPage {...publicPageConfigs.nosServices} />
}
