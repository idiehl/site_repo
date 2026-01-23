<script setup>
const skills = [
  { category: 'Frontend', items: ['Vue.js', 'React', 'TypeScript', 'Tailwind CSS'] },
  { category: 'Backend', items: ['Python', 'FastAPI', 'Node.js', 'PostgreSQL'] },
  { category: 'DevOps', items: ['Docker', 'GitHub Actions', 'Nginx', 'Linux'] },
  { category: 'AI/ML', items: ['OpenAI API', 'LangChain', 'Data Processing'] },
]

const socialLinks = [
  { 
    name: 'GitHub', 
    url: 'https://github.com', 
    icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' 
  },
  { 
    name: 'LinkedIn', 
    url: 'https://linkedin.com', 
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' 
  },
]
</script>

<template>
  <section id="about" class="section bg-night-900/30">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-2 gap-12 items-start">
        <!-- About Content -->
        <div>
          <span class="text-atlas-400 font-medium text-sm uppercase tracking-wider mb-2 block">
            About
          </span>
          <h2 class="section-title mb-6">Atlas Universalis LLC</h2>
          
          <div class="space-y-4 text-night-300">
            <p>
              Atlas Universalis is a software development venture focused on creating 
              practical, innovative tools that solve real-world problems. From job search 
              automation to productivity applications, we build software designed to help 
              people achieve their goals more efficiently.
            </p>
            <p>
              Our approach combines modern web technologies with AI capabilities to deliver 
              polished, professional-grade applications. Every project is built with attention 
              to detail, performance, and user experience.
            </p>
            <p>
              Whether it's a full-stack web application, a browser extension, or an API 
              integration, we bring technical expertise and a commitment to quality to 
              every project.
            </p>
          </div>
          
          <!-- Social Links -->
          <div class="flex items-center gap-4 mt-8">
            <a 
              v-for="social in socialLinks" 
              :key="social.name"
              :href="social.url"
              target="_blank"
              class="w-10 h-10 rounded-lg bg-night-800 hover:bg-night-700 flex items-center justify-center transition-colors group"
              :title="social.name"
            >
              <svg class="w-5 h-5 text-night-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path :d="social.icon" />
              </svg>
            </a>
          </div>
        </div>
        
        <!-- Skills Grid -->
        <div class="grid grid-cols-2 gap-4">
          <div 
            v-for="skill in skills" 
            :key="skill.category"
            class="card"
          >
            <h3 class="text-sm font-semibold text-atlas-400 uppercase tracking-wider mb-3">
              {{ skill.category }}
            </h3>
            <ul class="space-y-2">
              <li 
                v-for="item in skill.items" 
                :key="item"
                class="text-night-300 text-sm flex items-center gap-2"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-atlas-500"></span>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Contact CTA -->
      <div class="mt-16 text-center">
        <div class="card max-w-2xl mx-auto">
          <h3 class="text-2xl font-bold text-white mb-4">Get in Touch</h3>
          <p class="text-night-400 mb-6">
            Interested in working together or have questions about our projects?
          </p>
          <a 
            href="mailto:contact@atlasuniversalis.com" 
            class="btn btn-primary inline-flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Us
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
