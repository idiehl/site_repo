<script setup>
import { ref, defineEmits } from 'vue'
import { useJobsStore } from '../stores/jobs'

const emit = defineEmits(['close', 'success'])
const jobs = useJobsStore()

const urlInput = ref('')
const urls = ref([])
const error = ref('')

function addUrl() {
  const url = urlInput.value.trim()
  if (!url) return

  // Basic URL validation
  try {
    new URL(url)
    if (!urls.value.includes(url)) {
      urls.value.push(url)
    }
    urlInput.value = ''
    error.value = ''
  } catch {
    error.value = 'Please enter a valid URL'
  }
}

function removeUrl(url) {
  urls.value = urls.value.filter(u => u !== url)
}

async function submit() {
  if (!urls.value.length) {
    error.value = 'Add at least one URL'
    return
  }

  const result = await jobs.ingestJobs(urls.value)
  if (result) {
    emit('success')
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <div 
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="emit('close')"
    @keydown="handleKeydown"
  >
    <div class="bg-night-900 border border-night-800 rounded-xl w-full max-w-lg shadow-2xl animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-night-800">
        <h2 class="text-lg font-semibold">Add Job URLs</h2>
        <button 
          @click="emit('close')" 
          class="text-night-400 hover:text-night-100 text-xl"
        >
          ×
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <p class="text-night-400 text-sm mb-4">
          Paste job posting URLs to add them to your pipeline. We'll automatically extract job details.
        </p>

        <!-- URL Input -->
        <div class="flex gap-2 mb-4">
          <input
            v-model="urlInput"
            type="url"
            class="flex-1"
            placeholder="https://linkedin.com/jobs/..."
            @keyup.enter="addUrl"
          />
          <button @click="addUrl" class="btn btn-secondary">
            Add
          </button>
        </div>

        <!-- Error -->
        <p v-if="error" class="text-red-400 text-sm mb-4">{{ error }}</p>

        <!-- URL List -->
        <div v-if="urls.length" class="space-y-2 mb-4 max-h-48 overflow-y-auto">
          <div 
            v-for="url in urls" 
            :key="url"
            class="flex items-center gap-2 p-2 bg-night-800/50 rounded-lg"
          >
            <span class="flex-1 text-sm text-night-300 truncate">{{ url }}</span>
            <button 
              @click="removeUrl(url)"
              class="text-night-500 hover:text-red-400 text-sm"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-6 bg-night-800/30 rounded-lg mb-4">
          <p class="text-night-500 text-sm">No URLs added yet</p>
        </div>

        <!-- Job Store Error -->
        <p v-if="jobs.error" class="text-red-400 text-sm mb-4">{{ jobs.error }}</p>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-night-800">
        <button @click="emit('close')" class="btn btn-ghost">
          Cancel
        </button>
        <button 
          @click="submit" 
          class="btn btn-primary"
          :disabled="!urls.length || jobs.loading"
        >
          <span v-if="jobs.loading">Processing...</span>
          <span v-else>Add {{ urls.length }} Job{{ urls.length !== 1 ? 's' : '' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
