import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home.vue'
import MentionLegale from './components/MentionLegale.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'accueil', component: Home },
    { path: '/mentions-legales', name: 'mentions-legales', component: MentionLegale },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router