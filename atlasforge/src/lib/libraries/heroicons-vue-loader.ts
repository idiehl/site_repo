/**
 * Heroicons Vue Loader
 */
import * as HeroiconsOutline from '@heroicons/vue/24/outline';
import * as HeroiconsSolid from '@heroicons/vue/24/solid';
import type { LoadedLibrary } from '../library-loader';

const library: LoadedLibrary = {
  id: 'heroicons-vue',
  name: 'Heroicons',
  framework: 'vue',
  components: {
    // Outline icons
    ...HeroiconsOutline,
    // Solid icons (prefixed to avoid conflicts)
    ...Object.fromEntries(
      Object.entries(HeroiconsSolid).map(([key, value]) => [`${key}Solid`, value])
    ),
  },
  loaded: true,
};

export default library;
