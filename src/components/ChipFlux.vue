<script setup>
defineProps({
  nom: { type: String, required: true },
  couleur: { type: String, required: true },
})
defineEmits(['retirer'])
</script>

<template>
  <span class="chip">
    <span class="pastille-source" :style="{ background: couleur }"></span>
    {{ nom }}
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
