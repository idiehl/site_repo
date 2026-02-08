<script setup>
import { ref, onMounted, computed } from 'vue'

const accessToken = computed(() => localStorage.getItem('access_token') || '')
const statusData = ref(null)
const loading = ref(true)
const error = ref('')
const updating = ref(false)
const draftStatus = ref('READY')
const draftMessage = ref('')

const statusOptions = ['READY', 'PENDING', 'BLOCKED']

const statusLabel = computed(() => statusData.value?.status || 'UNKNOWN')
const statusMessage = computed(() => statusData.value?.message || '')
const formattedUpdatedAt = computed(() => {
  if (!statusData.value?.updated_at) return ''
  const date = new Date(statusData.value.updated_at)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
})
const statusMeta = computed(() => {
  const updatedAt = formattedUpdatedAt.value
  const updatedBy = statusData.value?.updated_by
  if (updatedAt && updatedBy) return `Updated ${updatedAt} by ${updatedBy}`
  if (updatedAt) return `Updated ${updatedAt}`
  if (updatedBy) return `Updated by ${updatedBy}`
  return ''
})

const statusClasses = computed(() => {
  switch (statusLabel.value) {
    case 'READY':
      return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
    case 'PENDING':
      return 'bg-amber-500/20 text-amber-200 border-amber-500/40'
    case 'BLOCKED':
      return 'bg-red-500/20 text-red-200 border-red-500/40'
    default:
      return 'bg-night-800 text-night-300 border-night-700'
  }
})

async function fetchStatus() {
  if (!accessToken.value) {
    error.value = 'Missing access token'
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await fetch('https://apply.atlasuniversalis.com/api/v1/dev/status', {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    })

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.assign('/dev')
      return
    }

    if (!response.ok) {
      throw new Error('Failed to load status')
    }

    const data = await response.json()
    statusData.value = data
    draftStatus.value = data.status || draftStatus.value
    draftMessage.value = data.message || ''
  } catch (err) {
    error.value = err.message || 'Failed to load status'
  } finally {
    loading.value = false
  }
}

async function saveStatus() {
  if (!accessToken.value) {
    error.value = 'Missing access token'
    return
  }

  updating.value = true
  error.value = ''

  try {
    const response = await fetch('https://apply.atlasuniversalis.com/api/v1/dev/status', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: draftStatus.value,
        message: draftMessage.value.trim() || null,
      }),
    })

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.assign('/dev')
      return
    }

    if (!response.ok) {
      throw new Error('Failed to update status')
    }

    statusData.value = await response.json()
  } catch (err) {
    error.value = err.message || 'Failed to update status'
  } finally {
    updating.value = false
  }
}

onMounted(fetchStatus)
</script>

<template>
  <div class="bg-night-900 border-b border-night-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-3 text-sm">
          <span class="text-xs uppercase tracking-[0.2em] text-night-500">Status</span>
          <span :class="['px-2 py-1 text-xs font-semibold rounded-full border', statusClasses]">
            {{ statusLabel }}
          </span>
          <span v-if="statusMessage" class="text-night-400 text-xs">
            “{{ statusMessage }}”
          </span>
          <span v-if="statusMeta" class="text-night-500 text-xs">
            {{ statusMeta }}
          </span>
          <span v-if="loading" class="text-night-500 text-xs">Loading...</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select
            v-model="draftStatus"
            class="px-3 py-2 text-xs rounded-lg bg-night-950 border border-night-800 text-white"
          >
            <option v-for="option in statusOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <input
            v-model="draftMessage"
            type="text"
            placeholder="Optional note"
            class="min-w-[180px] px-3 py-2 text-xs rounded-lg bg-night-950 border border-night-800 text-white placeholder:text-night-500"
          />
          <button
            @click="saveStatus"
            :disabled="updating"
            :class="[
              'px-3 py-2 text-xs rounded-lg transition-colors',
              updating
                ? 'bg-night-800 text-night-500 cursor-not-allowed'
                : 'bg-atlas-600 text-white hover:bg-atlas-500'
            ]"
          >
            {{ updating ? 'Saving...' : 'Update' }}
          </button>
        </div>
      </div>
      <p v-if="error" class="mt-2 text-xs text-red-400">{{ error }}</p>
    </div>
  </div>
</template>
