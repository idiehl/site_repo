<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '../stores/jobs'
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  jobs: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh'])
const router = useRouter()
const jobsStore = useJobsStore()  // Renamed to avoid conflict with props.jobs
const deletingId = ref(null)

function viewJob(job) {
  router.push(`/jobs/${job.id}`)
}

async function deleteJob(event, job) {
  event.stopPropagation() // Prevent row click
  
  if (!confirm(`Delete this job posting?\n${job.company_name || job.url}`)) {
    return
  }
  
  deletingId.value = job.id
  const success = await jobsStore.deleteJob(job.id)
  deletingId.value = null
  
  if (success) {
    emit('refresh')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading && !props.jobs.length" class="text-center py-12">
      <div class="inline-block animate-spin w-8 h-8 border-2 border-night-600 border-t-atlas-500 rounded-full"></div>
      <p class="text-night-400 mt-2">Loading jobs...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!props.jobs.length" class="text-center py-12">
      <div class="text-4xl mb-4">📋</div>
      <h3 class="text-lg font-medium text-night-300 mb-2">No jobs yet</h3>
      <p class="text-night-500">Add job URLs to start building your pipeline</p>
    </div>

    <!-- Jobs Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-night-800">
            <th class="text-left py-3 px-4 text-sm font-medium text-night-400">Company</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-night-400">Position</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-night-400">Location</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-night-400">Status</th>
            <th class="text-left py-3 px-4 text-sm font-medium text-night-400">Added</th>
            <th class="text-right py-3 px-4 text-sm font-medium text-night-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="job in props.jobs" 
            :key="job.id"
            class="border-b border-night-800/50 hover:bg-night-800/30 cursor-pointer transition-colors"
            @click="viewJob(job)"
          >
            <td class="py-3 px-4">
              <span class="font-medium">{{ job.company_name || 'Processing...' }}</span>
            </td>
            <td class="py-3 px-4">
              <span class="text-night-300">{{ job.job_title || '-' }}</span>
            </td>
            <td class="py-3 px-4">
              <span class="text-night-400 text-sm">{{ job.location || '-' }}</span>
            </td>
            <td class="py-3 px-4">
              <StatusBadge :status="job.status" />
            </td>
            <td class="py-3 px-4">
              <span class="text-night-400 text-sm">{{ formatDate(job.created_at) }}</span>
            </td>
            <td class="py-3 px-4 text-right">
              <button
                @click="deleteJob($event, job)"
                :disabled="deletingId === job.id"
                class="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-2 py-1 rounded text-sm transition-colors disabled:opacity-50"
                title="Delete job"
              >
                {{ deletingId === job.id ? '...' : '🗑️' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
