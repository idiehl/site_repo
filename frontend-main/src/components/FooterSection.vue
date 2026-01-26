<script setup>
const currentYear = new Date().getFullYear()

const footerLinks = [
  { name: 'Apps', href: '#apps' },
  { name: 'Projects', href: '#projects' },
  { name: 'About', href: '#about' },
]
</script>

<template>
  <footer class="border-t border-night-800 bg-night-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Brand -->
        <div>
          <a href="/" class="flex items-center gap-3 mb-4">
            <img 
              src="/atlas-icon.svg" 
              alt="Atlas Universalis" 
              class="h-8 w-auto"
            />
            <span class="text-xl font-bold">
              <span class="text-white">Atlas</span>
              <span class="text-atlas-400">Universalis</span>
            </span>
          </a>
          <p class="text-night-400 text-sm">
            Building innovative software solutions for the modern world.
          </p>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-semibold mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li v-for="link in footerLinks" :key="link.name">
              <a 
                :href="link.href" 
                class="text-night-400 hover:text-white transition-colors text-sm"
              >
                {{ link.name }}
              </a>
            </li>
            <li>
              <a 
                href="https://quickpro.atlasuniversalis.com" 
                class="text-night-400 hover:text-white transition-colors text-sm"
              >
                QuickPRO
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Contact -->
        <div>
          <h4 class="text-white font-semibold mb-4">Contact</h4>
          <ul class="space-y-2">
            <li>
              <a 
                href="mailto:idiehl@atlasuniversalis.onmicrosoft.com" 
                class="text-night-400 hover:text-white transition-colors text-sm"
              >
                idiehl@atlasuniversalis.onmicrosoft.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <div class="border-t border-night-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-night-500 text-sm">
          &copy; {{ currentYear }} Atlas Universalis LLC. All rights reserved.
        </p>
        <div class="flex items-center gap-6 text-sm text-night-500">
          <span>Built with Vue.js & Tailwind CSS</span>
        </div>
      </div>
    </div>
  </footer>
</template>
