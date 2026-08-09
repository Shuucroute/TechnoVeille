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

## Comment fonctionne la récupération RSS

Un navigateur ne peut pas lire un flux RSS (XML) sur un autre domaine à cause
des règles CORS. `useFlux.js` passe donc par le service gratuit **rss2json**,
qui convertit le XML en JSON facile à manipuler :

```
https://api.rss2json.com/v1/api.json?rss_url=URL_DU_FLUX
```

Pour un usage plus intensif que la limite gratuite quotidienne, il faudra soit
une clé API rss2json, soit un petit proxy CORS personnel.

## Build de production

```bash
npm run build
```

Génère le dossier `dist/`, prêt à héberger sur n'importe quel serveur statique.
