<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, shallowRef, markRaw } from 'vue';
import { useStore } from '@nanostores/vue';
import { 
  canvasElements, 
  selectedElementId, 
  canvasLayout, 
  gridVisible,
  previewComponent,
  selectElement,
  updateElementPosition,
  updateElementSize,
  removeElement,
  duplicateElement,
  moveElementUp,
  moveElementDown,
  clearCanvas
} from '../../lib/canvas-store';
import { getLibrary, getComponent } from '../../lib/registry';
import { loadLibrary, isLibraryLoaded, type LibraryId } from '../../lib/library-loader';
import { 
  TrashIcon, 
  DocumentDuplicateIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  Squares2X2Icon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/vue/24/outline';
import CanvasElementRenderer from './CanvasElementRenderer.vue';

// Vue component imports (always available)
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

const elements = useStore(canvasElements);
const selectedId = useStore(selectedElementId);
const layout = useStore(canvasLayout);
const showGrid = useStore(gridVisible);

// Preview panel state
const showPreviewPanel = ref(false);
const localPreview = ref<{
  libraryId: string | null;
  componentId: string | null;
  props: Record<string, any>;
}>({
  libraryId: null,
  componentId: null,
  props: {},
});

// Component loading state for preview
const previewLoading = ref(false);
const previewError = ref<string | null>(null);
const loadedPreviewComponent = shallowRef<any>(null);

// Map registry IDs to loader IDs
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

// Listen for preview updates
function handlePreviewUpdate(event: CustomEvent) {
  const { libraryId, componentId, props } = event.detail;
  localPreview.value = { libraryId, componentId, props };
  showPreviewPanel.value = true;
}

// Load component when preview changes
watch(
  [() => localPreview.value.libraryId, () => localPreview.value.componentId],
  async ([libraryId, componentId]) => {
    loadedPreviewComponent.value = null;
    previewError.value = null;
    
    if (!libraryId || !componentId) return;
    
    // Handle always-available libraries first
    if (libraryId === 'heroicons-vue') {
      loadedPreviewComponent.value = markRaw((HeroiconsVue as any)[componentId] || null);
      return;
    }
    
    if (libraryId === 'custom-vue') {
      loadedPreviewComponent.value = markRaw(customComponents[componentId] || null);
      return;
    }
    
    // For other libraries, load dynamically
    const loaderLibraryId = getLoaderLibraryId(libraryId);
    if (!loaderLibraryId) {
      previewError.value = `Unknown library: ${libraryId}`;
      return;
    }
    
    previewLoading.value = true;
    
    try {
      const library = await loadLibrary(loaderLibraryId);
      const component = library.components[componentId];
      
      if (component) {
        loadedPreviewComponent.value = markRaw(component);
      } else {
        previewError.value = `Component ${componentId} not found`;
      }
    } catch (err: any) {
      console.error('Failed to load library:', err);
      previewError.value = err.message || 'Failed to load library';
    } finally {
      previewLoading.value = false;
    }
  },
  { immediate: true }
);

// Computed for preview display
const previewLibrary = computed(() => 
  localPreview.value.libraryId ? getLibrary(localPreview.value.libraryId) : null
);
const previewComponentMeta = computed(() => 
  localPreview.value.libraryId && localPreview.value.componentId 
    ? getComponent(localPreview.value.libraryId, localPreview.value.componentId) 
    : null
);
const isVuePreview = computed(() => previewLibrary.value?.framework === 'vue');

// Canvas ref for drag calculations
const canvasRef = ref<HTMLElement | null>(null);

// Drag state
const dragging = ref<string | null>(null);
const dragOffset = ref({ x: 0, y: 0 });

// Resize state
const resizing = ref<{ elementId: string; handle: string } | null>(null);
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });

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
  // Handle resize
  if (resizing.value && canvasRef.value) {
    const dx = e.clientX - resizeStart.value.x;
    const dy = e.clientY - resizeStart.value.y;
    
    let newWidth = resizeStart.value.width;
    let newHeight = resizeStart.value.height;
    
    if (resizing.value.handle.includes('e')) {
      newWidth = Math.max(60, resizeStart.value.width + dx);
    }
    if (resizing.value.handle.includes('s')) {
      newHeight = Math.max(24, resizeStart.value.height + dy);
    }
    if (resizing.value.handle.includes('w')) {
      newWidth = Math.max(60, resizeStart.value.width - dx);
    }
    if (resizing.value.handle.includes('n')) {
      newHeight = Math.max(24, resizeStart.value.height - dy);
    }
    
    // Snap to grid if enabled
    if (showGrid.value) {
      newWidth = Math.round(newWidth / 20) * 20;
      newHeight = Math.round(newHeight / 20) * 20;
    }
    
    updateElementSize(resizing.value.elementId, { width: newWidth, height: newHeight });
    return;
  }
  
  // Handle drag
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
  resizing.value = null;
}

