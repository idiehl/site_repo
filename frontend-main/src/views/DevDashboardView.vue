<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const devToken = ref('')

onMounted(() => {
  devToken.value = localStorage.getItem('dev_token') || ''
  if (!devToken.value) {
    router.push('/dev')
  }
})

function logout() {
  localStorage.removeItem('dev_token')
  router.push('/dev')
}

const pages = [
  {
    title: 'Master Log',
    description: 'View the running changelog of all project updates',
    path: '/dev/log',
    icon: '📋'
  },
  {
    title: 'Project Overview',
    description: 'Complete file inventory and architecture documentation',
    path: '/dev/overview',
    icon: '🗂️'
  }
]
</script>

<template>
  <div class="min-h-screen bg-night-950">
    <!-- Header -->
    <header class="bg-night-900 border-b border-night-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🛠️</span>
          <h1 class="text-xl font-bold text-white">Developer Portal</h1>
        </div>
        <div class="flex items-center gap-4">
          <a href="/" class="text-night-400 hover:text-white text-sm transition-colors">
            Main Site
          </a>
          <button
            @click="logout"
            class="px-4 py-2 text-sm text-night-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
    
    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-2">Documentation</h2>
        <p class="text-night-400">Real-time access to project documentation</p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6">
        <router-link
          v-for="page in pages"
          :key="page.path"
          :to="page.path"
          class="bg-night-900 border border-night-800 rounded-xl p-6 hover:border-atlas-500 transition-colors group"
        >
          <div class="flex items-start gap-4">
            <span class="text-4xl">{{ page.icon }}</span>
            <div>
              <h3 class="text-lg font-semibold text-white group-hover:text-atlas-400 transition-colors">
                {{ page.title }}
              </h3>
              <p class="text-night-400 mt-1">{{ page.description }}</p>
            </div>
          </div>
        </router-link>
      </div>
      
      <div class="mt-12 p-6 bg-night-900 border border-night-800 rounded-xl">
        <h3 class="text-lg font-semibold text-white mb-4">Quick Info</h3>
        <div class="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-night-500">Environment</span>
            <p class="text-white font-medium">Production</p>
          </div>
          <div>
            <span class="text-night-500">API Endpoint</span>
            <p class="text-white font-medium">quickpro.atlasuniversalis.com</p>
          </div>
          <div>
            <span class="text-night-500">Last Deploy</span>
            <p class="text-white font-medium">{{ new Date().toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
