<script setup lang="ts">
/**
 * VuetifyProvider - Wraps components with Vuetify's required context
 */
import { computed, h, defineComponent, shallowRef, onMounted } from 'vue';
import { getLoadedLibrary } from '../../lib/library-loader';

const props = defineProps<{
  componentId: string;
  componentProps: Record<string, any>;
}>();

const library = shallowRef<any>(null);
const isReady = shallowRef(false);

onMounted(async () => {
  // Get the loaded Vuetify library
  library.value = getLoadedLibrary('vuetify');
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
  <div class="vuetify-provider" data-library="vuetify">
    <component 
      v-if="renderComponent"
      :is="renderComponent" 
      v-bind="componentProps"
    >
      <!-- Default slot content for components that need it -->
      <template v-if="componentId === 'VBtn' || componentId === 'VChip' || componentId === 'VTab'">
        {{ componentProps.text || componentProps.label || componentId }}
      </template>
      <template v-else-if="componentId === 'VCard'">
        <v-card-title v-if="componentProps.title">{{ componentProps.title }}</v-card-title>
        <v-card-text>Card content preview</v-card-text>
      </template>
    </component>
    <div v-else class="text-night-500 text-sm">
      Component not found: {{ componentId }}
    </div>
  </div>
</template>

<style scoped>
.vuetify-provider {
  /* Vuetify dark theme variables */
  --v-theme-background: 27, 27, 38;
  --v-theme-surface: 52, 52, 70;
  --v-theme-primary: 94, 107, 241;
}
</style>
