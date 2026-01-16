<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../api/client'

const auth = useAuthStore()

const profile = ref({
  full_name: '',
  headline: '',
  summary: '',
  profile_picture_url: '',
  location: '',
  phone: '',
  social_links: {
    linkedin: '',
    github: '',
    twitter: '',
    portfolio: '',
  },
  skills: [],
  work_history: [],
  education: [],
  certifications: [],
  projects: [],
  completeness_score: 0,
})

const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const uploadingPicture = ref(false)
const error = ref(null)
const success = ref(null)
const activeTab = ref('basic')
const billingLoading = ref(false)
const billingError = ref(null)

const newSkill = ref('')
const resumeFile = ref(null)
const pictureFile = ref(null)

// Completeness info
const completenessInfo = ref({
  score: 0,
  missing_fields: [],
  is_complete: false,
})

const tabs = [
  { id: 'basic', label: 'Basic Info', icon: '👤' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '🛠️' },
  { id: 'projects', label: 'Projects', icon: '📁' },
  { id: 'social', label: 'Links', icon: '🔗' },
]

const planLabel = computed(() => {
  if (auth.canAccessPremium) return 'Paid'
  return 'Free'
})

const resumeUsageText = computed(() => {
  if (auth.canAccessPremium) return 'Unlimited resume generations'
  if (!auth.resumeGenerationLimit) return ''
  return `${auth.resumeGenerationsUsed} of ${auth.resumeGenerationLimit} resumes used`
})

async function startUpgrade() {
  billingLoading.value = true
  billingError.value = null
  try {
    const response = await api.post('/api/v1/billing/checkout')
    if (response.data?.url) {
      window.location.href = response.data.url
    } else {
      billingError.value = 'Billing session unavailable'
    }
  } catch (err) {
    billingError.value = err.response?.data?.detail || 'Failed to start checkout'
  } finally {
    billingLoading.value = false
  }
}

onMounted(async () => {
  await fetchProfile()
  await fetchCompleteness()
})

async function fetchProfile() {
  loading.value = true
  try {
    const response = await api.get('/api/v1/profile')
    profile.value = {
      full_name: response.data.full_name || '',
      headline: response.data.headline || '',
      summary: response.data.summary || '',
      profile_picture_url: response.data.profile_picture_url || '',
      location: response.data.location || '',
      phone: response.data.phone || '',
      social_links: response.data.social_links || {
        linkedin: '',
        github: '',
        twitter: '',
        portfolio: '',
      },
      skills: response.data.skills || [],
      work_history: response.data.work_history || [],
      education: response.data.education || [],
      certifications: response.data.certifications || [],
      projects: response.data.projects || [],
      completeness_score: response.data.completeness_score || 0,
    }
  } catch (err) {
    console.log('No profile found, using defaults')
  } finally {
    loading.value = false
  }
}

async function fetchCompleteness() {
  try {
    const response = await api.get('/api/v1/profile/completeness')
    completenessInfo.value = response.data
  } catch (err) {
    console.log('Could not fetch completeness')
  }
}

