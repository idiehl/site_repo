/**
 * Heroicons React Loader
 */
import * as HeroiconsOutline from '@heroicons/react/24/outline';
import * as HeroiconsSolid from '@heroicons/react/24/solid';
import type { LoadedLibrary } from '../library-loader';

const library: LoadedLibrary = {
  id: 'heroicons-react',
  name: 'Heroicons',
  framework: 'react',
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
