import { createApp } from 'vue'
import ChapterNav from './components/ChapterNav.vue'

document.addEventListener('DOMContentLoaded', () => {
  const navRoot = document.getElementById('chapter-nav-root')
  if (navRoot) {
    const itemsJson = navRoot.dataset.navItems || '[]'
    const currentSlug = navRoot.dataset.currentSlug || ''

    let items
    try {
      items = JSON.parse(itemsJson)
    } catch (err) {
      console.error('Failed to parse nav items JSON', err)
      items = []
    }

    createApp(ChapterNav, {
      items,
      currentSlug,
    }).mount(navRoot)
  }
})
