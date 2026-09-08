<script setup>
import { ref, computed, watch } from 'vue'
import { couleurPour } from '../data/palette.js'
import { CATEGORIES, detecterCategorie } from '../data/categories.js'
import { cleArticle } from '../utils/confiance.js'
import CarteDepeche from './CarteDepeche.vue'

const props = defineProps({
  articles: { type: Array, required: true },
  flux: { type: Array, required: true },
  enChargement: { type: Boolean, default: false },
  fluxEnEchec: { type: Number, default: 0 },
  derniereActualisation: { type: Date, default: null },
  scoresConfiance: { type: Map, default: () => new Map() },
})

// Chaque article enrichi de sa catégorie détectée (ou null si aucune ne correspond)
const articlesAvecCategorie = computed(() =>
  props.articles.map((article) => ({ article, categorie: detecterCategorie(article) })),
)

const filtreActif = ref('toutes')

// Onglets affichés : "Toutes" + une entrée par catégorie réellement présente dans les dépêches
const categoriesPresentes = computed(() => {
  const idsPresents = new Set(
    articlesAvecCategorie.value.map((a) => a.categorie?.id).filter(Boolean),
  )
  return CATEGORIES.filter((c) => idsPresents.has(c.id))
})

const articlesFiltres = computed(() => {
  if (filtreActif.value === 'toutes') return articlesAvecCategorie.value
  return articlesAvecCategorie.value.filter((a) => a.categorie?.id === filtreActif.value)
})

// Limite d'affichage pour rester léger visuellement, avec un bouton pour en voir plus
const PAR_PAGE = 60
const nombreAffiche = ref(PAR_PAGE)
const articlesAffiches = computed(() => articlesFiltres.value.slice(0, nombreAffiche.value))
const ilResteDesArticles = computed(() => articlesFiltres.value.length > nombreAffiche.value)

function voirPlus() {
  nombreAffiche.value += PAR_PAGE
}

// On revient à la première page à chaque changement de filtre ou d'arrivée de nouvelles dépêches
watch(filtreActif, () => {
  nombreAffiche.value = PAR_PAGE
})
watch(
  () => props.articles,
  () => {
    nombreAffiche.value = PAR_PAGE
  },
)

function couleurSource(nomSource) {
  const index = props.flux.findIndex((f) => f.nom === nomSource)
  return couleurPour(index >= 0 ? index : 0)
}

const messageEtat = computed(() => {
  if (props.enChargement) return `Réception en cours… (${props.flux.length} flux en écoute)`
  const base = `${articlesFiltres.value.length} dépêche(s) reçue(s)`
  if (props.fluxEnEchec > 0) return `${base} — ${props.fluxEnEchec} flux injoignable(s)`
  if (props.derniereActualisation)
    return `${base} — dernière écoute à ${props.derniereActualisation.toLocaleTimeString('fr-FR')}`
  return base
})
</script>

<template>
  <main>
    <div class="etat" role="status" aria-live="polite">{{ messageEtat }}</div>

    <div class="onglets" v-if="categoriesPresentes.length">
      <button
        type="button"
        class="onglet"
        :class="{ actif: filtreActif === 'toutes' }"
        @click="filtreActif = 'toutes'"
      >
        Toutes
      </button>
      <button
        v-for="c in categoriesPresentes"
        :key="c.id"
        type="button"
        class="onglet"
        :class="{ actif: filtreActif === c.id }"
        :style="{ '--couleur-onglet': c.couleur }"
        @click="filtreActif = c.id"
      >
        {{ c.nom }}
      </button>
    </div>

    <p v-if="!enChargement && articlesAffiches.length === 0" class="vide">
      Aucune dépêche pour l'instant. Ajoutez un flux ci-dessus.
    </p>

    <div v-else class="grille">
      <CarteDepeche
        v-for="(item, i) in articlesAffiches"
        :key="item.article.lien + i"
        :article="item.article"
        :couleur="couleurSource(item.article.source)"
        :categorie="item.categorie"
        :confiance="scoresConfiance.get(cleArticle(item.article))"
      />
    </div>

    <button v-if="ilResteDesArticles" type="button" class="voir-plus" @click="voirPlus">
      Voir plus de dépêches
    </button>
  </main>
</template>

<style scoped>
main {
  max-width: 980px;
  margin: 0 auto;
  padding: 1.8em 1.2em 4em;
}
.etat {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  color: var(--ink-soft);
  margin-bottom: 1em;
}
.onglets {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
  margin-bottom: 1.2em;
}
.onglet {
  --couleur-onglet: var(--ink-soft);
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.72rem;
  font-weight: 600;
  background: transparent;
  color: var(--couleur-onglet);
  border: 1px solid var(--couleur-onglet);
  padding: 0.35em 0.8em;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.onglet:hover {
  filter: brightness(1.1);
}
.onglet.actif {
  background: var(--couleur-onglet);
  color: var(--paper);
}
.grille {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.6em 1.3em;
}
.vide {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
  color: var(--ink-soft);
  padding: 2em 0;
  text-align: center;
}

.voir-plus {
  display: block;
  margin: 2em auto 0;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.78rem;
  font-weight: 600;
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--ink);
  padding: 0.6em 1.4em;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.voir-plus:hover {
  background: var(--ink);
  color: var(--paper, #fff);
}
</style>