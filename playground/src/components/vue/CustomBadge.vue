<script setup lang="ts">
const props = defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'error';
  text?: string;
}>();

const variantClasses = {
  default: 'bg-atlas-500/20 text-atlas-400 border-atlas-500/30',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-gold-500/20 text-gold-400 border-gold-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
};
</script>

<template>
  <span 
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variantClasses[variant || 'default']
    ]"
  >
    {{ text || 'Badge' }}
  </span>
</template>
