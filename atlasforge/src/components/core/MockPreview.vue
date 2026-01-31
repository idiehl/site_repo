<script setup lang="ts">
/**
 * MockPreview - Renders styled mock versions of library components
 * These are visual representations that respond to props,
 * allowing users to preview how components would look
 */
import { computed } from 'vue';
import type { ComponentMeta } from '../../lib/registry';

const props = defineProps<{
  component: ComponentMeta;
  componentProps: Record<string, any>;
  libraryName: string;
}>();

// Get color based on variant/color/type props
const colorClass = computed(() => {
  const p = props.componentProps;
  const colorProp = p.color || p.colorScheme || p.severity || p.variant || p.type || 'primary';
  
  const colorMap: Record<string, string> = {
    // Primary/default colors
    primary: 'bg-blue-600 text-white border-blue-600',
    default: 'bg-night-700 text-white border-night-600',
    secondary: 'bg-gray-600 text-white border-gray-600',
    
    // Status colors
    success: 'bg-green-600 text-white border-green-600',
    green: 'bg-green-600 text-white border-green-600',
    teal: 'bg-teal-600 text-white border-teal-600',
    
    error: 'bg-red-600 text-white border-red-600',
    danger: 'bg-red-600 text-white border-red-600',
    destructive: 'bg-red-600 text-white border-red-600',
    red: 'bg-red-600 text-white border-red-600',
    
    warning: 'bg-amber-500 text-black border-amber-500',
    warn: 'bg-amber-500 text-black border-amber-500',
    yellow: 'bg-amber-500 text-black border-amber-500',
    orange: 'bg-orange-500 text-white border-orange-500',
    
    info: 'bg-cyan-600 text-white border-cyan-600',
    cyan: 'bg-cyan-600 text-white border-cyan-600',
    
    // Other colors
    blue: 'bg-blue-600 text-white border-blue-600',
    indigo: 'bg-indigo-600 text-white border-indigo-600',
    violet: 'bg-violet-600 text-white border-violet-600',
    purple: 'bg-purple-600 text-white border-purple-600',
    grape: 'bg-purple-600 text-white border-purple-600',
    pink: 'bg-pink-600 text-white border-pink-600',
    gray: 'bg-gray-600 text-white border-gray-600',
    lime: 'bg-lime-500 text-black border-lime-500',
    
    // Variants
    outline: 'bg-transparent text-blue-400 border-blue-400 border-2',
    ghost: 'bg-transparent text-blue-400 border-transparent hover:bg-blue-600/20',
    link: 'bg-transparent text-blue-400 border-transparent underline',
    subtle: 'bg-blue-600/20 text-blue-400 border-transparent',
    light: 'bg-blue-600/20 text-blue-400 border-transparent',
    filled: 'bg-blue-600 text-white border-blue-600',
    elevated: 'bg-blue-600 text-white border-blue-600 shadow-lg',
    flat: 'bg-blue-600/80 text-white border-transparent',
    tonal: 'bg-blue-600/30 text-blue-300 border-transparent',
    text: 'bg-transparent text-blue-400 border-transparent',
    plain: 'bg-transparent text-night-300 border-transparent',
  };
  
  return colorMap[colorProp] || colorMap.primary;
});

// Size classes
const sizeClass = computed(() => {
  const size = props.componentProps.size || 'md';
  const sizeMap: Record<string, string> = {
    'xs': 'text-xs px-2 py-1',
    'x-small': 'text-xs px-2 py-1',
    'tiny': 'text-xs px-2 py-1',
    'sm': 'text-sm px-3 py-1.5',
    'small': 'text-sm px-3 py-1.5',
    'md': 'text-sm px-4 py-2',
    'medium': 'text-sm px-4 py-2',
    'default': 'text-sm px-4 py-2',
    'normal': 'text-sm px-4 py-2',
    'lg': 'text-base px-5 py-2.5',
    'large': 'text-base px-5 py-2.5',
    'xl': 'text-lg px-6 py-3',
    'x-large': 'text-lg px-6 py-3',
  };
  return sizeMap[size] || sizeMap.md;
});

