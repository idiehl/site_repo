<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobsStore } from '../stores/jobs'
import StatusBadge from '../components/StatusBadge.vue'
import api from '../api/client'
import html2pdf from 'html2pdf.js'

const route = useRoute()
const router = useRouter()
const jobs = useJobsStore()

const job = computed(() => jobs.currentJob)
const generating = ref(false)
const generatingDeepDive = ref(false)
const showManualEntry = ref(false)
const manualContent = ref('')
const savingManual = ref(false)
const message = ref('')
const error = ref('')

// Resume state
const resumes = ref([])
const selectedResume = ref(null)
const showResumeModal = ref(false)
const loadingResume = ref(false)

// Deep dive state
const deepDive = ref(null)
const showDeepDiveModal = ref(false)

// Check if job was blocked/failed to scrape
const wasBlocked = computed(() => {
  if (!job.value) return false
  const text = job.value.raw_text || job.value.job_description || ''
  return text.toLowerCase().includes('blocked') || 
         text.toLowerCase().includes('cloudflare') ||
         (!job.value.company_name && !job.value.job_title && job.value.status === 'completed')
})

onMounted(async () => {
  await jobs.fetchJob(route.params.id)
  await fetchResumes()
  await fetchDeepDive()
})

async function fetchResumes() {
  if (!route.params.id) return
  try {
    const response = await api.get(`/api/v1/jobs/${route.params.id}/resumes`)
    resumes.value = response.data
  } catch (err) {
    console.error('Failed to fetch resumes:', err)
  }
}

async function fetchDeepDive() {
  if (!route.params.id) return
  try {
    const response = await api.get(`/api/v1/jobs/${route.params.id}/deep-dive`)
    deepDive.value = response.data
  } catch (err) {
    // 404 is expected if no deep dive exists yet
    if (err.response?.status !== 404) {
      console.error('Failed to fetch deep dive:', err)
    }
  }
}

function goBack() {
  router.push('/dashboard')
}

async function generateResume() {
  if (!job.value?.company_name) {
    error.value = 'Please add job details first (company blocked scraping)'
    return
  }
  generating.value = true
  error.value = ''
  message.value = ''
  try {
    const response = await api.post(`/api/v1/jobs/${job.value.id}/resumes`)
    message.value = `Resume generated! Match score: ${(response.data.match_score * 100).toFixed(0)}%`
    // Refresh resumes list and show the new one
    await fetchResumes()
    await viewResume(response.data.id)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to generate resume'
  } finally {
    generating.value = false
  }
}

async function viewResume(resumeId) {
  if (!job.value) return
  loadingResume.value = true
  try {
    const response = await api.get(`/api/v1/jobs/${job.value.id}/resumes/${resumeId}`)
    selectedResume.value = response.data
    showResumeModal.value = true
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load resume'
  } finally {
    loadingResume.value = false
  }
}

function closeResumeModal() {
  showResumeModal.value = false
  selectedResume.value = null
}

const downloadingPdf = ref(false)

