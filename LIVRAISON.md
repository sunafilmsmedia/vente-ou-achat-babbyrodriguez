# Babby Rodriguez — ¿Vender antes de comprar o al revés? (ESPAGNOL)

App one-page de qualification de leads pour Babby Rodriguez, courtier immobilier
RE/MAX Platine (Rive-Sud de Montréal). **Hybride** : branding et territoire repris
de `eval-babbyrodriguez` (logos réels du client, thème noir / gris #333333 / blanc,
carte Leaflet décorative, secteurs Rive-Sud), logistique et concept repris de
`vente-ou-achat-maxbacon` (logiciel « vendre avant d'acheter ou l'inverse »).
Next.js 15 (App Router, TS) · Tailwind v4 · Framer Motion · Leaflet · déploiement
Vercel. **Tout le contenu visiteur est en espagnol** (vouvoiement formel via « usted »).

## Concept

Contrairement à l'app d'évaluation vendeur de Babby (qui répond à « est-ce le bon
moment pour vendre ? »), ce logiciel répond à une question de SÉQUENCE : la personne
possède déjà une propriété et veut en changer — doit-elle vendre avant d'acheter,
acheter avant de vendre, ou coordonner les deux en parallèle ? Le résultat n'est
jamais un chiffre : c'est une recommandation de stratégie, déterminée par un scoring
bipolaire (`lib/scoring.ts`, -100 à +100) basé sur les 3 facteurs financiers qui
comptent vraiment (besoin de l'argent de la vente, capacité à porter deux
hypothèques, économies indépendantes), affinés par l'équité accumulée et la
priorité de la personne.

## Parcours (machine à états, un seul écran)

`hero → formulaire (12 à 13 questions selon le parcours, 4 étapes) → chargement (~2 s, IA) → résultats`

- 4 étapes : Su proyecto → Su propiedad actual → Su situación financiera →
  Sus prioridades, puis coordonnées (nombre/correo/teléfono).
- Auto-avance sur les choix (~220 ms). Barre de progression, bouton Anterior,
  transitions slide.
- Ville actuelle = champ de recherche filtrée (insensible aux accents/casse)
  + saisie libre, jamais de « pas trouvé ».
- Les coordonnées sont collectées À LA FIN du formulaire — le lead est soumis
  au CRM en même temps que le calcul, pas après un volet séparé.
- `/api/analyze` : rapport via Claude en espagnol formel (repli déterministe
  sans clé) — le verdict n'est jamais décidé par l'IA, seulement mis en mots.
- `/api/lead` : webhook CRM (GHL), payload aplati.

## Pour rebrander à un nouveau client — 4 endroits

1. **`lib/brand.ts`** — LE fichier central : nom, région/ville, carte (Leaflet),
   textes du hero (espagnol), le ou les courtiers, logos.
2. **`lib/regions.ts`** — la liste des villes/secteurs couverts (actuellement :
   la Rive-Sud de Montréal, repris tel quel de `eval-babbyrodriguez`).
3. **`public/`** — `babby-rodriguez-logo.png` (logo réel du client), `remax-platine-logo.png`
   (logo RE/MAX Platine réel, repris de eval-babbyrodriguez), `broker-1.svg`
   (silhouette placeholder — à remplacer par une vraie photo de Babby quand disponible).
4. **`.env.local`** (voir `.env.local.example`) — **actuellement vide**, clés propres à
   CE déploiement : `ANTHROPIC_API_KEY`, `CRM_WEBHOOK_URL`, `NEXT_PUBLIC_META_PIXEL_ID`,
   `NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_CLARITY_SCANNER_PROJECT`, `NEXT_PUBLIC_SITE_URL`.
   Sans ces clés : rapport déterministe (pas d'IA), pas de pixel Meta, pas de Clarity,
   pas de webhook CRM (lead seulement loggé côté serveur).

**Pixel Meta jamais réutilisé** : `vente-ou-achat-maxbacon` a son propre pixel codé
en dur (Max Bacon) — ce déploiement utilise plutôt le pattern par variable d'env
(`NEXT_PUBLIC_META_PIXEL_ID`, vide par défaut), comme `eval-babbyrodriguez`.

Palette : réglable dans `app/globals.css` (bloc `@theme`, variables `--color-brand-*`
et `--color-gold`, qui pointe vers le blanc). Par défaut : noir / gris #333333 / blanc.

## Développement

```bash
npm install
cp .env.local.example .env.local   # remplir au besoin
npm run dev
```

## Déploiement Vercel

1. `git push` vers le repo GitHub du projet.
2. Sur vercel.com → New Project → importer ce repo (Next.js détecté
   automatiquement, aucune config requise).
3. Renseigner les variables d'environnement de `.env.local.example` dans
   Vercel → Settings → Environment Variables.
4. Déployer.
