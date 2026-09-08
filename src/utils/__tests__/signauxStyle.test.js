import { describe, it, expect } from 'vitest'
import { detecterClickbait, detecterChargeEmotionnelle, detecterCitationSource } from '../signauxStyle.js'

describe('detecterClickbait', () => {
  it('détecte une formule putaclic classique', () => {
    const r = detecterClickbait("Vous ne devinerez jamais ce qui s'est passé ensuite")
    expect(r.detecte).toBe(true)
  })

  it('détecte une liste chiffrée en tête de titre', () => {
    const r = detecterClickbait('10 astuces pour économiser sur vos courses')
    expect(r.detecte).toBe(true)
  })

  it('détecte une ponctuation excessive', () => {
    const r = detecterClickbait('Il a réussi son examen !!!')
    expect(r.detecte).toBe(true)
  })

  it("ne déclenche rien sur un titre factuel classique", () => {
    const r = detecterClickbait('La Banque centrale relève ses taux directeurs de 0,25 point')
    expect(r.detecte).toBe(false)
  })
})

describe('detecterChargeEmotionnelle', () => {
  it('détecte un vocabulaire alarmiste dense', () => {
    const r = detecterChargeEmotionnelle('Un scandale choquant révélé, la situation est catastrophique')
    expect(r.detecte).toBe(true)
  })

  it("ne déclenche rien sur un seul mot isolé", () => {
    const r = detecterChargeEmotionnelle('Le gouvernement évoque une urgence sanitaire limitée')
    expect(r.detecte).toBe(false)
  })

  it('ignore un texte neutre', () => {
    const r = detecterChargeEmotionnelle('La réunion du conseil municipal aura lieu jeudi')
    expect(r.detecte).toBe(false)
  })
})

describe('detecterCitationSource', () => {
  it('détecte des guillemets', () => {
    expect(detecterCitationSource('Le maire a déclaré : "nous avançons"')).toBe(true)
  })

  it('détecte un marqueur d\'attribution', () => {
    expect(detecterCitationSource('Selon un rapport publié mardi, les ventes ont chuté')).toBe(true)
  })

  it('renvoie false sur un texte sans attribution', () => {
    expect(detecterCitationSource('Les ventes ont fortement chuté ce trimestre')).toBe(false)
  })

  it('renvoie false sur un texte vide', () => {
    expect(detecterCitationSource('')).toBe(false)
    expect(detecterCitationSource(null)).toBe(false)
  })
})
