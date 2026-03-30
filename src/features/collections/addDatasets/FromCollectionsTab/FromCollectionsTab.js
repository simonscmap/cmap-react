import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CollectionSearchSection from '../components/CollectionSearchSection';
import CollectionSummaryCard from '../components/CollectionSummaryCard';
import DatasetsTableSection from '../components/DatasetsTableSection';
import { SearchProvider } from '../../../../shared/UniversalSearch';

const useStyles = makeStyles((theme) => ({
  searchAndButtonRow: {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  searchContainer: {
    flex: 1,
  },
}));

/**
 * FromCollectionsTab Component
 *
 * **Purpose:**
 * Provides a UI for adding datasets to a collection by selecting from existing collections.
 * This component encapsulates the full workflow: search collections → load collection datasets → select datasets.
 *
 * **Integration Pattern:**
 * This component serves as a template for other tabs in the AddDatasetsModal.
 * Each tab should follow the same integration pattern:
 * 1. Receive state and handlers from parent as props (no direct store access)
 * 2. Manage local UI state only (search queries, loading states, etc.)
 * 3. Call parent handlers for all state mutations
 * 4. Return selection state to parent via callbacks
 *
 * **Data Flow:**
 * ```
 * Parent (AddDatasetsModal)
 *   ↓ props: collections, selectedDatasetIds, handlers
 * FromCollectionsTab (this component)
 *   ↓ user interactions: search, select, load
 *   ↑ callbacks: onSelectCollection, onToggleSelection
 * Parent updates store
 * ```
 *
 * **Props:**
 * @param {Object[]} collections - Array of all available collections to search from
 * @param {number} collections[].id - Unique collection identifier
 * @param {string} collections[].name - Collection name
 * @param {number} collections[].datasetCount - Number of datasets in collection
 * @param {boolean} collections[].isPublic - Whether collection is public
 * @param {string} [collections[].ownerName] - Collection owner name
 * @param {string} [collections[].ownerAffiliation] - Collection owner affiliation
 * @param {string} [collections[].description] - Collection description
 * @param {string} [collections[].createdDate] - ISO date string of creation
 *
 * @param {number|null} selectedCollectionId - Currently selected collection ID
 * @param {Object|null} selectedCollectionSummary - Summary of selected collection
 * @param {number} selectedCollectionSummary.id - Collection ID
 * @param {string} selectedCollectionSummary.name - Collection name
 * @param {number} selectedCollectionSummary.datasetCount - Dataset count
 * @param {boolean} selectedCollectionSummary.isPublic - Public flag
 *
 * @param {Object[]|null} sourceCollectionDatasets - Loaded datasets from selected collection
 * @param {string} sourceCollectionDatasets[].shortName - Dataset short name (unique identifier)
 * @param {boolean} [sourceCollectionDatasets[].isInvalid] - Whether dataset is invalid/deprecated
 * @param {Set<string>} selectedDatasetIds - Set of selected dataset short names
 * @param {Set<string>} currentCollectionDatasetIds - Set of dataset short names already in target collection
 *
 * @param {boolean} isLoadingDatasets - Whether collection datasets are currently loading
 * @param {string|null} loadError - Error message from failed load operation
 *
 * @param {(collectionId: number, summary: Object) => void} onSelectCollection
 *   Called when user selects a collection from search results.
 *   Parent should update selectedCollectionId and selectedCollectionSummary.
 *
 * @param {() => Promise<void>} onLoadCollection
 *   Called when user clicks "LOAD COLLECTION" button.
 *   Parent should fetch collection datasets and update sourceCollectionDatasets.
 *
 * @param {() => Promise<void>} onRetryLoad
 *   Called when user clicks "RETRY" after failed load.
 *   Parent should retry fetching collection datasets.
 *
 * @param {(datasetShortName: string) => void} onToggleSelection
 *   Called when user toggles dataset selection in table.
 *   Parent should add/remove dataset short name from selectedDatasetIds.
 *
 * **Example Usage:**
 * ```jsx
 * <FromCollectionsTab
 *   collections={allCollections}
 *   selectedCollectionId={selectedCollectionId}
 *   selectedCollectionSummary={selectedCollectionSummary}
 *   sourceCollectionDatasets={sourceCollectionDatasets}
 *   selectedDatasetIds={selectedDatasetIds}
 *   currentCollectionDatasetIds={currentCollectionDatasetIds}
 *   isLoadingDatasets={isLoadingDatasets}
 *   loadError={loadError}
 *   onSelectCollection={handleSelectCollection}
 *   onLoadCollection={handleLoadCollection}
 *   onRetryLoad={handleRetryLoad}
 *   onToggleSelection={handleToggleDataset}
 * />
 * ```
 *
 * **State Management:**
 * - Parent component manages all persistent state via Zustand store
 * - This component only manages transient UI state (e.g., search query in SearchProvider)
 * - All mutations flow through parent handlers to maintain single source of truth
 *
 * **Sibling Tab Implementation:**
 * When implementing other tabs (e.g., CatalogFilteringTab, SpatialTemporalTab):
 * 1. Follow this same prop-based integration pattern
 * 2. Accept collections/datasets data as props (not from store directly)
 * 3. Accept selection state (selectedDatasetIds, currentCollectionDatasetIds)
 * 4. Provide callbacks for mutations (onToggleSelection, etc.)
 * 5. Let parent handle all store interactions and side effects
 */
const FromCollectionsTab = ({
  collections,
  selectedCollectionId,
  selectedCollectionSummary,
  sourceCollectionDatasets,
  selectedDatasetIds,
  currentCollectionDatasetIds,
  isLoadingDatasets,
  loadError,
  onSelectCollection,
  onToggleSelection,
}) => {
  const classes = useStyles();

  // Transform selectedCollectionSummary to match CollectionSummaryCard's expected format
  const cardSummary = React.useMemo(() => {
    if (!selectedCollectionSummary) {
      return null;
    }

    // Find the full collection object to get all metadata
    const fullCollection = collections.find(
      (c) => c.id === selectedCollectionSummary.id,
    );

    const totalDatasets = selectedCollectionSummary.datasetCount || 0;

    // Base data from selectedCollectionSummary
    const baseData = {
      collectionName: selectedCollectionSummary.name,
      isPublic: selectedCollectionSummary.isPublic || false,
      creatorName: fullCollection?.ownerName || 'Unknown',
      creatorAffiliation: fullCollection?.ownerAffiliation || null,
      description: fullCollection?.description || null,
      createdDate: fullCollection?.createdDate || null,
    };

    if (!sourceCollectionDatasets) {
      return {
        ...baseData,
        totalDatasets,
        validDatasets: totalDatasets,
        alreadyInCollection: 0,
        invalidDatasets: 0,
      };
    }

    // Count datasets by category
    const invalidDatasets = sourceCollectionDatasets.filter(
      (d) => d.isInvalid === true,
    ).length;

    const alreadyInCollection = sourceCollectionDatasets.filter(
      (d) =>
        d.isInvalid !== true && currentCollectionDatasetIds.has(d.shortName),
    ).length;

    const validDatasets = sourceCollectionDatasets.filter(
      (d) =>
        d.isInvalid !== true && !currentCollectionDatasetIds.has(d.shortName),
    ).length;

    return {
      ...baseData,
      totalDatasets,
      validDatasets,
      alreadyInCollection,
      invalidDatasets,
    };
  }, [
    selectedCollectionSummary,
    sourceCollectionDatasets,
    currentCollectionDatasetIds,
    collections,
  ]);

  return (
    <>
      <Box className={classes.searchAndButtonRow}>
        <Box className={classes.searchContainer}>
          <SearchProvider
            items={collections}
            searchKeys={['name', 'description', 'ownerName', 'ownerAffiliation']}
            activationThreshold={2}
          >
            <CollectionSearchSection
              collections={collections}
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={onSelectCollection}
            />
          </SearchProvider>
        </Box>
      </Box>

      {sourceCollectionDatasets && (
        <CollectionSummaryCard
          summary={cardSummary}
          isLoading={isLoadingDatasets}
          loadError={loadError}
        />
      )}

      <DatasetsTableSection
        datasets={sourceCollectionDatasets}
        selectedDatasetIds={selectedDatasetIds}
        currentCollectionDatasetIds={currentCollectionDatasetIds}
        onToggleSelection={onToggleSelection}
        isLoading={isLoadingDatasets}
        emptyMessage="Search and select a collection above to see its datasets."
      />
    </>
  );
};

export default FromCollectionsTab;
