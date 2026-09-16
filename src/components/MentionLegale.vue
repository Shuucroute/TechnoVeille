<script setup>
// Page statique des mentions légales.
</script>

<template>
  <div class="page-mentions">
    <div class="carte-mentions">
      <h1>Mentions légales</h1>

      <section>
        <h2>Éditeur du site</h2>
        <p>
          Ce site est édité à titre personnel. Conformément à l'article 6 de la loi n° 2004-575 du
          21 juin 2004 pour la confiance dans l'économie numérique (LCEN), l'éditeur a fait le choix
          de conserver l'anonymat. Son identité et ses coordonnées exactes ont été transmises à
          l'hébergeur.
        </p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          Ce site est hébergé par :<br />
          Vercel Inc.<br />
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
          Contact : <a href="mailto:privacy@vercel.com">privacy@vercel.com</a>
        </p>
      </section>

      <router-link to="/" class="lien-retour">← Retour à l'accueil</router-link>
    </div>
  </div>
</template>

<style scoped>
.page-mentions {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2em 1em;
}

.carte-mentions {
  width: min(680px, 94vw);
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 2em clamp(1.2em, 4vw, 2.4em);
  box-shadow: 0 2px 10px rgba(30, 36, 48, 0.08);
}

h1 {
  font-family: 'IBM Plex Mono', monospace;
  font-size: clamp(1.3rem, 3vw, 1.7rem);
  color: var(--ink);
  margin: 0 0 1em;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

section {
  margin-bottom: 1.4em;
}

section:last-of-type {
  margin-bottom: 0;
}

h2 {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1rem;
  color: var(--wire-blue);
  margin: 0 0 0.5em;
}

p {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--ink);
  margin: 0;
}

a {
  color: var(--wire-blue);
}

.lien-retour {
  display: inline-block;
  margin-top: 0.8em;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  color: var(--ink-soft);
  text-decoration: underline;
}

.lien-retour:hover {
  color: var(--ink);
}
</style>