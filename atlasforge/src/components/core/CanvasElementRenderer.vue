<script setup lang="ts">
/**
 * CanvasElementRenderer - Renders visual component representations on canvas
 * Provides styled mock versions of all component types for wireframing
 */
import { computed, markRaw, shallowRef, watch, onMounted } from 'vue';
import { getComponent, getLibrary } from '../../lib/registry';
import { loadLibrary, isLibraryLoaded, getLoadedLibrary } from '../../lib/library-loader';

// Vue component imports
import * as HeroiconsVue from '@heroicons/vue/24/outline';
import CustomCard from '../vue/CustomCard.vue';
import CustomBadge from '../vue/CustomBadge.vue';
import CustomAlert from '../vue/CustomAlert.vue';
import CustomButton from '../vue/CustomButton.vue';
import CustomInput from '../vue/CustomInput.vue';
import CustomAvatar from '../vue/CustomAvatar.vue';
import CustomProgress from '../vue/CustomProgress.vue';
import CustomTabs from '../vue/CustomTabs.vue';

const customVueComponents: Record<string, any> = {
  Card: CustomCard,
  Badge: CustomBadge,
  Alert: CustomAlert,
  Button: CustomButton,
  Input: CustomInput,
  Avatar: CustomAvatar,
  Progress: CustomProgress,
  Tabs: CustomTabs,
};

const props = defineProps<{
  libraryId: string;
  componentId: string;
  componentProps: Record<string, any>;
  framework: 'vue' | 'react';
  width?: number;
  height?: number;
}>();

const componentMeta = computed(() => getComponent(props.libraryId, props.componentId));
const library = computed(() => getLibrary(props.libraryId));

// For actually loaded Vue components
const loadedVueComponent = shallowRef<any>(null);
const isLoading = shallowRef(false);

