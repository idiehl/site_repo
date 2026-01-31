<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  tabs?: string;
  activeIndex?: number;
}>();

const tabList = computed(() => {
  return (props.tabs || 'Tab 1,Tab 2,Tab 3').split(',').map(t => t.trim());
});

const active = ref(props.activeIndex || 0);
</script>

<template>
  <div class="space-y-4">
    <div class="flex border-b border-night-800">
      <button
        v-for="(tab, index) in tabList"
        :key="index"
        @click="active = index"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
          active === index 
            ? 'text-atlas-400 border-atlas-500' 
            : 'text-night-400 border-transparent hover:text-white hover:border-night-600'
        ]"
      >
        {{ tab }}
      </button>
    </div>
    <div class="p-4 bg-night-800/50 rounded-lg text-night-300 text-sm">
      Content for "{{ tabList[active] }}"
    </div>
  </div>
</template>
