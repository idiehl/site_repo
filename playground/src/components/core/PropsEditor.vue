<script setup lang="ts">
import { computed, watch } from 'vue';
import { useStore } from '@nanostores/vue';
import { previewComponent, updatePreviewProps, getSelectedElement, updateElementProps, selectedElementId, canvasElements } from '../../lib/canvas-store';
import { getComponent, getLibrary, type ComponentProp } from '../../lib/registry';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';

const preview = useStore(previewComponent);
const selectedId = useStore(selectedElementId);
const elements = useStore(canvasElements);

// Determine if we're editing a preview or a canvas element
const editMode = computed(() => {
  if (selectedId.value) return 'canvas';
  if (preview.value.libraryId) return 'preview';
  return null;
});

const currentLibraryId = computed(() => {
  if (editMode.value === 'canvas') {
    const element = elements.value.find(el => el.id === selectedId.value);
    return element?.libraryId || null;
  }
  return preview.value.libraryId;
});

const currentComponentId = computed(() => {
  if (editMode.value === 'canvas') {
    const element = elements.value.find(el => el.id === selectedId.value);
    return element?.componentId || null;
  }
  return preview.value.componentId;
});

const currentProps = computed(() => {
  if (editMode.value === 'canvas') {
    const element = elements.value.find(el => el.id === selectedId.value);
    return element?.props || {};
  }
  return preview.value.props;
});

const currentLibrary = computed(() => {
  if (!currentLibraryId.value) return null;
  return getLibrary(currentLibraryId.value);
});

const currentComponent = computed(() => {
  if (!currentLibraryId.value || !currentComponentId.value) return null;
  return getComponent(currentLibraryId.value, currentComponentId.value);
});

function updateProp(name: string, value: any) {
  const newProps = { ...currentProps.value, [name]: value };
  
  if (editMode.value === 'canvas' && selectedId.value) {
    updateElementProps(selectedId.value, newProps);
  } else {
    updatePreviewProps(newProps);
  }
}

function resetProps() {
  if (!currentComponent.value) return;
  const defaultProps = { ...currentComponent.value.defaultProps };
  
  if (editMode.value === 'canvas' && selectedId.value) {
    updateElementProps(selectedId.value, defaultProps);
  } else {
    updatePreviewProps(defaultProps);
  }
}

// Tailwind size options
const sizeOptions = ['w-4 h-4', 'w-5 h-5', 'w-6 h-6', 'w-8 h-8', 'w-10 h-10', 'w-12 h-12', 'w-16 h-16'];

