// Palette de couleurs attribuées tour à tour à chaque flux suivi
// (utilisée pour les "tampons" et les pastilles des chips)
export const PALETTE = ['#B9862F', '#2C4A75', '#A5341F', '#3F6B4E']

export function couleurPour(index) {
  return PALETTE[index % PALETTE.length]
}
