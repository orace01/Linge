import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { products } from '../data/catalog'
import { CloseIcon, SearchIcon } from './icons'

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  if (!open) return null

  const results = query.trim()
    ? products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query.trim().toLowerCase()))
    : []

  const goTo = (slug: string) => {
    onClose()
    setQuery('')
    navigate(`/produit/${slug}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-plum/97 px-6 pt-24 text-ivory">
      <button onClick={onClose} aria-label="Fermer la recherche" className="absolute right-6 top-6">
        <CloseIcon className="h-6 w-6" />
      </button>
      <div className="mx-auto w-full max-w-xl">
        <div className="flex items-center gap-3 border-b border-ivory/30 pb-3">
          <SearchIcon className="h-5 w-5 text-ivory/60" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une pièce, une catégorie..."
            className="w-full bg-transparent text-lg placeholder:text-ivory/40 focus:outline-none"
          />
        </div>
        <ul className="mt-6 space-y-3">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => goTo(p.slug)}
                className="flex w-full items-center justify-between text-left text-sm uppercase tracking-wide text-ivory/80 hover:text-ivory"
              >
                <span>{p.name}</span>
                <span>{p.price}&nbsp;€</span>
              </button>
            </li>
          ))}
          {query.trim() && results.length === 0 && (
            <li className="text-sm text-ivory/50">Aucun résultat pour « {query} ».</li>
          )}
        </ul>
      </div>
    </div>
  )
}
