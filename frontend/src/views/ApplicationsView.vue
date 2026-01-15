<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useApplicationsStore } from '../stores/applications'

const router = useRouter()
const applicationsStore = useApplicationsStore()

const filterStatus = ref('all')

const statusOptions = [
  { value: 'all', label: 'All Applications' },
  { value: 'pending', label: '📋 Pending' },
  { value: 'applied', label: '✅ Applied' },
  { value: 'interview_scheduled', label: '🎤 Interview' },
  { value: 'offer_received', label: '🎉 Offers' },
  { value: 'rejected', label: '❌ Rejected' }
]

const statusColors = {
  pending: 'bg-gray-500/20 text-gray-300',
  applied: 'bg-blue-500/20 text-blue-300',
  followup_scheduled: 'bg-yellow-500/20 text-yellow-300',
  interview_scheduled: 'bg-purple-500/20 text-purple-300',
  offer_received: 'bg-green-500/20 text-green-300',
  rejected: 'bg-red-500/20 text-red-300',
  withdrawn: 'bg-gray-500/20 text-gray-300',
  no_response_closed: 'bg-gray-500/20 text-gray-300'
}

const statusLabels = {
  pending: '📋 Pending',
  applied: '✅ Applied',
  followup_scheduled: '📅 Follow-up',
  interview_scheduled: '🎤 Interview',
  offer_received: '🎉 Offer',
  rejected: '❌ Rejected',
  withdrawn: '🚫 Withdrawn',
  no_response_closed: '⏰ No Response'
}

const filteredApplications = computed(() => {
  if (filterStatus.value === 'all') {
    return applicationsStore.applications
  }
  return applicationsStore.applications.filter(app => app.status === filterStatus.value)
})

const stats = computed(() => {
  const apps = applicationsStore.applications
  return {
    total: apps.length,
    active: apps.filter(a => ['pending', 'applied', 'followup_scheduled', 'interview_scheduled'].includes(a.status)).length,
    interviews: apps.filter(a => a.status === 'interview_scheduled').length,
    offers: apps.filter(a => a.status === 'offer_received').length
  }
})

onMounted(() => {
  applicationsStore.fetchApplications()
})

function goToJob(jobId) {
  router.push(`/jobs/${jobId}`)
}

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
          <button @click="goBack" class="btn btn-ghost mr-4">← Back</button>
          <h1 class="text-xl font-bold">My Applications</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card text-center">
          <p class="text-3xl font-bold text-atlas-400">{{ stats.total }}</p>
          <p class="text-sm text-night-400">Total Applications</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-blue-400">{{ stats.active }}</p>
          <p class="text-sm text-night-400">Active</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-purple-400">{{ stats.interviews }}</p>
          <p class="text-sm text-night-400">Interviews</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-green-400">{{ stats.offers }}</p>
          <p class="text-sm text-night-400">Offers</p>
        </div>
      </div>

      <!-- Filter -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          @click="filterStatus = option.value"
          class="px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors"
          :class="filterStatus === option.value 
            ? 'bg-atlas-600 text-white' 
            : 'bg-night-800 text-night-300 hover:bg-night-700'"
        >
          {{ option.label }}
        </button>
      </div>

      <!-- Applications List -->
      <div v-if="applicationsStore.loading" class="text-center py-12">
        <p class="text-night-400">Loading applications...</p>
      </div>

      <div v-else-if="filteredApplications.length === 0" class="text-center py-12">
        <p class="text-night-400 mb-4">
          {{ filterStatus === 'all' ? 'No applications yet' : 'No applications with this status' }}
        </p>
        <button @click="goBack" class="btn btn-primary">
          Browse Jobs
        </button>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="app in filteredApplications" 
          :key="app.id"
          @click="goToJob(app.job_posting_id)"
          class="card hover:border-atlas-600/50 transition-colors cursor-pointer"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span 
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="statusColors[app.status]"
                >
                  {{ statusLabels[app.status] }}
                </span>
              </div>
              <p class="text-sm text-night-400">
                Created {{ new Date(app.created_at).toLocaleDateString() }}
                <span v-if="app.applied_at" class="ml-2">
                  • Applied {{ new Date(app.applied_at).toLocaleDateString() }}
                </span>
              </p>
              <p v-if="app.notes" class="text-sm text-night-500 mt-2">{{ app.notes }}</p>
            </div>
            <span class="text-night-500">→</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
