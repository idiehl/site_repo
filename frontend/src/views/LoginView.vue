<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')

async function handleSubmit() {
  const success = await auth.login(email.value, password.value)
  if (success) {
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="text-center mb-8 animate-fade-in">
        <h1 class="text-4xl font-bold text-atlas-400 mb-2">AtlasOps</h1>
        <p class="text-night-400">AI-Powered Job Application Manager</p>
      </div>

      <!-- Login Card -->
      <div class="card animate-fade-in" style="animation-delay: 0.1s">
        <h2 class="text-2xl font-semibold mb-6">Sign In</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-night-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full"
              placeholder="you@example.com"
              autocomplete="email"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-night-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full"
              placeholder="••••••••"
              autocomplete="current-password"
            />
          </div>

          <div v-if="auth.error" class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p class="text-sm text-red-400">{{ auth.error }}</p>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="auth.loading"
          >
            <span v-if="auth.loading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-night-400 text-sm">
            Don't have an account?
            <router-link to="/register" class="text-atlas-400 hover:text-atlas-300">
              Create one
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
