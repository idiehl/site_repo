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

// Expanded state for each level: frameworks, libraries, and library types
const expandedFrameworks = ref<Set<string>>(new Set()); // 'vue', 'react' - collapsed by default
const expandedLibraryTypes = ref<Set<string>>(new Set()); // 'vue:heroicons', 'react:headless', etc.
const expandedLibraries = ref<Set<string>>(new Set()); // Full library IDs

// Current preview
const currentPreview = useStore(previewComponent);

// Library type mapping (extract type from library ID)
function getLibraryType(libraryId: string): string {
  // heroicons-vue -> heroicons, headless-vue -> headless, custom-vue -> custom
  return libraryId.replace(/-vue$/, '').replace(/-react$/, '');
}

// Group libraries by framework and then by type
interface LibraryGroup {
  type: string;
  typeName: string;
  libraries: LibraryMeta[];
}

interface FrameworkGroup {
  framework: 'vue' | 'react';
  frameworkName: string;
  libraryGroups: LibraryGroup[];
  totalComponents: number;
}

const frameworkGroups = computed((): FrameworkGroup[] => {
  let libs = libraries;
  
  // Apply framework filter
  if (props.frameworkFilter !== 'all') {
    libs = libs.filter(lib => lib.framework === props.frameworkFilter);
  }
  
  // Apply search filter
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
  
  // Group by framework
  const vueLibs = libs.filter(l => l.framework === 'vue');
  const reactLibs = libs.filter(l => l.framework === 'react');
  
  const result: FrameworkGroup[] = [];
  
  if (vueLibs.length > 0) {
    result.push({
      framework: 'vue',
      frameworkName: 'Vue',
      libraryGroups: groupByType(vueLibs),
      totalComponents: vueLibs.reduce((sum, l) => sum + l.components.length, 0),
    });
  }
  
  if (reactLibs.length > 0) {
    result.push({
      framework: 'react',
      frameworkName: 'React',
      libraryGroups: groupByType(reactLibs),
      totalComponents: reactLibs.reduce((sum, l) => sum + l.components.length, 0),
    });
  }
  
  return result;
});

function groupByType(libs: LibraryMeta[]): LibraryGroup[] {
  const typeMap = new Map<string, LibraryMeta[]>();
  
  for (const lib of libs) {
    const type = getLibraryType(lib.id);
    if (!typeMap.has(type)) {
      typeMap.set(type, []);
    }
    typeMap.get(type)!.push(lib);
  }
  
  const typeNames: Record<string, string> = {
    heroicons: 'Heroicons',
    headless: 'Headless UI',
    custom: 'Custom Components',
  };
  
  return Array.from(typeMap.entries()).map(([type, libraries]) => ({
    type,
    typeName: typeNames[type] || type,
    libraries,
  }));
}

function toggleFramework(framework: string) {
  if (expandedFrameworks.value.has(framework)) {
    expandedFrameworks.value.delete(framework);
  } else {
    expandedFrameworks.value.add(framework);
  }
  expandedFrameworks.value = new Set(expandedFrameworks.value);
}

function toggleLibraryType(framework: string, type: string) {
  const key = `${framework}:${type}`;
  if (expandedLibraryTypes.value.has(key)) {
    expandedLibraryTypes.value.delete(key);
  } else {
    expandedLibraryTypes.value.add(key);
  }
  expandedLibraryTypes.value = new Set(expandedLibraryTypes.value);
}

function isLibraryTypeExpanded(framework: string, type: string): boolean {
  return expandedLibraryTypes.value.has(`${framework}:${type}`);
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

function getFrameworkColor(framework: 'vue' | 'react') {
  return framework === 'vue'
    ? { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20' }
    : { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', badge: 'bg-sky-500/20' };
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
    
    <!-- Hierarchical Library List -->
    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="frameworkGroups.length === 0" class="p-4 text-center text-night-500 text-sm">
        No components found
      </div>
      
      <!-- Framework Level (Vue / React) -->
      <div v-for="fwGroup in frameworkGroups" :key="fwGroup.framework" class="mb-3">
        <button
          @click="toggleFramework(fwGroup.framework)"
          class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-left"
          :class="[
            getFrameworkColor(fwGroup.framework).bg,
            'border',
            getFrameworkColor(fwGroup.framework).border,
            'hover:brightness-110'
          ]"
        >
          <component 
            :is="expandedFrameworks.has(fwGroup.framework) ? ChevronDownIcon : ChevronRightIcon" 
            class="w-4 h-4"
            :class="getFrameworkColor(fwGroup.framework).text"
          />
          <span class="flex-1 text-sm font-semibold" :class="getFrameworkColor(fwGroup.framework).text">
            {{ fwGroup.frameworkName }}
          </span>
          <span 
            class="text-xs px-2 py-0.5 rounded-full"
            :class="[getFrameworkColor(fwGroup.framework).badge, getFrameworkColor(fwGroup.framework).text]"
          >
            {{ fwGroup.totalComponents }} components
          </span>
        </button>
        
        <!-- Library Type Level (Heroicons, Headless UI, Custom) -->
        <div v-show="expandedFrameworks.has(fwGroup.framework)" class="ml-3 mt-1 space-y-1">
          <div v-for="libGroup in fwGroup.libraryGroups" :key="libGroup.type">
            <button
              @click="toggleLibraryType(fwGroup.framework, libGroup.type)"
              class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-night-800 transition-colors text-left"
            >
              <component 
                :is="isLibraryTypeExpanded(fwGroup.framework, libGroup.type) ? ChevronDownIcon : ChevronRightIcon" 
                class="w-4 h-4 text-night-500"
              />
              <span class="flex-1 text-sm font-medium text-white">{{ libGroup.typeName }}</span>
              <span class="text-xs text-night-500">
                {{ libGroup.libraries.reduce((sum, l) => sum + l.components.length, 0) }}
              </span>
            </button>
            
            <!-- Component Level -->
            <div 
              v-show="isLibraryTypeExpanded(fwGroup.framework, libGroup.type)" 
              class="ml-4 mt-1 space-y-0.5"
            >
              <template v-for="library in libGroup.libraries" :key="library.id">
                <div
                  v-for="component in library.components"
                  :key="component.id"
                  @click="selectComponent(library, component)"
                  @dblclick="addToCanvas(library, component)"
                  class="group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
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
              </template>
            </div>
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
