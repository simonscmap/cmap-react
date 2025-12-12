/**
 * Row Count Feature
 *
 * @example
 * initializeRowCounts(shortNames, constraints);
 * <RecalculateAllButton constraints={constraints} />
 * <RowCountCell shortName={shortName} currentConstraints={constraints} />
 */

/**
 * Fetches metadata and estimates row counts. Call when datasets or constraints change.
 * @param {string[]} shortNames - Dataset short names
 * @param {Constraints} [constraints] - Constraint configuration
 */
export { initializeRowCounts } from './state/rowCountCalculationStore';

/**
 * Triggers backend calculation for non-estimable datasets. Returns null if none.
 * @param {Object} props
 * @param {Constraints} props.constraints - Current constraints
 * @param {string} [props.className] - CSS class name
 */
export { default as RecalculateAllButton } from './components/RecalculateAllButton';

/**
 * Displays row count with loading/stale/error states.
 * @param {Object} props
 * @param {string} props.shortName - Dataset short name
 * @param {Constraints} [props.currentConstraints] - Current constraints
 */
export { default as RowCountCell } from './components/RowCountCell';

/** Resets all row count state. Aborts any in-flight backend requests. */
export { clearRowCounts } from './state/rowCountCalculationStore';

/**
 * Re-estimate row counts when constraints change (no new search needed).
 * Uses cached metadata from last search.
 * @param {Constraints} constraints - Current constraint configuration
 */
export { reEstimateWithConstraints } from './state/rowCountCalculationStore';

/** Hook to read original row counts (from catalog DB, before constraints). */
export { useOriginalRowCounts } from './state/rowCountCalculationStore';

/** Hook to read calculated/estimated row counts (after constraints applied). */
export { useCalculatedRowCounts } from './state/rowCountCalculationStore';

/** Hook to read loading state for row count calculations. */
export { useRowCountsLoading } from './state/rowCountCalculationStore';

/** Selector: true if any datasets need recalculation */
export { useHasStaleDatasets } from './state/rowCountCalculationStore';

/** Hook to read the array of stale dataset shortNames */
export { useStaleDatasets } from './state/rowCountCalculationStore';
