<script setup lang="ts">
const props = defineProps<{
  value?: number;
  color?: 'atlas' | 'gold' | 'green' | 'red';
  showLabel?: boolean;
}>();

const colorClasses = {
  atlas: 'bg-atlas-500',
  gold: 'bg-gold-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
};

const percentage = Math.min(100, Math.max(0, props.value || 0));
</script>

<template>
  <div class="space-y-1">
    <div class="flex justify-between text-sm">
      <span class="text-night-400">Progress</span>
      <span v-if="showLabel !== false" class="text-white font-medium">{{ percentage }}%</span>
    </div>
    <div class="h-2 bg-night-800 rounded-full overflow-hidden">
      <div 
        :class="['h-full rounded-full transition-all duration-500', colorClasses[color || 'atlas']]"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>
