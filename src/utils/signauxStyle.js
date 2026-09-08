// Signaux STYLISTIQUES : calculés uniquement à partir de la forme du texte
// (titre + extrait), sans aucune base de faits. Ils ne mesurent PAS si une
// information est vraie — seulement des tournures d'écriture statistiquement
// associées à du contenu sensationnaliste ou peu sourcé. Un article tout à
// fait exact peut cocher ces signaux (un vrai scandale reste un scandale),
// et un article trompeur peut très bien les éviter. Ce sont des indices de
// forme, jamais de fond — à traiter comme tels dans l'interface.

function normaliser(texte) {
  return (texte || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const MOTIFS_CLICKBAIT = [
  { motif: /vous ne (allez pas|devinerez jamais|croirez jamais)/, label: 'formule "vous ne devinerez/croirez jamais"' },
  { motif: /ce que .*(cache|cachent|ne veulent pas que vous sachiez)/, label: 'sous-entendu de dissimulation ("ce qu\'ils cachent")' },
  { motif: /la verite (sur|derriere|cachee)/, label: 'formule "la vérité sur…"' },
  { motif: /\bincroyable\b/, label: 'superlatif "incroyable"' },
  { motif: /\bchoquant/, label: 'superlatif "choquant"' },
  { motif: /\bexclusif\b/, label: 'mention "exclusif"' },
  { motif: /^\s*\d+\s+(choses|raisons|astuces|secrets|signes)/, label: 'liste chiffrée en tête de titre (ex: "10 choses…")' },
  { motif: /ca va vous/, label: 'formule "ça va vous…"' },
]

// Analyse le TITRE uniquement (c'est là que le sensationnalisme se joue)
export function detecterClickbait(titre) {
  const brut = titre || ''
  const normalise = normaliser(brut)
  const indices = []

  for (const { motif, label } of MOTIFS_CLICKBAIT) {
    if (motif.test(normalise)) indices.push(label)
  }

  const motsMajuscules = (brut.match(/\b[A-ZÀ-Ý]{4,}\b/g) || []).length
  if (motsMajuscules >= 2) indices.push('plusieurs mots entièrement en MAJUSCULES')

  if (/[!?]{2,}/.test(brut)) indices.push('ponctuation excessive (!!, ??…)')

  return { detecte: indices.length > 0, indices }
}

const MOTS_CHARGE_EMOTIONNELLE = [
  'scandale', 'scandaleux', 'catastrophe', 'catastrophique', 'choc', 'choquant',
  'horreur', 'horrible', 'terrifiant', 'complot', 'cachent', 'mensonge',
  'mensonges', 'alerte', 'urgent', 'urgence', 'dramatique', 'effrayant',
  'affole', 'panique', 'inquietant', 'alarmant', 'scandaleuse',
]

// Analyse titre + extrait : une trop forte densité de vocabulaire alarmiste
// est un indice de ton, pas de fausseté (un vrai scandale reste scandaleux)
export function detecterChargeEmotionnelle(texte) {
  const normalise = normaliser(texte)
  const motsTrouves = MOTS_CHARGE_EMOTIONNELLE.filter((mot) =>
    new RegExp(`\\b${mot}s?\\b`).test(normalise),
  )
  return { detecte: motsTrouves.length >= 2, motsTrouves }
}

const MARQUEURS_CITATION = [
  'selon', "d'apres", 'rapporte', 'rapportent', 'affirme', 'affirment',
  'a declare', 'ont declare', 'a explique', 'ont explique', 'precise',
  'precisent', 'cite par', 'source :',
]

// Un article qui attribue ses informations (guillemets, "selon X"…) est,
// statistiquement, mieux sourcé qu'un texte à l'affirmation flottante —
// mais l'absence de ce marqueur dans un simple extrait RSS tronqué ne
// prouve rien en soi (le sourçage peut être plus loin dans l'article complet)
export function detecterCitationSource(texte) {
  if (!texte) return false
  if (/[«»""]/.test(texte)) return true
  const normalise = normaliser(texte)
  return MARQUEURS_CITATION.some((marqueur) => normalise.includes(normaliser(marqueur)))
}
