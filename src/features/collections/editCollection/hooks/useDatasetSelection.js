import useEditCollectionStore from '../../state/editCollectionStore';

/**
 * Hook for managing dataset selection state in the edit collection feature.
 *
 * This hook provides a convenient interface to the selection-related parts of
 * the editCollectionStore, abstracting away the store internals from components.
 *
 * @returns {Object} Selection state and handlers
 * @property {string[]} selectedDatasets - Array of selected dataset short names
 * @property {boolean} allDatasetsSelected - True if all selectable datasets are selected
 * @property {boolean} isIndeterminate - True if some (but not all) datasets are selected
 * @property {Function} toggleDataset - Toggle selection state of a single dataset
 * @property {Function} selectAll - Select all selectable datasets (excluding marked for removal)
 * @property {Function} clearAll - Clear all selections
 *
 * @example
 * const {
 *   selectedDatasets,
 *   allDatasetsSelected,
 *   isIndeterminate,
 *   toggleDataset,
 *   selectAll,
 *   clearAll
 * } = useDatasetSelection();
 *
 * // Use in SelectAllDropdown component
 * <SelectAllDropdown
 *   areAllSelected={allDatasetsSelected}
 *   areIndeterminate={isIndeterminate}
 *   onSelectAll={selectAll}
 *   onClearAll={clearAll}
 * />
 *
 * // Use in DatasetTableRow component
 * <Checkbox
 *   checked={selectedDatasets.includes(dataset.datasetShortName)}
 *   onChange={() => toggleDataset(dataset.datasetShortName)}
 * />
 */
const useDatasetSelection = () => {
  // Extract selection state from store
  const selectedDatasets = useEditCollectionStore(
    (state) => state.selectedDatasets,
  );

  // Extract computed selection states
  const allDatasetsSelected = useEditCollectionStore((state) =>
    state.allDatasetsSelected(),
  );

  const isIndeterminate = useEditCollectionStore((state) =>
    state.isIndeterminate(),
  );

  // Extract selection action handlers
  const toggleDatasetSelection = useEditCollectionStore(
    (state) => state.toggleDatasetSelection,
  );

  const selectAllDatasets = useEditCollectionStore(
    (state) => state.selectAllDatasets,
  );

  const clearAllSelections = useEditCollectionStore(
    (state) => state.clearAllSelections,
  );

  // Return interface with consistent naming
  return {
    selectedDatasets,
    allDatasetsSelected,
    isIndeterminate,
    toggleDataset: toggleDatasetSelection,
    selectAll: selectAllDatasets,
    clearAll: clearAllSelections,
  };
};

export default useDatasetSelection;
