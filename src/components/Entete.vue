<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const heure = ref(new Date().toLocaleTimeString('fr-FR'))
let intervalle = null

onMounted(() => {
  intervalle = setInterval(() => {
    heure.value = new Date().toLocaleTimeString('fr-FR')
  }, 1000)
})
onUnmounted(() => clearInterval(intervalle))
</script>

<template>
  <header class="station">
    <div>
      <h1><span class="pastille"></span> Veille Techno</h1>
    </div>
    <div class="horloge">{{ heure }}</div>
  </header>
</template>

<style scoped>
.station {
  background: var(--ink);
  color: var(--paper);
  padding: 1.1em 1.4em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6em 1.4em;
  border-bottom: 4px solid var(--brass);
}

h1 {
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 1.35rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.55em;
}

.pastille {
  width: 0.6em;
  height: 0.6em;
  border-radius: 50%;
  background: #7cc17e;
  box-shadow: 0 0 8px #7cc17e;
  animation: clignote 1.8s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes clignote {
  50% {
    opacity: 0.25;
  }
}

small {
  font-family: 'IBM Plex Mono', monospace;
  color: #c9c2ac;
  font-size: 0.72rem;
  letter-spacing: 0.03em;
  display: block;
  margin-top: 0.25em;
}

.horloge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
  color: var(--brass);
}
</style>
