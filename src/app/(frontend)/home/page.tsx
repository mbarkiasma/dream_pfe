import { PublicBlocksPage } from '@/components/pages/PublicBlocksPage'
import { publicPageConfigs } from '@/components/pages/publicPageConfigs'

export default async function HomePage() {
  return <PublicBlocksPage {...publicPageConfigs.home} />
}
