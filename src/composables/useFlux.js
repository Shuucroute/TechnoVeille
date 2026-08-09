import { ref } from 'vue'
import { FLUX_PAR_DEFAUT } from '../data/fluxSuggeres.js'
import { nettoyerExtrait } from '../utils/formatage.js'

const POINT_API = 'https://api.rss2json.com/v1/api.json?rss_url='

const CLE_API = 'gicigeecfrrwer42ygkpv1jd11ii2d1glcigx5zb'

export function useFlux() {
  const flux = ref([...FLUX_PAR_DEFAUT])
  const articles = ref([])
  const enChargement = ref(false)
  const fluxEnEchec = ref(0)
  const derniereActualisation = ref(null)

  // Récupère UN flux et renvoie sa liste d'articles (ou null en cas d'échec)
  async function recupererUnFlux(unFlux) {
    try {
      const url = POINT_API + encodeURIComponent(unFlux.url) + (CLE_API ? `&api_key=${CLE_API}` : '')
      const reponse = await fetch(url)
      const donnees = await reponse.json()

      if (donnees.status !== 'ok') throw new Error(donnees.message || 'flux invalide')

      return donnees.items.map((item) => ({
        titre: item.title,
        lien: item.link,
        date: item.pubDate,
        extrait: nettoyerExtrait(item.description),
        source: unFlux.nom,
      }))
    } catch (erreur) {
      console.error('Échec de récupération pour', unFlux.url, erreur)
      return null
    }
  }

  async function actualiserTout() {
    enChargement.value = true

    const resultats = await Promise.all(flux.value.map(recupererUnFlux))

    let fusion = []
    let echecs = 0
    resultats.forEach((liste) => {
      if (liste === null) {
        echecs++
        return
      }
      fusion = fusion.concat(liste)
    })

    fusion.sort((a, b) => new Date(b.date) - new Date(a.date))

    articles.value = fusion
    fluxEnEchec.value = echecs
    derniereActualisation.value = new Date()
    enChargement.value = false
  }

  function ajouterFlux(nom, url) {
    if (flux.value.some((f) => f.url === url)) return
    flux.value.push({ nom, url })
    actualiserTout()
  }

  function retirerFlux(index) {
    flux.value.splice(index, 1)
    actualiserTout()
  }

  return {
    flux,
    articles,
    enChargement,
    fluxEnEchec,
    derniereActualisation,
    actualiserTout,
    ajouterFlux,
    retirerFlux,
  }
}