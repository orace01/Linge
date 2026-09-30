import { Hero } from '../components/Hero'
import { CategoriesSection } from '../components/CategoriesSection'
import { LatestPieces } from '../components/LatestPieces'
import { CollectionHighlight } from '../components/CollectionHighlight'
import { StoryCraft } from '../components/StoryCraft'
import { EditorialMagazine } from '../components/EditorialMagazine'
import { NewsletterSection } from '../components/NewsletterSection'

export function Home() {
  return (
    <div>
      <Hero />
      <CategoriesSection />
      <LatestPieces />
      <CollectionHighlight />
      <StoryCraft />
      <EditorialMagazine />
      <NewsletterSection />
    </div>
  )
}
