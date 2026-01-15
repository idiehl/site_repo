<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobsStore } from '../stores/jobs'
import StatusBadge from '../components/StatusBadge.vue'
import api from '../api/client'

const route = useRoute()
const router = useRouter()
const jobs = useJobsStore()

const job = computed(() => jobs.currentJob)
const generating = ref(false)
const generatingDeepDive = ref(false)
const showManualEntry = ref(false)
const manualContent = ref('')
const savingManual = ref(false)
const message = ref('')
const error = ref('')

// Check if job was blocked/failed to scrape
const wasBlocked = computed(() => {
  if (!job.value) return false
  const text = job.value.raw_text || job.value.job_description || ''
  return text.toLowerCase().includes('blocked') || 
         text.toLowerCase().includes('cloudflare') ||
         (!job.value.company_name && !job.value.job_title && job.value.status === 'completed')
})

onMounted(async () => {
  await jobs.fetchJob(route.params.id)
})

function goBack() {
  router.push('/dashboard')
}

async function generateResume() {
  if (!job.value?.company_name) {
    error.value = 'Please add job details first (company blocked scraping)'
    return
  }
  generating.value = true
  error.value = ''
  try {
    const response = await api.post(`/api/v1/jobs/${job.value.id}/resumes`)
    message.value = `Resume generated! Match score: ${response.data.match_score}%`
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to generate resume'
  } finally {
    generating.value = false
  }
}

async function generateDeepDive() {
  if (!job.value?.company_name) {
    error.value = 'Please add job details first'
    return
  }
  generatingDeepDive.value = true
  error.value = ''
  try {
    const response = await api.post(`/api/v1/jobs/${job.value.id}/deep-dive`)
    message.value = 'Deep dive generated!'
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to generate deep dive'
  } finally {
    generatingDeepDive.value = false
  }
}

async function saveManualContent() {
  if (!manualContent.value.trim()) return
  
  savingManual.value = true
  error.value = ''
  try {
    // Re-process with manual content
    await api.post(`/api/v1/jobs/${job.value.id}/manual-content`, {
      content: manualContent.value
    })
    message.value = 'Job content saved and processed!'
    showManualEntry.value = false
    manualContent.value = ''
    // Refresh job data
    await jobs.fetchJob(route.params.id)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to save content'
  } finally {
    savingManual.value = false
  }
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-night-900/50 border-b border-night-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <button @click="goBack" class="btn btn-ghost mr-4">
            ← Back
          </button>
          <h1 class="text-xl font-bold">Job Details</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="jobs.loading" class="text-center py-12">
        <p class="text-night-400">Loading...</p>
      </div>

      <div v-else-if="job" class="space-y-6">
        <!-- Job Header -->
        <div class="card">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-2xl font-bold mb-2">{{ job.job_title || 'Processing...' }}</h2>
              <p class="text-lg text-night-300 mb-4">{{ job.company_name || 'Company name pending' }}</p>
              <div class="flex items-center gap-4 text-sm text-night-400">
                <span v-if="job.location">📍 {{ job.location }}</span>
                <span v-if="job.remote_policy">🏠 {{ job.remote_policy }}</span>
                <span v-if="job.salary_range">💰 {{ job.salary_range }}</span>
              </div>
            </div>
            <StatusBadge :status="job.status" />
          </div>
        </div>

        <!-- Description -->
        <div v-if="job.job_description" class="card">
          <h3 class="text-lg font-semibold mb-4">Description</h3>
          <p class="text-night-300 whitespace-pre-wrap">{{ job.job_description }}</p>
        </div>

        <!-- Requirements -->
        <div v-if="job.requirements" class="card">
          <h3 class="text-lg font-semibold mb-4">Requirements</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div v-if="job.requirements.hard_skills?.length">
              <h4 class="text-sm font-medium text-night-400 mb-2">Technical Skills</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="skill in job.requirements.hard_skills" 
                  :key="skill"
                  class="px-2 py-1 bg-atlas-500/20 text-atlas-300 rounded text-sm"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
            <div v-if="job.requirements.soft_skills?.length">
              <h4 class="text-sm font-medium text-night-400 mb-2">Soft Skills</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="skill in job.requirements.soft_skills" 
                  :key="skill"
                  class="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Blocked Warning -->
        <div v-if="wasBlocked" class="card bg-yellow-900/20 border-yellow-600/50">
          <div class="flex items-start gap-3">
            <span class="text-2xl">⚠️</span>
            <div class="flex-1">
              <h3 class="font-semibold text-yellow-400 mb-1">Scraping Blocked</h3>
              <p class="text-sm text-night-300 mb-3">
                This site blocked our scraper. You can paste the job posting content manually.
              </p>
              <button 
                @click="showManualEntry = !showManualEntry" 
                class="btn btn-secondary text-sm"
              >
                {{ showManualEntry ? 'Cancel' : 'Enter Job Details Manually' }}
              </button>
            </div>
          </div>
          
          <!-- Manual Entry Form -->
          <div v-if="showManualEntry" class="mt-4 pt-4 border-t border-yellow-600/30">
            <p class="text-sm text-night-400 mb-2">
              Copy and paste the job posting content from the website:
            </p>
            <textarea
              v-model="manualContent"
              class="w-full h-48 bg-night-800 border border-night-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-atlas-500"
              placeholder="Paste the job title, company name, description, requirements, etc..."
            ></textarea>
            <button 
              @click="saveManualContent"
              :disabled="savingManual || !manualContent.trim()"
              class="btn btn-primary mt-3"
            >
              {{ savingManual ? 'Processing...' : 'Save & Process' }}
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div v-if="message" class="card bg-green-900/20 border-green-600/50">
          <p class="text-green-400">✓ {{ message }}</p>
        </div>
        <div v-if="error" class="card bg-red-900/20 border-red-600/50">
          <p class="text-red-400">✗ {{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Actions</h3>
          <div class="flex flex-wrap gap-3">
            <button 
              @click="generateResume"
              :disabled="generating || !job.company_name"
              class="btn btn-primary"
            >
              {{ generating ? 'Generating...' : 'Generate Resume' }}
            </button>
            <button 
              @click="generateDeepDive"
              :disabled="generatingDeepDive || !job.company_name"
              class="btn btn-secondary"
            >
              {{ generatingDeepDive ? 'Researching...' : 'Company Deep Dive' }}
            </button>
            <button class="btn btn-secondary" disabled>
              Create Application
            </button>
          </div>
          <p v-if="!job.company_name" class="text-sm text-night-500 mt-2">
            ℹ️ Add job details to enable these actions
          </p>
        </div>

        <!-- Source URL -->
        <div class="card">
          <h3 class="text-sm font-medium text-night-400 mb-2">Source</h3>
          <a 
            :href="job.url" 
            target="_blank" 
            class="text-atlas-400 hover:text-atlas-300 break-all"
          >
            {{ job.url }}
          </a>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-night-400">Job not found</p>
      </div>
    </main>
  </div>
</template>
