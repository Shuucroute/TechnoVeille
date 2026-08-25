import { ref } from 'vue'
import { nettoyerExtrait } from '../utils/formatage.js'

const POINT_API = 'https://api.rss2json.com/v1/api.json?rss_url='

const CLE_API = import.meta.env.VITE_API_KEY

const CLE_STOCKAGE = 'telex-flux-utilisateur'

// Relit la liste de flux sauvegardée dans le navigateur, ou renvoie une liste vide
function chargerFluxSauvegardes() {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE)
    if (!brut) return []
    const parse = JSON.parse(brut)
    if (!Array.isArray(parse)) return []
    return parse
  } catch (erreur) {
    console.error('Lecture du stockage local impossible', erreur)
    return []
  }
}

function sauvegarderFlux(liste) {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(liste))
  } catch (erreur) {
    console.error('Écriture du stockage local impossible', erreur)
  }
}

export function useFlux() {
  const flux = ref(chargerFluxSauvegardes())
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
    sauvegarderFlux(flux.value)
    actualiserTout()
  }

  function retirerFlux(index) {
    flux.value.splice(index, 1)
    sauvegarderFlux(flux.value)
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