// Row Count Feature - Public API
// External features (e.g., SpatialTemporalTab) should import from this index

export {
  // Output Hooks
  useRowCountsLoading,
  useStaleDatasets,
  // Input Actions
  calculateRowCounts,
  recalculateStaleDatasets,
  clearRowCounts,
} from './state/rowCountCalculationStore';

export { default as RowCountCell } from './components/RowCountCell';
