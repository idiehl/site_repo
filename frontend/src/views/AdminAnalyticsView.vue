<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../api/client'

const auth = useAuthStore()

const loading = ref(true)
const visits = ref(null)
const apiUsage = ref(null)
const error = ref(null)
const days = ref(7)

const isAdmin = computed(() => auth.user?.is_admin === true)

async function fetchVisits() {
  try {
    const response = await api.get('/api/v1/admin/analytics/visits', {
      params: { days: days.value, limit: 100 }
    })
    visits.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load visits'
  }
}

async function fetchApiUsage() {
  try {
    const response = await api.get('/api/v1/admin/analytics/api-usage', {
      params: { days: days.value, limit: 100 }
    })
    apiUsage.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load API usage'
  }
}

async function fetchAll() {
  loading.value = true
  error.value = null
  await Promise.all([fetchVisits(), fetchApiUsage()])
  loading.value = false
}

onMounted(() => {
  if (isAdmin.value) {
    fetchAll()
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
            <h1 class="text-xl font-bold text-atlas-400">Analytics</h1>
            <nav class="hidden md:flex items-center gap-1">
              <router-link 
                to="/admin" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Overview
              </router-link>
              <router-link 
                to="/admin/analytics" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-100 bg-night-800"
              >
                Analytics
              </router-link>
              <router-link 
                to="/admin/security" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Security
              </router-link>
            </nav>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="text-sm text-night-400">{{ auth.user?.email }}</span>
            <button @click="auth.logout" class="btn btn-ghost text-sm">
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
          <div class="flex items-center gap-4">
            <label class="text-sm text-night-400">Period:</label>
            <select v-model="days" @change="fetchAll" class="input">
              <option :value="7">Last 7 days</option>
              <option :value="30">Last 30 days</option>
              <option :value="90">Last 90 days</option>
            </select>
            <button @click="fetchAll" class="btn btn-primary" :disabled="loading">
              Refresh
            </button>
          </div>
        </div>

        <div v-if="loading" class="card">
          <p class="text-night-400">Loading analytics...</p>
        </div>

        <div v-else-if="error" class="card bg-red-900/20 border-red-800">
          <p class="text-red-400">{{ error }}</p>
        </div>

        <div v-else>
          <!-- Site Visits -->
          <div class="card mb-6">
            <h2 class="text-xl font-bold mb-4">Site Visits</h2>
            
            <div v-if="visits?.popular_paths?.length" class="mb-6">
              <h3 class="text-lg font-semibold mb-3">Popular Paths</h3>
              <div class="space-y-2">
                <div 
                  v-for="path in visits.popular_paths" 
                  :key="path.path"
                  class="flex items-center justify-between p-2 bg-night-800 rounded"
                >
                  <span class="text-sm font-mono text-night-300">{{ path.path }}</span>
                  <span class="text-sm font-bold text-atlas-400">{{ path.count }}</span>
                </div>
              </div>
            </div>

            <div v-if="visits?.visits_by_day?.length" class="mb-6">
              <h3 class="text-lg font-semibold mb-3">Visits by Day</h3>
              <div class="space-y-2">
                <div 
                  v-for="day in visits.visits_by_day" 
                  :key="day.date"
                  class="flex items-center justify-between p-2 bg-night-800 rounded"
                >
                  <span class="text-sm text-night-300">{{ day.date }}</span>
                  <span class="text-sm font-bold text-purple-400">{{ day.count }}</span>
                </div>
              </div>
            </div>

            <div v-if="visits?.recent_visits?.length">
              <h3 class="text-lg font-semibold mb-3">Recent Visits</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-night-800">
                      <th class="text-left p-2">Path</th>
                      <th class="text-left p-2">Method</th>
                      <th class="text-left p-2">IP</th>
                      <th class="text-left p-2">User</th>
                      <th class="text-left p-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="visit in visits.recent_visits.slice(0, 20)" 
                      :key="visit.id"
                      class="border-b border-night-800/50"
                    >
                      <td class="p-2 font-mono text-xs">{{ visit.path }}</td>
                      <td class="p-2">{{ visit.method }}</td>
                      <td class="p-2 text-xs">{{ visit.ip_address || '-' }}</td>
                      <td class="p-2 text-xs">{{ visit.user_id || 'Anonymous' }}</td>
                      <td class="p-2 text-xs">{{ new Date(visit.created_at).toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- API Usage -->
          <div class="card">
            <h2 class="text-xl font-bold mb-4">API Usage</h2>
            
            <div v-if="apiUsage?.endpoint_stats?.length" class="mb-6">
              <h3 class="text-lg font-semibold mb-3">Endpoint Statistics</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-night-800">
                      <th class="text-left p-2">Endpoint</th>
                      <th class="text-left p-2">Method</th>
                      <th class="text-right p-2">Calls</th>
                      <th class="text-right p-2">Avg Time (ms)</th>
                      <th class="text-right p-2">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="stat in apiUsage.endpoint_stats" 
                      :key="`${stat.endpoint}-${stat.method}`"
                      class="border-b border-night-800/50"
                    >
                      <td class="p-2 font-mono text-xs">{{ stat.endpoint }}</td>
                      <td class="p-2">{{ stat.method }}</td>
                      <td class="p-2 text-right">{{ stat.count }}</td>
                      <td class="p-2 text-right">{{ stat.avg_response_time_ms }}</td>
                      <td class="p-2 text-right" :class="stat.error_count > 0 ? 'text-red-400' : ''">
                        {{ stat.error_count }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="apiUsage?.usage_by_day?.length" class="mb-6">
              <h3 class="text-lg font-semibold mb-3">Usage by Day</h3>
              <div class="space-y-2">
                <div 
                  v-for="day in apiUsage.usage_by_day" 
                  :key="day.date"
                  class="flex items-center justify-between p-2 bg-night-800 rounded"
                >
                  <span class="text-sm text-night-300">{{ day.date }}</span>
                  <div class="flex items-center gap-4">
                    <span class="text-sm text-blue-400">{{ day.count }} calls</span>
                    <span class="text-sm text-night-500">{{ day.avg_response_time_ms }}ms avg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
