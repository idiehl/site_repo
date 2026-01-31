<script setup lang="ts">
import { ref, computed } from 'vue';
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
import { libraries, type LibraryMeta, type ComponentMeta } from '../../lib/registry';
import { setPreviewComponent, previewComponent, addElement } from '../../lib/canvas-store';
import { useStore } from '@nanostores/vue';

const props = defineProps<{
  frameworkFilter: 'all' | 'vue' | 'react';
}>();

// Search
const searchQuery = ref('');

// Expanded libraries
const expandedLibraries = ref<Set<string>>(new Set(['heroicons-vue', 'heroicons-react']));

// Current preview
const currentPreview = useStore(previewComponent);

// Filter libraries by framework
const filteredLibraries = computed(() => {
  let libs = libraries;
  
  if (props.frameworkFilter !== 'all') {
    libs = libs.filter(lib => lib.framework === props.frameworkFilter);
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    libs = libs.map(lib => ({
      ...lib,
      components: lib.components.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      ),
    })).filter(lib => lib.components.length > 0);
  }
  
  return libs;
});

function toggleLibrary(id: string) {
  if (expandedLibraries.value.has(id)) {
    expandedLibraries.value.delete(id);
  } else {
    expandedLibraries.value.add(id);
  }
  expandedLibraries.value = new Set(expandedLibraries.value);
}

function selectComponent(library: LibraryMeta, component: ComponentMeta) {
  setPreviewComponent(library.id, component.id, { ...component.defaultProps });
}

function addToCanvas(library: LibraryMeta, component: ComponentMeta) {
  addElement(library.id, component.id, library.framework, { ...component.defaultProps });
}

function isSelected(libraryId: string, componentId: string): boolean {
  return currentPreview.value.libraryId === libraryId && 
         currentPreview.value.componentId === componentId;
}

function getFrameworkBadge(framework: 'vue' | 'react'): { label: string; class: string } {
  return framework === 'vue'
    ? { label: 'Vue', class: 'bg-emerald-500/20 text-emerald-400' }
    : { label: 'React', class: 'bg-sky-500/20 text-sky-400' };
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-night-800">
      <h2 class="text-sm font-semibold text-night-300 uppercase tracking-wider mb-3">
        Components
      </h2>
      
      <!-- Search -->
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-night-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search components..."
          class="w-full pl-9 pr-3 py-2 bg-night-800 border border-night-700 rounded-lg text-sm text-white placeholder-night-500 focus:outline-none focus:ring-2 focus:ring-atlas-500 focus:border-transparent"
        />
      </div>
    </div>
    
    <!-- Library List -->
    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="filteredLibraries.length === 0" class="p-4 text-center text-night-500 text-sm">
        No components found
      </div>
      
      <div v-for="library in filteredLibraries" :key="library.id" class="mb-2">
        <!-- Library Header -->
        <button
          @click="toggleLibrary(library.id)"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-night-800 transition-colors text-left"
        >
          <component 
            :is="expandedLibraries.has(library.id) ? ChevronDownIcon : ChevronRightIcon" 
            class="w-4 h-4 text-night-500"
          />
          <span class="flex-1 text-sm font-medium text-white">{{ library.name }}</span>
          <span 
            class="text-xs px-1.5 py-0.5 rounded"
            :class="getFrameworkBadge(library.framework).class"
          >
            {{ getFrameworkBadge(library.framework).label }}
          </span>
        </button>
        
        <!-- Components -->
        <div v-show="expandedLibraries.has(library.id)" class="ml-4 mt-1 space-y-1">
          <div
            v-for="component in library.components"
            :key="component.id"
            @click="selectComponent(library, component)"
            @dblclick="addToCanvas(library, component)"
            class="group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
            :class="isSelected(library.id, component.id) 
              ? 'bg-atlas-600/20 border border-atlas-500/50' 
              : 'hover:bg-night-800 border border-transparent'"
          >
            <div class="flex-1 min-w-0">
              <div class="text-sm text-white truncate">{{ component.name }}</div>
              <div class="text-xs text-night-500 truncate">{{ component.description }}</div>
            </div>
            
            <!-- Add button -->
            <button
              @click.stop="addToCanvas(library, component)"
              class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-atlas-600 text-night-400 hover:text-white transition-all"
              title="Add to canvas"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Help -->
    <div class="p-3 border-t border-night-800 text-xs text-night-500">
      Click to preview • Double-click to add to canvas
    </div>
  </div>
</template>
