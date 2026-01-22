<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}

// Direct download from our server
const downloadUrl = computed(() => {
  return '/quickpro-extension.zip'
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-night-900/50 border-b border-night-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <div class="flex items-center">
              <img src="/quickpro-icon.svg" alt="Q" class="w-8 h-8 -mr-0.5" />
              <h1 class="text-xl font-bold text-atlas-400">uickPRO</h1>
            </div>
            <nav class="hidden md:flex items-center gap-1">
              <router-link 
                to="/dashboard" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Dashboard
              </router-link>
              <router-link 
                to="/applications" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Applications
              </router-link>
              <router-link 
                to="/profile" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-400 hover:text-night-100 hover:bg-night-800/50"
              >
                Profile
              </router-link>
              <router-link 
                to="/extension" 
                class="px-3 py-2 rounded-lg text-sm font-medium text-night-100 bg-night-800"
              >
                Extension
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

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Hero -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-night-800 rounded-2xl mb-6">
          <img src="/quickpro-icon.svg" alt="QuickPRO" class="w-14 h-14" />
        </div>
        <h1 class="text-3xl font-bold mb-4">QuickPRO Browser Extension</h1>
        <p class="text-night-300 text-lg max-w-2xl mx-auto">
          Save job postings to QuickPRO with one click. Works on LinkedIn, Indeed, Glassdoor, and more.
        </p>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-6 mb-12">
        <div class="bg-night-800 rounded-xl p-6 border border-night-700">
          <div class="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="font-semibold mb-2">One-Click Save</h3>
          <p class="text-night-400 text-sm">Click the extension icon or floating button to instantly save any job posting.</p>
        </div>
        
        <div class="bg-night-800 rounded-xl p-6 border border-night-700">
          <div class="w-10 h-10 bg-atlas-500/20 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-atlas-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 class="font-semibold mb-2">Auto-Extract Details</h3>
          <p class="text-night-400 text-sm">AI automatically extracts job title, company, requirements, and more.</p>
        </div>
        
        <div class="bg-night-800 rounded-xl p-6 border border-night-700">
          <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 class="font-semibold mb-2">Bypass Blocks</h3>
          <p class="text-night-400 text-sm">Works directly in your browser - no scraping blocks from LinkedIn or Indeed.</p>
        </div>
      </div>

      <!-- Installation -->
      <div class="bg-night-800 rounded-xl border border-night-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-night-700 bg-night-800/50">
          <h2 class="text-xl font-semibold">Installation</h2>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Chrome/Edge -->
          <div>
            <h3 class="font-medium mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-atlas-500 text-white text-sm flex items-center justify-center">1</span>
              Download the Extension
            </h3>
            <a 
              :href="downloadUrl" 
              download="quickpro-extension.zip"
              class="btn-accent inline-flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download for Chrome / Edge
            </a>
          </div>

          <div>
            <h3 class="font-medium mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-atlas-500 text-white text-sm flex items-center justify-center">2</span>
              Extract the ZIP file
            </h3>
            <p class="text-night-400">Right-click the downloaded file and select "Extract All" to a folder you'll remember.</p>
          </div>

          <div>
            <h3 class="font-medium mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-atlas-500 text-white text-sm flex items-center justify-center">3</span>
              Open Extensions Page
            </h3>
            <div class="flex flex-wrap gap-3">
              <code class="bg-night-900 px-3 py-2 rounded text-sm text-cyan-400">chrome://extensions</code>
              <span class="text-night-500">or</span>
              <code class="bg-night-900 px-3 py-2 rounded text-sm text-cyan-400">edge://extensions</code>
            </div>
          </div>

          <div>
            <h3 class="font-medium mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-atlas-500 text-white text-sm flex items-center justify-center">4</span>
              Enable Developer Mode
            </h3>
            <p class="text-night-400">Toggle "Developer mode" in the top-right corner of the extensions page.</p>
          </div>

          <div>
            <h3 class="font-medium mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-atlas-500 text-white text-sm flex items-center justify-center">5</span>
              Load the Extension
            </h3>
            <p class="text-night-400">Click "Load unpacked" and select the extracted folder containing the extension files.</p>
          </div>

          <div>
            <h3 class="font-medium mb-4 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center">✓</span>
              Pin to Toolbar
            </h3>
            <p class="text-night-400">Click the puzzle piece icon in your toolbar, then click the pin icon next to QuickPRO to keep it visible.</p>
          </div>
        </div>
      </div>

      <!-- Supported Sites -->
      <div class="mt-8 text-center">
        <h3 class="text-night-400 mb-4">Supported Job Sites</h3>
        <div class="flex flex-wrap justify-center gap-4 text-sm text-night-300">
          <span class="px-3 py-1 bg-night-800 rounded-full">LinkedIn</span>
          <span class="px-3 py-1 bg-night-800 rounded-full">Indeed</span>
          <span class="px-3 py-1 bg-night-800 rounded-full">Glassdoor</span>
          <span class="px-3 py-1 bg-night-800 rounded-full">Lever</span>
          <span class="px-3 py-1 bg-night-800 rounded-full">Greenhouse</span>
          <span class="px-3 py-1 bg-night-800 rounded-full">Workday</span>
          <span class="px-3 py-1 bg-night-800 rounded-full">+ Any job site</span>
        </div>
      </div>
    </main>
  </div>
</template>
