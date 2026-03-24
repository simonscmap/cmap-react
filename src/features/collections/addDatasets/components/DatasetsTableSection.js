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
 * @param {string} props.emptyMessage - Message shown when no datasets
 */
const DatasetsTableSection = ({
  datasets,
  selectedDatasetIds,
  currentCollectionDatasetIds,
  onToggleSelection,
  isLoading,
  emptyMessage,
}) => {
  // Convert Set to array for CollectionDatasetsTable
  const selectedDatasetsArray = Array.from(selectedDatasetIds);

  // Compute selection count
  const selectedCount = selectedDatasetIds.size;

  // Pre-calculate row states for table rendering
  // This transforms dataset short names with row state information for styling
  const datasetShortNamesWithStates = datasets
    ? datasets
        .map((dataset) => {
          let rowState = 'normal';

          // Priority 1: Invalid datasets (yellow background)
          if (dataset.isInvalid === true) {
            rowState = 'invalid';
          }
          // Priority 2: Datasets already in collection (gray, disabled)
          else if (currentCollectionDatasetIds.has(dataset.shortName)) {
            rowState = 'alreadyPresent';
          }

          return {
            shortName: dataset.shortName,
            rowState,
          };
        })
        .filter(
          (item) =>
            item.shortName !== undefined &&
            item.shortName !== null &&
            item.shortName !== '',
        )
    : [];

  return (
    <CollectionDatasetsTable
      datasetShortNamesWithStates={datasetShortNamesWithStates}
      data={datasets}
      emptyMessage={emptyMessage}
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
      // 'rows' column definition commented out in CollectionDatasetsTable
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
  emptyMessage: PropTypes.string,
};

DatasetsTableSection.defaultProps = {
  datasets: null,
  emptyMessage: 'No datasets to display.',
};

export default DatasetsTableSection;
