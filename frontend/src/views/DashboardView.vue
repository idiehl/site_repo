<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useJobsStore } from '../stores/jobs'
import JobTable from '../components/JobTable.vue'
import IngestModal from '../components/IngestModal.vue'

const router = useRouter()
const auth = useAuthStore()
const jobs = useJobsStore()

const showIngestModal = ref(false)
const retrying = ref(false)
const isPolling = ref(false)
let pollInterval = null

// Check if there are any jobs still processing
const hasProcessingJobs = computed(() => {
  return jobs.jobs.some(job => 
    job.status === 'pending' || job.status === 'processing'
  )
})

// Count of jobs needing review
const needsReviewCount = computed(() => {
  return jobs.jobs.filter(job => job.status === 'needs_review').length
})

// Start polling when there are processing jobs
function startPolling() {
  if (pollInterval) return // Already polling
  
  isPolling.value = true
  pollInterval = setInterval(async () => {
    await jobs.fetchJobs()
    
    // Stop polling if no more processing jobs
    if (!hasProcessingJobs.value) {
      stopPolling()
    }
  }, 5000) // Poll every 5 seconds
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
  isPolling.value = false
}

// Watch for processing jobs and start/stop polling
watch(hasProcessingJobs, (hasProcessing) => {
  if (hasProcessing) {
    startPolling()
  } else {
    stopPolling()
  }
})

onMounted(async () => {
  await jobs.fetchJobs()
  // Start polling if there are already processing jobs
  if (hasProcessingJobs.value) {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}

async function handleRetryFailed() {
  retrying.value = true
  try {
    await jobs.retryAllFailed()
  } finally {
    retrying.value = false
  }
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-night-900/50 border-b border-night-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <img src="/atlas-icon.svg" alt="Atlas Apply logo" class="w-8 h-8" />
              <h1 class="text-xl font-bold text-atlas-400">tlas Apply</h1>
            </div>
            <nav class="hidden md:flex items-center gap-1">
              <router-link 
                to="/dashboard" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-100 bg-night-800"
              >
                Dashboard
              </router-link>
              <router-link 
                to="/applications" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Applications
              </router-link>
              <router-link 
                to="/profile" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Profile
              </router-link>
              <router-link 
                to="/extension" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Extension
              </router-link>
            </nav>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="text-sm text-night-400">{{ auth.user?.email }}</span>
            <button @click="handleLogout" class="btn btn-ghost text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div class="card">
          <p class="text-sm text-night-400 mb-1">Saved Jobs</p>
          <p class="text-2xl font-bold">{{ jobs.jobs.length }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-night-400 mb-1">Processing</p>
          <p class="text-2xl font-bold text-yellow-400">{{ jobs.pendingJobs.length }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-night-400 mb-1">Ready</p>
          <p class="text-2xl font-bold text-green-400">{{ jobs.completedJobs.length }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-night-400 mb-1">Needs Review</p>
          <p class="text-2xl font-bold text-orange-400">{{ needsReviewCount }}</p>
        </div>
        <div class="card">
          <p class="text-sm text-night-400 mb-1">Failed</p>
          <div class="flex items-center gap-2">
            <p class="text-2xl font-bold text-red-400">{{ jobs.failedJobs.length }}</p>
            <button 
              v-if="jobs.failedJobs.length > 0"
              @click="handleRetryFailed"
              :disabled="retrying"
              class="text-xs px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-white disabled:opacity-50"
            >
              {{ retrying ? 'Retrying...' : 'Retry All' }}
            </button>
          </div>
        </div>
        <div class="card">
          <p class="text-sm text-night-400 mb-1">Applications</p>
          <p class="text-2xl font-bold text-atlas-400">0</p>
        </div>
      </div>

      <!-- Jobs Section -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-semibold">My Jobs</h2>
            <span 
              v-if="isPolling" 
              class="flex items-center gap-2 text-xs text-night-400 bg-night-800 px-2 py-1 rounded-full"
            >
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Auto-refreshing
            </span>
          </div>
          <button @click="showIngestModal = true" class="btn btn-accent">
            + Add Jobs
          </button>
        </div>

        <JobTable 
          :jobs="jobs.jobs" 
          :loading="jobs.loading"
          @refresh="jobs.fetchJobs"
        />
      </div>
    </main>

    <!-- Ingest Modal -->
    <IngestModal 
      v-if="showIngestModal" 
      @close="showIngestModal = false"
      @success="jobs.fetchJobs(); showIngestModal = false"
    />
  </div>
</template>
