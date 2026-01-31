/**
 * Vue App Entry Point
 * Configures Vue with required plugins for library support
 */
import type { App } from 'vue';

export default (app: App) => {
  // Vuetify is loaded dynamically, so we don't add it here
  // This file is for any global Vue configuration needed
  
  // Add global error handler for component errors
  app.config.errorHandler = (err, vm, info) => {
    console.error('Vue Error:', err);
    console.error('Component:', vm);
    console.error('Info:', info);
  };
  
  // Add global warning handler
  app.config.warnHandler = (msg, vm, trace) => {
    console.warn('Vue Warning:', msg);
  };
};
