<script setup>
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Background gradient -->
    <div class="absolute inset-0 bg-gradient-to-b from-night-950 via-night-950 to-night-900"></div>
    
    <!-- Decorative elements -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-atlas-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"></div>
    
    <!-- Grid pattern overlay -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(94,107,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(94,107,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
    
    <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <!-- Heading -->
      <h1 class="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up flex items-center justify-center gap-4" style="animation-delay: 0.2s;">
        <img 
          src="/atlas-icon.svg" 
          alt="Atlas Universalis logo" 
          class="h-14 w-14 md:h-16 md:w-16 animate-float"
        />
        <span class="text-white">tlas</span>
        <span class="gradient-text">Universalis</span>
      </h1>
      
      <!-- Tagline -->
      <p class="text-xl md:text-2xl text-night-300 mb-4 animate-fade-in-up" style="animation-delay: 0.3s;">
        Building the Future, One Project at a Time
      </p>
      
      <!-- Subtitle -->
      <p class="text-lg text-night-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style="animation-delay: 0.4s;">
        A hub for innovative software, professional tools, and creative projects.
        Explore applications designed to help you achieve more.
      </p>
      
      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style="animation-delay: 0.5s;">
        <a href="#apps" class="btn btn-primary text-lg px-8 py-4">
          Explore Apps
        </a>
        <a href="#projects" class="btn btn-secondary text-lg px-8 py-4">
          View Projects
        </a>
      </div>
      
    </div>
    
    <!-- Scroll indicator - positioned relative to section, not content container -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce z-10">
      <svg class="w-6 h-6 text-night-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </section>
</template>
