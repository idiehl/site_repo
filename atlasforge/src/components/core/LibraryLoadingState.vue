<script setup lang="ts">
/**
 * LibraryLoadingState - Shows loading progress for libraries
 */
defineProps<{
  libraryName: string;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
}>();
</script>

<template>
  <div class="library-loading-state p-4 rounded-lg border transition-colors"
    :class="hasError 
      ? 'bg-red-500/10 border-red-500/30' 
      : isLoading 
        ? 'bg-night-800 border-night-700' 
        : 'bg-night-900 border-night-800'">
    <div class="flex items-center gap-3">
      <!-- Loading spinner -->
      <div v-if="isLoading" class="flex-shrink-0">
        <svg class="animate-spin h-5 w-5 text-atlas-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      
      <!-- Error icon -->
      <div v-else-if="hasError" class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <!-- Success icon -->
      <div v-else class="flex-shrink-0">
        <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-white truncate">
          {{ libraryName }}
        </p>
        <p v-if="isLoading" class="text-xs text-night-400">
          Loading library...
        </p>
        <p v-else-if="hasError" class="text-xs text-red-400 truncate">
          {{ errorMessage || 'Failed to load' }}
        </p>
        <p v-else class="text-xs text-green-400">
          Ready
        </p>
      </div>
    </div>
    
    <!-- Loading progress bar -->
    <div v-if="isLoading" class="mt-3">
      <div class="h-1 bg-night-700 rounded-full overflow-hidden">
        <div class="h-full bg-atlas-500 rounded-full animate-loading-bar" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes loading-bar {
  0% {
    width: 0%;
    margin-left: 0%;
  }
  50% {
    width: 30%;
    margin-left: 35%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}

.animate-loading-bar {
  animation: loading-bar 1.5s ease-in-out infinite;
}
</style>
