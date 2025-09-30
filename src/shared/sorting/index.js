/**
 * Universal Sorting Subsystem - Public API
 *
 * This module provides a comprehensive sorting solution for React applications
 * with support for multiple data types, nested field paths, custom comparators,
 * and two distinct UI patterns.
 *
 * @module shared/sorting
 * @see /src/shared/sorting/README.md for detailed usage guide
 *
 * Quick Start:
 * ```javascript
 * import { useSorting, SortDropdown, SortableHeader } from '@shared/sorting';
 *
 * const config = {
 *   fields: [
 *     { key: 'name', label: 'Name', type: 'string' },
 *     { key: 'created', label: 'Created', type: 'date' }
 *   ],
 *   uiPattern: 'dropdown-headers',
 *   defaultSort: { field: 'name', direction: 'asc' }
 * };
 *
 * function MyComponent() {
 *   const { activeSort, comparator, setSort, toggleDirection } = useSorting(config);
 *   const sortedData = [...data].sort(comparator);
 *
 *   return (
 *     <div>
 *       <SortDropdown
 *         fields={config.fields}
 *         activeField={activeSort.field}
 *         onFieldChange={setSort}
 *       />
 *       {sortedData.map(item => ...)}
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================================================
// Core Hook
// ============================================================================

/**
 * Primary hook for integrating sorting functionality into React components.
 * Manages sort state and provides a comparator function for data sorting.
 *
 * @function useSorting
 * @param {Object} config - Sort configuration object
 * @param {Array} config.fields - Array of field metadata objects (required)
 * @param {string} config.fields[].key - Unique identifier for the field (required)
 * @param {string} config.fields[].label - Display label for UI components (required)
 * @param {string} config.fields[].type - Data type: 'string', 'number', 'percent', 'date', or 'custom' (required)
 * @param {string} [config.fields[].path] - Dot-notation path for nested values (defaults to key)
 * @param {Function} [config.fields[].comparator] - Custom comparator function (required when type='custom')
 * @param {boolean} [config.fields[].nullsFirst=false] - Sort null values to beginning instead of end
 * @param {Object} [config.defaultSort] - Optional default sort settings
 * @param {string} config.defaultSort.field - Field key to sort by default
 * @param {string} [config.defaultSort.direction='asc'] - Default direction ('asc' or 'desc')
 * @param {string} config.uiPattern - UI pattern: 'dropdown-headers' or 'headers-only' (required)
 * @returns {Object} Sorting API
 * @returns {Object} return.activeSort - Current sort state with field, direction, and fieldConfig
 * @returns {Function} return.comparator - Comparator function ready for Array.sort()
 * @returns {Function} return.setSort - Set active field (resets to 'asc')
 * @returns {Function} return.toggleDirection - Toggle between 'asc' and 'desc'
 * @returns {Function} return.resetToDefault - Reset to default sort or clear sort
 * @returns {Object} return.config - Validated configuration object
 *
 * @example
 * const config = {
 *   fields: [
 *     { key: 'name', label: 'Name', type: 'string' },
 *     { key: 'score', label: 'Score', type: 'number' },
 *     { key: 'date', label: 'Date', type: 'date', path: 'metadata.createdAt' }
 *   ],
 *   uiPattern: 'dropdown-headers',
 *   defaultSort: { field: 'name', direction: 'asc' }
 * };
 *
 * const { activeSort, comparator, setSort, toggleDirection } = useSorting(config);
 * const sortedData = [...data].sort(comparator);
 */
export { useSorting } from './state/useSorting';

// ============================================================================
// UI Components
// ============================================================================

/**
 * Dropdown selector component for choosing which field to sort by.
 * Used in Pattern A (dropdown-headers) where field selection is separate from direction toggling.
 *
 * @component SortDropdown
 * @param {Object} props - Component props
 * @param {Array} props.fields - Array of field metadata objects (same as config.fields)
 * @param {string|null} props.activeField - Currently selected field key (from activeSort.field)
 * @param {Function} props.onFieldChange - Callback when user selects a different field (use setSort)
 * @param {string} [props.label='Sort By'] - Label text displayed above/before dropdown
 * @param {boolean} [props.disabled=false] - Disable dropdown interaction
 * @param {string} [props.className] - Additional CSS class for styling container
 *
 * @example
 * <SortDropdown
 *   fields={config.fields}
 *   activeField={activeSort.field}
 *   onFieldChange={setSort}
 *   label="Sort Datasets By"
 * />
 */
