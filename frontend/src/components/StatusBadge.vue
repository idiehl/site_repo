<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const statusConfig = {
  pending: { label: 'Pending', class: 'badge-pending' },
  processing: { label: 'Processing', class: 'badge-pending' },
  completed: { label: 'Ready', class: 'bg-green-500/20 text-green-400' },
  needs_review: { label: '⚠️ Incomplete', class: 'bg-orange-500/20 text-orange-400' },
  failed: { label: 'Failed', class: 'badge-rejected' },
  applied: { label: 'Applied', class: 'badge-applied' },
  followup_scheduled: { label: 'Follow-up', class: 'badge-applied' },
  interview_scheduled: { label: 'Interview', class: 'badge-interview' },
  offer_received: { label: 'Offer', class: 'badge-offer' },
  rejected: { label: 'Rejected', class: 'badge-rejected' },
  withdrawn: { label: 'Withdrawn', class: 'bg-night-600/20 text-night-400' },
  no_response_closed: { label: 'Closed', class: 'bg-night-600/20 text-night-400' },
}

const config = computed(() => statusConfig[props.status] || { label: props.status, class: '' })
</script>

<template>
  <span class="badge" :class="config.class">
    {{ config.label }}
  </span>
</template>
