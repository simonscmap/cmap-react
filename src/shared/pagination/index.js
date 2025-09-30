/**
 * Pagination Module Exports
 *
 * Barrel export file for the pagination module, providing clean import paths
 * for all pagination-related functionality.
 *
 * USAGE:
 * ```jsx
 * // Controller component (state + UI, simplest):
 * import { PaginationController } from '../shared/pagination';
 *
 * // Hook-based (for complex layouts):
 * import { usePagination, Pagination } from '../shared/pagination';
 *
 * // Or individual imports:
 * import { usePagination } from '../shared/pagination';
 * import { Pagination } from '../shared/pagination';
 * import { PaginationController } from '../shared/pagination';
 * ```
 */

export { default as usePagination } from './usePagination';
export { default as Pagination } from './Pagination';
export { default as PaginationController } from './PaginationController';
