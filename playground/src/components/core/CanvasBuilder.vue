<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from '@nanostores/vue';
import { 
  canvasElements, 
  selectedElementId, 
  canvasLayout, 
  gridVisible,
  selectElement,
  updateElementPosition,
  removeElement,
  duplicateElement,
  moveElementUp,
  moveElementDown,
  clearCanvas
} from '../../lib/canvas-store';
import { getLibrary, getComponent } from '../../lib/registry';
import { 
  TrashIcon, 
  DocumentDuplicateIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  Squares2X2Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

// Vue component imports for rendering
import * as HeroiconsVue from '@heroicons/vue/24/outline';

const elements = useStore(canvasElements);
const selectedId = useStore(selectedElementId);
const layout = useStore(canvasLayout);
const showGrid = useStore(gridVisible);

// Canvas ref for drag calculations
const canvasRef = ref<HTMLElement | null>(null);

// Drag state
const dragging = ref<string | null>(null);
const dragOffset = ref({ x: 0, y: 0 });

// Get Vue component for rendering
function getVueComponent(libraryId: string, componentId: string) {
  if (libraryId === 'heroicons-vue') {
    return (HeroiconsVue as any)[componentId] || null;
  }
  return null;
}

// Drag handlers
function handleMouseDown(e: MouseEvent, elementId: string) {
  if (e.button !== 0) return; // Only left click
  
  const element = elements.value.find(el => el.id === elementId);
  if (!element) return;
  
  selectElement(elementId);
  dragging.value = elementId;
  
  dragOffset.value = {
    x: e.clientX - element.styles.position.x,
    y: e.clientY - element.styles.position.y,
  };
  
  e.preventDefault();
}

function handleMouseMove(e: MouseEvent) {
  if (!dragging.value || !canvasRef.value) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = Math.max(0, e.clientX - dragOffset.value.x);
  const y = Math.max(0, e.clientY - dragOffset.value.y - rect.top);
  
  // Snap to grid if enabled
  const snapX = showGrid.value ? Math.round(x / 20) * 20 : x;
  const snapY = showGrid.value ? Math.round(y / 20) * 20 : y;
  
  updateElementPosition(dragging.value, { x: snapX, y: snapY });
}

function handleMouseUp() {
  dragging.value = null;
}

// Canvas click (deselect)
function handleCanvasClick(e: MouseEvent) {
  if (e.target === canvasRef.value) {
    selectElement(null);
  }
}

// Keyboard shortcuts
function handleKeyDown(e: KeyboardEvent) {
  if (!selectedId.value) return;
  
  if (e.key === 'Delete' || e.key === 'Backspace') {
    removeElement(selectedId.value);
    e.preventDefault();
  } else if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
    duplicateElement(selectedId.value);
    e.preventDefault();
  } else if (e.key === 'Escape') {
    selectElement(null);
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('keydown', handleKeyDown);
});

