<script setup lang="ts">
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string;
}>();

const typeConfig = {
  info: { 
    class: 'bg-atlas-500/10 border-atlas-500/30 text-atlas-400',
    icon: InformationCircleIcon,
    iconClass: 'text-atlas-400'
  },
  success: { 
    class: 'bg-green-500/10 border-green-500/30 text-green-400',
    icon: CheckCircleIcon,
    iconClass: 'text-green-400'
  },
  warning: { 
    class: 'bg-gold-500/10 border-gold-500/30 text-gold-400',
    icon: ExclamationTriangleIcon,
    iconClass: 'text-gold-400'
  },
  error: { 
    class: 'bg-red-500/10 border-red-500/30 text-red-400',
    icon: XCircleIcon,
    iconClass: 'text-red-400'
  },
};

const config = typeConfig[props.type || 'info'];
</script>

<template>
  <div :class="['rounded-lg border p-4 flex gap-3', config.class]">
    <component :is="config.icon" :class="['w-5 h-5 flex-shrink-0 mt-0.5', config.iconClass]" />
    <div>
      <h4 class="font-medium text-white">{{ title || 'Alert' }}</h4>
      <p class="text-sm mt-1 opacity-80">{{ message || 'This is an alert message.' }}</p>
    </div>
  </div>
</template>
