import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/jobs/:id',
    name: 'job-detail',
    component: () => import('../views/JobDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/applications',
    name: 'applications',
    component: () => import('../views/ApplicationsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/oauth/callback',
    name: 'oauth-callback',
    component: () => import('../views/OAuthCallbackView.vue'),
    meta: { guest: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/analytics',
    name: 'admin-analytics',
    component: () => import('../views/AdminAnalyticsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/security',
    name: 'admin-security',
    component: () => import('../views/AdminSecurityView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/extension',
    name: 'extension',
    component: () => import('../views/ExtensionView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // Ensure user data is loaded
  if (auth.isAuthenticated && !auth.user) {
    await auth.fetchUser()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresAdmin && (!auth.user || !auth.user.is_admin)) {
    // Redirect non-admin users trying to access admin routes
    next({ name: 'dashboard' })
  } else if (to.meta.guest && auth.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
