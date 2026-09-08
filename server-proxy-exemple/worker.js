/**
 * Exemple de proxy Cloudflare Worker pour appeler rss2json ET Google Fact
 * Check Tools SANS exposer les clés API dans le navigateur.
 *
 * Pourquoi : toute variable préfixée VITE_ dans le front-end (voir
 * src/composables/useFlux.js et src/utils/factCheck.js) finit en clair dans
 * le JS livré au navigateur. Ce worker s'intercale entre le front et les deux
 * APIs : les clés restent secrètes côté serveur (stockées en tant que
 * "secrets" Cloudflare), et le front-end n'appelle plus que ce worker.
 *
 * Routes exposées :
 *   GET /rss?rss_url=...        → proxy vers rss2json
 *   GET /factcheck?query=...    → proxy vers Google Fact Check Tools
 *
 * Déploiement rapide :
 *   1. npm install -g wrangler
 *   2. wrangler secret put RSS2JSON_API_KEY        (optionnel, coller la clé)
 *   3. wrangler secret put FACTCHECK_API_KEY        (coller la clé Google)
 *   4. wrangler deploy
 *   5. Dans le front-end :
 *      - src/composables/useFlux.js : remplacer POINT_API par
 *        "https://votre-worker.workers.dev/rss?rss_url=" (et ne plus ajouter
 *        &api_key=... côté client, il est déjà géré ici)
 *      - définir VITE_FACTCHECK_PROXY_URL="https://votre-worker.workers.dev/factcheck"
 *        dans un fichier .env (voir factCheck.js) — plus besoin de
 *        VITE_FACTCHECK_API_KEY côté client
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/rss') {
      return proxyRss(url, env)
    }
    if (url.pathname === '/factcheck') {
      return proxyFactCheck(url, env)
    }

    return new Response(JSON.stringify({ error: 'Route inconnue : utilisez /rss ou /factcheck' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    })
  },
}

async function proxyRss(url, env) {
  const rssUrl = url.searchParams.get('rss_url')
  if (!rssUrl) {
    return reponseErreur('Paramètre rss_url manquant', 400)
  }

  const cible = new URL('https://api.rss2json.com/v1/api.json')
  cible.searchParams.set('rss_url', rssUrl)
  if (env.RSS2JSON_API_KEY) {
    cible.searchParams.set('api_key', env.RSS2JSON_API_KEY)
  }

  const reponse = await fetch(cible.toString())
  return relayer(reponse)
}

async function proxyFactCheck(url, env) {
  const query = url.searchParams.get('query')
  if (!query) {
    return reponseErreur('Paramètre query manquant', 400)
  }
  if (!env.FACTCHECK_API_KEY) {
    return reponseErreur('FACTCHECK_API_KEY non configurée côté serveur', 500)
  }

  const cible = new URL('https://factchecktools.googleapis.com/v1alpha1/claims:search')
  cible.searchParams.set('query', query)
  cible.searchParams.set('languageCode', url.searchParams.get('languageCode') || 'fr')
  cible.searchParams.set('key', env.FACTCHECK_API_KEY)

  const reponse = await fetch(cible.toString())
  return relayer(reponse)
}

async function relayer(reponse) {
  const corps = await reponse.text()
  return new Response(corps, {
    status: reponse.status,
    headers: {
      'content-type': 'application/json',
      // Autorise l'appel depuis votre front-end (à restreindre à votre
      // propre domaine en production plutôt que '*')
      'access-control-allow-origin': '*',
    },
  })
}

function reponseErreur(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
