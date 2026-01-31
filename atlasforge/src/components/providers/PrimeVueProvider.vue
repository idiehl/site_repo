<script setup lang="ts">
/**
 * PrimeVueProvider - Wraps components with PrimeVue's required context
 */
import { computed, shallowRef, onMounted } from 'vue';
import { getLoadedLibrary } from '../../lib/library-loader';

const props = defineProps<{
  componentId: string;
  componentProps: Record<string, any>;
}>();

const library = shallowRef<any>(null);
const isReady = shallowRef(false);

onMounted(async () => {
  library.value = getLoadedLibrary('primevue');
  isReady.value = true;
});

const renderComponent = computed(() => {
  if (!isReady.value || !library.value) return null;
  
  const Component = library.value.components[props.componentId];
  if (!Component) return null;
  
  return Component;
});
</script>

<template>
  <div class="primevue-provider" data-library="primevue">
    <component 
      v-if="renderComponent"
      :is="renderComponent" 
      v-bind="componentProps"
    >
      <template v-if="componentId === 'Button'">
        {{ componentProps.label || 'Button' }}
      </template>
    </component>
    <div v-else class="text-night-500 text-sm">
      Component not found: {{ componentId }}
    </div>
  </div>
</template>
