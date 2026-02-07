import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'ElectraCast | Hear The Culture' },
  },
  {
    path: '/podcasts',
    name: 'podcasts',
    component: () => import('../views/PodcastsView.vue'),
    meta: { title: 'Podcasts | ElectraCast' },
  },
  {
    path: '/networks',
    name: 'networks',
    component: () => import('../views/NetworksView.vue'),
    meta: { title: 'Networks | ElectraCast' },
  },
  {
    path: '/custom-branded-podcasts',
    name: 'custom-branded',
    component: () => import('../views/CustomBrandedView.vue'),
    meta: { title: 'Custom Branded Podcasts | ElectraCast' },
  },
  {
    path: '/music',
    name: 'music',
    component: () => import('../views/MusicView.vue'),
    meta: { title: 'Music | ElectraCast' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { title: 'About | ElectraCast' },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('../views/ContactView.vue'),
    meta: { title: 'Contact | ElectraCast' },
  },
  {
    path: '/advertising',
    name: 'advertising',
    component: () => import('../views/AdvertisingView.vue'),
    meta: { title: 'Advertising | ElectraCast' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { title: 'Register | ElectraCast' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'ElectraCast | Hear The Culture'
  next()
})

export default router
