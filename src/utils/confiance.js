// Calcule un score de fiabilité INDICATIF par article.
//
// ⚠️ Important : ceci n'est PAS une vérification factuelle du contenu. Aucun
// algorithme simple ne peut fiablement dire si une information est vraie ou
// fausse — ce score combine des critères objectifs et vérifiables :
//   1. Recoupement : combien d'autres flux (parmi ceux que vous suivez)
//      publient un article au titre très proche, dans une fenêtre de temps
//      raisonnable — un signe qu'une info circule à plusieurs endroits.
//   2. Présence d'un extrait substantiel (vs. un simple titre sans contenu).
//   3. Présence d'une date de publication exploitable.
//   4. Signaux stylistiques (clickbait, charge émotionnelle, attribution des
//      sources) — voir signauxStyle.js pour leurs limites.
//
// Un cinquième signal, la recherche de fact-checks publiés (Google Fact
// Check Tools), est volontairement tenu à l'écart de ce score automatique :
// voir factCheck.js — il est déclenché à la demande, article par article,
// pour ne pas épuiser le quota gratuit de l'API sur toute la liste.
//
// Chaque article expose la liste des raisons ayant mené à son score, affichée
// à l'utilisateur, pour que le calcul reste transparent et contestable.

import { detecterClickbait, detecterChargeEmotionnelle, detecterCitationSource } from './signauxStyle.js'

const MOTS_VIDES = new Set([
  'les', 'des', 'du', 'de', 'la', 'le', 'un', 'une', 'et', 'en', 'au', 'aux',
  'pour', 'sur', 'avec', 'dans', 'par', 'sont', 'est', 'ce', 'cette', 'ces',
  'qui', 'que', 'plus', 'pas', 'ne', 'se', 'sa', 'son', 'ses', 'leur',
  'leurs', 'il', 'elle', 'on', 'vous', 'nous', 'ils', 'elles', 'ou', 'mais',
  'donc', 'or', 'ni', 'car', 'sans', 'apres', 'avant', 'entre', 'vers',
  'chez', 'comme', 'tout', 'tous', 'toute', 'toutes', 'ete', 'fait', 'faire',
  'aussi', 'meme', 'bien', 'cet', 'cette', 'nouveau', 'nouvelle',
])

const SEUIL_SIMILARITE = 0.34
const FENETRE_TEMPORELLE_MS = 48 * 60 * 60 * 1000

function normaliser(texte) {
  return (texte || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
}

function motsSignificatifs(titre) {
  return new Set(
    normaliser(titre)
      .split(/\s+/)
      .filter((mot) => mot.length > 2 && !MOTS_VIDES.has(mot)),
  )
}

// Indice de Jaccard : proportion de mots communs entre deux titres
function similariteJaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const mot of a) {
    if (b.has(mot)) intersection++
  }
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

function dateValide(dateBrute) {
  const d = new Date(dateBrute)
  return isNaN(d) ? null : d
}

// Clé stable identifiant un article, indépendamment de sa position dans une
// liste filtrée/triée (utilisée pour retrouver son score depuis les composants)
export function cleArticle(article) {
  return `${article.lien || article.titre || ''}|${article.source || ''}`
}

// Calcule le score de chaque article d'une liste, en les comparant entre eux
// pour détecter les recoupements. À appeler sur la liste COMPLÈTE des
// articles (non filtrée par la recherche), pour ne pas perdre de recoupements.
export function calculerScoresConfiance(articles) {
  const motsCles = articles.map((a) => motsSignificatifs(a.titre))
  const dates = articles.map((a) => dateValide(a.date))

  const scores = new Map()

  articles.forEach((article, i) => {
    const sourcesRecoupees = new Set()

    articles.forEach((autre, j) => {
      if (i === j || autre.source === article.source) return
      if (dates[i] && dates[j] && Math.abs(dates[i] - dates[j]) > FENETRE_TEMPORELLE_MS) return
      if (similariteJaccard(motsCles[i], motsCles[j]) >= SEUIL_SIMILARITE) {
        sourcesRecoupees.add(autre.source)
      }
    })

    const raisons = []
    let score = 35

    if (sourcesRecoupees.size >= 2) {
      score += 50
      raisons.push(`Repris par ${sourcesRecoupees.size} autres sources suivies`)
    } else if (sourcesRecoupees.size === 1) {
      score += 25
      raisons.push('Repris par une autre source suivie')
    } else {
      raisons.push('Source unique parmi vos flux pour l’instant')
    }

    if ((article.extrait || '').length >= 80) {
      score += 10
      raisons.push('Extrait substantiel disponible')
    } else {
      raisons.push('Extrait très court ou absent')
    }

    if (dates[i]) {
      score += 5
      raisons.push('Date de publication renseignée')
    } else {
      raisons.push('Date de publication manquante')
    }

    const clickbait = detecterClickbait(article.titre)
    if (clickbait.detecte) {
      score -= 15
      raisons.push(`Titre à tournure sensationnaliste (${clickbait.indices[0]})`)
    }

    const chargeEmotionnelle = detecterChargeEmotionnelle(`${article.titre || ''} ${article.extrait || ''}`)
    if (chargeEmotionnelle.detecte) {
      score -= 10
      raisons.push('Vocabulaire à forte charge émotionnelle')
    }

    const citationSource = detecterCitationSource(article.extrait)
    if (citationSource) {
      score += 10
      raisons.push('Une source est explicitement citée dans l’extrait')
    } else if ((article.extrait || '').length >= 40) {
      score -= 5
      raisons.push('Aucune source explicitement citée dans l’extrait')
    }

    score = Math.max(0, Math.min(100, score))

    let niveau
    let libelle
    if (score >= 80) {
      niveau = 'fort'
      libelle = 'Recoupée par plusieurs sources'
    } else if (score >= 55) {
      niveau = 'moyen'
      libelle = 'Recoupée une fois'
    } else {
      niveau = 'faible'
      libelle = 'Source unique — à vérifier'
    }

    scores.set(cleArticle(article), {
      score,
      niveau,
      libelle,
      raisons,
      signaux: { clickbait, chargeEmotionnelle, citationSource },
    })
  })

  return scores
}
