<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../api/client'

const auth = useAuthStore()

const profile = ref({
  full_name: '',
  headline: '',
  summary: '',
  skills: [],
  work_history: [],
  education: [],
})

const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const success = ref(false)

const newSkill = ref('')

onMounted(async () => {
  await fetchProfile()
})

async function fetchProfile() {
  loading.value = true
  try {
    const response = await api.get('/api/v1/profile')
    profile.value = {
      full_name: response.data.full_name || '',
      headline: response.data.headline || '',
      summary: response.data.summary || '',
      skills: response.data.skills || [],
      work_history: response.data.work_history || [],
      education: response.data.education || [],
    }
  } catch (err) {
    // Profile might not exist yet
    console.log('No profile found, using defaults')
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  saving.value = true
  error.value = null
  success.value = false
  
  try {
    await api.patch('/api/v1/profile', profile.value)
    success.value = true
    setTimeout(() => success.value = false, 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to save profile'
  } finally {
    saving.value = false
  }
}

function addSkill() {
  if (newSkill.value.trim() && !profile.value.skills.includes(newSkill.value.trim())) {
    profile.value.skills.push(newSkill.value.trim())
    newSkill.value = ''
  }
}

function removeSkill(skill) {
  profile.value.skills = profile.value.skills.filter(s => s !== skill)
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-night-900/50 border-b border-night-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-bold text-atlas-400">AtlasOps</h1>
            <nav class="hidden md:flex items-center gap-1">
              <router-link 
                to="/dashboard" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Dashboard
              </router-link>
              <router-link 
                to="/profile" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-100 bg-night-800"
              >
                Profile
              </router-link>
            </nav>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <p class="text-night-400">Loading profile...</p>
      </div>

      <form v-else @submit.prevent="saveProfile" class="space-y-6">
        <!-- Basic Info -->
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-night-300 mb-1.5">
                Full Name
              </label>
              <input
                v-model="profile.full_name"
                type="text"
                class="w-full"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-night-300 mb-1.5">
                Headline
              </label>
              <input
                v-model="profile.headline"
                type="text"
                class="w-full"
                placeholder="Senior Software Engineer"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-night-300 mb-1.5">
                Summary
              </label>
              <textarea
                v-model="profile.summary"
                rows="4"
                class="w-full"
                placeholder="Brief professional summary..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Skills</h2>
          
          <div class="flex gap-2 mb-4">
            <input
              v-model="newSkill"
              type="text"
              class="flex-1"
              placeholder="Add a skill"
              @keyup.enter="addSkill"
            />
            <button type="button" @click="addSkill" class="btn btn-secondary">
              Add
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <span 
              v-for="skill in profile.skills" 
              :key="skill"
              class="inline-flex items-center gap-1 px-3 py-1 bg-atlas-500/20 text-atlas-300 rounded-full text-sm"
            >
              {{ skill }}
              <button 
                type="button" 
                @click="removeSkill(skill)"
                class="hover:text-atlas-100"
              >
                ×
              </button>
            </span>
            <span v-if="!profile.skills.length" class="text-night-500 text-sm">
              No skills added yet
            </span>
          </div>
        </div>

        <!-- Status Messages -->
        <div v-if="error" class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p class="text-sm text-red-400">{{ error }}</p>
        </div>
        
        <div v-if="success" class="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p class="text-sm text-green-400">Profile saved successfully!</p>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : 'Save Profile' }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>
