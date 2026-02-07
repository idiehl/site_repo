<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    const formData = new URLSearchParams()
    formData.append('username', email.value)
    formData.append('password', password.value)

    const response = await fetch('https://apply.atlasuniversalis.com/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    })
    const data = await response.json()

    if (!response.ok) {
      error.value = data.detail || 'Invalid email or password'
      return
    }

    const meResponse = await fetch('https://apply.atlasuniversalis.com/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${data.access_token}` }
    })
    const meData = await meResponse.json()

    if (!meResponse.ok) {
      error.value = meData.detail || 'Failed to verify admin access'
      return
    }

    if (!meData.is_admin) {
      error.value = 'Admin access required'
      return
    }

    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    router.push('/dev/dashboard')
  } catch (err) {
    error.value = 'Failed to sign in. Please try again.'
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
        <p class="text-night-400">Sign in with your admin credentials</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="bg-night-900 rounded-xl p-8 border border-night-800">
        <div class="mb-6">
          <label for="email" class="block text-sm font-medium text-night-300 mb-2">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="w-full px-4 py-3 bg-night-800 border border-night-700 rounded-lg text-white placeholder-night-500 focus:outline-none focus:ring-2 focus:ring-atlas-500 focus:border-transparent"
            placeholder="you@atlasuniversalis.com"
          />
        </div>

        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-night-300 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full px-4 py-3 bg-night-800 border border-night-700 rounded-lg text-white placeholder-night-500 focus:outline-none focus:ring-2 focus:ring-atlas-500 focus:border-transparent"
            placeholder="Enter your password"
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
          {{ loading ? 'Signing in...' : 'Access Dev Portal' }}
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
