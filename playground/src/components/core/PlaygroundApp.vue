<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentBrowser from './ComponentBrowser.vue';
import PropsEditor from './PropsEditor.vue';
import CanvasBuilder from './CanvasBuilder.vue';
import PreviewPanel from './PreviewPanel.vue';
import TopBar from './TopBar.vue';
import CodeExporter from './CodeExporter.vue';
import SaveDesignModal from './SaveDesignModal.vue';

// Panel visibility
const leftPanelOpen = ref(true);
const rightPanelOpen = ref(true);

// Current mode
const mode = ref<'preview' | 'canvas'>('preview');

// Framework filter
const frameworkFilter = ref<'all' | 'vue' | 'react'>('all');

// Modal visibility
const exportModalOpen = ref(false);
const saveModalOpen = ref(false);
</script>

<template>
  <div class="h-screen flex flex-col bg-night-950">
    <!-- Top Bar -->
    <TopBar 
      v-model:mode="mode"
      v-model:frameworkFilter="frameworkFilter"
      v-model:leftPanelOpen="leftPanelOpen"
      v-model:rightPanelOpen="rightPanelOpen"
      @export="exportModalOpen = true"
      @save="saveModalOpen = true"
    />
    
    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Sidebar - Component Browser -->
      <aside 
        v-show="leftPanelOpen"
        class="w-72 bg-night-900 border-r border-night-800 flex flex-col overflow-hidden"
      >
        <ComponentBrowser :frameworkFilter="frameworkFilter" />
      </aside>
      
      <!-- Center - Preview or Canvas -->
      <main class="flex-1 flex flex-col overflow-hidden bg-night-950">
        <PreviewPanel v-if="mode === 'preview'" />
        <CanvasBuilder v-else />
      </main>
      
      <!-- Right Sidebar - Props Editor -->
      <aside 
        v-show="rightPanelOpen"
        class="w-80 bg-night-900 border-l border-night-800 flex flex-col overflow-hidden"
      >
        <PropsEditor />
      </aside>
    </div>
    
    <!-- Modals -->
    <CodeExporter :open="exportModalOpen" @close="exportModalOpen = false" />
    <SaveDesignModal :open="saveModalOpen" @close="saveModalOpen = false" />
  </div>
</template>