async function downloadResume() {
  if (!selectedResume.value?.rendered_html) return
  
  downloadingPdf.value = true
  
  try {
    // Create a temporary container for the HTML content
    const container = document.createElement('div')
    container.innerHTML = selectedResume.value.rendered_html
    container.style.padding = '20px'
    container.style.fontFamily = 'Georgia, serif'
    container.style.lineHeight = '1.6'
    container.style.maxWidth = '800px'
    container.style.margin = '0 auto'
    
    // Create filename from job title
    const jobTitle = (job.value?.job_title || 'resume').replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const company = (job.value?.company_name || '').replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const filename = `resume_${company}_${jobTitle}.pdf`
    
    // PDF options
    const options = {
      margin: 0.5,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    
    // Generate and download PDF
    await html2pdf().set(options).from(container).save()
  } catch (err) {
    console.error('PDF generation failed:', err)
    error.value = 'Failed to generate PDF'
  } finally {
    downloadingPdf.value = false
  }
}

async function generateDeepDive() {
  if (!job.value?.company_name) {
    error.value = 'Please add job details first'
    return
  }
  generatingDeepDive.value = true
  error.value = ''
  message.value = ''
  try {
    const response = await api.post(`/api/v1/jobs/${job.value.id}/deep-dive`)
    deepDive.value = response.data
    message.value = 'Deep dive generated!'
    showDeepDiveModal.value = true
  } catch (err) {
    if (err.response?.data?.detail === 'Deep dive already exists for this job') {
      // Just show the existing one
      await fetchDeepDive()
      showDeepDiveModal.value = true
    } else {
      error.value = err.response?.data?.detail || 'Failed to generate deep dive'
    }
  } finally {
    generatingDeepDive.value = false
  }
}

function viewDeepDive() {
  if (deepDive.value) {
    showDeepDiveModal.value = true
  } else {
    generateDeepDive()
  }
}

function closeDeepDiveModal() {
  showDeepDiveModal.value = false
}

async function saveManualContent() {
  if (!manualContent.value.trim()) return
  
  savingManual.value = true
  error.value = ''
  try {
    // Re-process with manual content
    await api.post(`/api/v1/jobs/${job.value.id}/manual-content`, {
      content: manualContent.value
    })
    message.value = 'Job content saved and processed!'
    showManualEntry.value = false
    manualContent.value = ''
    // Refresh job data
    await jobs.fetchJob(route.params.id)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to save content'
  } finally {
    savingManual.value = false
  }
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-night-900/50 border-b border-night-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <button @click="goBack" class="btn btn-ghost mr-4">
            ← Back
          </button>
          <h1 class="text-xl font-bold">Job Details</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="jobs.loading" class="text-center py-12">
        <p class="text-night-400">Loading...</p>
      </div>

      <div v-else-if="job" class="space-y-6">
        <!-- Job Header -->
        <div class="card">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-2xl font-bold mb-2">{{ job.job_title || 'Processing...' }}</h2>
              <p class="text-lg text-night-300 mb-4">{{ job.company_name || 'Company name pending' }}</p>
              <div class="flex items-center gap-4 text-sm text-night-400">
                <span v-if="job.location">📍 {{ job.location }}</span>
                <span v-if="job.remote_policy">🏠 {{ job.remote_policy }}</span>
                <span v-if="job.salary_range">💰 {{ job.salary_range }}</span>
              </div>
            </div>
            <StatusBadge :status="job.status" />
          </div>
        </div>

        <!-- Description -->
        <div v-if="job.job_description" class="card">
          <h3 class="text-lg font-semibold mb-4">Description</h3>
          <p class="text-night-300 whitespace-pre-wrap">{{ job.job_description }}</p>
        </div>

        <!-- Requirements -->
        <div v-if="job.requirements" class="card">
          <h3 class="text-lg font-semibold mb-4">Requirements</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div v-if="job.requirements.hard_skills?.length">
              <h4 class="text-sm font-medium text-night-400 mb-2">Technical Skills</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="skill in job.requirements.hard_skills" 
                  :key="skill"
                  class="px-2 py-1 bg-atlas-500/20 text-atlas-300 rounded text-sm"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
            <div v-if="job.requirements.soft_skills?.length">
              <h4 class="text-sm font-medium text-night-400 mb-2">Soft Skills</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="skill in job.requirements.soft_skills" 
                  :key="skill"
                  class="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Blocked Warning -->
        <div v-if="wasBlocked" class="card bg-yellow-900/20 border-yellow-600/50">
          <div class="flex items-start gap-3">
            <span class="text-2xl">⚠️</span>
            <div class="flex-1">
              <h3 class="font-semibold text-yellow-400 mb-1">Scraping Blocked</h3>
              <p class="text-sm text-night-300 mb-3">
                This site blocked our scraper. You can paste the job posting content manually.
              </p>
              <button 
                @click="showManualEntry = !showManualEntry" 
                class="btn btn-secondary text-sm"
              >
                {{ showManualEntry ? 'Cancel' : 'Enter Job Details Manually' }}
              </button>
            </div>
          </div>
          
          <!-- Manual Entry Form -->
          <div v-if="showManualEntry" class="mt-4 pt-4 border-t border-yellow-600/30">
            <p class="text-sm text-night-400 mb-2">
              Copy and paste the job posting content from the website:
            </p>
            <textarea
              v-model="manualContent"
              class="w-full h-48 bg-night-800 border border-night-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-atlas-500"
              placeholder="Paste the job title, company name, description, requirements, etc..."
            ></textarea>
            <button 
              @click="saveManualContent"
              :disabled="savingManual || !manualContent.trim()"
              class="btn btn-primary mt-3"
            >
              {{ savingManual ? 'Processing...' : 'Save & Process' }}
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div v-if="message" class="card bg-green-900/20 border-green-600/50">
          <p class="text-green-400">✓ {{ message }}</p>
        </div>
        <div v-if="error" class="card bg-red-900/20 border-red-600/50">
          <p class="text-red-400">✗ {{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Actions</h3>
          <div class="flex flex-wrap gap-3">
            <button 
              @click="generateResume"
              :disabled="generating || !job.company_name"
              class="btn btn-primary"
            >
              {{ generating ? 'Generating...' : 'Generate Resume' }}
            </button>
            <button 
              @click="viewDeepDive"
              :disabled="generatingDeepDive || !job.company_name"
              class="btn btn-secondary"
            >
              {{ generatingDeepDive ? 'Researching...' : (deepDive ? '🔍 View Deep Dive' : '🔍 Company Deep Dive') }}
            </button>
            <button class="btn btn-secondary" disabled>
              Create Application
            </button>
          </div>
          <p v-if="!job.company_name" class="text-sm text-night-500 mt-2">
            ℹ️ Add job details to enable these actions
          </p>
        </div>

        <!-- Generated Resumes -->
        <div v-if="resumes.length > 0" class="card">
          <h3 class="text-lg font-semibold mb-4">Generated Resumes</h3>
          <div class="space-y-3">
            <div 
              v-for="resume in resumes" 
              :key="resume.id"
              class="flex items-center justify-between p-3 bg-night-800/50 rounded-lg hover:bg-night-800 transition-colors cursor-pointer"
              @click="viewResume(resume.id)"
            >
              <div>
                <p class="font-medium">Resume</p>
                <p class="text-sm text-night-400">
                  Match Score: {{ (resume.match_score * 100).toFixed(1) }}% • 
                  {{ new Date(resume.created_at).toLocaleDateString() }}
                </p>
              </div>
              <button class="btn btn-ghost text-sm" :disabled="loadingResume">
                {{ loadingResume ? '...' : 'View →' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Source URL -->
        <div class="card">
          <h3 class="text-sm font-medium text-night-400 mb-2">Source</h3>
          <a 
            :href="job.url" 
            target="_blank" 
            class="text-atlas-400 hover:text-atlas-300 break-all"
          >
            {{ job.url }}
          </a>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-night-400">Job not found</p>
      </div>
    </main>

    <!-- Resume Modal -->
    <div 
      v-if="showResumeModal && selectedResume" 
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeResumeModal"
    >
      <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Generated Resume</h3>
            <p class="text-sm text-gray-500">
              Match Score: {{ (selectedResume.match_score * 100).toFixed(1) }}%
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="downloadResume" 
              :disabled="downloadingPdf"
              class="px-3 py-2 bg-atlas-600 text-white rounded-lg text-sm hover:bg-atlas-700 transition-colors disabled:opacity-50"
            >
              {{ downloadingPdf ? '⏳ Generating PDF...' : '⬇️ Download PDF' }}
            </button>
            <button @click="closeResumeModal" class="p-2 text-gray-500 hover:text-gray-700 text-xl">
              ✕
            </button>
          </div>
        </div>
        
        <!-- Resume Content -->
        <div class="flex-1 overflow-auto p-8 bg-white">
          <div 
            class="resume-content prose prose-sm max-w-none" 
            v-html="selectedResume.rendered_html"
          ></div>
        </div>

        <!-- Match Analysis -->
        <div v-if="selectedResume.gaps?.missing?.length" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Skills Gap Analysis</h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="gap in selectedResume.gaps.missing" 
              :key="gap"
              class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
            >
              {{ gap }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Deep Dive Modal -->
    <div 
      v-if="showDeepDiveModal && deepDive" 
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeDeepDiveModal"
    >
      <div class="bg-night-900 border border-night-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-night-700 bg-night-800">
          <div>
            <h3 class="text-lg font-semibold text-white">🔍 Company Deep Dive</h3>
            <p class="text-sm text-night-400">{{ job?.company_name }}</p>
          </div>
          <button @click="closeDeepDiveModal" class="p-2 text-night-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        <!-- Deep Dive Content -->
        <div class="flex-1 overflow-auto p-6 space-y-6">
          <!-- Company Overview -->
          <div v-if="deepDive.company_overview" class="space-y-2">
            <h4 class="text-sm font-semibold text-atlas-400 uppercase tracking-wide">🏢 Company Overview</h4>
            <p class="text-night-200 leading-relaxed">{{ deepDive.company_overview }}</p>
          </div>

          <!-- Culture Insights -->
          <div v-if="deepDive.culture_insights" class="space-y-2">
            <h4 class="text-sm font-semibold text-purple-400 uppercase tracking-wide">🎭 Culture & Values</h4>
            <p class="text-night-200 leading-relaxed">{{ deepDive.culture_insights }}</p>
          </div>

          <!-- Role Analysis -->
          <div v-if="deepDive.role_analysis" class="space-y-2">
            <h4 class="text-sm font-semibold text-green-400 uppercase tracking-wide">💼 Role Analysis</h4>
            <p class="text-night-200 leading-relaxed">{{ deepDive.role_analysis }}</p>
          </div>

          <!-- Interview Tips -->
          <div v-if="deepDive.interview_tips" class="space-y-2">
            <h4 class="text-sm font-semibold text-yellow-400 uppercase tracking-wide">🎯 Interview Tips</h4>
            <p class="text-night-200 leading-relaxed">{{ deepDive.interview_tips }}</p>
          </div>

          <!-- Key Talking Points -->
          <div v-if="deepDive.summary_json?.key_talking_points?.length" class="space-y-2">
            <h4 class="text-sm font-semibold text-cyan-400 uppercase tracking-wide">💬 Key Talking Points</h4>
            <ul class="space-y-2">
              <li 
                v-for="(point, idx) in deepDive.summary_json.key_talking_points" 
                :key="idx"
                class="flex items-start gap-2 text-night-200"
              >
                <span class="text-cyan-500 mt-1">→</span>
                <span>{{ point }}</span>
              </li>
            </ul>
          </div>

          <!-- Potential Concerns -->
          <div v-if="deepDive.summary_json?.potential_concerns?.length" class="space-y-2">
            <h4 class="text-sm font-semibold text-orange-400 uppercase tracking-wide">⚠️ Things to Investigate</h4>
            <ul class="space-y-2">
              <li 
                v-for="(concern, idx) in deepDive.summary_json.potential_concerns" 
                :key="idx"
                class="flex items-start gap-2 text-night-200"
              >
                <span class="text-orange-500 mt-1">!</span>
                <span>{{ concern }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-night-700 bg-night-800 text-xs text-night-500">
          Generated {{ deepDive.generated_at ? new Date(deepDive.generated_at).toLocaleDateString() : 'recently' }} • 
          AI-generated insights based on public information
        </div>
      </div>
    </div>
  </div>
</template>
