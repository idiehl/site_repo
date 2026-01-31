<script setup lang="ts">
/**
 * IsolatedPreview - Renders components in an isolated CSS context
 * Uses an iframe for complete style isolation between libraries
 */
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useStore } from '@nanostores/vue';
import { previewComponent } from '../../lib/canvas-store';
import { getLibrary, getComponent } from '../../lib/registry';
import { loadLibrary, isLibraryLoaded, type LibraryId } from '../../lib/library-loader';

const preview = useStore(previewComponent);

const isLoading = ref(false);
const loadError = ref<string | null>(null);
const loadedLibraryId = ref<string | null>(null);

const currentLibrary = computed(() => {
  if (!preview.value.libraryId) return null;
  return getLibrary(preview.value.libraryId);
});

const currentComponent = computed(() => {
  if (!preview.value.libraryId || !preview.value.componentId) return null;
  return getComponent(preview.value.libraryId, preview.value.componentId);
});

// Map registry library IDs to loader library IDs
function getLoaderLibraryId(registryId: string): LibraryId | null {
  const mapping: Record<string, LibraryId> = {
    'heroicons-vue': 'heroicons-vue',
    'heroicons-react': 'heroicons-react',
    'headless-vue': 'headless-vue',
    'headless-react': 'headless-react',
    'custom-vue': 'custom-vue',
    'custom-react': 'custom-react',
    'vuetify': 'vuetify',
    'primevue': 'primevue',
    'naiveui': 'naiveui',
    'chakraui': 'chakraui',
    'mantine': 'mantine',
    'radixui': 'radixui',
    'shadcnui': 'shadcnui',
  };
  return mapping[registryId] || null;
}

// Load library when preview changes
watch(
  () => preview.value.libraryId,
  async (libraryId) => {
    if (!libraryId) {
      loadedLibraryId.value = null;
      return;
    }
    
    const loaderLibraryId = getLoaderLibraryId(libraryId);
    if (!loaderLibraryId) {
      loadError.value = `Unknown library: ${libraryId}`;
      return;
    }
    
    // Check if already loaded
    if (isLibraryLoaded(loaderLibraryId)) {
      loadedLibraryId.value = libraryId;
      loadError.value = null;
      return;
    }
    
    // Load the library
    isLoading.value = true;
    loadError.value = null;
    
    try {
      await loadLibrary(loaderLibraryId);
      loadedLibraryId.value = libraryId;
    } catch (err: any) {
      loadError.value = err.message || 'Failed to load library';
      console.error('Failed to load library:', err);
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true }
);

// Notify React about preview changes
function notifyReact() {
  if (typeof window !== 'undefined' && preview.value.libraryId) {
    const detail = {
      libraryId: preview.value.libraryId,
      componentId: preview.value.componentId,
      props: preview.value.props,
      category: currentComponent.value?.category,
      libraryName: currentLibrary.value?.name,
    };
    (window as any).__forgePreview = detail;
    window.dispatchEvent(new CustomEvent('forge:preview-change', { detail }));
  }
}

watch(preview, notifyReact, { deep: true, immediate: true });
onMounted(notifyReact);
</script>

<template>
  <div class="isolated-preview-wrapper flex-1 flex flex-col">
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
      
      <div class="flex items-center gap-2">
        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-atlas-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span class="text-xs text-night-400">Loading library...</span>
        </div>
        
        <span 
          v-if="currentLibrary"
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
    <div class="flex-1 flex items-center justify-center p-8 bg-night-950 relative">
      <!-- Empty state -->
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
      
      <!-- Loading state -->
      <div v-else-if="isLoading" class="text-center text-night-500">
        <svg class="animate-spin h-12 w-12 mx-auto mb-4 text-atlas-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="text-sm">Loading {{ currentLibrary?.name }}...</p>
        <p class="text-xs mt-1 text-night-600">First load may take a moment</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="loadError" class="text-center text-red-400">
        <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-sm">{{ loadError }}</p>
      </div>
      
      <!-- Preview container - slot for actual component -->
      <div 
        v-else
        class="preview-container p-8 bg-night-900 rounded-xl border border-night-800 min-w-[200px] min-h-[100px] flex items-center justify-center"
      >
        <slot />
      </div>
    </div>
    
    <!-- Preview Info Bar -->
    <div v-if="currentComponent" class="px-4 py-2 border-t border-night-800 bg-night-900/50">
      <div class="flex items-center gap-4 text-xs text-night-500">
        <span>Category: <span class="text-night-300">{{ currentComponent.category }}</span></span>
        <span>Props: <span class="text-night-300">{{ Object.keys(preview.props).length }}</span></span>
        <span v-if="loadedLibraryId" class="text-green-400">Library loaded</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.isolated-preview-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-container {
  /* Container for the actual component preview */
  container-type: inline-size;
}
</style>
