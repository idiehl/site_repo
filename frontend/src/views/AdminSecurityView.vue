<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api/client'

const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}

const loading = ref(true)
const events = ref([])
const error = ref(null)
const filterResolved = ref(null)
const filterSeverity = ref(null)

const isAdmin = computed(() => auth.user?.is_admin === true)

const severityColors = {
  low: 'text-blue-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400'
}

async function fetchEvents() {
  loading.value = true
  error.value = null
  try {
    const params = {}
    if (filterResolved.value !== null) {
      params.resolved = filterResolved.value
    }
    if (filterSeverity.value) {
      params.severity = filterSeverity.value
    }
    
    const response = await api.get('/api/v1/admin/security/events', { params })
    events.value = response.data.events || []
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load security events'
  } finally {
    loading.value = false
  }
}

async function resolveEvent(eventId) {
  try {
    await api.post(`/api/v1/admin/security/events/${eventId}/resolve`)
    await fetchEvents()
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to resolve event'
  }
}

onMounted(() => {
  if (isAdmin.value) {
    fetchEvents()
  }
})
</script>

<template>
  <div class="min-h-screen bg-night-950">
    <!-- Header -->
    <header class="bg-night-900/50 border-b border-night-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-bold text-atlas-400">Security Events</h1>
            <nav class="hidden md:flex items-center gap-1">
              <router-link 
                to="/admin" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Overview
              </router-link>
              <router-link 
                to="/admin/analytics" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Analytics
              </router-link>
              <router-link 
                to="/admin/security" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-100 bg-night-800"
              >
                Security
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

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="!isAdmin" class="card bg-red-900/20 border-red-800">
        <h2 class="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
        <p class="text-night-300">You do not have admin privileges.</p>
      </div>

      <div v-else>
        <!-- Filters -->
        <div class="card mb-6">
          <div class="flex items-center gap-4 flex-wrap">
            <label class="text-sm text-night-400">Status:</label>
            <select v-model="filterResolved" @change="fetchEvents" class="input">
              <option :value="null">All</option>
              <option :value="false">Unresolved</option>
              <option :value="true">Resolved</option>
            </select>
            
            <label class="text-sm text-night-400 ml-4">Severity:</label>
            <select v-model="filterSeverity" @change="fetchEvents" class="input">
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            
            <button @click="fetchEvents" class="btn btn-primary" :disabled="loading">
              Refresh
            </button>
          </div>
        </div>

        <div v-if="loading" class="card">
          <p class="text-night-400">Loading security events...</p>
        </div>

        <div v-else-if="error" class="card bg-red-900/20 border-red-800">
          <p class="text-red-400">{{ error }}</p>
        </div>

        <div v-else-if="events.length === 0" class="card">
          <p class="text-night-400">No security events found.</p>
        </div>

        <div v-else class="card">
          <h2 class="text-xl font-bold mb-4">Security Events</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-night-800">
                  <th class="text-left p-2">Type</th>
                  <th class="text-left p-2">Severity</th>
                  <th class="text-left p-2">IP Address</th>
                  <th class="text-left p-2">User</th>
                  <th class="text-left p-2">Time</th>
                  <th class="text-left p-2">Status</th>
                  <th class="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="event in events" 
                  :key="event.id"
                  class="border-b border-night-800/50"
                  :class="event.severity === 'critical' && !event.resolved ? 'bg-red-900/10' : ''"
                >
                  <td class="p-2 font-mono text-xs">{{ event.event_type }}</td>
                  <td class="p-2">
                    <span :class="severityColors[event.severity] || 'text-night-400'">
                      {{ event.severity.toUpperCase() }}
                    </span>
                  </td>
                  <td class="p-2 text-xs">{{ event.ip_address || '-' }}</td>
                  <td class="p-2 text-xs">{{ event.user_id || 'Anonymous' }}</td>
                  <td class="p-2 text-xs">{{ new Date(event.created_at).toLocaleString() }}</td>
                  <td class="p-2">
                    <span 
                      :class="event.resolved ? 'text-green-400' : 'text-yellow-400'"
                      class="text-xs font-semibold"
                    >
                      {{ event.resolved ? 'RESOLVED' : 'UNRESOLVED' }}
                    </span>
                  </td>
                  <td class="p-2">
                    <button 
                      v-if="!event.resolved"
                      @click="resolveEvent(event.id)"
                      class="btn btn-sm btn-primary"
                    >
                      Resolve
                    </button>
                    <span v-else class="text-xs text-night-500">
                      {{ event.resolved_at ? new Date(event.resolved_at).toLocaleDateString() : '' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
