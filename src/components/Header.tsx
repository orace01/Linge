import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { SearchIcon, AccountIcon, HeartIcon, BagIcon, MenuIcon, CloseIcon } from './icons'
import { SearchOverlay } from './SearchOverlay'

const navLinks = [
  { label: 'Nouveautés', to: '/boutique?tri=nouveautes' },
  { label: 'Soutiens-gorge', to: '/collection/soutiens-gorge' },
  { label: 'Culottes', to: '/collection/culottes' },
  { label: 'Ensembles', to: '/collection/ensembles' },
  { label: 'Bodys', to: '/collection/bodys' },
  { label: 'Journal', to: '/journal' },
]

export function Header() {
  const { totalItems, openMiniCart } = useCart()
  const { favorites } = useFavorites()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-plum/8 bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 lg:px-10">
          {/* left: mobile menu + logo */}
          <div className="flex items-center gap-4">
            <button className="text-plum lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
              <MenuIcon size={22} />
            </button>
            <Link to="/" className="font-display text-xl tracking-[0.1em] text-plum sm:text-2xl">
              [NOM DE LA MARQUE]
            </Link>
          </div>

          {/* center: nav */}
          <nav className="hidden items-center justify-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `text-[11px] uppercase tracking-[0.14em] transition ${
                    isActive ? 'text-plum' : 'text-plum/65 hover:text-plum'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* right: icons */}
          <div className="flex items-center justify-end gap-4 text-plum sm:gap-5">
            <button aria-label="Rechercher" onClick={() => setSearchOpen(true)} className="transition hover:text-raspberry">
              <SearchIcon size={19} />
            </button>
            <Link to="/compte" aria-label="Mon compte" className="hidden transition hover:text-raspberry sm:block">
              <AccountIcon size={19} />
            </Link>
            <Link to="/favoris" aria-label="Mes favoris" className="relative transition hover:text-raspberry">
              <HeartIcon size={19} filled={favorites.length > 0} />
              {favorites.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-raspberry text-[9px] text-ivory">
                  {favorites.length}
                </span>
              )}
            </Link>
            <button aria-label="Voir le panier" onClick={openMiniCart} className="relative transition hover:text-raspberry">
              <BagIcon size={19} />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-raspberry text-[9px] text-ivory">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-cream">
          <div className="flex items-center justify-between border-b border-plum/8 px-5 py-5">
            <span className="font-display text-xl tracking-[0.1em] text-plum">[NOM DE LA MARQUE]</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" className="text-plum">
              <CloseIcon size={22} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-5 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="border-b border-plum/8 py-4 text-sm uppercase tracking-[0.1em] text-plum"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
