export const CATEGORIES = [
  {
    id: 'musique',
    nom: 'Musique',
    couleur: '#a24fa0',
    motsCles: [
      'musique', 'album', 'chanson', 'concert', 'artiste', 'single',
      'clip', 'festival', 'chanteur', 'chanteuse', 'rappeur', 'rappeuse',
      'tournee', 'spotify', 'playlist', 'song', 'music', 'singer', 'band',
      'ep', 'featuring',
    ],
  },
  {
    id: 'voiture',
    nom: 'Voiture',
    couleur: '#2d6ca8',
    motsCles: [
      'voiture', 'automobile', 'vehicule electrique', 'voiture electrique',
      'suv', 'tesla', 'bmw', 'mercedes', 'renault', 'peugeot', 'citroen',
      'essai routier', 'permis de conduire', 'moteur thermique', 'hybride',
      'vehicle', 'sedan', 'pickup', 'constructeur automobile', 'stellantis',
    ],
  },
  {
    id: 'rm',
    nom: 'RM',
    couleur: '#1f9e8c',
    motsCles: [
      'realite mixte', 'realite virtuelle', 'realite augmentee', 'casque vr',
      'metavers', 'vision pro', 'meta quest', 'hololens', 'hologramme',
      'mixed reality', 'virtual reality', 'augmented reality', 'vr', 'ar',
    ],
  },
  {
    id: 'jeux-video',
    nom: 'Jeux vidéo',
    couleur: '#c76b1f',
    motsCles: [
      'jeu video', 'jeux video', 'jeu', 'jeux', 'jouer', 'joueur', 'joueurs',
      'gaming', 'playstation', 'ps5', 'ps4', 'xbox', 'nintendo', 'switch',
      'steam', 'manette', 'esport', 'dlc', 'gamer', 'console', 'consoles',
      'remake', 'mod', 'mods', 'video game', 'rpg', 'fps', 'mmo', 'speedrun',
      'gamecube',
    ],
  },
]

function normaliser(texte) {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function echapperRegex(texte) {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const CATEGORIES_AVEC_MOTIFS = CATEGORIES.map((categorie) => ({
  ...categorie,
  motifs: categorie.motsCles.map(
    (motCle) => new RegExp(`\\b${echapperRegex(normaliser(motCle))}s?\\b`, 'i'),
  ),
}))

const CATEGORIE_PAR_SOURCE_DEDIEE = {
  'gamekult': 'jeux-video',
  'game kult': 'jeux-video',
  'jeuxvideo.com': 'jeux-video',
  'jeuxactu': 'jeux-video',
  'gameblog': 'jeux-video',
  'uploadvr': 'rm',
  'road to vr': 'rm',
  'roadtovr': 'rm',
}

function normaliserSource(nom) {
  return normaliser(nom ?? '').trim()
}

export function detecterCategorie(article) {
  const texte = normaliser(`${article.titre ?? ''} ${article.extrait ?? ''}`)

  for (const categorie of CATEGORIES_AVEC_MOTIFS) {
    if (categorie.motifs.some((motif) => motif.test(texte))) {
      return categorie
    }
  }

  const idSource = CATEGORIE_PAR_SOURCE_DEDIEE[normaliserSource(article.source)]
  if (idSource) {
    return CATEGORIES.find((c) => c.id === idSource) ?? null
  }

  return null
}