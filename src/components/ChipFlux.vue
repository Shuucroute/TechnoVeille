<script setup>
defineProps({
  nom: { type: String, required: true },
  couleur: { type: String, required: true },
  enEchec: { type: Boolean, default: false },
})
defineEmits(['retirer'])
</script>

<template>
  <span class="chip" :class="{ echec: enEchec }">
    <span class="pastille-source" :style="{ background: couleur }"></span>
    {{ nom }}
    <span
      v-if="enEchec"
      class="alerte"
      title="Ce flux est injoignable pour l'instant (URL invalide, CORS, ou flux indisponible)"
      aria-label="Flux injoignable"
    >⚠</span>
    <button title="Retirer ce flux" @click="$emit('retirer')">×</button>
  </span>
</template>

<style scoped>
.chip {
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  background: var(--paper);
  border: 1px solid var(--ink);
  padding: 0.35em 0.5em 0.35em 0.7em;
  border-radius: var(--radius);
}
.pastille-source {
  width: 0.6em;
  height: 0.6em;
  border-radius: 50%;
  flex-shrink: 0;
}
.chip.echec {
  border-color: var(--stamp-red);
}
.alerte {
  color: var(--stamp-red);
  font-size: 0.85em;
  line-height: 1;
}
button {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: var(--stamp-red);
  font-size: 1rem;
  line-height: 1;
  padding: 0 0.15em;
}
</style>
