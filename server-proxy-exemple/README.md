# Proxy optionnel pour cacher les clés API

`worker.js` est un exemple minimal de [Cloudflare Worker](https://developers.cloudflare.com/workers/)
qui relaie les appels à **rss2json** et à **Google Fact Check Tools** en
gardant les clés API secrètes côté serveur.

C'est **optionnel** :
- Sans clé rss2json, l'application fonctionne avec le quota gratuit (suffisant pour un usage personnel).
- La recherche de fact-checks (bouton par article) est simplement désactivée tant qu'aucune clé/proxy Fact Check n'est configuré — le reste de l'app fonctionne normalement.

Ce proxy est utile si vous voulez activer la recherche de fact-checks sans
exposer votre clé Google, ou passer à un usage plus intensif de rss2json.

Voir les commentaires en tête de `worker.js` pour les étapes de déploiement.
