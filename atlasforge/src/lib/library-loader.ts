/**
 * Library Loader - Dynamic import system for lazy-loading UI libraries
 * Each library is loaded only when first accessed to minimize initial bundle size
 */

export type LibraryId = 
  | 'vuetify' 
  | 'primevue' 
  | 'naiveui' 
  | 'chakraui' 
  | 'mantine' 
  | 'radixui' 
  | 'shadcnui'
  | 'heroicons-vue'
  | 'heroicons-react'
  | 'headless-vue'
  | 'headless-react'
  | 'custom-vue'
  | 'custom-react';

export interface LoadedLibrary {
  id: LibraryId;
  name: string;
  framework: 'vue' | 'react';
  components: Record<string, any>;
  Provider?: any;
  css?: string;
  loaded: boolean;
}

// Cache for loaded libraries
const libraryCache = new Map<LibraryId, LoadedLibrary>();

// Loading promises to prevent duplicate loads
const loadingPromises = new Map<LibraryId, Promise<LoadedLibrary>>();

/**
 * Check if a library is already loaded
 */
export function isLibraryLoaded(libraryId: LibraryId): boolean {
  return libraryCache.has(libraryId);
}

/**
 * Get a loaded library from cache
 */
export function getLoadedLibrary(libraryId: LibraryId): LoadedLibrary | undefined {
  return libraryCache.get(libraryId);
}

/**
 * Load a library dynamically
 */
export async function loadLibrary(libraryId: LibraryId): Promise<LoadedLibrary> {
  // Return from cache if already loaded
  if (libraryCache.has(libraryId)) {
    return libraryCache.get(libraryId)!;
  }
  
  // Return existing promise if already loading
  if (loadingPromises.has(libraryId)) {
    return loadingPromises.get(libraryId)!;
  }
  
  // Create loading promise
  const loadPromise = doLoadLibrary(libraryId);
  loadingPromises.set(libraryId, loadPromise);
  
  try {
    const library = await loadPromise;
    libraryCache.set(libraryId, library);
    return library;
  } finally {
    loadingPromises.delete(libraryId);
  }
}

/**
 * Perform the actual library load
 */
async function doLoadLibrary(libraryId: LibraryId): Promise<LoadedLibrary> {
  switch (libraryId) {
    // Vue Libraries
    case 'vuetify':
      return import('./libraries/vuetify-loader').then(m => m.default);
    case 'primevue':
      return import('./libraries/primevue-loader').then(m => m.default);
    case 'naiveui':
      return import('./libraries/naiveui-loader').then(m => m.default);
    case 'heroicons-vue':
      return import('./libraries/heroicons-vue-loader').then(m => m.default);
    case 'headless-vue':
      return import('./libraries/headless-vue-loader').then(m => m.default);
    case 'custom-vue':
      return import('./libraries/custom-vue-loader').then(m => m.default);
      
    // React Libraries
    case 'chakraui':
      return import('./libraries/chakra-loader').then(m => m.default);
    case 'mantine':
      return import('./libraries/mantine-loader').then(m => m.default);
    case 'radixui':
      return import('./libraries/radix-loader').then(m => m.default);
    case 'shadcnui':
      return import('./libraries/shadcn-loader').then(m => m.default);
    case 'heroicons-react':
      return import('./libraries/heroicons-react-loader').then(m => m.default);
    case 'headless-react':
      return import('./libraries/headless-react-loader').then(m => m.default);
    case 'custom-react':
      return import('./libraries/custom-react-loader.tsx').then(m => m.default);
      
    default:
      throw new Error(`Unknown library: ${libraryId}`);
  }
}

/**
 * Preload libraries in the background
 */
export function preloadLibraries(libraryIds: LibraryId[]): void {
  libraryIds.forEach(id => {
    // Use requestIdleCallback if available for non-blocking preload
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => loadLibrary(id));
    } else {
      setTimeout(() => loadLibrary(id), 100);
    }
  });
}

/**
 * Get all loaded libraries
 */
export function getAllLoadedLibraries(): LoadedLibrary[] {
  return Array.from(libraryCache.values());
}

/**
 * Clear library cache (useful for hot reloading)
 */
export function clearLibraryCache(): void {
  libraryCache.clear();
}
