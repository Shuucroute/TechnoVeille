// Met une date brute de flux RSS au format "08 août 2026 · 14:32"
export function formaterDate(dateBrute) {
  const d = new Date(dateBrute)
  if (isNaN(d)) return ''
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
}

// Retire les balises HTML d'un extrait de description RSS
export function nettoyerExtrait(html, longueurMax = 180) {
  const texte = (html || '').replace(/<[^>]+>/g, '').trim()
  return texte.length > longueurMax ? texte.slice(0, longueurMax) + '…' : texte
}
