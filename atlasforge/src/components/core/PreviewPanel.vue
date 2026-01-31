<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '@nanostores/vue';
import { previewComponent } from '../../lib/canvas-store';
import { getLibrary, getComponent } from '../../lib/registry';

// Vue component imports
import * as HeroiconsVue from '@heroicons/vue/24/outline';

// Custom Vue components
import CustomCard from '../vue/CustomCard.vue';
import CustomBadge from '../vue/CustomBadge.vue';
import CustomAlert from '../vue/CustomAlert.vue';
import CustomButton from '../vue/CustomButton.vue';
import CustomInput from '../vue/CustomInput.vue';
import CustomAvatar from '../vue/CustomAvatar.vue';
import CustomProgress from '../vue/CustomProgress.vue';
import CustomTabs from '../vue/CustomTabs.vue';

const customComponents: Record<string, any> = {
  Card: CustomCard,
  Badge: CustomBadge,
  Alert: CustomAlert,
  Button: CustomButton,
  Input: CustomInput,
  Avatar: CustomAvatar,
  Progress: CustomProgress,
  Tabs: CustomTabs,
};

const preview = useStore(previewComponent);

const currentLibrary = computed(() => {
  if (!preview.value.libraryId) return null;
  return getLibrary(preview.value.libraryId);
});

const currentComponent = computed(() => {
  if (!preview.value.libraryId || !preview.value.componentId) return null;
  return getComponent(preview.value.libraryId, preview.value.componentId);
});

// Get the actual Vue component to render
const vueComponent = computed(() => {
  if (!currentLibrary.value || currentLibrary.value.framework !== 'vue') return null;
  if (!preview.value.componentId) return null;
  
  // Handle Heroicons Vue
  if (preview.value.libraryId === 'heroicons-vue') {
    return (HeroiconsVue as any)[preview.value.componentId] || null;
  }
  
  // Handle custom Vue components
  if (preview.value.libraryId === 'custom-vue') {
    return customComponents[preview.value.componentId] || null;
  }
  
  return null;
});
</script>

<template>
  <div class="flex-1 flex flex-col">
    <!-- Preview Header -->
    <div class="px-4 py-3 border-b border-night-800 flex items-center justify-between">
      <div>
        <h2 class="text-sm font-semibold text-white">
          {{ currentComponent?.name || 'Select a component' }}
        </h2>
        <p v-if="currentLibrary" class="text-xs text-night-500">
          {{ currentLibrary.name }}
        </p>
      </div>
      
      <div v-if="currentLibrary" class="flex items-center gap-2">
        <span 
          class="text-xs px-2 py-1 rounded"
          :class="currentLibrary.framework === 'vue' 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-sky-500/20 text-sky-400'"
        >
          {{ currentLibrary.framework === 'vue' ? 'Vue' : 'React' }}
        </span>
      </div>
    </div>
    
    <!-- Preview Area -->
    <div class="flex-1 flex items-center justify-center p-8 bg-night-950">
      <div 
        v-if="!preview.libraryId"
        class="text-center text-night-500"
      >
        <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-night-800 flex items-center justify-center">
          <svg class="w-8 h-8 text-night-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" 
            />
          </svg>
        </div>
        <p class="text-sm">Select a component from the browser</p>
        <p class="text-xs mt-1">Click to preview, double-click to add to canvas</p>
      </div>
      
      <!-- Vue Component Preview -->
      <div 
        v-else-if="currentLibrary?.framework === 'vue'"
        class="p-12 bg-night-900 rounded-xl border border-night-800 min-w-[200px] flex items-center justify-center"
      >
        <component 
          v-if="vueComponent"
          :is="vueComponent" 
          v-bind="preview.props"
        />
        <div v-else class="text-night-500 text-sm">
          Component not available for preview
        </div>
      </div>
      
      <!-- React Component Preview - rendered by ReactPreviewWrapper overlay -->
      <div 
        v-else-if="currentLibrary?.framework === 'react'"
        class="flex items-center justify-center text-night-500 text-sm"
      >
        <!-- React component renders in overlay -->
        <div class="text-center">
          <div class="w-8 h-8 mx-auto mb-3 rounded-full bg-sky-500/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-sky-400">React component loading...</span>
        </div>
      </div>
    </div>
    
    <!-- Preview Info Bar -->
    <div v-if="currentComponent" class="px-4 py-2 border-t border-night-800 bg-night-900/50">
      <div class="flex items-center gap-4 text-xs text-night-500">
        <span>Category: <span class="text-night-300">{{ currentComponent.category }}</span></span>
        <span>Props: <span class="text-night-300">{{ Object.keys(preview.props).length }}</span></span>
      </div>
    </div>
  </div>
</template>
