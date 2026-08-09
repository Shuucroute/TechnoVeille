<script setup>
import { onMounted, onUnmounted } from 'vue'
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
</script>

<template>
  <Entete />
  <BandeauTelex :articles="articles" />

  <PanneauFlux
    :flux="flux"
    @ajouter="({ nom, url }) => ajouterFlux(nom, url)"
    @retirer="retirerFlux"
  />

  <GrilleArticles
    :articles="articles"
    :flux="flux"
    :en-chargement="enChargement"
    :flux-en-echec="fluxEnEchec"
    :derniere-actualisation="derniereActualisation"
  />

  <footer>
    Les flux sont récupérés en direct depuis votre navigateur — rien n'est stocké sur un serveur.<br />
    À la fermeture de la page, la liste de flux repart de zéro.
  </footer>
</template>

<style scoped>
footer {
  text-align: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  color: var(--ink-soft);
  padding: 1.5em 1em 2.5em;
}
</style>
