<script setup>
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const error = ref(null)
const processing = ref(true)

onMounted(async () => {
  // Check for error in query params
  if (route.query.error) {
    error.value = getErrorMessage(route.query.error)
    processing.value = false
    return
  }
  
  // Extract tokens from URL fragment (hash)
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  
  if (!accessToken || !refreshToken) {
    error.value = 'No tokens received from authentication provider'
    processing.value = false
    return
  }
  
  try {
    await auth.handleOAuthCallback({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    
    // Clear the hash from URL for security
    window.history.replaceState(null, '', window.location.pathname)
    
    // Redirect to dashboard
    router.push('/dashboard')
  } catch (err) {
    error.value = 'Failed to complete authentication'
    processing.value = false
  }
})

function getErrorMessage(errorCode) {
  const messages = {
    invalid_state: 'Invalid authentication state. Please try again.',
    oauth_not_configured: 'OAuth is not configured on this server.',
    token_exchange_failed: 'Failed to exchange authorization code.',
    no_access_token: 'No access token received.',
    userinfo_failed: 'Failed to retrieve user information.',
    missing_user_data: 'Missing required user data from provider.',
    network_error: 'Network error occurred. Please try again.',
  }
  return messages[errorCode] || 'An unknown error occurred.'
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="card text-center">
        <div v-if="processing" class="py-8">
          <div class="animate-spin w-12 h-12 border-4 border-atlas-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-night-300">Completing authentication...</p>
        </div>
        
        <div v-else-if="error" class="py-8">
          <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-red-400 mb-2">Authentication Failed</h2>
          <p class="text-night-400 mb-6">{{ error }}</p>
          <button @click="goToLogin" class="btn btn-primary">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
