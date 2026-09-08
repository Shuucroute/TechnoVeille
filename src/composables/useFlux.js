import { ref } from 'vue'
import { nettoyerExtrait } from '../utils/formatage.js'

const POINT_API = 'https://api.rss2json.com/v1/api.json?rss_url='

// ⚠️ Toute variable préfixée VITE_ est injectée EN CLAIR dans le bundle livré
// au navigateur : n'importe qui peut l'extraire depuis les devtools ou les
// requêtes réseau. Ne mettez ici qu'une clé rss2json que vous acceptez de
// voir fuiter (quota gratuit), jamais une clé sensible. Pour un usage plus
// intensif et garder la clé secrète, faites transiter les requêtes par un
// petit proxy serveur (voir server-proxy-exemple/ à la racine du projet) qui
// ajoute la clé côté serveur, et pointez POINT_API vers ce proxy à la place.
const CLE_API = import.meta.env.VITE_API_KEY

const CLE_STOCKAGE_FLUX = 'telex-flux-utilisateur'
const CLE_STOCKAGE_ARTICLES = 'telex-articles-cache'

// Normalise une URL de flux pour comparer proprement deux entrées
// (évite d'ajouter deux fois "https://x.com/feed" et "https://x.com/feed/")
function normaliserUrl(url) {
  try {
    const u = new URL(url.trim())
    u.hash = ''
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1)
    }
    return u.toString()
  } catch {
    return url.trim()
  }
}

// Vérifie qu'une chaîne ressemble à une URL http(s) valide avant tout appel réseau
export function estUrlValide(url) {
  try {
    const u = new URL(url.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function chargerJsonStocke(cle, valeurParDefaut) {
  try {
    const brut = localStorage.getItem(cle)
    if (!brut) return valeurParDefaut
    const parse = JSON.parse(brut)
    return parse ?? valeurParDefaut
  } catch (erreur) {
    console.error(`Lecture du stockage local impossible (${cle})`, erreur)
    return valeurParDefaut
  }
}

function sauvegarderJson(cle, valeur) {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur))
  } catch (erreur) {
    console.error(`Écriture du stockage local impossible (${cle})`, erreur)
  }
}

function chargerFluxSauvegardes() {
  const liste = chargerJsonStocke(CLE_STOCKAGE_FLUX, [])
  return Array.isArray(liste) ? liste : []
}

function chargerArticlesEnCache() {
  const liste = chargerJsonStocke(CLE_STOCKAGE_ARTICLES, [])
  return Array.isArray(liste) ? liste : []
}

export function useFlux() {
  const flux = ref(chargerFluxSauvegardes())
  // On affiche tout de suite le dernier résultat connu (localStorage) : l'écran
  // n'est plus vide le temps du premier fetch au chargement de la page.
  const articles = ref(chargerArticlesEnCache())
  const enChargement = ref(false)
  // Ensemble des URLs de flux actuellement en échec (permet d'afficher
  // précisément *quel* flux pose problème, pas juste un compteur global)
  const fluxEnEchecUrls = ref(new Set())
  const derniereActualisation = ref(null)

  function persisterArticles(liste) {
    articles.value = liste
    sauvegarderJson(CLE_STOCKAGE_ARTICLES, liste)
  }

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
        urlFlux: unFlux.url,
      }))
    } catch (erreur) {
      console.error('Échec de récupération pour', unFlux.url, erreur)
      return null
    }
  }

  function fusionnerEtTrier(listesArticles) {
    const fusion = listesArticles.flat()
    fusion.sort((a, b) => new Date(b.date) - new Date(a.date))
    return fusion
  }

  // Réactualise l'ensemble des flux suivis (chargement initial, minuteur, bouton "actualiser")
  async function actualiserTout() {
    if (flux.value.length === 0) {
      persisterArticles([])
      fluxEnEchecUrls.value = new Set()
      derniereActualisation.value = new Date()
      return
    }

    enChargement.value = true

    const resultats = await Promise.all(flux.value.map(recupererUnFlux))

    const echecs = new Set()
    const listesOk = []
    resultats.forEach((liste, i) => {
      if (liste === null) {
        echecs.add(flux.value[i].url)
        return
      }
      listesOk.push(liste)
    })

    persisterArticles(fusionnerEtTrier(listesOk))
    fluxEnEchecUrls.value = echecs
    derniereActualisation.value = new Date()
    enChargement.value = false
  }

  // Ajoute un flux et ne va chercher QUE celui-ci (au lieu de tout refaire),
  // pour ménager le quota gratuit de rss2json et rester rapide
  async function ajouterFlux(nom, url) {
    const urlNormalisee = normaliserUrl(url)
    if (flux.value.some((f) => normaliserUrl(f.url) === urlNormalisee)) return

    const nouveauFlux = { nom, url: urlNormalisee }
    flux.value.push(nouveauFlux)
    sauvegarderJson(CLE_STOCKAGE_FLUX, flux.value)

    enChargement.value = true
    const liste = await recupererUnFlux(nouveauFlux)
    enChargement.value = false

    const echecs = new Set(fluxEnEchecUrls.value)
    if (liste === null) {
      echecs.add(nouveauFlux.url)
    } else {
      echecs.delete(nouveauFlux.url)
      persisterArticles(fusionnerEtTrier([articles.value, liste]))
    }
    fluxEnEchecUrls.value = echecs
    derniereActualisation.value = new Date()
  }

  // Retire un flux et ses articles associés, sans refaire de fetch réseau
  function retirerFlux(index) {
    const fluxRetire = flux.value[index]
    if (!fluxRetire) return

    flux.value.splice(index, 1)
    sauvegarderJson(CLE_STOCKAGE_FLUX, flux.value)

    persisterArticles(articles.value.filter((a) => a.urlFlux !== fluxRetire.url))

    const echecs = new Set(fluxEnEchecUrls.value)
    echecs.delete(fluxRetire.url)
    fluxEnEchecUrls.value = echecs
  }

  return {
    flux,
    articles,
    enChargement,
    fluxEnEchecUrls,
    derniereActualisation,
    actualiserTout,
    ajouterFlux,
    retirerFlux,
  }
}
