<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const navLinks = [
  { name: 'Apps', href: '#apps' },
  { name: 'Projects', href: '#projects' },
  { name: 'About', href: '#about' },
]

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav 
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-night-950/95 backdrop-blur-md border-b border-night-800' : 'bg-transparent'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-3 group">
          <img 
            src="/atlas-icon.svg" 
            alt="Atlas Universalis logo" 
            class="h-8 w-auto transition-transform group-hover:scale-105"
          />
          <span class="text-xl font-bold">
            <span class="text-white">tlas</span>
            <span class="text-atlas-400">Universalis</span>
          </span>
        </a>
        
        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8">
          <a 
            v-for="link in navLinks" 
            :key="link.name"
            :href="link.href"
            class="text-night-300 hover:text-white transition-colors font-medium"
          >
            {{ link.name }}
          </a>
          <a 
            href="https://apply.atlasuniversalis.com" 
            class="btn btn-primary text-sm"
          >
            Launch Atlas Apply
          </a>
        </div>
        
        <!-- Mobile Menu Button -->
        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="md:hidden p-2 text-night-300 hover:text-white"
        >
          <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Mobile Menu -->
    <div 
      v-if="isMobileMenuOpen"
      class="md:hidden bg-night-900 border-t border-night-800"
    >
      <div class="px-4 py-4 space-y-3">
        <a 
          v-for="link in navLinks" 
          :key="link.name"
          :href="link.href"
          @click="isMobileMenuOpen = false"
          class="block px-4 py-2 text-night-300 hover:text-white hover:bg-night-800 rounded-lg transition-colors"
        >
          {{ link.name }}
        </a>
        <a 
          href="https://apply.atlasuniversalis.com" 
          class="block px-4 py-2 bg-atlas-600 text-white rounded-lg text-center font-medium"
        >
          Launch Atlas Apply
        </a>
      </div>
    </div>
  </nav>
</template>
