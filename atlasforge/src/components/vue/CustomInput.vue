<script setup lang="ts">
const props = defineProps<{
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-medium text-night-300">
      {{ label }}
    </label>
    <input
      type="text"
      :placeholder="placeholder || 'Enter text...'"
      :disabled="disabled"
      :class="[
        'w-full px-3 py-2 bg-night-800 border border-night-700 rounded-lg text-white placeholder-night-500',
        'focus:outline-none focus:ring-2 focus:ring-atlas-500 focus:border-transparent',
        'transition-colors',
        disabled && 'opacity-50 cursor-not-allowed'
      ]"
    />
  </div>
</template>
