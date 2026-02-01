<script setup>
const apps = [
  {
    id: 'atlas-apply',
    name: 'Atlas Apply',
    tagline: 'AI-Powered Job Application Manager',
    description: 'Streamline your job search with intelligent resume generation, application tracking, and company insights. Save job postings with one click and let AI tailor your materials for each opportunity.',
    features: [
      'AI-generated tailored resumes',
      'One-click job saving via browser extension',
      'Company deep-dive insights',
      'Application status tracking',
    ],
    url: 'https://apply.atlasuniversalis.com',
    icon: '/atlas-icon.svg',
    color: 'atlas',
    status: 'Live',
  },
  // Future apps can be added here
]
</script>

<template>
  <section id="apps" class="section bg-night-900/30">
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <span class="text-atlas-400 font-medium text-sm uppercase tracking-wider mb-2 block">
          Applications
        </span>
        <h2 class="section-title">Hosted Apps</h2>
        <p class="section-subtitle mx-auto">
          Professional tools and applications built to solve real problems.
        </p>
      </div>
      
      <!-- Apps Grid -->
      <div class="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
        <div 
          v-for="app in apps" 
          :key="app.id"
          class="card card-hover group"
        >
          <div class="flex flex-col md:flex-row gap-6">
            <!-- App Icon -->
            <div class="flex-shrink-0">
              <div 
                :class="[
                  'w-20 h-20 rounded-2xl flex items-center justify-center',
                  app.color === 'atlas' ? 'bg-atlas-500/20 glow' : 'bg-night-800'
                ]"
              >
                <img 
                  :src="app.icon" 
                  :alt="app.name"
                  class="w-12 h-12"
                />
              </div>
            </div>
            
            <!-- App Info -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-2xl font-bold text-white">{{ app.name }}</h3>
                <span 
                  :class="[
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    app.status === 'Live' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  ]"
                >
                  {{ app.status }}
                </span>
              </div>
              
              <p class="text-atlas-400 font-medium mb-3">{{ app.tagline }}</p>
              <p class="text-night-300 mb-4">{{ app.description }}</p>
              
              <!-- Features -->
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                <li 
                  v-for="feature in app.features" 
                  :key="feature"
                  class="flex items-center gap-2 text-sm text-night-400"
                >
                  <svg class="w-4 h-4 text-atlas-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  {{ feature }}
                </li>
              </ul>
              
              <!-- Launch Button -->
              <a 
                :href="app.url"
                class="inline-flex items-center gap-2 btn btn-primary"
              >
                Launch {{ app.name }}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Coming Soon Card -->
        <div class="card border-dashed border-night-700 flex items-center justify-center min-h-[300px]">
          <div class="text-center">
            <div class="w-16 h-16 rounded-2xl bg-night-800 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-night-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-night-400 mb-2">More Coming Soon</h3>
            <p class="text-night-500 max-w-xs">
              New applications are in development. Stay tuned for exciting releases.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
