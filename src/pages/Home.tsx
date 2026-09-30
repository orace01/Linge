import { Hero } from '../components/Hero'
import { CategoriesSection } from '../components/CategoriesSection'
import { LatestPieces } from '../components/LatestPieces'
import { CollectionStory } from '../components/CollectionStory'
import { StoryCraft } from '../components/StoryCraft'
import { EditorialMagazine } from '../components/EditorialMagazine'
import { NewsletterSection } from '../components/NewsletterSection'

export function Home() {
  return (
    <div>
      <Hero />
      <CategoriesSection />
      <LatestPieces />
      <CollectionStory />
      <StoryCraft />
      <EditorialMagazine />
      <NewsletterSection />
    </div>
  )
}
