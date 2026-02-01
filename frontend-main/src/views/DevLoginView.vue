<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    // Verify token with backend
    const response = await fetch(`https://apply.atlasuniversalis.com/api/v1/dev/verify?token=${encodeURIComponent(token.value)}`)
    const data = await response.json()
    
    if (response.ok && data.valid) {
      // Store token and redirect
      localStorage.setItem('dev_token', token.value)
      router.push('/dev/dashboard')
    } else {
      error.value = data.detail || 'Invalid token'
    }
  } catch (err) {
    error.value = 'Failed to verify token. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-night-950 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Developer Access</h1>
        <p class="text-night-400">Enter your developer token to continue</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="bg-night-900 rounded-xl p-8 border border-night-800">
        <div class="mb-6">
          <label for="token" class="block text-sm font-medium text-night-300 mb-2">
            Developer Token
          </label>
          <input
            id="token"
            v-model="token"
            type="password"
            required
            class="w-full px-4 py-3 bg-night-800 border border-night-700 rounded-lg text-white placeholder-night-500 focus:outline-none focus:ring-2 focus:ring-atlas-500 focus:border-transparent"
            placeholder="Enter your token"
          />
        </div>
        
        <div v-if="error" class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {{ error }}
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 px-4 bg-atlas-600 hover:bg-atlas-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Verifying...' : 'Access Dev Portal' }}
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <a href="/" class="text-night-400 hover:text-white text-sm transition-colors">
          ← Back to main site
        </a>
      </div>
    </div>
  </div>
</template>
