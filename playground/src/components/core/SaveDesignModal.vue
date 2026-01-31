<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStore } from '@nanostores/vue';
import { 
  saveDesign, 
  loadDesign, 
  getLocalDesigns, 
  deleteLocalDesign,
  currentDesign,
  type Design 
} from '../../lib/canvas-store';
import { 
  XMarkIcon, 
  TrashIcon,
  FolderOpenIcon,
  DocumentPlusIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const designs = ref<Design[]>([]);
const newDesignName = ref('');
const activeTab = ref<'save' | 'load'>('save');
const saving = ref(false);

const current = useStore(currentDesign);

onMounted(() => {
  loadDesigns();
});

function loadDesigns() {
  designs.value = getLocalDesigns();
}

async function handleSave() {
  if (!newDesignName.value.trim()) return;
  
  saving.value = true;
  try {
    saveDesign(newDesignName.value.trim());
    newDesignName.value = '';
    loadDesigns();
    emit('close');
  } finally {
    saving.value = false;
  }
}

function handleLoad(design: Design) {
  loadDesign(design);
  emit('close');
}

function handleDelete(id: string) {
  if (confirm('Delete this design?')) {
    deleteLocalDesign(id);
    loadDesigns();
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-night-950/80 backdrop-blur-sm"
          @click="emit('close')"
        />
        
        <!-- Modal -->
        <div class="relative w-full max-w-lg bg-night-900 border border-night-800 rounded-xl shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-night-800">
            <h2 class="text-lg font-semibold text-white">Designs</h2>
            <button
              @click="emit('close')"
              class="p-1 rounded-lg hover:bg-night-800 text-night-400 hover:text-white transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
          
          <!-- Tabs -->
          <div class="flex border-b border-night-800 px-6">
            <button
              @click="activeTab = 'save'"
              :class="[
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === 'save' 
                  ? 'text-atlas-400 border-atlas-500' 
                  : 'text-night-400 border-transparent hover:text-white'
              ]"
            >
              <DocumentPlusIcon class="w-4 h-4" />
              Save New
            </button>
            <button
              @click="activeTab = 'load'"
              :class="[
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === 'load' 
                  ? 'text-atlas-400 border-atlas-500' 
                  : 'text-night-400 border-transparent hover:text-white'
              ]"
            >
              <FolderOpenIcon class="w-4 h-4" />
              Load ({{ designs.length }})
            </button>
          </div>
          
          <!-- Content -->
          <div class="p-6">
            <!-- Save tab -->
            <div v-if="activeTab === 'save'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-night-300 mb-2">
                  Design Name
                </label>
                <input
                  v-model="newDesignName"
                  type="text"
                  placeholder="My awesome design..."
                  class="w-full px-4 py-3 bg-night-800 border border-night-700 rounded-lg text-white placeholder-night-500 focus:outline-none focus:ring-2 focus:ring-atlas-500 focus:border-transparent"
                  @keydown.enter="handleSave"
                />
              </div>
              
              <button
                @click="handleSave"
                :disabled="!newDesignName.trim() || saving"
                class="w-full py-3 bg-atlas-600 hover:bg-atlas-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {{ saving ? 'Saving...' : 'Save Design' }}
              </button>
              
              <p v-if="current" class="text-xs text-night-500 text-center">
                Currently editing: {{ current.name }}
              </p>
            </div>
            
            <!-- Load tab -->
            <div v-else class="space-y-2 max-h-80 overflow-y-auto">
              <div 
                v-if="designs.length === 0"
                class="text-center py-8 text-night-500"
              >
                <FolderOpenIcon class="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No saved designs yet</p>
              </div>
              
              <div
                v-for="design in designs"
                :key="design.id"
                class="flex items-center justify-between p-4 bg-night-800 rounded-lg hover:bg-night-700 transition-colors group"
              >
                <button
                  @click="handleLoad(design)"
                  class="flex-1 text-left"
                >
                  <div class="font-medium text-white">{{ design.name }}</div>
                  <div class="text-xs text-night-500 mt-1">
                    {{ design.elements.length }} elements • {{ formatDate(design.updatedAt) }}
                  </div>
                </button>
                
                <button
                  @click.stop="handleDelete(design.id)"
                  class="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-night-400 hover:text-red-400 transition-all"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
