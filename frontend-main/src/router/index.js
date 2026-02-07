import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/meridian',
    name: 'meridian',
    component: () => import('../views/MeridianView.vue'),
  },
  // Developer portal routes
  {
    path: '/dev',
    name: 'dev-login',
    component: () => import('../views/DevLoginView.vue'),
  },
  {
    path: '/dev/dashboard',
    name: 'dev-dashboard',
    component: () => import('../views/DevDashboardView.vue'),
  },
  {
    path: '/dev/log',
    name: 'dev-log',
    component: () => import('../views/DevLogView.vue'),
  },
  {
    path: '/dev/overview',
    name: 'dev-overview',
    component: () => import('../views/DevOverviewView.vue'),
  },
  {
    path: '/dev/apps/:appId/log',
    name: 'dev-app-log',
    component: () => import('../views/DevAppLogView.vue'),
  },
  {
    path: '/dev/apps/:appId/overview',
    name: 'dev-app-overview',
    component: () => import('../views/DevAppOverviewView.vue'),
  },
  {
    path: '/dev/apps/:appId/checklist',
    name: 'dev-app-checklist',
    component: () => import('../views/DevAppChecklistView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

export default router
