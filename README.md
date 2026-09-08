# Station d'écoute — Veille Techno (Vue 3 + Vite)

Application de veille technologique : ajoutez des flux RSS, les articles
arrivent triés par date sous forme de « dépêches » perforées.

## Installation

```bash
npm install
npm run dev
```

Puis ouvrez l'adresse affichée dans le terminal (en général `http://localhost:5173`).

## Structure du projet

```
src/
├── App.vue                    # Assemble tous les composants + déclenche l'actualisation
├── main.js                    # Point d'entrée : monte l'app sur #app
├── assets/style.css           # Variables de couleurs & styles globaux
├── composables/
│   └── useFlux.js             # Toute la logique RSS : fetch, tri, ajout/retrait de flux
├── data/
│   ├── palette.js             # Couleurs attribuées aux sources
│   └── fluxSuggeres.js        # Flux proposés + flux actifs par défaut
├── utils/
│   └── formatage.js           # Formatage de date et nettoyage des extraits HTML
└── components/
    ├── Entete.vue              # Bandeau titre + horloge
    ├── BandeauTelex.vue        # Ticker défilant des derniers titres
    ├── PanneauFlux.vue         # Formulaire d'ajout + suggestions + liste des flux actifs
    ├── ChipFlux.vue            # Une "puce" représentant un flux actif
    ├── GrilleArticles.vue      # Grille des dépêches + états de chargement/vide
    └── CarteDepeche.vue        # Une dépêche individuelle (un article)
```

## Score de fiabilité indicatif par article

Chaque dépêche affiche un petit badge (point vert/orange/gris) au survol
duquel apparaît le détail du calcul. **Ce n'est pas une vérification
factuelle du contenu** — aucun outil simple ne peut garantir qu'une
information est vraie ou fausse. Le score se base sur des critères objectifs
et transparents, calculés dans `src/utils/confiance.js` :

1. **Recoupement** : combien d'autres flux que vous suivez publient un
   article au titre très proche, dans une fenêtre de 48h.
2. **Extrait substantiel** : présence d'un résumé de contenu, pas juste un titre.
3. **Date renseignée** : présence d'une date de publication exploitable.
4. **Signaux stylistiques** (`src/utils/signauxStyle.js`) :
   - titre à tournure sensationnaliste/putaclic (pénalité),
   - vocabulaire à forte charge émotionnelle (pénalité),
   - présence d'une source explicitement citée dans l'extrait (bonus).

Ces signaux stylistiques mesurent la **forme** du texte, jamais son
exactitude : un vrai scandale reste correctement qualifié de "scandaleux", et
un article trompeur peut très bien être écrit sobrement. Ils s'ajoutent au
score sans jamais prétendre juger le fond.

Un article "source unique" n'est pas forcément faux, et un article recoupé
peut tout à fait relayer la même erreur ailleurs. Le badge donne un indice,
pas un verdict.

### Recherche de fact-checks publiés (à la demande)

Un bouton **« Chercher des fact-checks liés »** sur chaque article interroge,
uniquement sur clic, l'API [Google Fact Check Tools](https://developers.google.com/fact-check/tools/api)
(qui agrège les vérifications d'organismes comme l'AFP, Full Fact,
PolitiFact...) pour voir si un sujet proche a déjà été vérifié.

- **Volontairement à la demande, pas automatique** : interroger cette API sur
  chaque article de chaque flux à chaque actualisation épuiserait vite le
  quota gratuit. Vous choisissez quel article vérifier.
- **Une correspondance ne certifie pas cet article précis** : elle indique
  qu'un sujet proche a été traité par un organisme tiers, pas que l'article
  affiché ici a été validé ou invalidé.
- **Configuration nécessaire** : sans clé, le bouton affiche un message
  expliquant que la fonction est désactivée (rien ne casse). Pour l'activer,
  créez un fichier `.env` à la racine avec :
  ```
  VITE_FACTCHECK_API_KEY=votre_cle_google
  ```
  ⚠️ Comme pour `VITE_API_KEY` (rss2json), cette clé sera visible dans le
  bundle client. Pour la garder secrète, utilisez le proxy fourni dans
  `server-proxy-exemple/` (route `/factcheck`) et définissez plutôt :
  ```
  VITE_FACTCHECK_PROXY_URL=https://votre-worker.workers.dev/factcheck
  ```

## Comment fonctionne la récupération RSS

Un navigateur ne peut pas lire un flux RSS (XML) sur un autre domaine à cause
des règles CORS. `useFlux.js` passe donc par le service gratuit **rss2json**,
qui convertit le XML en JSON facile à manipuler :

```
https://api.rss2json.com/v1/api.json?rss_url=URL_DU_FLUX
```

Le premier ajout d'un flux ne récupère que celui-ci (pas de refetch de tous
les flux existants), pour ménager le quota gratuit. Une actualisation
complète a lieu au chargement de la page et toutes les 5 minutes.

Les derniers articles récupérés sont aussi mis en cache dans `localStorage`,
pour un affichage instantané au rechargement de la page (avant même le
premier fetch réseau).

### ⚠️ À propos de la clé API (`VITE_API_KEY`)

Pour un usage plus intensif que la limite gratuite quotidienne, il faudra une
clé API rss2json. **Attention** : toute variable préfixée `VITE_` est
injectée en clair dans le JavaScript livré au navigateur — n'importe qui peut
l'extraire via les devtools. N'utilisez cette variable que si vous acceptez
que la clé soit visible publiquement.

Pour une clé réellement secrète, passez par un petit proxy serveur : un
exemple de Cloudflare Worker est fourni dans `server-proxy-exemple/`.

## Tests

```bash
npm run test
```

Des tests unitaires (Vitest) couvrent le formatage des dates/extraits
(`src/utils/__tests__`), la détection de catégorie (`src/data/__tests__`),
le calcul du score de fiabilité et les signaux stylistiques
(`src/utils/__tests__`).

## Build de production

```bash
npm run build
```

Génère le dossier `dist/`, prêt à héberger sur n'importe quel serveur statique.
