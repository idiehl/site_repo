<script setup lang="ts">
import { computed } from 'vue';
import { 
  Bars3Icon, 
  AdjustmentsHorizontalIcon,
  EyeIcon,
  Square2StackIcon,
  CodeBracketIcon,
  FolderIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  mode: 'preview' | 'canvas';
  frameworkFilter: 'all' | 'vue' | 'react';
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
}>();

const emit = defineEmits<{
  'update:mode': [value: 'preview' | 'canvas'];
  'update:frameworkFilter': [value: 'all' | 'vue' | 'react'];
  'update:leftPanelOpen': [value: boolean];
  'update:rightPanelOpen': [value: boolean];
  'export': [];
  'save': [];
}>();

const modes = [
  { id: 'preview', label: 'Preview', icon: EyeIcon },
  { id: 'canvas', label: 'Canvas', icon: Square2StackIcon },
] as const;

const frameworks = [
  { id: 'all', label: 'All' },
  { id: 'vue', label: 'Vue' },
  { id: 'react', label: 'React' },
] as const;
</script>

<template>
  <header class="h-14 bg-night-900 border-b border-night-800 flex items-center px-4 gap-4">
    <!-- Logo -->
    <a href="https://atlasuniversalis.com" class="flex items-center gap-2 mr-4">
      <img src="/atlas-icon.svg" alt="Atlas" class="h-8 w-8" />
      <span class="font-semibold text-white hidden sm:block">UI Playground</span>
    </a>
    
    <!-- Left Panel Toggle -->
    <button
      @click="emit('update:leftPanelOpen', !leftPanelOpen)"
      class="p-2 rounded-lg hover:bg-night-800 transition-colors"
      :class="leftPanelOpen ? 'text-atlas-400' : 'text-night-400'"
      title="Toggle component browser"
    >
      <Bars3Icon class="w-5 h-5" />
    </button>
    
    <!-- Mode Selector -->
    <div class="flex bg-night-800 rounded-lg p-1">
      <button
        v-for="m in modes"
        :key="m.id"
        @click="emit('update:mode', m.id)"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        :class="mode === m.id 
          ? 'bg-atlas-600 text-white' 
          : 'text-night-400 hover:text-white'"
      >
        <component :is="m.icon" class="w-4 h-4" />
        <span class="hidden sm:inline">{{ m.label }}</span>
      </button>
    </div>
    
    <!-- Framework Filter -->
    <div class="flex bg-night-800 rounded-lg p-1">
      <button
        v-for="f in frameworks"
        :key="f.id"
        @click="emit('update:frameworkFilter', f.id)"
        class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        :class="frameworkFilter === f.id 
          ? 'bg-night-700 text-white' 
          : 'text-night-400 hover:text-white'"
      >
        {{ f.label }}
      </button>
    </div>
    
    <!-- Spacer -->
    <div class="flex-1" />
    
    <!-- Save Button -->
    <button
      @click="emit('save')"
      class="flex items-center gap-2 px-3 py-1.5 bg-night-800 hover:bg-night-700 text-white rounded-lg text-sm font-medium transition-colors"
    >
      <FolderIcon class="w-4 h-4" />
      <span class="hidden sm:inline">Designs</span>
    </button>
    
    <!-- Export Button -->
    <button
      @click="emit('export')"
      class="flex items-center gap-2 px-3 py-1.5 bg-atlas-600 hover:bg-atlas-500 text-white rounded-lg text-sm font-medium transition-colors"
    >
      <CodeBracketIcon class="w-4 h-4" />
      <span class="hidden sm:inline">Export Code</span>
    </button>
    
    <!-- Right Panel Toggle -->
    <button
      @click="emit('update:rightPanelOpen', !rightPanelOpen)"
      class="p-2 rounded-lg hover:bg-night-800 transition-colors"
      :class="rightPanelOpen ? 'text-atlas-400' : 'text-night-400'"
      title="Toggle props editor"
    >
      <AdjustmentsHorizontalIcon class="w-5 h-5" />
    </button>
  </header>
</template>
