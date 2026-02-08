<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { FolderOpenIcon, ArrowPathIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import DevStatusBanner from '../components/DevStatusBanner.vue'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const docData = ref(null)
const viewMode = ref('html') // 'html' or 'markdown'

const accessToken = computed(() => localStorage.getItem('access_token') || '')

async function fetchOverview() {
  if (!accessToken.value) {
    router.push('/dev')
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch('https://apply.atlasuniversalis.com/api/v1/dev/overview', {
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })
    
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      router.push('/dev')
      return
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch overview')
    }
    
    docData.value = await response.json()
  } catch (err) {
    error.value = err.message || 'Failed to load Project Overview'
  } finally {
    loading.value = false
  }
}

onMounted(fetchOverview)
</script>

<template>
  <div class="min-h-screen bg-night-950">
    <!-- Header -->
    <header class="bg-night-900 border-b border-night-800 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link to="/dev/dashboard" class="text-night-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeftIcon class="w-4 h-4" />
            Back
          </router-link>
          <div class="flex items-center gap-2">
            <FolderOpenIcon class="w-6 h-6 text-atlas-400" />
            <h1 class="text-xl font-bold text-white">Project Overview</h1>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex bg-night-800 rounded-lg p-1">
            <button
              @click="viewMode = 'html'"
              :class="[
                'px-3 py-1 text-sm rounded-md transition-colors',
                viewMode === 'html' ? 'bg-atlas-600 text-white' : 'text-night-400 hover:text-white'
              ]"
            >
              Rendered
            </button>
            <button
              @click="viewMode = 'markdown'"
              :class="[
                'px-3 py-1 text-sm rounded-md transition-colors',
                viewMode === 'markdown' ? 'bg-atlas-600 text-white' : 'text-night-400 hover:text-white'
              ]"
            >
              Markdown
            </button>
          </div>
          <button
            @click="fetchOverview"
            class="px-4 py-2 text-sm bg-night-800 text-night-300 hover:text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon class="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </header>

    <DevStatusBanner />
    
    <!-- Content -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-night-400">Loading...</div>
      </div>
      
      <div v-else-if="error" class="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        {{ error }}
      </div>
      
      <div v-else-if="docData" class="bg-night-900 border border-night-800 rounded-xl overflow-hidden">
        <!-- Rendered HTML view -->
        <div
          v-if="viewMode === 'html'"
          class="prose prose-invert prose-atlas max-w-none p-8"
          v-html="docData.content_html"
        />
        
        <!-- Raw Markdown view -->
        <pre
          v-else
          class="p-8 text-sm text-night-300 overflow-x-auto whitespace-pre-wrap"
        >{{ docData.content_md }}</pre>
      </div>
    </main>
  </div>
</template>

<style>
/* Prose styling for rendered markdown */
.prose-atlas {
  --tw-prose-headings: theme('colors.white');
  --tw-prose-body: theme('colors.night.300');
  --tw-prose-bold: theme('colors.white');
  --tw-prose-links: theme('colors.atlas.400');
  --tw-prose-code: theme('colors.gold.400');
}

.prose-atlas h1 {
  color: theme('colors.atlas.400');
  border-bottom: 2px solid theme('colors.atlas.500');
  padding-bottom: 0.5rem;
}

.prose-atlas h2 {
  color: theme('colors.white');
  border-bottom: 1px solid theme('colors.night.700');
  padding-bottom: 0.5rem;
  margin-top: 2rem;
}

.prose-atlas h3 {
  color: theme('colors.atlas.300');
}

.prose-atlas code {
  background: theme('colors.night.800');
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.9em;
}

.prose-atlas pre {
  background: theme('colors.night.950');
  border: 1px solid theme('colors.night.700');
}

.prose-atlas pre code {
  background: none;
  padding: 0;
}

.prose-atlas table {
  width: 100%;
}

.prose-atlas th {
  background: theme('colors.atlas.600');
  color: white;
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.prose-atlas td {
  border: 1px solid theme('colors.night.700');
  padding: 0.5rem 0.75rem;
}

.prose-atlas tr:nth-child(even) {
  background: theme('colors.night.800' / 50%);
}

.prose-atlas strong {
  color: theme('colors.gold.400');
}

.prose-atlas hr {
  border-color: theme('colors.night.700');
}
</style>
