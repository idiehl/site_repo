<script setup lang="ts">
const props = defineProps<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  initials?: string;
  status?: 'none' | 'online' | 'offline' | 'busy';
}>();

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusClasses = {
  none: '',
  online: 'bg-green-500',
  offline: 'bg-night-500',
  busy: 'bg-red-500',
};

const statusSizes = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};
</script>

<template>
  <div class="relative inline-block">
    <div 
      :class="[
        'flex items-center justify-center rounded-full bg-atlas-600 text-white font-medium',
        sizeClasses[size || 'md']
      ]"
    >
      {{ initials || 'AU' }}
    </div>
    <span 
      v-if="status && status !== 'none'"
      :class="[
        'absolute bottom-0 right-0 rounded-full border-2 border-night-950',
        statusClasses[status],
        statusSizes[size || 'md']
      ]"
    />
  </div>
</template>
