import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BRAND } from '../brand'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { SearchIcon, AccountIcon, HeartIcon, BagIcon, MenuIcon, CloseIcon } from './icons'
import { SearchOverlay } from './SearchOverlay'

const navLinks = [
  { label: 'Nouveautés', to: '/boutique?tri=nouveautes' },
  { label: 'Soutiens-gorge', to: '/collection/soutiens-gorge' },
  { label: 'Culottes', to: '/collection/culottes' },
  { label: 'Ensembles', to: '/collection/ensembles' },
  { label: 'Journal', to: '/journal' },
]

export function Header() {
  const { totalItems, openMiniCart } = useCart()
  const { favorites } = useFavorites()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const isHome = pathname === '/'

  return (
    <>
      {/* thin band above the header (desktop): the hero photo shows through it on the home page */}
      <div aria-hidden="true" className={`hidden h-[var(--strip-h)] lg:block ${isHome ? '' : 'bg-wine'}`} />

      <header
        className="sticky top-0 z-40 h-[60px] border-b border-border bg-page lg:h-[var(--header-h)]"
      >
        <div className="mx-auto flex h-full items-center justify-between px-5 lg:grid lg:w-[min(100%,calc(1344*var(--s)))] lg:grid-cols-[1fr_auto_1fr] lg:pl-[calc(101*var(--s))] lg:pr-[calc(116.6*var(--s))]">
          {/* left: mobile menu + logo */}
          <div className="flex items-center gap-4">
            <button className="text-ink lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
              <MenuIcon size={24} />
            </button>
            <Link
              to="/"
              className="font-logo text-[27px] font-bold uppercase leading-none tracking-[0.02em] text-wine lg:-translate-y-[calc(2.5*var(--s))] lg:text-[length:calc(41*var(--s))]"
            >
              {BRAND}
            </Link>
          </div>

          {/* center: nav */}
          <nav aria-label="Navigation principale" className="hidden items-center gap-[calc(31*var(--s))] lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className="font-ui text-[length:calc(15.5*var(--s))] font-medium uppercase leading-none tracking-[0.02em] text-ink transition hover:text-wine"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* right: search + bag */}
          <div className="flex items-center justify-end gap-5 text-ink lg:gap-[calc(24*var(--s))]">
            <button aria-label="Rechercher" onClick={() => setSearchOpen(true)} className="transition hover:text-wine">
              <SearchIcon size={24} stroke={2} className="lg:h-[calc(27*var(--s))] lg:w-[calc(27*var(--s))]" />
            </button>
            <button aria-label="Voir le panier" onClick={openMiniCart} className="relative transition hover:text-wine">
              <BagIcon size={24} stroke={2} className="lg:h-[calc(27*var(--s))] lg:w-[calc(27*var(--s))]" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-wine px-1 font-ui text-[9px] text-surface">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-page">
          <div className="flex h-[60px] items-center justify-between border-b border-border px-5">
            <span className="font-logo text-[27px] font-bold uppercase leading-none tracking-[0.02em] text-wine">{BRAND}</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" className="text-ink">
              <CloseIcon size={24} />
            </button>
          </div>
          <nav aria-label="Navigation mobile" className="flex flex-col px-5 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="border-b border-border py-4 font-ui text-sm font-medium uppercase tracking-[0.06em] text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/compte"
              onClick={() => setMobileOpen(false)}
              className="mt-6 flex items-center gap-3 py-3 font-ui text-sm text-ink"
            >
              <AccountIcon size={20} />
              Mon compte
            </Link>
            <Link
              to="/favoris"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 py-3 font-ui text-sm text-ink"
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
