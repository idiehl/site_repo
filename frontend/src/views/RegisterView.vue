<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref('')

async function handleSubmit() {
  localError.value = ''
  
  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 8) {
    localError.value = 'Password must be at least 8 characters'
    return
  }

  const success = await auth.register(email.value, password.value)
  if (success) {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="text-center mb-8 animate-fade-in">
        <h1 class="text-4xl font-bold text-atlas-400 mb-2">AtlasOps</h1>
        <p class="text-night-400">Create your account</p>
      </div>

      <!-- Register Card -->
      <div class="card animate-fade-in" style="animation-delay: 0.1s">
        <h2 class="text-2xl font-semibold mb-6">Sign Up</h2>

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
              placeholder="At least 8 characters"
              autocomplete="new-password"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-night-300 mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full"
              placeholder="Confirm your password"
              autocomplete="new-password"
            />
          </div>

          <div v-if="localError || auth.error" class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p class="text-sm text-red-400">{{ localError || auth.error }}</p>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="auth.loading"
          >
            <span v-if="auth.loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-night-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-night-800 text-night-400">Or continue with</span>
          </div>
        </div>

        <!-- LinkedIn Login Button -->
        <button
          type="button"
          @click="auth.loginWithLinkedIn"
          :disabled="auth.loading"
          class="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-night-600 rounded-lg hover:bg-night-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
          </svg>
          <span class="text-night-200">Continue with LinkedIn</span>
        </button>

        <div class="mt-6 text-center">
          <p class="text-night-400 text-sm">
            Already have an account?
            <router-link to="/login" class="text-atlas-400 hover:text-atlas-300">
              Sign in
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
