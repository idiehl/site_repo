import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue({
      appEntrypoint: '/src/vue-app.ts',
    }),
    react(),
    tailwind(),
  ],
  output: 'static',
  build: {
    assets: 'assets',
  },
  vite: {
    ssr: {
      noExternal: [
        // Icon libraries
        '@heroicons/vue', 
        '@heroicons/react', 
        // Headless UI
        '@headlessui/vue', 
        '@headlessui/react',
        // Vue libraries
        'vuetify',
        'primevue',
        'naive-ui',
        // React libraries
        '@chakra-ui/react',
        '@emotion/react',
        '@emotion/styled',
        'framer-motion',
        '@mantine/core',
        '@mantine/hooks',
        '@mantine/dates',
        // Radix UI
        '@radix-ui/react-accordion',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-avatar',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-collapsible',
        '@radix-ui/react-context-menu',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-hover-card',
        '@radix-ui/react-label',
        '@radix-ui/react-menubar',
        '@radix-ui/react-navigation-menu',
        '@radix-ui/react-popover',
        '@radix-ui/react-progress',
        '@radix-ui/react-radio-group',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-select',
        '@radix-ui/react-separator',
        '@radix-ui/react-slider',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-toast',
        '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group',
        '@radix-ui/react-toolbar',
        '@radix-ui/react-tooltip',
      ],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vue libraries
            vuetify: ['vuetify'],
            primevue: ['primevue'],
            naiveui: ['naive-ui'],
            // React libraries
            chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
            mantine: ['@mantine/core', '@mantine/hooks', '@mantine/dates'],
            // Icons split from main bundle
            heroicons: ['@heroicons/vue', '@heroicons/react'],
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        'vuetify',
        'naive-ui',
        '@chakra-ui/react',
        '@mantine/core',
      ],
    },
  },
});
