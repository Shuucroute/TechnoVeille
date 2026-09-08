<script setup>
import { ref } from 'vue'
import { formaterDate } from '../utils/formatage.js'
import { rechercherFactChecks, factCheckDisponible } from '../utils/factCheck.js'

const props = defineProps({
  article: { type: Object, required: true },
  couleur: { type: String, required: true },
  categorie: { type: Object, default: null },
  confiance: { type: Object, default: null },
})

// etat : 'inactif' | 'chargement' | 'ok' | 'erreur'
const factCheck = ref({ etat: 'inactif', resultats: [], message: '' })

async function lancerRechercheFactCheck() {
  factCheck.value = { etat: 'chargement', resultats: [], message: '' }
  try {
    const resultats = await rechercherFactChecks(props.article.titre)
    factCheck.value = { etat: 'ok', resultats, message: '' }
  } catch (erreur) {
    const message =
      erreur.code === 'AUCUNE_CLE'
        ? "Recherche désactivée : aucune clé d'API Fact Check configurée pour ce site."
        : 'Recherche impossible pour le moment (réseau ou quota API).'
    factCheck.value = { etat: 'erreur', resultats: [], message }
  }
}
</script>

<template>
  <article class="depeche">
    <span class="tampon" :style="{ color: couleur }">{{ article.source }}</span>
    <h3>
      <a :href="article.lien" target="_blank" rel="noopener noreferrer">{{ article.titre }}</a>
    </h3>
    <div class="meta">
      {{ formaterDate(article.date) }}
      <span
        v-if="categorie"
        class="etiquette-categorie"
        :style="{ '--couleur-categorie': categorie.couleur }"
      >
        {{ categorie.nom }}
      </span>
    </div>
    <p class="extrait">{{ article.extrait }}</p>
    <div
      v-if="confiance"
      class="confiance"
      :class="'confiance--' + confiance.niveau"
      :title="'Score indicatif (non factuel) : ' + confiance.raisons.join(' · ')"
    >
      <span class="confiance-point" aria-hidden="true"></span>
      {{ confiance.libelle }} · {{ confiance.score }}%
      <span class="sr-only"> — {{ confiance.raisons.join(', ') }}</span>
    </div>

    <div class="fact-check">
      <button
        v-if="factCheck.etat === 'inactif' || factCheck.etat === 'erreur'"
        type="button"
        class="bouton-factcheck"
        @click="lancerRechercheFactCheck"
      >
        Chercher des fact-checks liés
      </button>
      <p v-if="factCheck.etat === 'chargement'" class="factcheck-msg">Recherche en cours…</p>
      <p v-else-if="factCheck.etat === 'erreur'" class="factcheck-msg factcheck-msg--erreur">
        {{ factCheck.message }}
      </p>
      <template v-else-if="factCheck.etat === 'ok'">
        <p class="factcheck-note">
          Sujets proches déjà vérifiés par des organismes indépendants — ne certifie pas cet article précis.
        </p>
        <ul v-if="factCheck.resultats.length" class="factcheck-liste">
          <li v-for="(r, i) in factCheck.resultats" :key="i">
            <a :href="r.url" target="_blank" rel="noopener noreferrer">
              <strong>{{ r.evaluateur }}</strong> : {{ r.verdict }}
            </a>
          </li>
        </ul>
        <p v-else class="factcheck-msg">Aucun fact-check publié trouvé sur un sujet proche.</p>
      </template>
    </div>
  </article>
</template>

<style scoped>
.depeche {
  position: relative;
  background: var(--paper);
  border: 1px solid var(--ink);
  border-left: none;
  padding: 1.1em 1.1em 1.6em 1.5em;
  display: flex;
  flex-direction: column;
  gap: 0.55em;
}

.depeche::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0.85em;
  background: radial-gradient(circle at 50% 0, transparent 4px, var(--paper-dark) 4.5px) top / 100% 1.15em
    repeat-y;
  border-right: 1px dashed var(--ink-soft);
}

.depeche::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -9px;
  height: 18px;
  background:
    linear-gradient(135deg, var(--paper) 50%, transparent 50%) 0 0/14px 14px,
    linear-gradient(45deg, var(--paper) 50%, transparent 50%) 0 0/14px 14px;
  background-position: 0 0, 7px 0;
}

.tampon {
  align-self: flex-end;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 0.25em 0.55em;
  border: 2px solid currentColor;
  border-radius: 3px;
  transform: rotate(-3deg);
}

h3 {
  margin: 0.1em 0 0;
  font-family: 'Oswald', sans-serif;
  font-weight: 600;
  font-size: 1.05rem;
  line-height: 1.28;
}
h3 a {
  color: var(--ink);
  text-decoration: none;
}
h3 a:hover {
  text-decoration: underline;
  text-decoration-color: var(--brass);
}

.meta {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  color: var(--ink-soft);
  letter-spacing: 0.02em;
}

.etiquette-categorie {
  display: inline-block;
  margin-left: 0.6em;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--couleur-categorie);
  border: 1px solid var(--couleur-categorie);
  border-radius: var(--radius);
  padding: 0.12em 0.5em;
}

.extrait {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.85rem;
  color: var(--ink-soft);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.confiance {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  align-self: flex-start;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--couleur-confiance);
  cursor: help;
}
.confiance-point {
  width: 0.55em;
  height: 0.55em;
  border-radius: 50%;
  background: var(--couleur-confiance);
  flex-shrink: 0;
}
.confiance--fort {
  --couleur-confiance: var(--pine);
}
.confiance--moyen {
  --couleur-confiance: var(--brass);
}
.confiance--faible {
  --couleur-confiance: var(--ink-soft);
}

.fact-check {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
}

.bouton-factcheck {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  background: transparent;
  color: var(--wire-blue);
  border: 1px solid var(--wire-blue);
  border-radius: var(--radius);
  padding: 0.3em 0.6em;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.bouton-factcheck:hover {
  background: var(--wire-blue);
  color: var(--paper, #fff);
}

.factcheck-msg {
  margin: 0.4em 0 0;
  color: var(--ink-soft);
}
.factcheck-msg--erreur {
  color: var(--stamp-red);
}

.factcheck-note {
  margin: 0.4em 0 0.3em;
  color: var(--ink-soft);
  font-style: italic;
}

.factcheck-liste {
  margin: 0;
  padding-left: 1.1em;
}
.factcheck-liste a {
  color: var(--ink);
}
.factcheck-liste a:hover {
  text-decoration-color: var(--brass);
}
</style>