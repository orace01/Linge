import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { StockProvider } from './context/StockContext'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { MiniCartDrawer } from './components/MiniCartDrawer'
import { Home } from './pages/Home'
import { Collection } from './pages/Collection'
import { Product } from './pages/Product'
import { Cart } from './pages/Cart'
import { Favorites } from './pages/Favorites'
import { InfoPage } from './pages/InfoPage'
import { GuideDesTailles } from './pages/GuideDesTailles'
import { FAQ } from './pages/FAQ'
import { Contact } from './pages/Contact'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <StockProvider>
    <CartProvider>
      <FavoritesProvider>
        <ScrollToTop />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/boutique" element={<Collection />} />
            <Route path="/collection/:slug" element={<Collection />} />
            <Route path="/produit/:slug" element={<Product />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/favoris" element={<Favorites />} />
            <Route path="/guide-des-tailles" element={<GuideDesTailles />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/notre-histoire"
              element={
                <InfoPage
                  eyebrow="La maison"
                  title="Notre histoire"
                  description="Une maison de lingerie pensée pour sublimer chaque silhouette, entre exigence des matières et attention portée à la coupe."
                />
              }
            />
            <Route
              path="/nos-matieres"
              element={
                <InfoPage
                  eyebrow="Savoir-faire"
                  title="Nos matières"
                  description="Dentelles, satins et mailles sélectionnés pour leur toucher, leur tenue et leur confort au quotidien."
                />
              }
            />
            <Route
              path="/entretien"
              element={
                <InfoPage
                  eyebrow="Conseils"
                  title="Conseils d'entretien"
                  description="Un lavage à la main, à froid et sans assouplissant, pour préserver la beauté de vos pièces dans le temps."
                />
              }
            />
            <Route
              path="/bien-choisir"
              element={
                <InfoPage
                  eyebrow="Conseils"
                  title="Bien choisir sa lingerie"
                  description="Coupe, maintien, matière : quelques repères pour trouver la pièce qui vous correspond vraiment."
                />
              }
            />
            <Route
              path="/livraison-retours"
              element={
                <InfoPage
                  eyebrow="Service client"
                  title="Livraison et retours"
                  description="Livraison offerte dès [montant] €. Retours gratuits sous 30 jours, dans leur état d'origine."
                  withFrame={false}
                />
              }
            />
            <Route
              path="/journal"
              element={
                <InfoPage
                  eyebrow="Journal"
                  title="Le journal"
                  description="Nos inspirations, nos coulisses et nos conseils lingerie — de nouveaux articles arrivent bientôt."
                />
              }
            />
            <Route
              path="/compte"
              element={
                <InfoPage
                  eyebrow="Espace client"
                  title="Mon compte"
                  description="Connectez-vous pour retrouver vos commandes, vos favoris et vos informations personnelles."
                  withFrame={false}
                />
              }
            />
          </Routes>
        </main>
        <Footer />
        <MiniCartDrawer />
      </FavoritesProvider>
    </CartProvider>
    </StockProvider>
  )
}

export default App