// Try to load Vue components
watch(
  () => [props.libraryId, props.componentId],
  async () => {
    if (props.framework !== 'vue') {
      loadedVueComponent.value = null;
      return;
    }
    
    // Heroicons - always available
    if (props.libraryId === 'heroicons-vue') {
      loadedVueComponent.value = markRaw((HeroiconsVue as any)[props.componentId] || null);
      return;
    }
    
    // Custom components - always available
    if (props.libraryId === 'custom-vue') {
      loadedVueComponent.value = markRaw(customVueComponents[props.componentId] || null);
      return;
    }
    
    // For other Vue libraries, try to load
    isLoading.value = true;
    try {
      const lib = await loadLibrary(props.libraryId as any);
      loadedVueComponent.value = markRaw(lib.components[props.componentId] || null);
    } catch {
      loadedVueComponent.value = null;
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true }
);

// Get color based on props
const colorValue = computed(() => props.componentProps.color || props.componentProps.variant || 'default');
const sizeValue = computed(() => props.componentProps.size || 'md');
const isDisabled = computed(() => props.componentProps.disabled || props.componentProps.isDisabled);
const labelText = computed(() => props.componentProps.text || props.componentProps.label || props.componentProps.children || componentMeta.value?.name || props.componentId);
const progressValue = computed(() => Math.min(100, Math.max(0, props.componentProps.value || props.componentProps.progress || 60)));

// Color mappings
const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
  secondary: { bg: 'bg-gray-600', text: 'text-white', border: 'border-gray-500' },
  success: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-500' },
  warning: { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-400' },
  error: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-500' },
  danger: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-500' },
  info: { bg: 'bg-sky-600', text: 'text-white', border: 'border-sky-500' },
  default: { bg: 'bg-atlas-600', text: 'text-white', border: 'border-atlas-500' },
  ghost: { bg: 'bg-transparent', text: 'text-night-300', border: 'border-night-600' },
  outline: { bg: 'bg-transparent', text: 'text-night-300', border: 'border-night-500' },
  filled: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' },
  light: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  subtle: { bg: 'bg-night-700', text: 'text-night-300', border: 'border-night-600' },
};

const sizeMap: Record<string, string> = {
  xs: 'text-xs px-2 py-1',
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
  xl: 'text-lg px-6 py-3',
};

const colors = computed(() => colorMap[colorValue.value] || colorMap.default);
const sizes = computed(() => sizeMap[sizeValue.value] || sizeMap.md);
</script>

<template>
  <div 
    class="canvas-element-content"
    :style="{ 
      width: width ? width + 'px' : 'auto',
      height: height ? height + 'px' : 'auto',
      minWidth: '60px',
      minHeight: '24px',
    }"
  >
    <!-- Loaded Vue Component -->
    <template v-if="framework === 'vue' && loadedVueComponent">
      <component :is="loadedVueComponent" v-bind="componentProps" />
    </template>
    
    <!-- Loading State -->
    <template v-else-if="isLoading">
      <div class="flex items-center gap-2 text-night-500 text-xs">
        <svg class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Loading...
      </div>
    </template>
    
    <!-- BUTTONS -->
    <template v-else-if="componentMeta?.category === 'buttons'">
      <button 
        :class="[
          'rounded-lg font-medium transition-colors border',
          colors.bg, colors.text, colors.border,
          sizes,
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
        ]"
        :disabled="isDisabled"
      >
        <span v-if="componentProps.loading" class="inline-flex mr-2">
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </span>
        {{ labelText }}
      </button>
    </template>
    
    <!-- INPUTS -->
    <template v-else-if="componentMeta?.category === 'inputs'">
      <!-- Switch/Toggle -->
      <template v-if="componentId.toLowerCase().includes('switch') || componentId.toLowerCase().includes('toggle')">
        <div class="flex items-center gap-3">
          <div 
            class="w-11 h-6 rounded-full relative transition-colors cursor-pointer"
            :class="componentProps.checked || componentProps.value ? 'bg-atlas-600' : 'bg-night-600'"
          >
            <div 
              class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
              :class="componentProps.checked || componentProps.value ? 'translate-x-6' : 'translate-x-1'"
            />
          </div>
          <span v-if="componentProps.label" class="text-night-300 text-sm">{{ componentProps.label }}</span>
        </div>
      </template>
      
      <!-- Checkbox -->
      <template v-else-if="componentId.toLowerCase().includes('checkbox')">
        <div class="flex items-center gap-2">
          <div 
            class="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors"
            :class="componentProps.checked ? 'bg-atlas-600 border-atlas-600' : 'border-night-500 bg-night-800'"
          >
            <svg v-if="componentProps.checked" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="text-night-300 text-sm">{{ componentProps.label || 'Checkbox' }}</span>
        </div>
      </template>
      
      <!-- Radio -->
      <template v-else-if="componentId.toLowerCase().includes('radio')">
        <div class="flex items-center gap-2">
          <div 
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors"
            :class="componentProps.checked ? 'border-atlas-600' : 'border-night-500'"
          >
            <div v-if="componentProps.checked" class="w-2.5 h-2.5 rounded-full bg-atlas-600" />
          </div>
          <span class="text-night-300 text-sm">{{ componentProps.label || 'Radio' }}</span>
        </div>
      </template>
      
      <!-- Slider -->
      <template v-else-if="componentId.toLowerCase().includes('slider')">
        <div class="w-full min-w-[120px]">
          <div class="h-2 bg-night-600 rounded-full overflow-hidden">
            <div 
              class="h-full rounded-full transition-all" 
              :class="colors.bg"
              :style="{ width: progressValue + '%' }"
            />
          </div>
        </div>
      </template>
      
      <!-- Select/Dropdown -->
      <template v-else-if="componentId.toLowerCase().includes('select') || componentId.toLowerCase().includes('dropdown')">
        <div class="w-full min-w-[150px]">
          <div v-if="componentProps.label" class="text-xs text-night-400 mb-1">{{ componentProps.label }}</div>
          <div class="flex items-center justify-between px-3 py-2 bg-night-800 border border-night-600 rounded-lg text-night-300 text-sm">
            <span>{{ componentProps.placeholder || 'Select...' }}</span>
            <svg class="w-4 h-4 text-night-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </template>
      
      <!-- Default Text Input -->
      <template v-else>
        <div class="w-full min-w-[150px]">
          <div v-if="componentProps.label" class="text-xs text-night-400 mb-1">{{ componentProps.label }}</div>
          <input 
            type="text"
            :placeholder="componentProps.placeholder || 'Enter text...'"
            :disabled="isDisabled"
            class="w-full px-3 py-2 bg-night-800 border border-night-600 rounded-lg text-white placeholder-night-500 text-sm focus:outline-none focus:ring-2 focus:ring-atlas-500"
          />
          <div v-if="componentProps.description" class="text-xs text-night-500 mt-1">{{ componentProps.description }}</div>
          <div v-if="componentProps.error" class="text-xs text-red-400 mt-1">{{ componentProps.error }}</div>
        </div>
      </template>
    </template>
    
    <!-- FEEDBACK -->
    <template v-else-if="componentMeta?.category === 'feedback'">
      <!-- Progress Bar -->
      <template v-if="componentId.toLowerCase().includes('progress') && !componentId.toLowerCase().includes('circular')">
        <div class="w-full min-w-[120px]">
          <div class="flex justify-between text-xs text-night-400 mb-1">
            <span>Progress</span>
            <span>{{ progressValue }}%</span>
          </div>
          <div class="h-2 bg-night-600 rounded-full overflow-hidden">
            <div 
              class="h-full rounded-full transition-all" 
              :class="colors.bg"
              :style="{ width: progressValue + '%' }"
            />
          </div>
        </div>
      </template>
      
      <!-- Circular Progress / Spinner -->
      <template v-else-if="componentId.toLowerCase().includes('spinner') || componentId.toLowerCase().includes('circular') || componentId.toLowerCase().includes('loader')">
        <div 
          class="w-8 h-8 border-2 rounded-full animate-spin"
          :class="[colors.border, 'border-t-transparent']"
        />
      </template>
      
      <!-- Skeleton -->
      <template v-else-if="componentId.toLowerCase().includes('skeleton')">
        <div class="space-y-2 w-full min-w-[150px]">
          <div class="h-4 bg-night-600 rounded animate-pulse" />
          <div class="h-4 bg-night-600 rounded animate-pulse w-3/4" />
        </div>
      </template>
      
      <!-- Alert -->
      <template v-else-if="componentId.toLowerCase().includes('alert') || componentId.toLowerCase().includes('message')">
        <div 
          class="rounded-lg border p-3 min-w-[200px]"
          :class="[
            colorValue === 'error' || colorValue === 'danger' ? 'bg-red-500/10 border-red-500/30' :
            colorValue === 'success' ? 'bg-green-500/10 border-green-500/30' :
            colorValue === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
            'bg-atlas-500/10 border-atlas-500/30'
          ]"
        >
          <div 
            class="font-medium text-sm"
            :class="[
              colorValue === 'error' || colorValue === 'danger' ? 'text-red-400' :
              colorValue === 'success' ? 'text-green-400' :
              colorValue === 'warning' ? 'text-amber-400' :
              'text-atlas-400'
            ]"
          >
            {{ componentProps.title || 'Alert' }}
          </div>
          <div class="text-xs text-night-400 mt-1">
            {{ componentProps.message || componentProps.description || 'Alert message' }}
          </div>
        </div>
      </template>
      
      <!-- Badge -->
      <template v-else-if="componentId.toLowerCase().includes('badge') || componentId.toLowerCase().includes('tag') || componentId.toLowerCase().includes('chip')">
        <span 
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
          :class="[
            colorValue === 'error' || colorValue === 'danger' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
            colorValue === 'success' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
            colorValue === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
            'bg-atlas-500/20 text-atlas-400 border-atlas-500/30'
          ]"
        >
          {{ labelText }}
        </span>
      </template>
      
      <!-- Default -->
      <template v-else>
        <div class="text-night-400 text-sm">{{ componentMeta?.name || componentId }}</div>
      </template>
    </template>
    
    <!-- LAYOUT -->
    <template v-else-if="componentMeta?.category === 'layout'">
      <!-- Card -->
      <template v-if="componentId.toLowerCase().includes('card')">
        <div class="bg-night-800 border border-night-600 rounded-xl p-4 min-w-[150px]">
          <div v-if="componentProps.title" class="font-medium text-white text-sm mb-1">{{ componentProps.title }}</div>
          <div class="text-xs text-night-400">{{ componentProps.description || 'Card content' }}</div>
        </div>
      </template>
      
      <!-- Divider/Separator -->
      <template v-else-if="componentId.toLowerCase().includes('divider') || componentId.toLowerCase().includes('separator')">
        <div class="w-full h-px bg-night-600 min-w-[100px]" />
      </template>
      
      <!-- Accordion -->
      <template v-else-if="componentId.toLowerCase().includes('accordion')">
        <div class="w-full min-w-[200px] border border-night-600 rounded-lg overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 bg-night-800 cursor-pointer">
            <span class="text-sm text-white">Accordion Item</span>
            <svg class="w-4 h-4 text-night-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </template>
      
      <!-- Default layout box -->
      <template v-else>
        <div class="border border-dashed border-night-500 rounded-lg p-3 min-w-[100px] min-h-[50px] flex items-center justify-center">
          <span class="text-xs text-night-500">{{ componentMeta?.name || componentId }}</span>
        </div>
      </template>
    </template>
    
    <!-- NAVIGATION -->
    <template v-else-if="componentMeta?.category === 'navigation'">
      <!-- Tabs -->
      <template v-if="componentId.toLowerCase().includes('tab')">
        <div class="flex gap-1 border-b border-night-600">
          <span class="px-4 py-2 text-sm text-atlas-400 border-b-2 border-atlas-500">Tab 1</span>
          <span class="px-4 py-2 text-sm text-night-400">Tab 2</span>
          <span class="px-4 py-2 text-sm text-night-400">Tab 3</span>
        </div>
      </template>
      
      <!-- Breadcrumb -->
      <template v-else-if="componentId.toLowerCase().includes('breadcrumb')">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-atlas-400">Home</span>
          <span class="text-night-500">/</span>
          <span class="text-atlas-400">Page</span>
          <span class="text-night-500">/</span>
          <span class="text-night-300">Current</span>
        </div>
      </template>
      
      <!-- Pagination -->
      <template v-else-if="componentId.toLowerCase().includes('pagination')">
        <div class="flex items-center gap-1">
          <button class="px-2 py-1 text-sm text-night-400 hover:bg-night-700 rounded">&lt;</button>
          <button class="px-3 py-1 text-sm bg-atlas-600 text-white rounded">1</button>
          <button class="px-3 py-1 text-sm text-night-300 hover:bg-night-700 rounded">2</button>
          <button class="px-3 py-1 text-sm text-night-300 hover:bg-night-700 rounded">3</button>
          <button class="px-2 py-1 text-sm text-night-400 hover:bg-night-700 rounded">&gt;</button>
        </div>
      </template>
      
      <!-- Default -->
      <template v-else>
        <div class="text-night-400 text-sm">{{ componentMeta?.name || componentId }}</div>
      </template>
    </template>
    
    <!-- DATA DISPLAY -->
    <template v-else-if="componentMeta?.category === 'data'">
      <!-- Avatar -->
      <template v-if="componentId.toLowerCase().includes('avatar')">
        <div 
          class="flex items-center justify-center rounded-full bg-atlas-600 text-white font-medium"
          :class="{
            'w-8 h-8 text-xs': sizeValue === 'sm' || sizeValue === 'xs',
            'w-10 h-10 text-sm': sizeValue === 'md',
            'w-12 h-12 text-base': sizeValue === 'lg',
            'w-16 h-16 text-lg': sizeValue === 'xl',
          }"
        >
          {{ componentProps.initials || componentProps.name?.substring(0, 2) || 'AU' }}
        </div>
      </template>
      
      <!-- Table -->
      <template v-else-if="componentId.toLowerCase().includes('table')">
        <div class="border border-night-600 rounded-lg overflow-hidden min-w-[200px]">
          <div class="bg-night-800 px-3 py-2 border-b border-night-600 flex gap-8">
            <span class="text-xs text-night-400 font-medium">Column 1</span>
            <span class="text-xs text-night-400 font-medium">Column 2</span>
          </div>
          <div class="px-3 py-2 flex gap-8">
            <span class="text-xs text-night-300">Row 1</span>
            <span class="text-xs text-night-300">Data</span>
          </div>
        </div>
      </template>
      
      <!-- Default -->
      <template v-else>
        <div class="text-night-400 text-sm">{{ componentMeta?.name || componentId }}</div>
      </template>
    </template>
    
    <!-- ICONS -->
    <template v-else-if="componentMeta?.category === 'icons'">
      <svg 
        class="text-atlas-400"
        :class="{
          'w-4 h-4': sizeValue === 'xs',
          'w-5 h-5': sizeValue === 'sm',
          'w-6 h-6': sizeValue === 'md' || !sizeValue,
          'w-8 h-8': sizeValue === 'lg',
          'w-10 h-10': sizeValue === 'xl',
        }"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </template>
    
    <!-- OVERLAYS -->
    <template v-else-if="componentMeta?.category === 'overlays'">
      <!-- Modal/Dialog indicator -->
      <template v-if="componentId.toLowerCase().includes('modal') || componentId.toLowerCase().includes('dialog')">
        <div class="border border-dashed border-night-500 rounded-lg p-3 min-w-[120px] bg-night-800/50">
          <div class="text-xs text-night-400 text-center">Modal/Dialog</div>
          <div class="text-[10px] text-night-500 text-center mt-1">(overlay component)</div>
        </div>
      </template>
      
      <!-- Tooltip indicator -->
      <template v-else-if="componentId.toLowerCase().includes('tooltip')">
        <div class="bg-night-700 text-white text-xs px-2 py-1 rounded shadow-lg">
          {{ componentProps.content || 'Tooltip' }}
        </div>
      </template>
      
      <!-- Default -->
      <template v-else>
        <div class="text-night-400 text-sm">{{ componentMeta?.name || componentId }}</div>
      </template>
    </template>
    
    <!-- TYPOGRAPHY -->
    <template v-else-if="componentMeta?.category === 'typography'">
      <template v-if="componentId.toLowerCase().includes('heading') || componentId.toLowerCase().includes('title')">
        <h3 class="text-white font-semibold">{{ componentProps.children || 'Heading' }}</h3>
      </template>
      <template v-else-if="componentId.toLowerCase().includes('text') || componentId.toLowerCase().includes('paragraph')">
        <p class="text-night-300 text-sm">{{ componentProps.children || 'Text content' }}</p>
      </template>
      <template v-else-if="componentId.toLowerCase().includes('code')">
        <code class="bg-night-800 text-pink-400 px-2 py-1 rounded text-sm font-mono">{{ componentProps.children || 'code' }}</code>
      </template>
      <template v-else>
        <div class="text-night-300">{{ componentMeta?.name || componentId }}</div>
      </template>
    </template>
    
    <!-- FALLBACK -->
    <template v-else>
      <div 
        class="border border-dashed rounded-lg p-2 flex items-center gap-2 min-w-[80px]"
        :class="framework === 'vue' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-sky-500/50 bg-sky-500/5'"
      >
        <span 
          class="text-xs font-medium"
          :class="framework === 'vue' ? 'text-emerald-400' : 'text-sky-400'"
        >
          {{ framework === 'vue' ? 'Vue' : 'React' }}
        </span>
        <span class="text-xs text-night-400">{{ componentMeta?.name || componentId }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.canvas-element-content {
  user-select: none;
}
</style>