// Disabled state
const isDisabled = computed(() => {
  return props.componentProps.disabled || props.componentProps.isDisabled;
});

// Get text content
const labelText = computed(() => {
  return props.componentProps.label || 
         props.componentProps.text || 
         props.componentProps.title ||
         props.componentProps.value ||
         props.component.name;
});

// Progress value
const progressValue = computed(() => {
  return props.componentProps.value || 
         props.componentProps.modelValue || 
         props.componentProps.percentage || 
         50;
});
</script>

<template>
  <div class="mock-preview">
    <!-- BUTTONS -->
    <template v-if="component.category === 'buttons'">
      <button
        :class="[
          'rounded-lg font-medium transition-all border',
          sizeClass,
          colorClass,
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110',
          componentProps.rounded || componentProps.round ? 'rounded-full' : '',
          componentProps.loading || componentProps.isLoading ? 'animate-pulse' : '',
        ]"
        :disabled="isDisabled"
      >
        <span v-if="componentProps.loading || componentProps.isLoading" class="mr-2">
          <svg class="animate-spin h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </span>
        {{ labelText }}
      </button>
    </template>

    <!-- INPUTS -->
    <template v-else-if="component.category === 'inputs'">
      <!-- Switch/Toggle -->
      <div v-if="component.id.toLowerCase().includes('switch') || component.id.toLowerCase().includes('toggle')" class="flex items-center gap-3">
        <button
          :class="[
            'relative w-11 h-6 rounded-full transition-colors',
            componentProps.modelValue || componentProps.checked ? 'bg-blue-600' : 'bg-night-600',
          ]"
        >
          <span
            :class="[
              'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
              componentProps.modelValue || componentProps.checked ? 'left-5' : 'left-0.5',
            ]"
          />
        </button>
        <span v-if="componentProps.label" class="text-white text-sm">{{ componentProps.label }}</span>
      </div>
      
      <!-- Checkbox -->
      <div v-else-if="component.id.toLowerCase().includes('checkbox')" class="flex items-center gap-3">
        <div
          :class="[
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
            componentProps.modelValue || componentProps.checked 
              ? 'bg-blue-600 border-blue-600' 
              : 'bg-transparent border-night-500',
          ]"
        >
          <svg v-if="componentProps.modelValue || componentProps.checked" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span v-if="componentProps.label" class="text-white text-sm">{{ componentProps.label }}</span>
      </div>
      
      <!-- Radio -->
      <div v-else-if="component.id.toLowerCase().includes('radio')" class="flex items-center gap-3">
        <div
          :class="[
            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
            'border-blue-600',
          ]"
        >
          <div class="w-2.5 h-2.5 rounded-full bg-blue-600" />
        </div>
        <span v-if="componentProps.label" class="text-white text-sm">{{ componentProps.label }}</span>
      </div>
      
      <!-- Slider -->
      <div v-else-if="component.id.toLowerCase().includes('slider')" class="w-48">
        <div class="relative h-2 bg-night-700 rounded-full">
          <div 
            class="absolute h-full bg-blue-600 rounded-full"
            :style="{ width: `${progressValue}%` }"
          />
          <div 
            class="absolute w-4 h-4 bg-white rounded-full shadow -top-1 transform -translate-x-1/2"
            :style="{ left: `${progressValue}%` }"
          />
        </div>
      </div>
      
      <!-- Select/Dropdown -->
      <div v-else-if="component.id.toLowerCase().includes('select') || component.id.toLowerCase().includes('dropdown') || component.id.toLowerCase().includes('listbox') || component.id.toLowerCase().includes('combobox')" class="w-64">
        <label v-if="componentProps.label" class="block text-sm text-night-400 mb-1">{{ componentProps.label }}</label>
        <div class="relative">
          <select
            :class="[
              'w-full px-3 py-2 bg-night-800 border border-night-600 rounded-lg text-white appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              isDisabled ? 'opacity-50 cursor-not-allowed' : '',
            ]"
            :disabled="isDisabled"
          >
            <option>{{ componentProps.placeholder || 'Select...' }}</option>
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-night-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <!-- Textarea -->
      <div v-else-if="component.id.toLowerCase().includes('textarea')" class="w-64">
        <label v-if="componentProps.label" class="block text-sm text-night-400 mb-1">{{ componentProps.label }}</label>
        <textarea
          :placeholder="componentProps.placeholder || 'Enter text...'"
          :class="[
            'w-full px-3 py-2 bg-night-800 border border-night-600 rounded-lg text-white resize-none',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            isDisabled ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          :disabled="isDisabled"
          rows="3"
        />
      </div>
      
      <!-- Default Text Input -->
      <div v-else class="w-64">
        <label v-if="componentProps.label" class="block text-sm text-night-400 mb-1">{{ componentProps.label }}</label>
        <input
          type="text"
          :placeholder="componentProps.placeholder || 'Enter text...'"
          :class="[
            'w-full px-3 py-2 bg-night-800 border rounded-lg text-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            componentProps.error || componentProps.invalid || componentProps.isInvalid 
              ? 'border-red-500' 
              : 'border-night-600',
            isDisabled ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          :disabled="isDisabled"
        />
        <p v-if="componentProps.description" class="text-xs text-night-500 mt-1">{{ componentProps.description }}</p>
        <p v-if="componentProps.error" class="text-xs text-red-400 mt-1">{{ componentProps.error }}</p>
      </div>
    </template>

    <!-- LAYOUT -->
    <template v-else-if="component.category === 'layout'">
      <!-- Card -->
      <div v-if="component.id.toLowerCase().includes('card') || component.id.toLowerCase().includes('paper')"
        :class="[
          'w-64 p-4 rounded-xl border',
          'bg-night-800 border-night-700',
          componentProps.hover || componentProps.hoverable ? 'hover:border-night-500 transition-colors' : '',
          componentProps.elevation ? 'shadow-lg' : '',
        ]"
      >
        <h3 v-if="componentProps.title || componentProps.header" class="font-semibold text-white mb-2">
          {{ componentProps.title || componentProps.header }}
        </h3>
        <p class="text-night-400 text-sm">Card content preview</p>
      </div>
      
      <!-- Accordion/Collapse/Disclosure -->
      <div v-else-if="component.id.toLowerCase().includes('accordion') || component.id.toLowerCase().includes('collapse') || component.id.toLowerCase().includes('disclosure') || component.id.toLowerCase().includes('panel')" class="w-64 border border-night-700 rounded-lg overflow-hidden">
        <button class="w-full px-4 py-3 bg-night-800 text-white text-left flex justify-between items-center">
          <span>{{ componentProps.header || 'Accordion Item' }}</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div class="px-4 py-3 bg-night-900 text-night-400 text-sm">
          Collapsed content area
        </div>
      </div>
      
      <!-- Divider/Separator -->
      <div v-else-if="component.id.toLowerCase().includes('divider') || component.id.toLowerCase().includes('separator')"
        :class="[
          componentProps.orientation === 'vertical' ? 'w-px h-16 bg-night-600' : 'w-48 h-px bg-night-600',
        ]"
      />
      
      <!-- Default layout -->
      <div v-else class="w-64 p-4 rounded-xl bg-night-800 border border-night-700">
        <p class="text-night-400 text-sm">{{ component.name }} container</p>
      </div>
    </template>

    <!-- FEEDBACK -->
    <template v-else-if="component.category === 'feedback'">
      <!-- Progress Bar -->
      <div v-if="component.id.toLowerCase().includes('progress') && !component.id.toLowerCase().includes('circular') && !component.id.toLowerCase().includes('ring')" class="w-48">
        <div class="relative h-2 bg-night-700 rounded-full overflow-hidden">
          <div 
            :class="[
              'h-full rounded-full transition-all',
              componentProps.striped || componentProps.hasStripe ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-[length:20px_20px]' : 'bg-blue-600',
              componentProps.animated || componentProps.isAnimated || componentProps.indeterminate ? 'animate-pulse' : '',
            ]"
            :style="{ width: componentProps.indeterminate ? '100%' : `${progressValue}%` }"
          />
        </div>
        <p v-if="componentProps.showValue || componentProps.showLabel" class="text-xs text-night-400 mt-1 text-center">{{ progressValue }}%</p>
      </div>
      
      <!-- Circular Progress / Ring -->
      <div v-else-if="component.id.toLowerCase().includes('circular') || component.id.toLowerCase().includes('ring') || component.id.toLowerCase().includes('spinner')" class="relative">
        <svg 
          :class="[
            'transform -rotate-90',
            componentProps.indeterminate ? 'animate-spin' : '',
          ]"
          :width="componentProps.size || 64" 
          :height="componentProps.size || 64"
        >
          <circle
            class="text-night-700"
            stroke="currentColor"
            stroke-width="8"
            fill="transparent"
            :r="(componentProps.size || 64) / 2 - 8"
            :cx="(componentProps.size || 64) / 2"
            :cy="(componentProps.size || 64) / 2"
          />
          <circle
            class="text-blue-600"
            stroke="currentColor"
            stroke-width="8"
            fill="transparent"
            stroke-linecap="round"
            :r="(componentProps.size || 64) / 2 - 8"
            :cx="(componentProps.size || 64) / 2"
            :cy="(componentProps.size || 64) / 2"
            :stroke-dasharray="`${progressValue * 1.5} 150`"
          />
        </svg>
      </div>
      
      <!-- Alert/Message -->
      <div v-else-if="component.id.toLowerCase().includes('alert') || component.id.toLowerCase().includes('message') || component.id.toLowerCase().includes('notification')"
        :class="[
          'w-72 p-4 rounded-lg border flex gap-3',
          componentProps.type === 'success' || componentProps.status === 'success' || componentProps.severity === 'success' ? 'bg-green-600/20 border-green-600/50 text-green-400' :
          componentProps.type === 'error' || componentProps.status === 'error' || componentProps.severity === 'error' || componentProps.severity === 'danger' ? 'bg-red-600/20 border-red-600/50 text-red-400' :
          componentProps.type === 'warning' || componentProps.status === 'warning' || componentProps.severity === 'warning' || componentProps.severity === 'warn' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' :
          'bg-blue-600/20 border-blue-600/50 text-blue-400',
        ]"
      >
        <div class="flex-1">
          <p v-if="componentProps.title" class="font-medium">{{ componentProps.title }}</p>
          <p class="text-sm opacity-80">{{ componentProps.message || componentProps.text || 'Alert message content' }}</p>
        </div>
        <button v-if="componentProps.closable || componentProps.withCloseButton" class="opacity-60 hover:opacity-100">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Skeleton -->
      <div v-else-if="component.id.toLowerCase().includes('skeleton')" class="space-y-2">
        <div class="h-4 bg-night-700 rounded animate-pulse w-48" />
        <div class="h-4 bg-night-700 rounded animate-pulse w-36" />
        <div class="h-4 bg-night-700 rounded animate-pulse w-40" />
      </div>
      
      <!-- Badge (also in feedback) -->
      <div v-else-if="component.id.toLowerCase().includes('badge')"
        :class="[
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          colorClass,
        ]"
      >
        {{ componentProps.content || componentProps.value || componentProps.text || 'Badge' }}
      </div>
      
      <!-- Default feedback -->
      <div v-else class="text-night-400 text-sm">{{ component.name }}</div>
    </template>

    <!-- NAVIGATION -->
    <template v-else-if="component.category === 'navigation'">
      <!-- Tabs -->
      <div v-if="component.id.toLowerCase().includes('tab')" class="w-72">
        <div class="flex border-b border-night-700">
          <button class="px-4 py-2 text-blue-400 border-b-2 border-blue-400 font-medium text-sm">Tab 1</button>
          <button class="px-4 py-2 text-night-400 border-b-2 border-transparent hover:text-white text-sm">Tab 2</button>
          <button class="px-4 py-2 text-night-400 border-b-2 border-transparent hover:text-white text-sm">Tab 3</button>
        </div>
      </div>
      
      <!-- Breadcrumb -->
      <div v-else-if="component.id.toLowerCase().includes('breadcrumb')" class="flex items-center gap-2 text-sm">
        <a href="#" class="text-night-400 hover:text-white">Home</a>
        <span class="text-night-600">{{ componentProps.separator || '/' }}</span>
        <a href="#" class="text-night-400 hover:text-white">Category</a>
        <span class="text-night-600">{{ componentProps.separator || '/' }}</span>
        <span class="text-white">Current</span>
      </div>
      
      <!-- Pagination -->
      <div v-else-if="component.id.toLowerCase().includes('pagination')" class="flex items-center gap-1">
        <button class="w-8 h-8 rounded bg-night-800 text-night-400 hover:bg-night-700">&lt;</button>
        <button class="w-8 h-8 rounded bg-blue-600 text-white">1</button>
        <button class="w-8 h-8 rounded bg-night-800 text-night-400 hover:bg-night-700">2</button>
        <button class="w-8 h-8 rounded bg-night-800 text-night-400 hover:bg-night-700">3</button>
        <button class="w-8 h-8 rounded bg-night-800 text-night-400 hover:bg-night-700">&gt;</button>
      </div>
      
      <!-- Steps/Stepper -->
      <div v-else-if="component.id.toLowerCase().includes('step')" class="flex items-center gap-2">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">1</div>
          <div class="w-12 h-0.5 bg-blue-600"></div>
        </div>
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">2</div>
          <div class="w-12 h-0.5 bg-night-600"></div>
        </div>
        <div class="w-8 h-8 rounded-full bg-night-700 text-night-400 flex items-center justify-center text-sm font-medium">3</div>
      </div>
      
      <!-- Menu/NavLink -->
      <div v-else-if="component.id.toLowerCase().includes('menu') || component.id.toLowerCase().includes('nav')" class="w-48 bg-night-800 rounded-lg border border-night-700 py-1">
        <a href="#" class="block px-4 py-2 text-white hover:bg-night-700 text-sm">Menu Item 1</a>
        <a href="#" class="block px-4 py-2 text-night-400 hover:bg-night-700 text-sm">Menu Item 2</a>
        <a href="#" class="block px-4 py-2 text-night-400 hover:bg-night-700 text-sm">Menu Item 3</a>
      </div>
      
      <!-- Default nav -->
      <div v-else class="text-night-400 text-sm">{{ component.name }}</div>
    </template>

    <!-- DATA DISPLAY -->
    <template v-else-if="component.category === 'data'">
      <!-- Avatar -->
      <div v-if="component.id.toLowerCase().includes('avatar')"
        :class="[
          'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium',
          componentProps.size === 'sm' || componentProps.size === 'small' ? 'w-8 h-8 text-xs' :
          componentProps.size === 'lg' || componentProps.size === 'large' ? 'w-16 h-16 text-xl' :
          componentProps.size === 'xl' || componentProps.size === 'xlarge' || componentProps.size === 'x-large' ? 'w-20 h-20 text-2xl' :
          'w-10 h-10 text-sm',
        ]"
      >
        {{ componentProps.initials || componentProps.name?.charAt(0) || componentProps.label || 'A' }}
      </div>
      
      <!-- Badge/Tag/Chip -->
      <div v-else-if="component.id.toLowerCase().includes('badge') || component.id.toLowerCase().includes('tag') || component.id.toLowerCase().includes('chip')"
        :class="[
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
          colorClass,
          componentProps.closable ? 'pr-1' : '',
        ]"
      >
        {{ componentProps.content || componentProps.value || componentProps.text || componentProps.label || 'Tag' }}
        <button v-if="componentProps.closable" class="ml-1 hover:bg-white/20 rounded-full p-0.5">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Table -->
      <div v-else-if="component.id.toLowerCase().includes('table')" class="w-72 border border-night-700 rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-night-800">
            <tr>
              <th class="px-3 py-2 text-left text-night-300 font-medium">Name</th>
              <th class="px-3 py-2 text-left text-night-300 font-medium">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-night-700">
            <tr :class="componentProps.striped || componentProps.stripedRows ? 'bg-night-800/50' : ''">
              <td class="px-3 py-2 text-white">Item 1</td>
              <td class="px-3 py-2 text-green-400">Active</td>
            </tr>
            <tr :class="componentProps.hover || componentProps.highlightOnHover ? 'hover:bg-night-800' : ''">
              <td class="px-3 py-2 text-white">Item 2</td>
              <td class="px-3 py-2 text-night-400">Inactive</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- List -->
      <div v-else-if="component.id.toLowerCase().includes('list')" class="w-48 bg-night-800 rounded-lg border border-night-700 divide-y divide-night-700">
        <div class="px-4 py-2 text-white text-sm">List Item 1</div>
        <div class="px-4 py-2 text-white text-sm">List Item 2</div>
        <div class="px-4 py-2 text-white text-sm">List Item 3</div>
      </div>
      
      <!-- Tree -->
      <div v-else-if="component.id.toLowerCase().includes('tree')" class="w-48 text-sm">
        <div class="flex items-center gap-1 text-white py-1">
          <svg class="w-4 h-4 text-night-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          Parent Node
        </div>
        <div class="ml-5 space-y-1">
          <div class="flex items-center gap-1 text-night-300 py-1">
            <svg class="w-4 h-4 text-night-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
            Child 1
          </div>
          <div class="flex items-center gap-1 text-night-300 py-1">
            <svg class="w-4 h-4 text-night-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
            Child 2
          </div>
        </div>
      </div>
      
      <!-- Default data -->
      <div v-else class="text-night-400 text-sm">{{ component.name }}</div>
    </template>

    <!-- OVERLAYS -->
    <template v-else-if="component.category === 'overlays'">
      <!-- Dialog/Modal -->
      <div v-if="component.id.toLowerCase().includes('dialog') || component.id.toLowerCase().includes('modal')" class="w-72 bg-night-800 rounded-xl border border-night-700 shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-night-700">
          <h3 class="font-medium text-white">{{ componentProps.title || componentProps.header || 'Modal Title' }}</h3>
          <button v-if="componentProps.closable !== false && componentProps.withCloseButton !== false" class="text-night-400 hover:text-white">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4 text-night-300 text-sm">
          Modal content goes here...
        </div>
        <div class="px-4 py-3 bg-night-900 flex justify-end gap-2">
          <button class="px-3 py-1.5 text-sm text-night-400 hover:text-white">Cancel</button>
          <button class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500">Confirm</button>
        </div>
      </div>
      
      <!-- Drawer/Sheet/Sidebar -->
      <div v-else-if="component.id.toLowerCase().includes('drawer') || component.id.toLowerCase().includes('sheet') || component.id.toLowerCase().includes('sidebar')" class="w-48 h-48 bg-night-800 rounded-lg border border-night-700 flex flex-col">
        <div class="px-4 py-3 border-b border-night-700">
          <h3 class="font-medium text-white text-sm">{{ componentProps.title || 'Drawer' }}</h3>
        </div>
        <div class="flex-1 p-4 text-night-400 text-xs">
          Drawer content...
        </div>
      </div>
      
      <!-- Tooltip -->
      <div v-else-if="component.id.toLowerCase().includes('tooltip')" class="relative">
        <div class="px-3 py-1.5 bg-night-700 text-white text-sm rounded-lg shadow-lg">
          {{ componentProps.label || componentProps.text || componentProps.value || 'Tooltip text' }}
        </div>
        <div v-if="componentProps.hasArrow !== false && componentProps.withArrow !== false" class="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-night-700 rotate-45" />
      </div>
      
      <!-- Popover -->
      <div v-else-if="component.id.toLowerCase().includes('popover') || component.id.toLowerCase().includes('hover')" class="w-48 bg-night-800 rounded-lg border border-night-700 shadow-xl p-3">
        <p class="text-white text-sm font-medium mb-1">Popover Title</p>
        <p class="text-night-400 text-xs">Popover content goes here.</p>
      </div>
      
      <!-- Menu -->
      <div v-else-if="component.id.toLowerCase().includes('menu') || component.id.toLowerCase().includes('dropdown') || component.id.toLowerCase().includes('context')" class="w-40 bg-night-800 rounded-lg border border-night-700 shadow-xl py-1">
        <button class="w-full px-3 py-2 text-left text-sm text-white hover:bg-night-700">Action 1</button>
        <button class="w-full px-3 py-2 text-left text-sm text-white hover:bg-night-700">Action 2</button>
        <div class="border-t border-night-700 my-1" />
        <button class="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-night-700">Delete</button>
      </div>
      
      <!-- Default overlay -->
      <div v-else class="text-night-400 text-sm">{{ component.name }}</div>
    </template>

    <!-- TYPOGRAPHY -->
    <template v-else-if="component.category === 'typography'">
      <!-- Heading/Title -->
      <div v-if="component.id.toLowerCase().includes('heading') || component.id.toLowerCase().includes('title')"
        :class="[
          'font-bold text-white',
          componentProps.size === 'h1' || componentProps.order === 1 || componentProps.as === 'h1' ? 'text-4xl' :
          componentProps.size === 'h2' || componentProps.order === 2 || componentProps.as === 'h2' ? 'text-3xl' :
          componentProps.size === 'h3' || componentProps.order === 3 || componentProps.as === 'h3' ? 'text-2xl' :
          componentProps.size === 'h4' || componentProps.order === 4 || componentProps.as === 'h4' ? 'text-xl' :
          componentProps.size === 'h5' || componentProps.order === 5 || componentProps.as === 'h5' ? 'text-lg' :
          'text-2xl',
        ]"
      >
        Heading Text
      </div>
      
      <!-- Text -->
      <div v-else-if="component.id.toLowerCase().includes('text')"
        :class="[
          'text-night-300',
          componentProps.size === 'xs' ? 'text-xs' :
          componentProps.size === 'sm' ? 'text-sm' :
          componentProps.size === 'lg' ? 'text-lg' :
          componentProps.size === 'xl' ? 'text-xl' :
          'text-base',
        ]"
      >
        Sample body text content
      </div>
      
      <!-- Code -->
      <div v-else-if="component.id.toLowerCase().includes('code') || component.id.toLowerCase().includes('kbd')" 
        class="px-2 py-1 bg-night-800 text-pink-400 font-mono text-sm rounded"
      >
        code snippet
      </div>
      
      <!-- Highlight -->
      <div v-else-if="component.id.toLowerCase().includes('highlight')" class="text-white">
        Some <span class="bg-yellow-500/30 px-1">highlighted</span> text
      </div>
      
      <!-- Default typography -->
      <div v-else class="text-night-300">{{ component.name }}</div>
    </template>

    <!-- FORMS -->
    <template v-else-if="component.category === 'forms'">
      <div class="w-64 space-y-3">
        <div>
          <label class="block text-sm text-night-400 mb-1">Form Field</label>
          <input type="text" placeholder="Enter value" class="w-full px-3 py-2 bg-night-800 border border-night-600 rounded-lg text-white" />
        </div>
      </div>
    </template>

    <!-- ICONS - show placeholder -->
    <template v-else-if="component.category === 'icons'">
      <div class="w-8 h-8 text-blue-400">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" :class="componentProps.class || componentProps.className || 'w-8 h-8'">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </template>

    <!-- DEFAULT FALLBACK -->
    <template v-else>
      <div class="text-night-500 text-sm italic">
        {{ component.name }} preview
      </div>
    </template>

    <!-- Library label -->
    <div class="mt-4 text-xs text-night-600 text-center">
      Mock preview • {{ libraryName }}
    </div>
  </div>
</template>

<style scoped>
.mock-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
