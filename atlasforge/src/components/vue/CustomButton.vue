<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  disabled?: boolean;
}>();

const variantClasses = {
  primary: 'bg-atlas-600 hover:bg-atlas-500 text-white',
  secondary: 'bg-night-800 hover:bg-night-700 text-night-100 border border-night-700',
  ghost: 'bg-transparent hover:bg-night-800 text-night-300 hover:text-night-100',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
</script>

<template>
  <button
    :disabled="disabled"
    :class="[
      'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-atlas-500 focus:ring-offset-2 focus:ring-offset-night-950',
      variantClasses[variant || 'primary'],
      sizeClasses[size || 'md'],
      disabled && 'opacity-50 cursor-not-allowed'
    ]"
  >
    {{ text || 'Button' }}
  </button>
</template>
