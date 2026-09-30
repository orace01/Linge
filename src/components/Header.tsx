import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BRAND } from '../brand'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { SearchIcon, AccountIcon, HeartIcon, BagIcon, MenuIcon, CloseIcon } from './icons'
import { SearchOverlay } from './SearchOverlay'

const navLeft = [
  { label: 'Nouveautés', to: '/boutique?tri=nouveautes' },
  { label: 'Soutiens-gorge', to: '/collection/soutiens-gorge' },
  { label: 'Culottes', to: '/collection/culottes' },
]
const navRight = [
  { label: 'Ensembles', to: '/collection/ensembles' },
  { label: 'Journal', to: '/journal' },
]
const navLinks = [...navLeft, ...navRight]

export function Header() {
  const { totalItems, openMiniCart } = useCart()
  const { favorites } = useFavorites()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const hover = 'hover:text-wine'
  const linkClass = `font-sans text-[11px] font-normal uppercase tracking-[0.2em] transition ${hover}`

  return (
    <>
      {/* a light, thin frosted band - over the hero photos too */}
      <header className="sticky top-0 z-40 h-[var(--header-h)] border-b border-border/70 bg-page/80 text-ink backdrop-blur-md">
        <div className="mx-auto grid h-full max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 lg:px-10">
          {/* left: mobile menu / first links */}
          <div className="flex items-center gap-7">
            <button className={`transition lg:hidden ${hover}`} onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
              <MenuIcon size={22} />
            </button>
            <nav aria-label="Navigation principale" className="hidden items-center gap-7 lg:flex">
              {navLeft.map((link) => (
                <NavLink key={link.label} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* centre: wordmark */}
          <Link
            to="/"
            aria-label={`${BRAND}, accueil`}
            className="font-display text-[21px] font-medium uppercase leading-none tracking-[0.34em] [margin-right:-0.34em] lg:text-[24px]"
          >
            {BRAND}
          </Link>

          {/* right: last links + search + bag */}
          <div className="flex items-center justify-end gap-7">
            <nav aria-label="Navigation principale, suite" className="hidden items-center gap-7 lg:flex">
              {navRight.map((link) => (
                <NavLink key={link.label} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <button aria-label="Rechercher" onClick={() => setSearchOpen(true)} className={`transition ${hover}`}>
                <SearchIcon size={19} stroke={1.4} />
              </button>
              <button aria-label="Voir le panier" onClick={openMiniCart} className={`relative transition ${hover}`}>
                <BagIcon size={19} stroke={1.4} />
                {totalItems > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-wine px-1 text-[8px] text-surface">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-page">
          <div className="grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center border-b border-border px-5">
            <span />
            <span className="font-display text-[21px] font-medium uppercase leading-none tracking-[0.34em] [margin-right:-0.34em] text-ink">
              {BRAND}
            </span>
            <button onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" className="justify-self-end text-ink">
              <CloseIcon size={22} />
            </button>
          </div>
          <nav aria-label="Navigation mobile" className="flex flex-col px-5 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="border-b border-border py-5 font-display text-2xl text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/compte"
              onClick={() => setMobileOpen(false)}
              className="mt-6 flex items-center gap-3 py-3 text-sm text-ink"
            >
              <AccountIcon size={20} />
              Mon compte
            </Link>
            <Link
              to="/favoris"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 py-3 text-sm text-ink"
            >
              <HeartIcon size={20} filled={favorites.length > 0} />
              Mes favoris{favorites.length > 0 && ` (${favorites.length})`}
            </Link>
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
