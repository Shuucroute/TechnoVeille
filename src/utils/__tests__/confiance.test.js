import { describe, it, expect } from 'vitest'
import { calculerScoresConfiance, cleArticle } from '../confiance.js'

function article(overrides = {}) {
  return {
    titre: 'Titre par défaut',
    lien: 'https://exemple.com/a',
    extrait: '',
    source: 'Source A',
    date: '2026-08-08T10:00:00Z',
    ...overrides,
  }
}

describe('calculerScoresConfiance', () => {
  it('donne un niveau "faible" à un article isolé, sans extrait ni date', () => {
    const a = article({ extrait: '', date: 'date invalide' })
    const scores = calculerScoresConfiance([a])
    const score = scores.get(cleArticle(a))
    expect(score.niveau).toBe('faible')
    expect(score.raisons).toContain('Source unique parmi vos flux pour l’instant')
    expect(score.raisons).toContain('Date de publication manquante')
  })

  it('augmente le score quand une autre source publie un titre très proche', () => {
    const a = article({ titre: 'Apple annonce un nouveau MacBook Pro', source: 'Source A' })
    const b = article({ titre: 'Apple dévoile son nouveau MacBook Pro', source: 'Source B', lien: 'https://exemple.com/b' })

    const scores = calculerScoresConfiance([a, b])
    const scoreA = scores.get(cleArticle(a))

    expect(scoreA.niveau).not.toBe('faible')
    expect(scoreA.raisons.some((r) => r.includes('autre source'))).toBe(true)
  })

  it('ne recoupe pas deux articles de la même source', () => {
    const a = article({ titre: 'Une actualité importante', source: 'Source A', lien: 'https://exemple.com/a' })
    const b = article({ titre: 'Une actualité importante', source: 'Source A', lien: 'https://exemple.com/a2' })

    const scores = calculerScoresConfiance([a, b])
    const scoreA = scores.get(cleArticle(a))
    expect(scoreA.raisons).toContain('Source unique parmi vos flux pour l’instant')
  })

  it("ne recoupe pas deux titres proches mais trop éloignés dans le temps", () => {
    const a = article({
      titre: 'Sortie du nouveau jeu vidéo attendu',
      source: 'Source A',
      lien: 'https://exemple.com/a',
      date: '2026-01-01T10:00:00Z',
    })
    const b = article({
      titre: 'Sortie du nouveau jeu vidéo très attendu',
      source: 'Source B',
      lien: 'https://exemple.com/b',
      date: '2026-06-01T10:00:00Z',
    })

    const scores = calculerScoresConfiance([a, b])
    const scoreA = scores.get(cleArticle(a))
    expect(scoreA.raisons).toContain('Source unique parmi vos flux pour l’instant')
  })

  it('valorise un extrait substantiel', () => {
    const a = article({ extrait: 'x'.repeat(120) })
    const scores = calculerScoresConfiance([a])
    const score = scores.get(cleArticle(a))
    expect(score.raisons).toContain('Extrait substantiel disponible')
  })
})
