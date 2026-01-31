<script setup lang="ts">
/**
 * NaiveUIProvider - Wraps components with Naive UI's required context
 */
import { computed, shallowRef, onMounted, h } from 'vue';
import { getLoadedLibrary } from '../../lib/library-loader';

const props = defineProps<{
  componentId: string;
  componentProps: Record<string, any>;
}>();

const library = shallowRef<any>(null);
const isReady = shallowRef(false);

onMounted(async () => {
  library.value = getLoadedLibrary('naiveui');
  isReady.value = true;
});

const renderComponent = computed(() => {
  if (!isReady.value || !library.value) return null;
  
  const Component = library.value.components[props.componentId];
  if (!Component) return null;
  
  return Component;
});

// Naive UI uses NConfigProvider for theming
const configProvider = computed(() => {
  if (!library.value) return null;
  return library.value.components.NConfigProvider;
});
</script>

<template>
  <div class="naiveui-provider" data-library="naiveui">
    <component 
      v-if="configProvider"
      :is="configProvider"
      :theme-overrides="{
        common: {
          primaryColor: '#5e6bf1',
          primaryColorHover: '#7e91f8',
        }
      }"
    >
      <component 
        v-if="renderComponent"
        :is="renderComponent" 
        v-bind="componentProps"
      >
        <template v-if="componentId === 'NButton'">
          {{ componentProps.label || componentProps.text || 'Button' }}
        </template>
      </component>
      <div v-else class="text-night-500 text-sm">
        Component not found: {{ componentId }}
      </div>
    </component>
    <div v-else-if="renderComponent">
      <component 
        :is="renderComponent" 
        v-bind="componentProps"
      />
    </div>
    <div v-else class="text-night-500 text-sm">
      Loading...
    </div>
  </div>
</template>
