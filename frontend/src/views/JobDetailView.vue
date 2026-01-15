<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobsStore } from '../stores/jobs'
import StatusBadge from '../components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const jobs = useJobsStore()

const job = computed(() => jobs.currentJob)

onMounted(async () => {
  await jobs.fetchJob(route.params.id)
})

function goBack() {
  router.push('/dashboard')
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

        <!-- Actions -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Actions</h3>
          <div class="flex flex-wrap gap-3">
            <button class="btn btn-primary" disabled>
              Generate Resume
            </button>
            <button class="btn btn-secondary" disabled>
              Company Deep Dive
            </button>
            <button class="btn btn-secondary" disabled>
              Create Application
            </button>
          </div>
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
