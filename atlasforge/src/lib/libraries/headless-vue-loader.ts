/**
 * Headless UI Vue Loader
 */
import * as HeadlessUI from '@headlessui/vue';
import type { LoadedLibrary } from '../library-loader';

const library: LoadedLibrary = {
  id: 'headless-vue',
  name: 'Headless UI',
  framework: 'vue',
  components: {
    ...HeadlessUI,
  },
  loaded: true,
};

export default library;
