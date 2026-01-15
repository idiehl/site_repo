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
