import { describe, it, expect } from 'vitest'
import { formaterDate, nettoyerExtrait } from '../formatage.js'

describe('formaterDate', () => {
  it('renvoie une chaîne vide pour une date invalide', () => {
    expect(formaterDate('pas une date')).toBe('')
    expect(formaterDate(undefined)).toBe('')
  })

  it('formate une date valide en français', () => {
    const resultat = formaterDate('2026-08-08T14:32:00Z')
    expect(resultat).toContain('2026')
    expect(resultat).toContain('·')
  })
})

describe('nettoyerExtrait', () => {
  it('retire les balises HTML', () => {
    expect(nettoyerExtrait('<p>Bonjour <b>le monde</b></p>')).toBe('Bonjour le monde')
  })

  it('décode les entités HTML courantes', () => {
    expect(nettoyerExtrait('Tom &amp; Jerry &#39;s show')).toBe("Tom & Jerry 's show")
    expect(nettoyerExtrait('Caf&eacute;'.replace('&eacute;', '&#233;'))).toBe('Café')
  })

  it('tronque au-delà de la longueur maximale et ajoute une ellipse', () => {
    const long = 'a'.repeat(200)
    const resultat = nettoyerExtrait(long, 10)
    expect(resultat).toBe('a'.repeat(10) + '…')
  })

  it('gère une entrée vide ou nulle', () => {
    expect(nettoyerExtrait(null)).toBe('')
    expect(nettoyerExtrait(undefined)).toBe('')
  })
})
