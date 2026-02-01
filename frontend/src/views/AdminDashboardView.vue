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
const stats = ref(null)
const error = ref(null)

const isAdmin = computed(() => auth.user?.is_admin === true)

async function fetchStats() {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/api/v1/admin/stats/overview', {
      params: { days: 30 }
    })
    stats.value = response.data
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load stats'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isAdmin.value) {
    fetchStats()
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
            <div class="flex items-center gap-2">
              <img src="/atlas-icon.svg" alt="Atlas Apply logo" class="w-8 h-8" />
              <h1 class="text-xl font-bold text-atlas-400">tlas Apply Admin</h1>
            </div>
            <nav class="hidden md:flex items-center gap-1">
              <router-link 
                to="/admin" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-100 bg-night-800"
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
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Security
              </router-link>
              <router-link 
                to="/dashboard" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                User Dashboard
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
      <div v-if="!isAdmin" class="card bg-red-900/20 border-red-800">
        <h2 class="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
        <p class="text-night-300">You do not have admin privileges.</p>
      </div>

      <div v-else-if="loading" class="card">
        <p class="text-night-400">Loading statistics...</p>
      </div>

      <div v-else-if="error" class="card bg-red-900/20 border-red-800">
        <p class="text-red-400">{{ error }}</p>
      </div>

      <div v-else-if="stats">
        <!-- Overview Stats -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Overview (Last {{ stats.period_days }} Days)</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="card">
              <p class="text-sm text-night-400 mb-1">Total Users</p>
              <p class="text-3xl font-bold text-atlas-400">{{ stats.users.total }}</p>
              <p class="text-xs text-night-500 mt-1">{{ stats.users.new }} new</p>
            </div>
            
            <div class="card">
              <p class="text-sm text-night-400 mb-1">Job Postings</p>
              <p class="text-3xl font-bold text-green-400">{{ stats.jobs.total }}</p>
              <p class="text-xs text-night-500 mt-1">{{ stats.jobs.recent }} recent</p>
            </div>
            
            <div class="card">
              <p class="text-sm text-night-400 mb-1">Applications</p>
              <p class="text-3xl font-bold text-blue-400">{{ stats.applications.total }}</p>
              <p class="text-xs text-night-500 mt-1">{{ stats.applications.recent }} recent</p>
            </div>
            
            <div class="card">
              <p class="text-sm text-night-400 mb-1">Site Visits</p>
              <p class="text-3xl font-bold text-purple-400">{{ stats.traffic.total_visits }}</p>
              <p class="text-xs text-night-500 mt-1">{{ stats.traffic.unique_visitors }} unique</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="card">
              <p class="text-sm text-night-400 mb-1">API Calls</p>
              <p class="text-2xl font-bold">{{ stats.api.total_calls.toLocaleString() }}</p>
              <p class="text-xs text-night-500 mt-1">
                Avg: {{ stats.api.avg_response_time_ms }}ms
              </p>
              <p class="text-xs text-red-400 mt-1">
                Error Rate: {{ stats.api.error_rate_percent }}%
              </p>
            </div>
            
            <div class="card" :class="stats.security.critical_events > 0 ? 'bg-red-900/20 border-red-800' : ''">
              <p class="text-sm text-night-400 mb-1">Security Events</p>
              <p class="text-2xl font-bold" :class="stats.security.critical_events > 0 ? 'text-red-400' : 'text-yellow-400'">
                {{ stats.security.unresolved_events }}
              </p>
              <p class="text-xs text-red-400 mt-1" v-if="stats.security.critical_events > 0">
                {{ stats.security.critical_events }} critical
              </p>
            </div>
            
            <div class="card">
              <p class="text-sm text-night-400 mb-1">System Health</p>
              <p class="text-2xl font-bold text-green-400">Healthy</p>
              <p class="text-xs text-night-500 mt-1">
                Error rate: {{ stats.api.error_rate_percent }}%
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
          <div class="flex flex-wrap gap-3">
            <router-link to="/admin/analytics" class="btn btn-primary">
              View Analytics
            </router-link>
            <router-link to="/admin/security" class="btn btn-secondary">
              Security Events
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
