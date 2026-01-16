<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/client'

const props = defineProps({
  job: {
    type: Object,
    required: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  resumeLimitReached: {
    type: Boolean,
    default: false
  },
  resumeUsageText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'generate-resume',
  'generate-cover-letter',
  'generate-followup',
  'upgrade'
])

// Tab state
const activeTab = ref('resume')
const tabs = [
  { id: 'resume', label: 'Resume', icon: '📄' },
  { id: 'cover-letter', label: 'Cover Letter', icon: '✉️' },
  { id: 'followup', label: 'Follow-up', icon: '📧' }
]

// Template state
const templates = ref([])
const selectedTemplate = ref('basic')  // Default to free template
const selectedColorScheme = ref(null)
const colorSchemes = ref([])
const loading = ref(false)
const loadingTemplates = ref(true)

// Color scheme display info
const colorSchemeInfo = {
  blue: { name: 'Blue', primary: '#4361ee', secondary: '#06b6d4' },
  green: { name: 'Green', primary: '#10b981', secondary: '#34d399' },
  purple: { name: 'Purple', primary: '#8b5cf6', secondary: '#a78bfa' },
  teal: { name: 'Teal', primary: '#14b8a6', secondary: '#2dd4bf' },
  red: { name: 'Red', primary: '#ef4444', secondary: '#f87171' },
  orange: { name: 'Orange', primary: '#f97316', secondary: '#fb923c' },
  navy: { name: 'Navy', primary: '#1e3a5f', secondary: '#2d5a87' }
}

// Computed
const selectedTemplateInfo = computed(() => {
  return templates.value.find(t => t.id === selectedTemplate.value)
})

const canSelectColorScheme = computed(() => {
  return props.isPremium && selectedTemplateInfo.value?.color_schemes?.length > 0
})

const canGenerate = computed(() => {
  if (!props.job?.company_name) return false
  if (activeTab.value === 'resume') {
    return !props.resumeLimitReached || props.isPremium
  }
  return props.isPremium
})

const generateButtonText = computed(() => {
  if (loading.value) return 'Generating...'
  
  if (activeTab.value === 'resume') {
    if (props.resumeLimitReached && !props.isPremium) {
      return 'Upgrade to Generate'
    }
    return 'Generate Resume'
  } else if (activeTab.value === 'cover-letter') {
    return 'Generate Cover Letter'
  } else {
    return 'Generate Follow-up'
  }
})

// Methods
async function fetchTemplates() {
  try {
    loadingTemplates.value = true
    const response = await api.get('/api/v1/jobs/templates')
    templates.value = response.data.templates
    colorSchemes.value = response.data.color_schemes || []
  } catch (err) {
    console.error('Failed to fetch templates:', err)
    // Fallback templates
    templates.value = [
      { id: 'basic', name: 'Basic', tier: 'free', thumbnail: '/templates/basic-preview.svg', accessible: true, description: 'Simple black and white resume' },
      { id: 'simple', name: 'Simple', tier: 'free', thumbnail: '/templates/simple-preview.svg', accessible: true, description: 'Clean, minimal design' }
    ]
  } finally {
    loadingTemplates.value = false
  }
}

function selectTemplate(template) {
  if (template.locked && !props.isPremium) {
    emit('upgrade')
    return
  }
  selectedTemplate.value = template.id
  // Reset color scheme when changing templates
  if (!template.color_schemes) {
    selectedColorScheme.value = null
  }
}

function selectColorScheme(scheme) {
  if (!props.isPremium) {
    emit('upgrade')
    return
  }
  selectedColorScheme.value = selectedColorScheme.value === scheme ? null : scheme
}

function handleGenerate() {
  if (!canGenerate.value) {
    if (!props.job?.company_name) return
    emit('upgrade')
    return
  }
  
  loading.value = true
  
  if (activeTab.value === 'resume') {
    emit('generate-resume', {
      template: selectedTemplate.value,
      colorScheme: selectedColorScheme.value
    })
  } else if (activeTab.value === 'cover-letter') {
    emit('generate-cover-letter')
  } else {
    emit('generate-followup')
  }
}

function resetLoading() {
  loading.value = false
}

// Expose method to parent
defineExpose({ resetLoading })

onMounted(() => {
  fetchTemplates()
})
</script>

<template>
  <div class="card">
    <h3 class="text-lg font-semibold mb-4">Generate Documents</h3>
    
    <!-- Upgrade banner for free users -->
    <div v-if="!isPremium" class="mb-4 p-3 bg-night-800/60 rounded-lg text-sm text-night-300">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <p class="text-atlas-300 font-medium">Free plan limits apply</p>
          <p class="text-night-400">{{ resumeUsageText }}</p>
          <p class="text-night-500 mt-1">Upgrade to unlock all templates, colors, cover letters, and follow-ups.</p>
        </div>
        <button class="btn btn-accent" @click="$emit('upgrade')">
          Upgrade to PRO
        </button>
      </div>
    </div>
    
    <!-- Tab Navigation -->
    <div class="flex gap-1 mb-6 border-b border-night-700">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
          activeTab === tab.id
            ? 'text-atlas-400 border-atlas-400'
            : 'text-night-400 border-transparent hover:text-night-200 hover:border-night-600'
        ]"
        :disabled="(tab.id !== 'resume' && !isPremium)"
        :title="tab.id !== 'resume' && !isPremium ? 'Upgrade to unlock' : ''"
      >
        <span class="mr-1.5">{{ tab.icon }}</span>
        {{ tab.label }}
        <span v-if="tab.id !== 'resume' && !isPremium" class="ml-1 text-xs text-night-500">PRO</span>
      </button>
    </div>
    
    <!-- Resume Tab Content -->
    <div v-if="activeTab === 'resume'" class="space-y-6">
      <!-- Template Gallery -->
      <div>
        <h4 class="text-sm font-medium text-night-300 mb-3">Choose a Template</h4>
        <div v-if="loadingTemplates" class="text-center py-8 text-night-400">
          Loading templates...
        </div>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="template in templates"
            :key="template.id"
            @click="selectTemplate(template)"
            :class="[
              'relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200 group',
              selectedTemplate === template.id
                ? 'border-atlas-500 ring-2 ring-atlas-500/30'
                : template.locked
                  ? 'border-night-700 opacity-60'
                  : 'border-night-700 hover:border-night-500'
            ]"
          >
            <!-- Thumbnail -->
            <div class="aspect-[3/4] bg-night-800 relative overflow-hidden">
              <img 
                v-if="template.thumbnail" 
                :src="template.thumbnail" 
                :alt="template.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-night-500">
                No preview
              </div>
              
              <!-- Lock overlay for paid templates -->
              <div 
                v-if="template.locked"
                class="absolute inset-0 bg-night-900/60 flex items-center justify-center"
              >
                <span class="text-2xl">🔒</span>
              </div>
              
              <!-- Selected indicator -->
              <div 
                v-if="selectedTemplate === template.id"
                class="absolute top-2 right-2 w-6 h-6 bg-atlas-500 rounded-full flex items-center justify-center"
              >
                <span class="text-white text-xs">✓</span>
              </div>
              
              <!-- Tier badge -->
              <div 
                :class="[
                  'absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold',
                  template.tier === 'free' 
                    ? 'bg-green-500/90 text-white' 
                    : 'bg-purple-500/90 text-white'
                ]"
              >
                {{ template.tier === 'free' ? 'FREE' : 'PRO' }}
              </div>
            </div>
            
            <!-- Template info -->
            <div class="p-3 bg-night-800/50">
              <h5 class="font-medium text-white text-sm">{{ template.name }}</h5>
              <p class="text-xs text-night-400 mt-0.5 line-clamp-2">{{ template.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Color Scheme Picker (paid only) -->
      <div v-if="canSelectColorScheme" class="pt-4 border-t border-night-700">
        <h4 class="text-sm font-medium text-night-300 mb-3">Color Scheme</h4>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="scheme in colorSchemes"
            :key="scheme"
            @click="selectColorScheme(scheme)"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
              selectedColorScheme === scheme
                ? 'border-atlas-500 bg-atlas-500/10'
                : 'border-night-700 hover:border-night-500 bg-night-800/50'
            ]"
            :title="colorSchemeInfo[scheme]?.name || scheme"
          >
            <div 
              class="w-5 h-5 rounded-full border border-night-600"
              :style="{ backgroundColor: colorSchemeInfo[scheme]?.primary || '#4361ee' }"
            ></div>
            <span class="text-sm text-night-200">{{ colorSchemeInfo[scheme]?.name || scheme }}</span>
            <span v-if="selectedColorScheme === scheme" class="text-atlas-400 text-xs">✓</span>
          </button>
        </div>
        <p class="text-xs text-night-500 mt-2">Optional: Leave unselected for template default colors</p>
      </div>
      
      <!-- Color scheme teaser for free users with paid template selected -->
      <div v-else-if="!isPremium && selectedTemplateInfo?.tier === 'paid'" class="pt-4 border-t border-night-700">
        <div class="flex items-center gap-2 text-sm text-night-400">
          <span>🎨</span>
          <span>Upgrade to customize colors</span>
        </div>
      </div>
    </div>
    
    <!-- Cover Letter Tab Content -->
    <div v-else-if="activeTab === 'cover-letter'" class="py-6 text-center">
      <div class="text-4xl mb-3">✉️</div>
      <h4 class="text-lg font-medium text-white mb-2">Professional Cover Letter</h4>
      <p class="text-night-400 max-w-md mx-auto">
        Generate a tailored cover letter that highlights your relevant experience 
        and matches the job requirements.
      </p>
    </div>
    
    <!-- Follow-up Tab Content -->
    <div v-else-if="activeTab === 'followup'" class="py-6 text-center">
      <div class="text-4xl mb-3">📧</div>
      <h4 class="text-lg font-medium text-white mb-2">Follow-up Message</h4>
      <p class="text-night-400 max-w-md mx-auto">
        Create a professional follow-up message to send after submitting 
        your application or after an interview.
      </p>
    </div>
    
    <!-- Generate Button -->
    <div class="mt-6 pt-4 border-t border-night-700">
      <button
        @click="handleGenerate"
        :disabled="loading || !job?.company_name"
        :class="[
          'w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2',
          canGenerate
            ? 'bg-atlas-600 hover:bg-atlas-500 text-white'
            : 'bg-night-700 text-night-400 cursor-not-allowed'
        ]"
      >
        <span v-if="loading" class="animate-spin">⏳</span>
        <span v-else-if="!canGenerate && !props.job?.company_name">Add job details first</span>
        <span v-else>{{ generateButtonText }}</span>
      </button>
      
      <p v-if="!job?.company_name" class="text-sm text-night-500 mt-2 text-center">
        Job details are required to generate documents
      </p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
