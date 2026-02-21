import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('access_token'))
  const refreshToken = ref(localStorage.getItem('refresh_token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.is_admin === true)
  const canAccessPremium = computed(() => user.value?.can_access_premium_features === true || isAdmin.value)
  const subscriptionTier = computed(() => user.value?.subscription_tier || 'free')
  const subscriptionStatus = computed(() => user.value?.subscription_status || 'free')
  const resumeGenerationsUsed = computed(() => user.value?.resume_generations_used ?? 0)
  const resumeGenerationLimit = computed(() => user.value?.resume_generation_limit ?? 0)
  const resumeGenerationResetAt = computed(() => user.value?.resume_generation_reset_at || null)

  async function login(email, password) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/api/v2/auth/login', { email, password })
      
      accessToken.value = response.data.access_token
      refreshToken.value = response.data.refresh_token
      
      localStorage.setItem('access_token', accessToken.value)
      localStorage.setItem('refresh_token', refreshToken.value)
      
      await fetchUser()
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(email, password) {
    loading.value = true
    error.value = null
    
    try {
      await api.post('/api/v2/auth/register', { email, password })
      // Auto-login after registration
      return await login(email, password)
    } catch (err) {
      error.value = err.response?.data?.detail || 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!accessToken.value) return
    
    try {
      const response = await api.get('/api/v2/auth/me')
      user.value = response.data
    } catch (err) {
      // Token might be expired
      logout()
    }
  }

  async function checkAuth() {
    if (accessToken.value) {
      await fetchUser()
    }
  }

  async function loginWithLinkedIn() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/api/v2/auth/linkedin/authorize')
      // Redirect to LinkedIn authorization page
      window.location.href = response.data.url
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to initiate LinkedIn login'
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/api/v2/auth/google/authorize')
      // Redirect to Google authorization page
      window.location.href = response.data.url
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to initiate Google login'
      loading.value = false
    }
  }

  function handleOAuthCallback(tokens) {
    // Called by OAuth callback page with tokens from URL fragment
    accessToken.value = tokens.access_token
    refreshToken.value = tokens.refresh_token
    
    localStorage.setItem('access_token', accessToken.value)
    localStorage.setItem('refresh_token', refreshToken.value)
    
    return fetchUser()
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  return {
    user,
    accessToken,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    canAccessPremium,
    subscriptionTier,
    subscriptionStatus,
    resumeGenerationsUsed,
    resumeGenerationLimit,
    resumeGenerationResetAt,
    login,
    register,
    loginWithLinkedIn,
    loginWithGoogle,
    handleOAuthCallback,
    fetchUser,
    checkAuth,
    logout,
  }
})
