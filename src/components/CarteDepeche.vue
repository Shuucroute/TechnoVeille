<script setup>
import { formaterDate } from '../utils/formatage.js'

defineProps({
  article: { type: Object, required: true },
  couleur: { type: String, required: true },
  categorie: { type: Object, default: null },
})
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
</style>