const selectedElement = computed(() => {
  return elements.value.find(el => el.id === selectedId.value);
});
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Canvas Toolbar -->
    <div class="px-4 py-2 border-b border-night-800 flex items-center gap-4">
      <div class="flex items-center gap-2">
        <button
          @click="gridVisible.set(!showGrid)"
          class="p-2 rounded-lg transition-colors"
          :class="showGrid ? 'bg-atlas-600/20 text-atlas-400' : 'hover:bg-night-800 text-night-400'"
          title="Toggle grid"
        >
          <Squares2X2Icon class="w-4 h-4" />
        </button>
      </div>
      
      <div class="h-4 w-px bg-night-700" />
      
      <!-- Element count -->
      <span class="text-xs text-night-500">
        {{ elements.length }} element{{ elements.length !== 1 ? 's' : '' }}
      </span>
      
      <div class="flex-1" />
      
      <!-- Selected element actions -->
      <template v-if="selectedElement">
        <button
          @click="moveElementDown(selectedId!)"
          class="p-1.5 rounded hover:bg-night-800 text-night-400 hover:text-white transition-colors"
          title="Move back"
        >
          <ChevronDownIcon class="w-4 h-4" />
        </button>
        <button
          @click="moveElementUp(selectedId!)"
          class="p-1.5 rounded hover:bg-night-800 text-night-400 hover:text-white transition-colors"
          title="Move forward"
        >
          <ChevronUpIcon class="w-4 h-4" />
        </button>
        <button
          @click="duplicateElement(selectedId!)"
          class="p-1.5 rounded hover:bg-night-800 text-night-400 hover:text-white transition-colors"
          title="Duplicate (Ctrl+D)"
        >
          <DocumentDuplicateIcon class="w-4 h-4" />
        </button>
        <button
          @click="removeElement(selectedId!)"
          class="p-1.5 rounded hover:bg-red-500/20 text-night-400 hover:text-red-400 transition-colors"
          title="Delete (Del)"
        >
          <TrashIcon class="w-4 h-4" />
        </button>
      </template>
      
      <button
        v-if="elements.length > 0"
        @click="clearCanvas"
        class="px-3 py-1.5 text-xs rounded-lg hover:bg-red-500/20 text-night-400 hover:text-red-400 transition-colors"
      >
        Clear All
      </button>
    </div>
    
    <!-- Canvas Area -->
    <div 
      ref="canvasRef"
      @click="handleCanvasClick"
      class="flex-1 relative overflow-auto"
      :class="showGrid ? 'bg-[url(\'data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22%230d0d12%22%2F%3E%3Cpath%20d%3D%22M%2020%200%20L%200%200%200%2020%22%20fill%3D%22none%22%20stroke%3D%22%23343446%22%20stroke-width%3D%220.5%22%2F%3E%3C%2Fsvg%3E\')]' : 'bg-night-950'"
    >
      <!-- Empty state -->
      <div 
        v-if="elements.length === 0"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="text-center text-night-500">
          <div class="w-20 h-20 mx-auto mb-4 rounded-xl bg-night-800/50 flex items-center justify-center border-2 border-dashed border-night-700">
            <svg class="w-10 h-10 text-night-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p class="text-sm font-medium">Canvas is empty</p>
          <p class="text-xs mt-1">Double-click components in the browser to add them</p>
        </div>
      </div>
      
      <!-- Canvas Elements -->
      <div
        v-for="element in elements"
        :key="element.id"
        @mousedown="handleMouseDown($event, element.id)"
        class="absolute cursor-move group"
        :style="{
          left: element.styles.position.x + 'px',
          top: element.styles.position.y + 'px',
          zIndex: element.zIndex,
        }"
        :class="[
          selectedId === element.id 
            ? 'ring-2 ring-atlas-500 ring-offset-2 ring-offset-night-950' 
            : 'hover:ring-2 hover:ring-night-600 hover:ring-offset-2 hover:ring-offset-night-950'
        ]"
      >
        <!-- Element wrapper -->
        <div class="p-2 bg-night-900 rounded-lg border border-night-700">
          <!-- Vue component -->
          <template v-if="element.framework === 'vue'">
            <component 
              :is="getVueComponent(element.libraryId, element.componentId)"
              v-if="getVueComponent(element.libraryId, element.componentId)"
              v-bind="element.props"
            />
            <div v-else class="text-night-500 text-xs px-2">
              {{ element.componentId }}
            </div>
          </template>
          
          <!-- React placeholder -->
          <template v-else>
            <div class="text-sky-400 text-xs px-2 py-1 bg-sky-500/10 rounded">
              React: {{ element.componentId }}
            </div>
          </template>
        </div>
        
        <!-- Selection indicator -->
        <div 
          v-if="selectedId === element.id"
          class="absolute -top-6 left-0 text-xs text-atlas-400 whitespace-nowrap"
        >
          {{ getComponent(element.libraryId, element.componentId)?.name }}
        </div>
        
        <!-- Quick delete on hover -->
        <button
          @click.stop="removeElement(element.id)"
          class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <XMarkIcon class="w-3 h-3" />
        </button>
      </div>
    </div>
    
    <!-- Canvas Footer -->
    <div class="px-4 py-2 border-t border-night-800 flex items-center gap-4 text-xs text-night-500">
      <span>Layout: {{ layout }}</span>
      <span>•</span>
      <span>Grid: {{ showGrid ? 'On' : 'Off' }}</span>
      <template v-if="selectedElement">
        <span>•</span>
        <span>
          Position: {{ selectedElement.styles.position.x }}, {{ selectedElement.styles.position.y }}
        </span>
      </template>
    </div>
  </div>
</template>
