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

// Entités HTML les plus courantes dans les flux RSS (évite d'afficher "&amp;", "&#39;"…)
const ENTITES_HTML = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&hellip;': '…',
  '&mdash;': '—',
  '&ndash;': '–',
}

function decoderEntitesHtml(texte) {
  return texte
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&apos;|&nbsp;|&hellip;|&mdash;|&ndash;/g, (e) => ENTITES_HTML[e])
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

// Retire les balises HTML et décode les entités d'un extrait de description RSS
export function nettoyerExtrait(html, longueurMax = 180) {
  const sansBalises = (html || '').replace(/<[^>]+>/g, '').trim()
  const texte = decoderEntitesHtml(sansBalises)
  return texte.length > longueurMax ? texte.slice(0, longueurMax) + '…' : texte
}
