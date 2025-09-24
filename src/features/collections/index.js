// Collections Feature - Public API
// Main entry point for collections functionality

// State exports - Zustand store
export { default as useCollectionsStore } from './state/collectionsStore';

// Domain component exports (to be implemented in next phases)
// My Collections domain
export * from './myCollections';

// Public Collections domain
export * from './publicCollections';

// Shared components (if any)
export * from './shared';
