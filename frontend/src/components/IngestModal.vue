<script setup>
import { ref, defineEmits } from 'vue'
import { useJobsStore } from '../stores/jobs'
import api from '../api/client'

const emit = defineEmits(['close', 'success'])
const jobs = useJobsStore()

// Mode: 'url' or 'paste'
const mode = ref('url')

// URL mode
const urlInput = ref('')
const urls = ref([])

// Paste mode
const pastedContent = ref('')
const sourceUrl = ref('')

const error = ref('')
const submitting = ref(false)

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
  error.value = ''
  submitting.value = true

  try {
    if (mode.value === 'url') {
      // URL mode - use existing ingest
      if (!urls.value.length) {
        error.value = 'Add at least one URL'
        submitting.value = false
        return
      }
      const result = await jobs.ingestJobs(urls.value)
      if (result) {
        emit('success')
      }
    } else {
      // Paste mode - create job with manual content
      if (!pastedContent.value.trim() || pastedContent.value.trim().length < 50) {
        error.value = 'Please paste the job description (at least 50 characters)'
        submitting.value = false
        return
      }

      // Create job with placeholder URL, then add manual content
      const jobUrl = sourceUrl.value.trim() || `manual-entry-${Date.now()}`
      const ingestResult = await api.post('/api/v1/jobs/ingest', { 
        urls: [jobUrl.startsWith('http') ? jobUrl : `https://manual-entry.local/${jobUrl}`] 
      })
      
      if (ingestResult.data?.job_ids?.length) {
        // Now add the manual content
        await api.post(`/api/v1/jobs/${ingestResult.data.job_ids[0]}/manual-content`, {
          content: pastedContent.value
        })
      }
      
      emit('success')
    }
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to add job'
  } finally {
    submitting.value = false
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
        <h2 class="text-lg font-semibold">Add Job</h2>
        <button 
          @click="emit('close')" 
          class="text-night-400 hover:text-night-100 text-xl"
        >
          ×
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Mode Toggle -->
        <div class="flex gap-2 mb-4">
          <button
            @click="mode = 'url'"
            :class="[
              'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
              mode === 'url' 
                ? 'bg-atlas-600 text-white' 
                : 'bg-night-800 text-night-400 hover:text-night-200'
            ]"
          >
            📎 Paste URL
          </button>
          <button
            @click="mode = 'paste'"
            :class="[
              'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
              mode === 'paste' 
                ? 'bg-atlas-600 text-white' 
                : 'bg-night-800 text-night-400 hover:text-night-200'
            ]"
          >
            📝 Paste Description
          </button>
        </div>

        <!-- URL Mode -->
        <div v-if="mode === 'url'">
          <p class="text-night-400 text-sm mb-4">
            Paste job posting URLs to add them to your pipeline.
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
        </div>

        <!-- Paste Mode -->
        <div v-else>
          <p class="text-night-400 text-sm mb-4">
            Copy and paste the job description directly. Great for sites that block scraping.
          </p>

          <!-- Source URL (optional) -->
          <input
            v-model="sourceUrl"
            type="text"
            class="w-full mb-3"
            placeholder="Source URL (optional)"
          />

          <!-- Job Description -->
          <textarea
            v-model="pastedContent"
            class="w-full h-48 bg-night-800 border border-night-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-atlas-500"
            placeholder="Paste the job title, company name, description, requirements, etc..."
          ></textarea>
          
          <p class="text-night-500 text-xs mt-2">
            Include: job title, company name, location, requirements, and description for best results.
          </p>
        </div>

        <!-- Error -->
        <p v-if="error" class="text-red-400 text-sm mt-4">{{ error }}</p>
        <p v-if="jobs.error" class="text-red-400 text-sm mt-2">{{ jobs.error }}</p>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-night-800">
        <button @click="emit('close')" class="btn btn-ghost">
          Cancel
        </button>
        <button 
          @click="submit" 
          class="btn btn-primary"
          :disabled="submitting || (mode === 'url' && !urls.length) || (mode === 'paste' && !pastedContent.trim())"
        >
          <span v-if="submitting">Processing...</span>
          <span v-else-if="mode === 'url'">Add {{ urls.length }} Job{{ urls.length !== 1 ? 's' : '' }}</span>
          <span v-else>Add Job</span>
        </button>
      </div>
    </div>
  </div>
</template>