// Resize handlers
function handleResizeStart(e: MouseEvent, elementId: string, handle: string) {
  e.stopPropagation();
  e.preventDefault();
  
  const element = elements.value.find(el => el.id === elementId);
  if (!element) return;
  
  resizing.value = { elementId, handle };
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: element.styles.size?.width || 150,
    height: element.styles.size?.height || 50,
  };
  
  selectElement(elementId);
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
  window.addEventListener('forge:preview-update', handlePreviewUpdate as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('forge:preview-update', handlePreviewUpdate as EventListener);
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
        <button
          @click="showPreviewPanel = !showPreviewPanel"
          class="p-2 rounded-lg transition-colors"
          :class="showPreviewPanel ? 'bg-atlas-600/20 text-atlas-400' : 'hover:bg-night-800 text-night-400'"
          title="Toggle preview panel"
        >
          <EyeIcon class="w-4 h-4" />
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
    
    <!-- Canvas + Preview Panel Container -->
    <div class="flex-1 flex overflow-hidden">
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
          width: element.styles.size?.width ? element.styles.size.width + 'px' : 'auto',
          height: element.styles.size?.height ? element.styles.size.height + 'px' : 'auto',
          zIndex: element.zIndex,
        }"
        :class="[
          selectedId === element.id 
            ? 'ring-2 ring-atlas-500 ring-offset-2 ring-offset-night-950' 
            : 'hover:ring-2 hover:ring-night-600 hover:ring-offset-2 hover:ring-offset-night-950'
        ]"
      >
        <!-- Element wrapper -->
        <div class="p-2 bg-night-900/80 rounded-lg border border-night-700 h-full">
          <CanvasElementRenderer
            :libraryId="element.libraryId"
            :componentId="element.componentId"
            :componentProps="element.props"
            :framework="element.framework"
            :width="element.styles.size?.width ? element.styles.size.width - 16 : undefined"
            :height="element.styles.size?.height ? element.styles.size.height - 16 : undefined"
          />
        </div>
        
        <!-- Selection indicator -->
        <div 
          v-if="selectedId === element.id"
          class="absolute -top-6 left-0 text-xs text-atlas-400 whitespace-nowrap bg-night-900 px-2 py-0.5 rounded"
        >
          {{ getComponent(element.libraryId, element.componentId)?.name }}
        </div>
        
        <!-- Resize handles (only when selected) -->
        <template v-if="selectedId === element.id">
          <!-- Corner handles -->
          <div 
            @mousedown="handleResizeStart($event, element.id, 'se')"
            class="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-atlas-500 border border-atlas-400 rounded-sm cursor-se-resize z-10"
          />
          <div 
            @mousedown="handleResizeStart($event, element.id, 'sw')"
            class="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-atlas-500 border border-atlas-400 rounded-sm cursor-sw-resize z-10"
          />
          <div 
            @mousedown="handleResizeStart($event, element.id, 'ne')"
            class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-atlas-500 border border-atlas-400 rounded-sm cursor-ne-resize z-10"
          />
          <div 
            @mousedown="handleResizeStart($event, element.id, 'nw')"
            class="absolute -top-1.5 -left-1.5 w-3 h-3 bg-atlas-500 border border-atlas-400 rounded-sm cursor-nw-resize z-10"
          />
          
          <!-- Edge handles -->
          <div 
            @mousedown="handleResizeStart($event, element.id, 'e')"
            class="absolute top-1/2 -right-1.5 w-2 h-6 -translate-y-1/2 bg-atlas-500/50 border border-atlas-400/50 rounded-sm cursor-e-resize z-10"
          />
          <div 
            @mousedown="handleResizeStart($event, element.id, 's')"
            class="absolute -bottom-1.5 left-1/2 w-6 h-2 -translate-x-1/2 bg-atlas-500/50 border border-atlas-400/50 rounded-sm cursor-s-resize z-10"
          />
        </template>
        
        <!-- Quick delete button (only when selected) -->
        <button
          v-if="selectedId === element.id"
          @click.stop="removeElement(element.id)"
          class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center z-20 shadow-lg transition-colors"
          title="Delete element"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <!-- Preview Panel (Right Side) -->
    <div 
      v-if="showPreviewPanel"
      class="w-72 border-l border-night-800 bg-night-900 flex flex-col overflow-hidden"
    >
      <!-- Preview Header -->
      <div class="px-3 py-2 border-b border-night-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <EyeIcon class="w-4 h-4 text-atlas-400" />
          <span class="text-sm font-medium text-white">Preview</span>
        </div>
        <button
          @click="showPreviewPanel = false"
          class="p-1 rounded hover:bg-night-800 text-night-400 hover:text-white transition-colors"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Preview Content -->
      <div class="flex-1 overflow-auto p-4">
        <template v-if="localPreview.libraryId && localPreview.componentId">
          <!-- Component Info -->
          <div class="mb-4">
            <h3 class="text-sm font-medium text-white">{{ previewComponentMeta?.name }}</h3>
            <p class="text-xs text-night-400 flex items-center gap-2">
              {{ previewLibrary?.name }}
              <span 
                class="text-xs px-1.5 py-0.5 rounded"
                :class="previewLibrary?.framework === 'vue' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-sky-500/20 text-sky-400'"
              >
                {{ previewLibrary?.framework === 'vue' ? 'Vue' : 'React' }}
              </span>
            </p>
          </div>
          
          <!-- Preview Display -->
          <div class="bg-night-950 rounded-lg border border-night-700 p-4 flex items-center justify-center min-h-[120px]">
            <!-- Loading state -->
            <div v-if="previewLoading" class="text-center">
              <svg class="animate-spin h-8 w-8 mx-auto text-atlas-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <p class="text-xs text-night-400 mt-2">Loading...</p>
            </div>
            
            <!-- Vue Component - Live Preview -->
            <component 
              v-else-if="isVuePreview && loadedPreviewComponent"
              :is="loadedPreviewComponent" 
              v-bind="localPreview.props"
            >
              <!-- Default slot content for components that need it -->
              <template v-if="previewComponentMeta?.category === 'buttons'">
                {{ localPreview.props.text || localPreview.props.label || previewComponentMeta?.name || 'Button' }}
              </template>
            </component>
            
            <!-- React Component - Show placeholder -->
            <div v-else-if="!isVuePreview" class="text-center">
              <div class="text-night-400 text-sm">{{ previewComponentMeta?.name }}</div>
              <div class="text-night-500 text-xs mt-1">React component</div>
            </div>
            
            <!-- Error state -->
            <div v-else-if="previewError" class="text-center">
              <div class="text-red-400 text-sm">{{ previewError }}</div>
            </div>
            
            <!-- Fallback -->
            <div v-else class="text-night-500 text-sm">
              {{ previewComponentMeta?.name || 'Unknown' }}
            </div>
          </div>
          
          <!-- Component Details -->
          <div class="mt-4 space-y-2">
            <div class="text-xs text-night-500">
              <span class="text-night-400">Category:</span> {{ previewComponentMeta?.category }}
            </div>
            <div class="text-xs text-night-500">
              <span class="text-night-400">Framework:</span> 
              <span :class="previewLibrary?.framework === 'vue' ? 'text-green-400' : 'text-blue-400'">
                {{ previewLibrary?.framework === 'vue' ? 'Vue' : 'React' }}
              </span>
            </div>
          </div>
          
          <!-- Hint -->
          <div class="mt-4 p-2 bg-night-800/50 rounded text-xs text-night-400">
            Double-click in sidebar to add to canvas
          </div>
        </template>
        
        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center h-full text-center">
          <EyeIcon class="w-10 h-10 text-night-700 mb-3" />
          <p class="text-sm text-night-500">No component selected</p>
          <p class="text-xs text-night-600 mt-1">Click a component in the sidebar</p>
        </div>
      </div>
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
