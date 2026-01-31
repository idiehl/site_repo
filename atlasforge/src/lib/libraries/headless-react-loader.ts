/**
 * Headless UI React Loader
 */
import * as HeadlessUI from '@headlessui/react';
import type { LoadedLibrary } from '../library-loader';

const library: LoadedLibrary = {
  id: 'headless-react',
  name: 'Headless UI',
  framework: 'react',
  components: {
    ...HeadlessUI,
  },
  loaded: true,
};

export default library;
