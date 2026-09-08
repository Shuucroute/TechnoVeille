import { describe, it, expect } from 'vitest'
import { detecterCategorie } from '../categories.js'

describe('detecterCategorie', () => {
  it('détecte une catégorie via un mot-clé dans le titre', () => {
    const categorie = detecterCategorie({ titre: 'La nouvelle voiture électrique de Tesla', extrait: '' })
    expect(categorie?.id).toBe('voiture')
  })

  it('détecte une catégorie via un mot-clé accentué (normalisation)', () => {
    const categorie = detecterCategorie({ titre: 'Un nouveau casque de réalité virtuelle', extrait: '' })
    expect(categorie?.id).toBe('rm')
  })

  it("retombe sur la source dédiée si aucun mot-clé ne correspond", () => {
    const categorie = detecterCategorie({ titre: 'Actualités diverses', extrait: '', source: 'GameKult' })
    expect(categorie?.id).toBe('jeux-video')
  })

  it('renvoie null si rien ne correspond', () => {
    const categorie = detecterCategorie({ titre: 'La météo de demain', extrait: '', source: 'France Info' })
    expect(categorie).toBeNull()
  })

  it("n'accroche pas sur un sous-mot (limite de mot \\b respectée)", () => {
    const categorie = detecterCategorie({ titre: 'Le carrelage de la salle de bain', extrait: '' })
    expect(categorie).toBeNull()
  })
})