// Color options
const colorOptions = [
  'text-white', 'text-night-400', 'text-atlas-400', 'text-atlas-500',
  'text-gold-400', 'text-gold-500', 'text-green-500', 'text-red-500',
  'text-blue-500', 'text-purple-500', 'text-pink-500'
];
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-night-800 flex items-center justify-between">
      <div>
        <h2 class="text-sm font-semibold text-night-300 uppercase tracking-wider">
          Properties
        </h2>
        <p v-if="currentComponent" class="text-xs text-night-500 mt-1">
          {{ currentComponent.name }}
        </p>
      </div>
      
      <button
        v-if="currentComponent"
        @click="resetProps"
        class="p-1.5 rounded hover:bg-night-800 text-night-400 hover:text-white transition-colors"
        title="Reset to defaults"
      >
        <ArrowPathIcon class="w-4 h-4" />
      </button>
    </div>
    
    <!-- No Selection -->
    <div v-if="!editMode" class="flex-1 flex items-center justify-center p-4">
      <div class="text-center text-night-500">
        <svg class="w-12 h-12 mx-auto mb-3 text-night-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
          />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p class="text-sm">No component selected</p>
        <p class="text-xs mt-1">Select a component to edit its properties</p>
      </div>
    </div>
    
    <!-- Props Form -->
    <div v-else class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Mode indicator -->
      <div class="flex items-center gap-2 p-2 rounded-lg bg-night-800/50">
        <span 
          class="w-2 h-2 rounded-full"
          :class="editMode === 'canvas' ? 'bg-gold-500' : 'bg-atlas-500'"
        />
        <span class="text-xs text-night-400">
          Editing {{ editMode === 'canvas' ? 'canvas element' : 'preview' }}
        </span>
      </div>
      
      <!-- Component Props -->
      <div v-for="prop in currentComponent?.props" :key="prop.name" class="space-y-1.5">
        <label class="flex items-center justify-between">
          <span class="text-sm text-night-300">{{ prop.name }}</span>
          <span class="text-xs text-night-600">{{ prop.type }}</span>
        </label>
        
        <!-- String input -->
        <input
          v-if="prop.type === 'string'"
          type="text"
          :value="currentProps[prop.name] ?? prop.default"
          @input="updateProp(prop.name, ($event.target as HTMLInputElement).value)"
          class="w-full px-3 py-2 bg-night-800 border border-night-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-atlas-500 focus:border-transparent"
        />
        
        <!-- Number input -->
        <input
          v-else-if="prop.type === 'number'"
          type="number"
          :value="currentProps[prop.name] ?? prop.default"
          @input="updateProp(prop.name, Number(($event.target as HTMLInputElement).value))"
          class="w-full px-3 py-2 bg-night-800 border border-night-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-atlas-500 focus:border-transparent"
        />
        
        <!-- Boolean toggle -->
        <button
          v-else-if="prop.type === 'boolean'"
          @click="updateProp(prop.name, !(currentProps[prop.name] ?? prop.default))"
          class="relative w-12 h-6 rounded-full transition-colors"
          :class="(currentProps[prop.name] ?? prop.default) ? 'bg-atlas-600' : 'bg-night-700'"
        >
          <span 
            class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
            :class="(currentProps[prop.name] ?? prop.default) ? 'left-7' : 'left-1'"
          />
        </button>
        
        <!-- Select -->
        <select
          v-else-if="prop.type === 'select'"
          :value="currentProps[prop.name] ?? prop.default"
          @change="updateProp(prop.name, ($event.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 bg-night-800 border border-night-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-atlas-500 focus:border-transparent"
        >
          <option v-for="opt in prop.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        
        <!-- Class (Tailwind) -->
        <div v-else-if="prop.type === 'class'" class="space-y-2">
          <input
            type="text"
            :value="currentProps[prop.name] ?? prop.default"
            @input="updateProp(prop.name, ($event.target as HTMLInputElement).value)"
            class="w-full px-3 py-2 bg-night-800 border border-night-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-atlas-500 focus:border-transparent"
            placeholder="Tailwind classes"
          />
          
          <!-- Quick size picker -->
          <div class="flex flex-wrap gap-1">
            <button
              v-for="size in sizeOptions"
              :key="size"
              @click="updateProp(prop.name, size + ' ' + (currentProps[prop.name]?.split(' ').filter((c: string) => !c.startsWith('w-') && !c.startsWith('h-')).join(' ') || ''))"
              class="px-2 py-1 text-xs rounded bg-night-800 hover:bg-night-700 text-night-400 hover:text-white transition-colors"
            >
              {{ size.split(' ')[0] }}
            </button>
          </div>
          
          <!-- Quick color picker -->
          <div class="flex flex-wrap gap-1">
            <button
              v-for="color in colorOptions"
              :key="color"
              @click="updateProp(prop.name, (currentProps[prop.name]?.split(' ').filter((c: string) => !c.startsWith('text-')).join(' ') || '') + ' ' + color)"
              class="w-6 h-6 rounded border border-night-700 transition-transform hover:scale-110"
              :class="color.replace('text-', 'bg-')"
              :title="color"
            />
          </div>
        </div>
        
        <!-- Description -->
        <p v-if="prop.description" class="text-xs text-night-600">
          {{ prop.description }}
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div v-if="editMode" class="p-3 border-t border-night-800">
      <div class="text-xs text-night-500 font-mono bg-night-800 p-2 rounded overflow-x-auto">
        {{ JSON.stringify(currentProps, null, 2).slice(0, 100) }}...
      </div>
    </div>
  </div>
</template>
