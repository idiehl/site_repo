<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { WrenchScrewdriverIcon, ClipboardDocumentListIcon, FolderOpenIcon } from '@heroicons/vue/24/outline'
import DevStatusBanner from '../components/DevStatusBanner.vue'

const router = useRouter()
const accessToken = ref('')

async function requireAdmin() {
  if (!accessToken.value) {
    router.push('/dev')
    return
  }

  try {
    const response = await fetch('https://apply.atlasuniversalis.com/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${accessToken.value}` }
    })

    if (!response.ok) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      router.push('/dev')
      return
    }

    const data = await response.json()
    if (!data.is_admin) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      router.push('/dev')
    }
  } catch (err) {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/dev')
  }
}

onMounted(() => {
  accessToken.value = localStorage.getItem('access_token') || ''
  requireAdmin()
})

function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  router.push('/dev')
}

const apps = [
  {
    id: 'atlas-forge',
    title: 'Atlas Forge',
    description: 'UI design laboratory for Vue and React components',
    logPath: '/dev/apps/atlas-forge/log',
    overviewPath: '/dev/apps/atlas-forge/overview',
    checklistPath: '/dev/apps/atlas-forge/checklist',
    inventoryPath: '/dev/apps/atlas-forge/inventory',
  },
  {
    id: 'atlas-apply',
    title: 'Atlas Apply',
    description: 'AI-powered job application and resume platform',
    logPath: '/dev/apps/atlas-apply/log',
    overviewPath: '/dev/apps/atlas-apply/overview',
    checklistPath: '/dev/apps/atlas-apply/checklist',
    inventoryPath: '/dev/apps/atlas-apply/inventory',
  },
  {
    id: 'atlas-universalis',
    title: 'Atlas Universalis',
    description: 'Main site and product hub for the Atlas ecosystem',
    logPath: '/dev/apps/atlas-universalis/log',
    overviewPath: '/dev/apps/atlas-universalis/overview',
    checklistPath: '/dev/apps/atlas-universalis/checklist',
    inventoryPath: '/dev/apps/atlas-universalis/inventory',
  },
  {
    id: 'electracast',
    title: 'ElectraCast',
    description: 'ElectraCast mirror and podcast network rebuild',
    logPath: '/dev/apps/electracast/log',
    overviewPath: '/dev/apps/electracast/overview',
    checklistPath: '/dev/apps/electracast/checklist',
    inventoryPath: '/dev/apps/electracast/inventory',
  },
  {
    id: 'atlas-meridian',
    title: 'Atlas Meridian',
    description: 'Dynamic visual interface and canvas operating system',
    logPath: '/dev/apps/atlas-meridian/log',
    overviewPath: '/dev/apps/atlas-meridian/overview',
    checklistPath: '/dev/apps/atlas-meridian/checklist',
    inventoryPath: '/dev/apps/atlas-meridian/inventory',
  },
]

const platformPages = [
  {
    title: 'Master Log',
    description: 'Global changelog across the entire platform',
    path: '/dev/log',
    icon: ClipboardDocumentListIcon
  },
  {
    title: 'Project Overview',
    description: 'Full file inventory and architecture documentation',
    path: '/dev/overview',
    icon: FolderOpenIcon
  }
]
</script>

<template>
  <div class="min-h-screen bg-night-950">
    <!-- Header -->
    <header class="bg-night-900 border-b border-night-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <WrenchScrewdriverIcon class="w-7 h-7 text-atlas-400" />
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

    <DevStatusBanner />
    
    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-2">Applications</h2>
        <p class="text-night-400">Dedicated logs and overviews for each app</p>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div
          v-for="app in apps"
          :key="app.id"
          class="bg-night-900 border border-night-800 rounded-xl p-6 hover:border-atlas-500 transition-colors"
        >
          <div>
            <h3 class="text-lg font-semibold text-white">{{ app.title }}</h3>
            <p class="text-night-400 mt-1">{{ app.description }}</p>
          </div>
          <div class="mt-4 flex items-center gap-3">
            <router-link
              :to="app.logPath"
              class="px-3 py-1.5 text-sm rounded-lg bg-night-800 text-night-300 hover:text-white hover:bg-night-700 transition-colors"
            >
              Log
            </router-link>
            <router-link
              :to="app.overviewPath"
              class="px-3 py-1.5 text-sm rounded-lg bg-night-800 text-night-300 hover:text-white hover:bg-night-700 transition-colors"
            >
              Overview
            </router-link>
            <router-link
              :to="app.checklistPath"
              class="px-3 py-1.5 text-sm rounded-lg bg-night-800 text-night-300 hover:text-white hover:bg-night-700 transition-colors"
            >
              Checklist
            </router-link>
            <router-link
              :to="app.inventoryPath"
              class="px-3 py-1.5 text-sm rounded-lg bg-night-800 text-night-300 hover:text-white hover:bg-night-700 transition-colors"
            >
              Inventory
            </router-link>
          </div>
        </div>
      </div>

      <div class="mt-12">
        <h2 class="text-xl font-semibold text-white mb-2">Platform Docs</h2>
        <p class="text-night-400 mb-6">Global documentation across all apps</p>
        <div class="grid md:grid-cols-2 gap-6">
          <router-link
            v-for="page in platformPages"
            :key="page.path"
            :to="page.path"
            class="bg-night-900 border border-night-800 rounded-xl p-6 hover:border-atlas-500 transition-colors group"
          >
            <div class="flex items-start gap-4">
              <component :is="page.icon" class="w-10 h-10 text-atlas-400 group-hover:text-atlas-300 transition-colors flex-shrink-0" />
              <div>
                <h3 class="text-lg font-semibold text-white group-hover:text-atlas-400 transition-colors">
                  {{ page.title }}
                </h3>
                <p class="text-night-400 mt-1">{{ page.description }}</p>
              </div>
            </div>
          </router-link>
        </div>
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
            <p class="text-white font-medium">apply.atlasuniversalis.com</p>
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