async function saveProfile() {
  saving.value = true
  error.value = null
  success.value = null
  
  try {
    await api.patch('/api/v1/profile', profile.value)
    success.value = 'Profile saved successfully!'
    await fetchCompleteness()
    setTimeout(() => success.value = null, 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to save profile'
  } finally {
    saving.value = false
  }
}

async function uploadResume() {
  if (!resumeFile.value) return
  
  uploading.value = true
  error.value = null
  success.value = null
  
  const formData = new FormData()
  formData.append('file', resumeFile.value)
  
  try {
    const response = await api.post('/api/v1/profile/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    success.value = `Resume parsed! Updated ${response.data.parsed_fields.length} fields.`
    
    // Refresh profile data
    await fetchProfile()
    await fetchCompleteness()
    
    resumeFile.value = null
    // Reset file input
    const fileInput = document.getElementById('resume-upload')
    if (fileInput) fileInput.value = ''
    
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to parse resume'
  } finally {
    uploading.value = false
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    resumeFile.value = file
  }
}

function handlePictureSelect(event) {
  const file = event.target.files[0]
  if (file) {
    pictureFile.value = file
    uploadProfilePicture()
  }
}

async function uploadProfilePicture() {
  if (!pictureFile.value) return
  
  uploadingPicture.value = true
  error.value = null
  
  const formData = new FormData()
  formData.append('file', pictureFile.value)
  
  try {
    const response = await api.post('/api/v1/profile/upload-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    profile.value.profile_picture_url = response.data.profile_picture_url
    success.value = 'Profile picture uploaded!'
    await fetchCompleteness()
    
    pictureFile.value = null
    const fileInput = document.getElementById('picture-upload')
    if (fileInput) fileInput.value = ''
    
    setTimeout(() => success.value = null, 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to upload picture'
  } finally {
    uploadingPicture.value = false
  }
}

async function deleteProfilePicture() {
  if (!profile.value.profile_picture_url) return
  
  try {
    await api.delete('/api/v1/profile/picture')
    profile.value.profile_picture_url = ''
    success.value = 'Profile picture removed'
    await fetchCompleteness()
    setTimeout(() => success.value = null, 3000)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to delete picture'
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

function addWorkExperience() {
  profile.value.work_history.push({
    company: '',
    title: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    achievements: [],
  })
}

function removeWorkExperience(index) {
  profile.value.work_history.splice(index, 1)
}

function addEducation() {
  profile.value.education.push({
    institution: '',
    degree: '',
    field: '',
    start_date: '',
    end_date: '',
  })
}

function removeEducation(index) {
  profile.value.education.splice(index, 1)
}

function addProject() {
  profile.value.projects.push({
    name: '',
    description: '',
    technologies: [],
    url: '',
  })
}

function removeProject(index) {
  profile.value.projects.splice(index, 1)
}

const completenessColor = computed(() => {
  const score = completenessInfo.value.score
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
})
</script>

<template>
  <div class="min-h-screen bg-night-950">
    <!-- Header -->
    <header class="bg-night-900/50 border-b border-night-800 sticky top-0 z-10 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-bold text-atlas-400">QuickPro</h1>
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
          <button @click="auth.logout" class="text-sm text-night-400 hover:text-night-200">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-atlas-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-night-400">Loading profile...</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Profile Header with Completeness -->
        <div class="card">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <!-- Profile Picture with Upload -->
              <div class="relative group">
                <div class="w-20 h-20 rounded-full bg-night-700 flex items-center justify-center overflow-hidden ring-2 ring-night-600">
                  <img 
                    v-if="profile.profile_picture_url" 
                    :src="profile.profile_picture_url" 
                    class="w-full h-full object-cover"
                    alt="Profile"
                  />
                  <span v-else class="text-3xl">👤</span>
                </div>
                <!-- Upload overlay -->
                <div class="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input
                    id="picture-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    @change="handlePictureSelect"
                    class="hidden"
                  />
                  <label 
                    v-if="!uploadingPicture"
                    for="picture-upload"
                    class="text-white text-xs font-medium cursor-pointer"
                  >
                    {{ profile.profile_picture_url ? '📷 Change' : '📷 Upload' }}
                  </label>
                  <span v-else class="text-white text-xs">Uploading...</span>
                </div>
                <!-- Delete button -->
                <button 
                  v-if="profile.profile_picture_url && !uploadingPicture"
                  @click="deleteProfilePicture"
                  class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove picture"
                >
                  ×
                </button>
              </div>
              <div>
                <h2 class="text-xl font-semibold">{{ profile.full_name || 'Your Name' }}</h2>
                <p class="text-night-400">{{ profile.headline || 'Add your headline' }}</p>
              </div>
            </div>
            
            <!-- Completeness Score -->
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-sm text-night-400">Profile Strength</div>
                <div class="text-lg font-semibold">{{ completenessInfo.score }}%</div>
              </div>
              <div class="w-24 h-2 bg-night-700 rounded-full overflow-hidden">
                <div 
                  :class="completenessColor"
                  class="h-full transition-all duration-500"
                  :style="{ width: `${completenessInfo.score}%` }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- Missing Fields Hint -->
          <div v-if="completenessInfo.missing_fields.length > 0" class="mt-4 p-3 bg-night-800/50 rounded-lg">
            <p class="text-sm text-night-400">
              <span class="text-atlas-400">Tip:</span> Add 
              {{ completenessInfo.missing_fields.slice(0, 3).map(f => f.label).join(', ') }}
              {{ completenessInfo.missing_fields.length > 3 ? ` and ${completenessInfo.missing_fields.length - 3} more` : '' }}
              to improve your profile.
            </p>
          </div>
        </div>

        <!-- Plan & Billing -->
        <div class="card">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold">Plan</h3>
              <p class="text-night-300 text-sm mt-1">
                {{ planLabel }} plan
                <span class="text-night-500 ml-2">•</span>
                <span class="text-night-400 ml-2">{{ auth.subscriptionStatus }}</span>
              </p>
              <p v-if="resumeUsageText" class="text-sm text-night-400 mt-2">
                {{ resumeUsageText }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button
                v-if="!auth.canAccessPremium"
                @click="startUpgrade"
                :disabled="billingLoading"
                class="btn btn-primary"
              >
                {{ billingLoading ? 'Redirecting...' : 'Upgrade to Paid' }}
              </button>
              <span v-else class="text-sm text-green-400">Premium features unlocked</span>
            </div>
          </div>
          <div v-if="billingError" class="mt-3 text-sm text-red-400">
            {{ billingError }}
          </div>
        </div>

        <!-- Resume Upload -->
        <div class="card bg-gradient-to-r from-atlas-900/20 to-night-800/50">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold flex items-center gap-2">
                📄 Quick Import
              </h3>
              <p class="text-night-400 text-sm mt-1">
                Upload your resume to automatically fill your profile
              </p>
            </div>
            <div class="flex items-center gap-3">
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.txt"
                @change="handleFileSelect"
                class="hidden"
              />
              <label 
                for="resume-upload"
                class="btn btn-secondary cursor-pointer"
              >
                {{ resumeFile ? resumeFile.name : 'Choose File' }}
              </label>
              <button 
                v-if="resumeFile"
                @click="uploadResume"
                :disabled="uploading"
                class="btn btn-primary"
              >
                {{ uploading ? 'Parsing...' : 'Parse Resume' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex flex-wrap gap-2 border-b border-night-800 pb-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id 
                ? 'bg-atlas-500/20 text-atlas-300' 
                : 'text-night-400 hover:text-night-200 hover:bg-night-800/50'
            ]"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <form @submit.prevent="saveProfile">
          <!-- Basic Info Tab -->
          <div v-if="activeTab === 'basic'" class="card space-y-4">
            <h3 class="text-lg font-semibold">Basic Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-night-300 mb-1.5">Full Name</label>
                <input v-model="profile.full_name" type="text" class="w-full" placeholder="John Doe" />
              </div>
              <div>
                <label class="block text-sm font-medium text-night-300 mb-1.5">Headline</label>
                <input v-model="profile.headline" type="text" class="w-full" placeholder="Senior Software Engineer" />
              </div>
              <div>
                <label class="block text-sm font-medium text-night-300 mb-1.5">Location</label>
                <input v-model="profile.location" type="text" class="w-full" placeholder="San Francisco, CA" />
              </div>
              <div>
                <label class="block text-sm font-medium text-night-300 mb-1.5">Phone</label>
                <input v-model="profile.phone" type="tel" class="w-full" placeholder="+1 (555) 123-4567" />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-night-300 mb-1.5">Professional Summary</label>
              <textarea v-model="profile.summary" rows="4" class="w-full" placeholder="Brief overview of your career and goals..."></textarea>
            </div>
          </div>

          <!-- Experience Tab -->
          <div v-if="activeTab === 'experience'" class="card space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Work Experience</h3>
              <button type="button" @click="addWorkExperience" class="btn btn-secondary text-sm">
                + Add Experience
              </button>
            </div>
            
            <div v-if="profile.work_history.length === 0" class="text-center py-8 text-night-500">
              No work experience added yet. Click "Add Experience" to get started.
            </div>
            
            <div v-for="(job, index) in profile.work_history" :key="index" class="p-4 bg-night-800/50 rounded-lg space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-night-400">Position {{ index + 1 }}</span>
                <button type="button" @click="removeWorkExperience(index)" class="text-red-400 text-sm hover:text-red-300">
                  Remove
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input v-model="job.company" type="text" class="w-full" placeholder="Company Name" />
                <input v-model="job.title" type="text" class="w-full" placeholder="Job Title" />
                <input v-model="job.location" type="text" class="w-full" placeholder="Location" />
                <div class="flex gap-2">
                  <input v-model="job.start_date" type="text" class="w-full" placeholder="Start (YYYY-MM)" />
                  <input v-model="job.end_date" type="text" class="w-full" placeholder="End or Present" :disabled="job.is_current" />
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <input v-model="job.is_current" type="checkbox" id="current-job-${index}" class="rounded" />
                <label :for="`current-job-${index}`" class="text-sm text-night-400">I currently work here</label>
              </div>
              
              <textarea v-model="job.description" rows="3" class="w-full" placeholder="Describe your responsibilities and achievements..."></textarea>
            </div>
          </div>

          <!-- Education Tab -->
          <div v-if="activeTab === 'education'" class="card space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Education</h3>
              <button type="button" @click="addEducation" class="btn btn-secondary text-sm">
                + Add Education
              </button>
            </div>
            
            <div v-if="profile.education.length === 0" class="text-center py-8 text-night-500">
              No education added yet. Click "Add Education" to get started.
            </div>
            
            <div v-for="(edu, index) in profile.education" :key="index" class="p-4 bg-night-800/50 rounded-lg space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-night-400">Education {{ index + 1 }}</span>
                <button type="button" @click="removeEducation(index)" class="text-red-400 text-sm hover:text-red-300">
                  Remove
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input v-model="edu.institution" type="text" class="w-full" placeholder="School/University" />
                <input v-model="edu.degree" type="text" class="w-full" placeholder="Degree (e.g., B.S., M.S.)" />
                <input v-model="edu.field" type="text" class="w-full" placeholder="Field of Study" />
                <div class="flex gap-2">
                  <input v-model="edu.start_date" type="text" class="w-full" placeholder="Start Year" />
                  <input v-model="edu.end_date" type="text" class="w-full" placeholder="End Year" />
                </div>
              </div>
            </div>
          </div>

          <!-- Skills Tab -->
          <div v-if="activeTab === 'skills'" class="card space-y-4">
            <h3 class="text-lg font-semibold">Skills</h3>
            
            <div class="flex gap-2">
              <input
                v-model="newSkill"
                type="text"
                class="flex-1"
                placeholder="Add a skill (e.g., Python, Project Management)"
                @keyup.enter.prevent="addSkill"
              />
              <button type="button" @click="addSkill" class="btn btn-secondary">
                Add
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <span 
                v-for="skill in profile.skills" 
                :key="skill"
                class="inline-flex items-center gap-1 px-3 py-1.5 bg-atlas-500/20 text-atlas-300 rounded-full text-sm"
              >
                {{ skill }}
                <button 
                  type="button" 
                  @click="removeSkill(skill)"
                  class="hover:text-atlas-100 ml-1"
                >
                  ×
                </button>
              </span>
              <span v-if="!profile.skills.length" class="text-night-500 text-sm py-2">
                No skills added yet. Start typing to add skills.
              </span>
            </div>
          </div>

          <!-- Projects Tab -->
          <div v-if="activeTab === 'projects'" class="card space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Projects</h3>
              <button type="button" @click="addProject" class="btn btn-secondary text-sm">
                + Add Project
              </button>
            </div>
            
            <div v-if="profile.projects.length === 0" class="text-center py-8 text-night-500">
              No projects added yet. Showcase your work by adding projects.
            </div>
            
            <div v-for="(project, index) in profile.projects" :key="index" class="p-4 bg-night-800/50 rounded-lg space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-night-400">Project {{ index + 1 }}</span>
                <button type="button" @click="removeProject(index)" class="text-red-400 text-sm hover:text-red-300">
                  Remove
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input v-model="project.name" type="text" class="w-full" placeholder="Project Name" />
                <input v-model="project.url" type="url" class="w-full" placeholder="Project URL" />
              </div>
              <textarea v-model="project.description" rows="2" class="w-full" placeholder="Brief description of the project..."></textarea>
            </div>
          </div>

          <!-- Social Links Tab -->
          <div v-if="activeTab === 'social'" class="card space-y-4">
            <h3 class="text-lg font-semibold">Social & Professional Links</h3>
            
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="w-8 text-center">🔗</span>
                <input v-model="profile.social_links.linkedin" type="url" class="flex-1" placeholder="LinkedIn URL" />
              </div>
              <div class="flex items-center gap-3">
                <span class="w-8 text-center">💻</span>
                <input v-model="profile.social_links.github" type="url" class="flex-1" placeholder="GitHub URL" />
              </div>
              <div class="flex items-center gap-3">
                <span class="w-8 text-center">🐦</span>
                <input v-model="profile.social_links.twitter" type="url" class="flex-1" placeholder="Twitter/X URL" />
              </div>
              <div class="flex items-center gap-3">
                <span class="w-8 text-center">🌐</span>
                <input v-model="profile.social_links.portfolio" type="url" class="flex-1" placeholder="Portfolio/Personal Website" />
              </div>
            </div>
          </div>

          <!-- Status Messages -->
          <div v-if="error" class="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>
          
          <div v-if="success" class="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p class="text-sm text-green-400">{{ success }}</p>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end mt-6">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save Profile' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
