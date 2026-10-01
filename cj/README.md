# Catalogue CJdropshipping

Le site vend une sélection de produits CJ. Le catalogue (noms, photos, variantes, prix) est généré à partir
de `cj/selection.json` ; le stock est synchronisé deux fois par jour et revérifié en direct au moment de payer.

## 1. Choisir les produits : `cj/selection.json`

Un bloc par produit :

```json
{
  "sku": "CJQQ1416398",
  "category": "bodys",
  "name": "Body Dentelle Nuit",
  "description": "Body en dentelle florale…",
  "price": 49.9,
  "isNew": true,
  "isBestSeller": false,
  "excludeColors": ["Blue"],
  "colorNames": { "Wine Red": "Bordeaux" }
}
```

- `sku` : référence CJ (ou `pid`, l'identifiant produit CJ). **Obligatoire.**
- `category` : `soutiens-gorge`, `culottes`, `ensembles`, `bodys` ou `lingerie-de-nuit`. **Obligatoire.**
- `name`, `description` : textes en français affichés sur le site (sinon le titre anglais de CJ).
- `price` : prix de vente en euros. **Conseillé** : sans prix, c'est coût CJ le plus élevé × `usdToEur` × `markup`,
  arrondi à ,90 (minimum 9,90 €). L'import affiche le prix conseillé par CJ pour t'aider.
- `excludeColors` : couleurs CJ à ne pas vendre (nom CJ ou nom français).
- `colorNames` : pour renommer une couleur (les couleurs courantes sont traduites automatiquement ; l'import
  signale celles qu'il faut renommer).
- `skipPhotos` : photos CJ à écarter, par position (1 = la première), par ex. un tableau de tailles : `[4]`.
- `mainPhoto` : position de la photo CJ à montrer en premier (cartes, fiche produit).
- `defaultColor` : couleur sélectionnée à l'ouverture de la fiche (nom français), celle de la photo principale.

Les photos qui ne servent plus (écartées, retirées chez CJ) sont supprimées de `public/products/` à l'import.

## 2. Importer

```bash
npm run cj:import              # vrai import (clé CJ_API_KEY dans .env.local)
npm run cj:import -- --mock    # données simulées, pour tester sans la clé
```

Le script écrit `src/data/cj-catalog.ts` et enregistre les photos en WebP dans `public/products/<sku>/`
(un nom par photo CJ, par ex. `3f2a9c01be.webp`).
**Les photos déjà présentes ne sont jamais écrasées** : tu peux les retoucher (même nom de fichier, format WebP),
puis relancer l'import sans risque. Pour récupérer à nouveau la photo CJ, supprime le fichier.

Relance l'import quand tu changes la sélection, les textes ou les prix, puis commit + push : Vercel redéploie.

## 3. Stock

CJ ne donne le stock que **variante par variante** (1 appel par couleur × taille). Pour 25 produits
(~150 à 200 variantes), une synchro fait donc ~200 appels et dure 3 à 4 minutes.

```bash
npm run cj:sync     # en local : écrit .data/stock.json (ou dans Vercel Blob si BLOB_READ_WRITE_TOKEN est défini)
```

En ligne, la synchro tourne dans **GitHub Actions** (`.github/workflows/sync-stock.yml`) : deux fois par jour,
et automatiquement après chaque changement du catalogue (push de `src/data/cj-catalog.ts`).
Chaque « Passer commande » revérifie en direct les variantes du panier.
En cas d'échec, la cause s'affiche dans « Annotations » sur la page de l'exécution (onglet Actions).

Budget CJ (1 000 appels par jour pour un compte gratuit) : 2 synchros × ~310 variantes = ~620, le reste pour les
vérifications de panier et les imports. Si ta sélection grossit, espace les synchros (ligne `cron` du workflow).

Un produit dont le stock est uniquement dans un entrepôt hors Chine/Europe (par ex. États-Unis) n'est en général
pas livrable en France : vérifie le calcul d'expédition vers la France sur la fiche CJ avant de l'ajouter.

## 4. Configuration

| Variable | Où | Rôle |
| --- | --- | --- |
| `CJ_API_KEY` | `.env.local`, Vercel, secret GitHub | clé API CJ (Applications → API → Add API → type API Key) |
| `BLOB_STORE_ID` | Vercel (automatique) | le site lit le stock dans le Blob (connexion OIDC) |
| `BLOB_READ_WRITE_TOKEN` | secret GitHub (+ `.env.local` si besoin) | la synchro écrit le stock dans le Blob depuis GitHub |

- **Vercel** : Settings → Environment Variables → `CJ_API_KEY`. Puis Storage → Create → Blob (accès public)
  et connecte-le au projet : `BLOB_STORE_ID` est ajouté tout seul.
  **Ne révoque pas le jeton read-write** que Vercel propose de révoquer : la synchro GitHub en a besoin.
- **GitHub** : repo → Settings → Secrets and variables → Actions → New repository secret : `CJ_API_KEY` et
  `BLOB_READ_WRITE_TOKEN` (valeur visible dans Vercel → Storage → ton Blob → onglet `.env.local`).
- Première synchro : onglet Actions → « Sync CJ stock » → Run workflow. Vérifie ensuite `https://<ton-site>/api/stock`.

Remarque : GitHub met en pause les tâches programmées d'un repo sans activité pendant 60 jours ; un commit les relance.
