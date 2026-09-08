// Recherche, À LA DEMANDE (bouton par article, jamais en masse), des
// fact-checks déjà publiés par des organismes indépendants sur un sujet
// proche, via l'API Google Fact Check Tools (agrège des vérifications de
// l'AFP, Full Fact, PolitiFact, Les Décodeurs, etc.) :
// https://developers.google.com/fact-check/tools/api
//
// ⚠️ Deux limites importantes, à garder visibles dans l'interface :
//  1. Une correspondance porte sur un SUJET proche, pas sur CET article
//     précis : elle ne certifie ni ne dément le contenu affiché ici.
//  2. Comme pour rss2json, VITE_FACTCHECK_API_KEY est visible dans le
//     bundle client si vous la renseignez. Pour la garder secrète, passez
//     par le proxy fourni dans server-proxy-exemple/ (route /factcheck).
//
// Cette recherche est volontairement exclue du score automatique de
// confiance.js : interroger l'API sur chaque article de chaque flux à
// chaque actualisation épuiserait vite le quota gratuit. Elle n'est donc
// déclenchée qu'au clic, sur l'article qui intéresse l'utilisateur.

const POINT_API_FACTCHECK = 'https://factchecktools.googleapis.com/v1alpha1/claims:search'

const CLE_API_FACTCHECK = import.meta.env.VITE_FACTCHECK_API_KEY

// Si vous déployez le proxy fourni, remplacez la valeur ci-dessus par son URL
// et laissez CLE_API_FACTCHECK vide (le proxy ajoute la clé côté serveur).
const POINT_API_EFFECTIF = import.meta.env.VITE_FACTCHECK_PROXY_URL || POINT_API_FACTCHECK

const cacheRecherches = new Map()

export function factCheckDisponible() {
  return Boolean(CLE_API_FACTCHECK || import.meta.env.VITE_FACTCHECK_PROXY_URL)
}

// Extrait quelques mots-clés significatifs d'un titre pour une requête plus
// pertinente que le titre complet (souvent trop spécifique pour trouver un match)
function motsClesRequete(titre, maxMots = 6) {
  return (titre || '')
    .split(/\s+/)
    .filter((mot) => mot.length > 3)
    .slice(0, maxMots)
    .join(' ')
}

export async function rechercherFactChecks(titre) {
  if (!factCheckDisponible()) {
    const erreur = new Error("Aucune clé Fact Check configurée (VITE_FACTCHECK_API_KEY ou VITE_FACTCHECK_PROXY_URL)")
    erreur.code = 'AUCUNE_CLE'
    throw erreur
  }

  const requete = motsClesRequete(titre)
  if (!requete) return []

  if (cacheRecherches.has(requete)) {
    return cacheRecherches.get(requete)
  }

  const url = new URL(POINT_API_EFFECTIF)
  url.searchParams.set('query', requete)
  url.searchParams.set('languageCode', 'fr')
  if (CLE_API_FACTCHECK && POINT_API_EFFECTIF === POINT_API_FACTCHECK) {
    url.searchParams.set('key', CLE_API_FACTCHECK)
  }

  const reponse = await fetch(url.toString())
  if (!reponse.ok) {
    const erreur = new Error(`Erreur API Fact Check (HTTP ${reponse.status})`)
    erreur.code = 'ERREUR_RESEAU'
    throw erreur
  }

  const donnees = await reponse.json()

  const resultats = (donnees.claims || [])
    .map((claim) => {
      const revue = claim.claimReview?.[0]
      if (!revue?.url) return null
      return {
        texteClaim: claim.text,
        evaluateur: revue.publisher?.name || 'Organisme non précisé',
        verdict: revue.textualRating || 'Verdict non précisé',
        url: revue.url,
        dateClaim: claim.claimDate || null,
      }
    })
    .filter(Boolean)

  cacheRecherches.set(requete, resultats)
  return resultats
}
