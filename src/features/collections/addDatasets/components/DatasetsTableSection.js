import React from 'react';
import PropTypes from 'prop-types';
import CollectionDatasetsTable from '../../components/CollectionDatasetsTable';

/**
 * DatasetsTableSection Component
 *
 * Responsibilities:
 * - Render CollectionDatasetsTable with validation states
 * - Handle checkbox selection logic
 * - Apply row styling based on validation state
 *
 * Row Styling Logic:
 * - Invalid dataset: Yellow background, warning icon, checkbox disabled
 * - Already in collection: Gray tint, disabled, checkbox hidden
 * - Valid dataset: Normal styling, selectable
 *
 * @param {Object} props
 * @param {Array|null} props.datasets - Loaded datasets (null until loaded)
 * @param {Set} props.selectedDatasetIds - Set of selected dataset short names
 * @param {Set} props.currentCollectionDatasetIds - Dataset IDs already in collection (for de-duplication)
 * @param {Function} props.onToggleSelection - Callback when dataset checkbox is toggled
 * @param {boolean} props.isLoading - True while datasets are loading
 */
const DatasetsTableSection = ({
  datasets,
  selectedDatasetIds,
  currentCollectionDatasetIds,
  onToggleSelection,
  isLoading,
}) => {
  /**
   * getRowClass - Determine row styling class based on dataset state
   * Contract: AddDatasetsModal.contract.md lines 172-182
   *
   * @param {Object} dataset - Dataset object
   * @returns {string} CSS class name for the row
   */
  const getRowClass = (dataset) => {
    // Priority 1: Invalid datasets (yellow background)
    if (dataset.isInvalid === true) {
      return 'invalidRow';
    }

    // Priority 2: Datasets already in collection (gray, disabled)
    if (currentCollectionDatasetIds.has(dataset.shortName)) {
      return 'alreadyPresentRow';
    }

    // Default: Normal selectable row
    return 'normalRow';
  };

  // Convert Set to array for CollectionDatasetsTable
  const selectedDatasetsArray = Array.from(selectedDatasetIds);

  // Compute selection count
  const selectedCount = selectedDatasetIds.size;

  // Extract dataset short names for CollectionDatasetsTable, filtering out undefined/null values
  // If datasets is null, use empty array to show table structure
  const datasetShortNames = datasets
    ? datasets
        .map((d) => d.shortName)
        .filter((name) => name !== undefined && name !== null && name !== '')
    : [];

  return (
    <CollectionDatasetsTable
      datasetShortNames={datasetShortNames}
      data={datasets}
      emptyMessage="No datasets loaded. Click 'LOAD COLLECTION' to fetch data."
      selectedDatasets={selectedDatasetsArray}
      onToggleSelection={onToggleSelection}
      onSelectAll={() => {
        // Select all valid datasets (not invalid, not already in collection)
        if (datasets) {
          datasets.forEach((dataset) => {
            if (
              dataset.isInvalid !== true &&
              !currentCollectionDatasetIds.has(dataset.shortName) &&
              !selectedDatasetIds.has(dataset.shortName)
            ) {
              onToggleSelection(dataset.shortName);
            }
          });
        }
      }}
      onClearAll={() => {
        // Clear all selections
        selectedDatasetsArray.forEach((shortName) => {
          onToggleSelection(shortName);
        });
      }}
      areAllSelected={
        datasets
          ? datasets.filter(
              (d) =>
                d.isInvalid !== true &&
                !currentCollectionDatasetIds.has(d.shortName),
            ).length === selectedCount && selectedCount > 0
          : false
      }
      areIndeterminate={
        datasets
          ? selectedCount > 0 &&
            datasets.filter(
              (d) =>
                d.isInvalid !== true &&
                !currentCollectionDatasetIds.has(d.shortName),
            ).length !== selectedCount
          : false
      }
      rowClassGetter={getRowClass}
      columns={['status', 'name', 'type', 'region', 'dateRange', 'rows']}
      maxHeight={400}
    />
  );
};

DatasetsTableSection.propTypes = {
  datasets: PropTypes.array,
  selectedDatasetIds: PropTypes.instanceOf(Set).isRequired,
  currentCollectionDatasetIds: PropTypes.instanceOf(Set).isRequired,
  onToggleSelection: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

DatasetsTableSection.defaultProps = {
  datasets: null,
};

export default DatasetsTableSection;
