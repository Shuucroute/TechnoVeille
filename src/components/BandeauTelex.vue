<script setup>
import { computed } from 'vue'

const props = defineProps({
  articles: { type: Array, default: () => [] },
})

const texte = computed(() => {
  if (props.articles.length === 0) return 'En attente de dépêches…'
  return props.articles
    .slice(0, 7)
    .map((a) => `▮ ${a.source} — ${a.titre}`)
    .join('     ')
})
</script>

<template>
  <div class="telex" aria-hidden="true">
    <span class="piste">{{ texte }}</span>
  </div>
</template>

<style scoped>
.telex {
  background: var(--wire-blue);
  color: var(--paper);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.02em;
  overflow: hidden;
  white-space: nowrap;
  padding: 0.45em 0;
  border-bottom: 1px solid var(--ink);
}

.piste {
  display: inline-block;
  padding-left: 100%;
  animation: defiler 45s linear infinite;
}
.piste:hover {
  animation-play-state: paused;
}
@keyframes defiler {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .piste {
    animation: none;
    padding-left: 1em;
  }
}
</style>
