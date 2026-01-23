<script setup>
const projects = [
  {
    id: 1,
    name: 'QuickPRO Platform',
    description: 'Full-stack job application management platform with AI-powered resume generation, browser extension for one-click job saving, and comprehensive application tracking.',
    technologies: ['Vue 3', 'FastAPI', 'PostgreSQL', 'OpenAI', 'Celery', 'Redis'],
    category: 'Web Application',
    github: null, // Private
    demo: 'https://quickpro.atlasuniversalis.com',
    featured: true,
  },
  {
    id: 2,
    name: 'Browser Extension SDK',
    description: 'Chrome/Edge extension for capturing web content and integrating with backend services. Features intelligent page parsing and secure API communication.',
    technologies: ['JavaScript', 'Chrome APIs', 'Manifest V3'],
    category: 'Browser Extension',
    github: null,
    demo: null,
    featured: false,
  },
  {
    id: 3,
    name: 'Resume Template Engine',
    description: 'Customizable resume generation system with multiple templates, color scheme support, and PDF export capabilities. Designed for professional-quality output.',
    technologies: ['Python', 'Jinja2', 'WeasyPrint', 'HTML/CSS'],
    category: 'Document Generation',
    github: null,
    demo: null,
    featured: false,
  },
]

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
      <div class="text-center mb-16">
        <span class="text-gold-400 font-medium text-sm uppercase tracking-wider mb-2 block">
          Portfolio
        </span>
        <h2 class="section-title">Projects & Work</h2>
        <p class="section-subtitle mx-auto">
          A showcase of technical projects and professional work.
        </p>
      </div>
      
      <!-- Projects Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="project in projects" 
          :key="project.id"
          :class="[
            'card card-hover flex flex-col',
            project.featured ? 'md:col-span-2 lg:col-span-1 ring-1 ring-atlas-500/30' : ''
          ]"
        >
          <!-- Featured Badge -->
          <div v-if="project.featured" class="flex items-center gap-2 mb-4">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-atlas-500/20 text-atlas-400">
              Featured
            </span>
          </div>
          
          <!-- Category -->
          <span 
            :class="[
              'inline-flex px-3 py-1 rounded-full text-xs font-medium w-fit mb-3',
              categoryColors[project.category] || 'bg-night-800 text-night-400'
            ]"
          >
            {{ project.category }}
          </span>
          
          <!-- Project Info -->
          <h3 class="text-xl font-bold text-white mb-2">{{ project.name }}</h3>
          <p class="text-night-400 mb-4 flex-1">{{ project.description }}</p>
          
          <!-- Technologies -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span 
              v-for="tech in project.technologies" 
              :key="tech"
              class="px-2 py-1 bg-night-800 rounded text-xs text-night-300 font-mono"
            >
              {{ tech }}
            </span>
          </div>
          
          <!-- Links -->
          <div class="flex items-center gap-3 pt-4 border-t border-night-800">
            <a 
              v-if="project.github"
              :href="project.github"
              target="_blank"
              class="flex items-center gap-2 text-sm text-night-400 hover:text-white transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a 
              v-if="project.demo"
              :href="project.demo"
              target="_blank"
              class="flex items-center gap-2 text-sm text-atlas-400 hover:text-atlas-300 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Live Demo
            </a>
            <span 
              v-if="!project.github && !project.demo"
              class="text-sm text-night-500"
            >
              Private Project
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
