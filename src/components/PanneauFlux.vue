<script setup>
import { ref } from 'vue'
import { couleurPour } from '../data/palette.js'
import { estUrlValide } from '../composables/useFlux.js'
import ChipFlux from './ChipFlux.vue'

const props = defineProps({
  flux: { type: Array, required: true },
  fluxEnEchecUrls: { type: Set, default: () => new Set() },
})
const emit = defineEmits(['ajouter', 'retirer'])

const champUrl = ref('')
const messageErreur = ref('')

function soumettreFormulaire() {
  const url = champUrl.value.trim()
  if (!url) return

  if (!estUrlValide(url)) {
    messageErreur.value = "Cette adresse ne ressemble pas à une URL valide (elle doit commencer par http:// ou https://)."
    return
  }

  if (props.flux.some((f) => f.url === url)) {
    messageErreur.value = 'Ce flux est déjà en écoute.'
    return
  }

  let nom
  try {
    nom = new URL(url).hostname.replace('www.', '')
  } catch {
    nom = url
  }

  messageErreur.value = ''
  emit('ajouter', { nom, url })
  champUrl.value = ''
}
</script>

<template>
  <div class="panneau">
    <h2>Ajouter un flux RSS</h2>

    <form @submit.prevent="soumettreFormulaire" novalidate>
      <input
        v-model="champUrl"
        type="text"
        placeholder="https://exemple.com/feed.xml ou https://exemple.com/rss.xml"
        autocomplete="off"
        :aria-invalid="Boolean(messageErreur)"
        required
        @input="messageErreur = ''"
      />
      <button type="submit">Mettre en écoute</button>
    </form>
    <p v-if="messageErreur" class="erreur" role="alert">{{ messageErreur }}</p>

    <div class="chips">
      <ChipFlux
        v-for="(f, i) in flux"
        :key="f.url"
        :nom="f.nom"
        :couleur="couleurPour(i)"
        :en-echec="fluxEnEchecUrls.has(f.url)"
        @retirer="emit('retirer', i)"
      />
    </div>
  </div>
</template>

<style scoped>
.panneau {
  max-width: 980px;
  margin: 2em auto 0;
  padding: 0 1.2em;
}
h2 {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  color: var(--ink-soft);
  margin: 0 0 0.6em;
  border-bottom: 1px dashed var(--line);
  padding-bottom: 0.4em;
}
form {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}
input[type='text'] {
  flex: 1 1 320px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
  padding: 0.65em 0.8em;
  border: 1px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  border-radius: var(--radius);
}
input[type='text']:focus-visible {
  outline: 2px solid var(--wire-blue);
  outline-offset: 1px;
}
button[type='submit'] {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--stamp-red);
  color: var(--paper);
  border: none;
  padding: 0.65em 1.3em;
  cursor: pointer;
  border-radius: var(--radius);
  transition: filter 0.15s ease;
}
button[type='submit']:hover {
  filter: brightness(1.12);
}
button[type='submit']:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

.chips {
  margin-top: 1em;
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}

.erreur {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.78rem;
  color: var(--stamp-red);
  margin: 0.5em 0 0;
}

input[type='text'][aria-invalid='true'] {
  border-color: var(--stamp-red);
}
</style>