export { default as SortDropdown } from './components/SortDropdown';

/**
 * Column header component with directional sort arrows.
 * Behavior differs based on UI pattern:
 * - Pattern A (dropdown-headers): Shows arrows only on active column, arrow click toggles direction
 * - Pattern B (headers-only): Shows both arrows on all columns, header click activates/toggles sort
 *
 * @component SortableHeader
 * @param {Object} props - Component props
 * @param {string} props.field - Field key this header represents (must match a key in config.fields)
 * @param {string} props.label - Display text for the column header
 * @param {boolean} props.isActive - Whether this field is currently active (use activeSort.field === field)
 * @param {string} props.direction - Current sort direction ('asc' or 'desc', from activeSort.direction)
 * @param {string} props.uiPattern - UI pattern selection ('dropdown-headers' or 'headers-only')
 * @param {Function} [props.onToggle] - Callback for arrow click (Pattern A only, use toggleDirection)
 * @param {Function} [props.onClick] - Callback for header click (Pattern B only, use setSort)
 * @param {string} [props.className] - Additional CSS class for styling
 *
 * @example
 * // Pattern A: Active header with toggle
 * <SortableHeader
 *   field="name"
 *   label="Dataset Name"
 *   isActive={activeSort.field === 'name'}
 *   direction={activeSort.direction}
 *   uiPattern="dropdown-headers"
 *   onToggle={toggleDirection}
 * />
 *
 * @example
 * // Pattern B: Clickable header
 * <SortableHeader
 *   field="name"
 *   label="Dataset Name"
 *   isActive={activeSort.field === 'name'}
 *   direction={activeSort.direction}
 *   uiPattern="headers-only"
 *   onClick={setSort}
 * />
 */
export { default as SortableHeader } from './components/SortableHeader';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Retrieves a nested value from an object using dot-notation path.
 * Useful for custom processing or debugging.
 *
 * @function getNestedValue
 * @param {Object} obj - The object to retrieve the value from
 * @param {string} path - Dot-notation path to the desired value (e.g., "user.address.city")
 * @returns {*} The value at the specified path, or undefined if any intermediate property is missing
 *
 * @example
 * const data = { user: { name: "Alice", address: { city: "NYC" } } };
 * getNestedValue(data, "user.address.city"); // "NYC"
 * getNestedValue(data, "user.phone"); // undefined
 * getNestedValue(data, ""); // data (returns object itself for empty path)
 */
export { getNestedValue } from './utils/helpers';

// ============================================================================
// Type Definitions (for IDE autocomplete and documentation)
// ============================================================================

/**
 * @typedef {Object} SortFieldConfig
 * @property {string} key - Unique identifier for the field (required)
 * @property {string} label - Display label for UI components (required)
 * @property {('string'|'number'|'percent'|'date'|'custom')} type - Data type (required)
 * @property {string} [path] - Dot-notation path for nested values (defaults to key)
 * @property {Function} [comparator] - Custom comparator function (required when type='custom')
 * @property {boolean} [nullsFirst=false] - Sort null values to beginning instead of end
 */

/**
 * @typedef {Object} SortConfig
 * @property {SortFieldConfig[]} fields - Array of field metadata objects (required)
 * @property {('dropdown-headers'|'headers-only')} uiPattern - UI pattern selection (required)
 * @property {Object} [defaultSort] - Optional default sort settings
 * @property {string} defaultSort.field - Field key to sort by default
 * @property {('asc'|'desc')} [defaultSort.direction='asc'] - Default direction
 */

/**
 * @typedef {Object} ActiveSort
 * @property {string|null} field - Currently active field key (null if no sort active)
 * @property {('asc'|'desc')} direction - Current sort direction
 * @property {SortFieldConfig|null} fieldConfig - Full configuration for active field
 */

/**
 * @typedef {Object} SortingAPI
 * @property {ActiveSort} activeSort - Current sort state
 * @property {Function} comparator - Comparator function for Array.sort()
 * @property {Function} setSort - Function to set active field: (fieldKey: string) => void
 * @property {Function} toggleDirection - Function to toggle direction: () => void
 * @property {Function} resetToDefault - Function to reset to default or clear: () => void
 * @property {SortConfig} config - Validated configuration object
 */
