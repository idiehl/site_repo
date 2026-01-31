<script setup lang="ts">
defineProps<{
  class?: string;
  hover?: boolean;
}>();
</script>

<template>
  <div 
    :class="[
      'bg-night-900 border border-night-800 rounded-xl p-6 transition-all duration-300',
      hover && 'hover:bg-night-800 hover:border-night-700 hover:-translate-y-1 cursor-pointer',
      $props.class
    ]"
  >
    <slot>
      <div class="text-night-300 text-sm">Card Content</div>
    </slot>
  </div>
</template>
