<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useStore } from '@nanostores/vue';
import { canvasElements } from '../../lib/canvas-store';
import { generateCode, copyToClipboard, downloadAsFile, type ExportFormat } from '../../lib/code-generator';
import { 
  ClipboardDocumentIcon, 
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const elements = useStore(canvasElements);
const activeFormat = ref<ExportFormat>('vue');
const copied = ref(false);

const formats: { id: ExportFormat; label: string; extension: string }[] = [
  { id: 'vue', label: 'Vue 3 SFC', extension: '.vue' },
  { id: 'react', label: 'React JSX', extension: '.jsx' },
  { id: 'html', label: 'HTML + Tailwind', extension: '.html' },
];

const generatedCode = computed(() => {
  return generateCode(elements.value, activeFormat.value);
});

async function handleCopy() {
  const success = await copyToClipboard(generatedCode.value);
  if (success) {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  }
}

function handleDownload() {
  const format = formats.find(f => f.id === activeFormat.value);
  const filename = `design${format?.extension || '.txt'}`;
  downloadAsFile(generatedCode.value, filename);
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
        <div class="relative w-full max-w-3xl bg-night-900 border border-night-800 rounded-xl shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-night-800">
            <h2 class="text-lg font-semibold text-white">Export Code</h2>
            <button
              @click="emit('close')"
              class="p-1 rounded-lg hover:bg-night-800 text-night-400 hover:text-white transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
          
          <!-- Format tabs -->
          <div class="flex border-b border-night-800 px-6">
            <button
              v-for="format in formats"
              :key="format.id"
              @click="activeFormat = format.id"
              :class="[
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeFormat === format.id 
                  ? 'text-atlas-400 border-atlas-500' 
                  : 'text-night-400 border-transparent hover:text-white'
              ]"
            >
              {{ format.label }}
            </button>
          </div>
          
          <!-- Code preview -->
          <div class="p-6 max-h-96 overflow-auto">
            <pre class="text-sm font-mono text-night-300 bg-night-950 rounded-lg p-4 overflow-x-auto">{{ generatedCode }}</pre>
          </div>
          
          <!-- Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-night-800 bg-night-900/50">
            <div class="text-sm text-night-500">
              {{ elements.length }} element{{ elements.length !== 1 ? 's' : '' }} in design
            </div>
            <div class="flex gap-3">
              <button
                @click="handleCopy"
                :class="[
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  copied 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-night-800 hover:bg-night-700 text-white'
                ]"
              >
                <component :is="copied ? CheckIcon : ClipboardDocumentIcon" class="w-4 h-4" />
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
              <button
                @click="handleDownload"
                class="flex items-center gap-2 px-4 py-2 bg-atlas-600 hover:bg-atlas-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <ArrowDownTrayIcon class="w-4 h-4" />
                Download
              </button>
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

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
