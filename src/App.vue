<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useFlux } from './composables/useFlux.js'
import Entete from './components/Entete.vue'
import BandeauTelex from './components/BandeauTelex.vue'
import PanneauFlux from './components/PanneauFlux.vue'
import GrilleArticles from './components/GrilleArticles.vue'

const {
  flux,
  articles,
  enChargement,
  fluxEnEchec,
  derniereActualisation,
  actualiserTout,
  ajouterFlux,
  retirerFlux,
} = useFlux()

let intervalleActualisation = null

onMounted(() => {
  actualiserTout()
  // Actualisation automatique toutes les 5 minutes
  intervalleActualisation = setInterval(actualiserTout, 5 * 60 * 1000)
})
onUnmounted(() => clearInterval(intervalleActualisation))

// --- Recherche ---
const rechercheOuverte = ref(false)
const texteRecherche = ref('')
const champRecherche = ref(null)

function basculerRecherche() {
  rechercheOuverte.value = !rechercheOuverte.value
  if (rechercheOuverte.value) {
    nextTick(() => champRecherche.value?.focus())
  } else {
    texteRecherche.value = ''
  }
}

function fermerRecherche() {
  rechercheOuverte.value = false
  texteRecherche.value = ''
}

const articlesFiltres = computed(() => {
  const q = texteRecherche.value.trim().toLowerCase()
  if (!q) return articles.value
  return articles.value.filter((a) =>
    [a.titre, a.extrait, a.source].some((champ) =>
      champ?.toLowerCase().includes(q)
    )
  )
})
</script>

<template>
  <Entete />
  <BandeauTelex :articles="articles" />

  <div class="barre-recherche" :class="{ ouverte: rechercheOuverte }">
    <input
      ref="champRecherche"
      v-model="texteRecherche"
      type="text"
      class="champ-recherche"
      placeholder="Rechercher un article…"
      @keyup.escape="fermerRecherche"
    />
    <button
      type="button"
      class="bouton-recherche"
      :aria-expanded="rechercheOuverte"
      aria-label="Rechercher"
      @click="basculerRecherche"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2" />
        <line x1="21" y1="21" x2="15.5" y2="15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </div>

  <PanneauFlux
    :flux="flux"
    @ajouter="({ nom, url }) => ajouterFlux(nom, url)"
    @retirer="retirerFlux"
  />

  <GrilleArticles
    :articles="articlesFiltres"
    :flux="flux"
    :en-chargement="enChargement"
    :flux-en-echec="fluxEnEchec"
    :derniere-actualisation="derniereActualisation"
  />

  <footer>
    Les flux sont récupérés en direct depuis votre navigateur — rien n'est stocké sur un serveur.<br />
    Votre liste de flux est mémorisée sur cet appareil (localStorage) et vous sera proposée à chaque visite.
  </footer>
</template>

<style scoped>
.barre-recherche {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4em;
  padding: 0.6em 1em 0;
}

.bouton-recherche {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.2em;
  height: 2.2em;
  border: 1px solid var(--ink-soft);
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.bouton-recherche:hover {
  background: var(--ink);
  color: var(--paper, #fff);
}

.champ-recherche {
  width: 0;
  padding: 0;
  border: 1px solid var(--ink-soft);
  border-radius: 999px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
  color: var(--ink);
  background: transparent;
  opacity: 0;
  overflow: hidden;
  transition: width 0.25s ease, opacity 0.2s ease, padding 0.25s ease;
}

.barre-recherche.ouverte .champ-recherche {
  width: 16em;
  padding: 0.5em 0.9em;
  opacity: 1;
}

.champ-recherche:focus {
  outline: none;
  border-color: var(--ink);
}

footer {
  text-align: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  color: var(--ink-soft);
  padding: 1.5em 1em 2.5em;
}
</style>