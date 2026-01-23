<script setup>
// Work history / experience
const experience = [
  {
    title: 'AI Trainer',
    company: 'Handshake AI',
    period: 'Nov 2025 - Present',
    description: 'Evaluating and ranking LLM outputs for quality, accuracy, and safety. Reviewing and annotating multimedia content to improve model alignment.',
    current: true,
  },
  {
    title: 'Founder & Developer',
    company: 'Atlas Universalis LLC',
    period: '2024 - Present',
    description: 'Building innovative software tools including QuickPRO and creative applications for artists, musicians, and researchers.',
    current: true,
  },
  {
    title: 'Key Account Manager',
    company: 'Fibrocon',
    period: 'Nov 2019 - Jul 2022',
    description: 'Established client relationships through design consultations. Drafted 2D and 3D visual materials tailored to client specifications.',
    current: false,
  },
]

// Education
const education = [
  {
    degree: 'B.A. Interdisciplinary Social Studies',
    focus: 'Information Systems & Mass Communication',
    school: 'University of South Florida',
    period: '2021 - 2027',
  },
  {
    degree: 'Associate in Arts',
    focus: null,
    school: 'State College of Florida',
    period: '2018 - 2020',
  },
]

// Interests and pursuits
const interests = [
  { name: 'Music & Art', icon: '🎨' },
  { name: 'Full-Stack Development', icon: '💻' },
  { name: 'Data Analytics', icon: '📊' },
  { name: 'AI & Machine Learning', icon: '🤖' },
  { name: 'Creative Tools', icon: '✨' },
  { name: 'Visual Design', icon: '🖼️' },
]

const skills = [
  { category: 'Languages', items: ['Python', 'C/C++/C#', 'JavaScript', 'SQL', 'HTML/CSS'] },
  { category: 'Frameworks', items: ['Vue.js', '.NET', 'FastAPI', 'WPF', 'Qt'] },
  { category: 'Data & Analytics', items: ['Pandas', 'Plotly', 'PostgreSQL', 'Data Visualization'] },
  { category: 'Tools', items: ['Docker', 'Git', 'Adobe Creative Suite', 'VS Code'] },
]

const socialLinks = [
  { 
    name: 'GitHub', 
    url: 'https://github.com/idiehl', 
    icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' 
  },
  { 
    name: 'LinkedIn', 
    url: 'https://linkedin.com/in/jdiehl-usf', 
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' 
  },
  { 
    name: 'Email', 
    url: 'mailto:iajdiehl@gmail.com', 
    icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' 
  },
]
</script>

<template>
  <section id="about" class="section bg-night-900/30">
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span class="text-atlas-400 font-medium text-sm uppercase tracking-wider mb-2 block">
          About
        </span>
        <h2 class="section-title">Meet the Developer</h2>
      </div>
      
      <!-- Bio Section -->
      <div class="max-w-4xl mx-auto mb-16">
        <div class="card">
          <div class="flex flex-col md:flex-row gap-8 items-start">
            <!-- Profile Photo -->
            <img 
              src="/profile.png" 
              alt="Jacob Diehl" 
              class="w-32 h-32 rounded-2xl object-cover flex-shrink-0"
            />
            
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-white mb-2">Jacob Diehl</h3>
              <p class="text-atlas-400 font-medium mb-4">Software Developer & Data Analyst</p>
              
              <div class="space-y-3 text-night-300">
                <p>
                  I'm a software developer with a diverse background that shapes how I approach 
                  problem-solving. My journey started in Psychology, then took a creative turn 
                  through visual art - where I became fascinated with light, color, and perspective. 
                  This led me to explore the tools and platforms that could expand those creative efforts.
                </p>
                <p>
                  I graduated with a degree in Interdisciplinary Social Studies, focusing on Mass 
                  Communication and Information Systems. Today I build full-stack applications, 
                  data pipelines, and desktop tools - bringing a unique perspective that bridges 
                  analytical thinking with creative problem-solving.
                </p>
                <p>
                  My current focus is developing tools for artists, musicians, students, and 
                  researchers. Atlas Universalis is my platform for building software that empowers 
                  creative and analytical minds alike.
                </p>
              </div>
              
              <!-- Social Links -->
              <div class="flex items-center gap-4 mt-6">
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
          </div>
        </div>
      </div>
      
      <!-- Interests -->
      <div class="mb-16">
        <h3 class="text-xl font-semibold text-white text-center mb-6">Interests & Focus Areas</h3>
        <div class="flex flex-wrap justify-center gap-3">
          <span 
            v-for="interest in interests" 
            :key="interest.name"
            class="px-4 py-2 bg-night-800 hover:bg-night-700 rounded-full text-night-200 transition-colors flex items-center gap-2"
          >
            <span>{{ interest.icon }}</span>
            {{ interest.name }}
          </span>
        </div>
      </div>
      
      <!-- Skills Grid -->
      <div class="mb-16">
        <h3 class="text-xl font-semibold text-white text-center mb-6">Technical Skills</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div 
            v-for="skill in skills" 
            :key="skill.category"
            class="card"
          >
            <h4 class="text-sm font-semibold text-atlas-400 uppercase tracking-wider mb-3">
              {{ skill.category }}
            </h4>
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
      
      <!-- Experience & Education Grid -->
      <div class="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
        <!-- Experience Timeline -->
        <div v-if="experience.length > 0">
          <h3 class="text-xl font-semibold text-white text-center mb-6">Experience</h3>
          <div class="space-y-4">
            <div 
              v-for="job in experience" 
              :key="job.title + job.company"
              class="card flex gap-4"
            >
              <div class="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" :class="job.current ? 'bg-green-500' : 'bg-night-600'"></div>
              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 class="font-semibold text-white">{{ job.title }}</h4>
                  <span v-if="job.current" class="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">Current</span>
                </div>
                <p class="text-atlas-400 text-sm mb-1">{{ job.company }}</p>
                <p class="text-night-500 text-xs mb-2">{{ job.period }}</p>
                <p class="text-night-400 text-sm">{{ job.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Education -->
        <div v-if="education.length > 0">
          <h3 class="text-xl font-semibold text-white text-center mb-6">Education</h3>
          <div class="space-y-4">
            <div 
              v-for="edu in education" 
              :key="edu.school + edu.degree"
              class="card"
            >
              <h4 class="font-semibold text-white mb-1">{{ edu.degree }}</h4>
              <p v-if="edu.focus" class="text-atlas-400 text-sm mb-1">{{ edu.focus }}</p>
              <p class="text-night-400 text-sm">{{ edu.school }}</p>
              <p class="text-night-500 text-xs mt-1">{{ edu.period }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Contact CTA -->
      <div class="text-center">
        <div class="card max-w-2xl mx-auto">
          <h3 class="text-2xl font-bold text-white mb-4">Get in Touch</h3>
          <p class="text-night-400 mb-6">
            Interested in working together or have questions about my projects?
          </p>
          <a 
            href="mailto:iajdiehl@gmail.com" 
            class="btn btn-primary inline-flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Me
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
