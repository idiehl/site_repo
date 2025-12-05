<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  currentSlug: { type: String, default: '' },
})

const normalizedItems = computed(() =>
  (props.items || []).map(item => ({
    ...item,
    isActive: item.slug === props.currentSlug,
  })),
)
</script>

<template>
  <ul class="chapter-nav">
    <li
      v-for="item in normalizedItems"
      :key="item.slug"
      class="chapter-nav-item"
      :class="{ 'is-active': item.isActive }"
    >
      <a :href="`/pages/${item.slug}`">
        {{ item.title }}
      </a>
    </li>
  </ul>
</template>
