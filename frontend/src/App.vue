<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const auth = useAuthStore()

onMounted(async () => {
  // Try to restore session from stored token
  await auth.checkAuth()
})
</script>

<template>
  <div class="min-h-screen bg-night-950 text-night-100">
    <RouterView />
  </div>
</template>
