<script setup>
// Featured projects (hosted apps)
const featuredProjects = [
  {
    id: 'atlas-apply',
    name: 'Atlas Apply',
    description: 'Full-stack job application management platform with AI-powered resume generation, browser extension for one-click job saving, and comprehensive application tracking.',
    technologies: ['Vue 3', 'FastAPI', 'PostgreSQL', 'OpenAI', 'Celery', 'Redis'],
    category: 'Web Application',
    github: 'https://github.com/idiehl/site_repo',
    demo: 'https://apply.atlasuniversalis.com',
    featured: true,
  },
]

// All GitHub repositories
const githubProjects = [
  {
    name: 'StockView',
    description: 'A platform for monitoring stock prices and portfolio management.',
    language: 'Python',
    github: 'https://github.com/idiehl/stockview',
  },
  {
    name: 'C# Type Browser',
    description: 'A C# type browser leveraging nested node elements and live load library for visualizing large, structured data sets. Built with WPF.',
    language: 'C#',
    github: 'https://github.com/idiehl/Cs_Type_Browser',
  },
  {
    name: 'Color Tracker',
    description: 'Generates a color palette based on a JPEG image.',
    language: 'Python',
    github: 'https://github.com/idiehl/color_tracker',
  },
  {
    name: 'Tiny API',
    description: 'FastAPI microservice demonstrating Python backend development.',
    language: 'Python',
    github: 'https://github.com/idiehl/tiny_api',
  },
  {
    name: 'Markdown Editor',
    description: 'Converts Markdown to HTML with live preview.',
    language: 'Python',
    github: 'https://github.com/idiehl/Markdown_Editor',
  },
  {
    name: 'Invoice to PDF',
    description: 'Creates professional PDF invoices from user input.',
    language: 'Python',
    github: 'https://github.com/idiehl/Invoice_to_PDF',
  },
  {
    name: 'Password Generator',
    description: 'Generates secure random passwords with customizable options.',
    language: 'Python',
    github: 'https://github.com/idiehl/Random_Password_Generator',
  },
  {
    name: 'DirectX Window Setup',
    description: 'DirectX window initialization and setup template.',
    language: 'C#',
    github: 'https://github.com/idiehl/DirectX_WIndow_Setup',
  },
  {
    name: 'WPF Desktop App',
    description: 'A desktop application template using Windows Presentation Foundation.',
    language: 'C#',
    github: 'https://github.com/idiehl/WPF_desktop',
  },
  {
    name: 'WPF Samples',
    description: 'A collection of UI elements and modules for building WPF desktop applications.',
    language: 'C#',
    github: 'https://github.com/idiehl/wpf_samples',
  },
  {
    name: 'Docker Server with DB',
    description: 'A Docker-containerized server using Flask and PostgreSQL.',
    language: 'Python',
    github: 'https://github.com/idiehl/docker_server_w_db',
  },
  {
    name: 'Stock Analyzer',
    description: 'An application for analyzing current stock prices and trends.',
    language: 'Python',
    github: 'https://github.com/idiehl/unfinished',
  },
]

const languageColors = {
  'Python': 'bg-yellow-500/20 text-yellow-400',
  'C#': 'bg-purple-500/20 text-purple-400',
  'JavaScript': 'bg-yellow-500/20 text-yellow-300',
  'TypeScript': 'bg-blue-500/20 text-blue-400',
  'HTML': 'bg-orange-500/20 text-orange-400',
}

const categoryColors = {
  'Web Application': 'bg-atlas-500/20 text-atlas-400',
  'Browser Extension': 'bg-green-500/20 text-green-400',
  'Document Generation': 'bg-purple-500/20 text-purple-400',
  'API': 'bg-cyan-500/20 text-cyan-400',
}
</script>

<template>
  <section id="projects" class="section">
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span class="text-gold-400 font-medium text-sm uppercase tracking-wider mb-2 block">
          Portfolio
        </span>
        <h2 class="section-title">Projects & Work</h2>
        <p class="section-subtitle mx-auto">
          A showcase of technical projects and professional work.
        </p>
      </div>
      
      <!-- Featured Project -->
      <div class="mb-12">
        <div 
          v-for="project in featuredProjects" 
          :key="project.id"
          class="card card-hover ring-1 ring-atlas-500/30 max-w-3xl mx-auto"
        >
          <div class="flex items-center gap-2 mb-4">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-atlas-500/20 text-atlas-400">
              Featured
            </span>
            <span 
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium',
                categoryColors[project.category] || 'bg-night-800 text-night-400'
              ]"
            >
              {{ project.category }}
            </span>
          </div>
          
          <h3 class="text-2xl font-bold text-white mb-3">{{ project.name }}</h3>
          <p class="text-night-300 mb-4">{{ project.description }}</p>
          
          <div class="flex flex-wrap gap-2 mb-4">
            <span 
              v-for="tech in project.technologies" 
              :key="tech"
              class="px-2 py-1 bg-night-800 rounded text-xs text-night-300 font-mono"
            >
              {{ tech }}
            </span>
          </div>
          
          <div class="flex items-center gap-4 pt-4 border-t border-night-800">
            <a 
              v-if="project.github"
              :href="project.github"
              target="_blank"
              class="flex items-center gap-2 text-sm text-night-400 hover:text-white transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View Source
            </a>
            <a 
              v-if="project.demo"
              :href="project.demo"
              target="_blank"
              class="flex items-center gap-2 btn btn-primary text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Launch App
            </a>
          </div>
        </div>
      </div>
      
      <!-- GitHub Repos Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-white">GitHub Repositories</h3>
        <a 
          href="https://github.com/idiehl" 
          target="_blank"
          class="flex items-center gap-2 text-sm text-night-400 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          View All on GitHub
        </a>
      </div>
      
      <!-- GitHub Repos Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <a 
          v-for="repo in githubProjects" 
          :key="repo.name"
          :href="repo.github"
          target="_blank"
          class="card card-hover group"
        >
          <div class="flex items-start justify-between mb-2">
            <h4 class="font-semibold text-white group-hover:text-atlas-400 transition-colors">
              {{ repo.name }}
            </h4>
            <svg class="w-4 h-4 text-night-500 group-hover:text-atlas-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <p class="text-night-400 text-sm mb-3 line-clamp-2">{{ repo.description }}</p>
          <span 
            v-if="repo.language"
            :class="[
              'inline-flex px-2 py-0.5 rounded text-xs font-medium',
              languageColors[repo.language] || 'bg-night-700 text-night-300'
            ]"
          >
            {{ repo.language }}
          </span>
        </a>
      </div>
    </div>
  </section>
</template>
