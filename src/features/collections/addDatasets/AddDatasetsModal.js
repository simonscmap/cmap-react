import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Box,
  Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import zIndex from '../../../enums/zIndex';
import { useAddDatasetsStore } from './state/addDatasetsStore';
import useCollectionsStore from '../state/collectionsStore';
import CollectionSearchSection from './components/CollectionSearchSection';
import CollectionSummaryCard from './components/CollectionSummaryCard';
import DatasetsTableSection from './components/DatasetsTableSection';
import ConfirmationDialog from '../../../shared/components/ConfirmationDialog';
import UniversalButton from '../../../shared/components/UniversalButton';
import { SearchProvider } from '../../../shared/UniversalSearch';

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    width: '1400px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    backgroundColor: 'rgb(24, 69, 98)',
  },
  dialogRoot: {
    zIndex: `${zIndex.MUI_DIALOG + 1} !important`,
  },
  dialogTitle: {
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(6),
  },
  modalTitle: {
    margin: 0,
    fontWeight: 500,
    fontSize: '1.5rem',
    color: '#8bc34a',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  dialogContent: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    minHeight: '650px', // Tall enough to fit search input + dropdown overlay + some content
    position: 'relative', // Establish positioning context
  },
  tabsRoot: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    marginBottom: theme.spacing(3),
  },
  dialogActions: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    gap: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionCount: {
    color: theme.palette.text.secondary,
  },
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
 * TabPanel component for rendering tab content
 */
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`add-datasets-tabpanel-${index}`}
      aria-labelledby={`add-datasets-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

/**
 * AddDatasetsModal
 *
 * Modal component for adding datasets to a collection.
 * Provides multiple methods for dataset discovery and selection.
 *
 * Props:
 * - open: boolean - Controls modal visibility
 * - onClose: () => void - Called when modal should close
 * - onAddDatasets: (datasets: Dataset[]) => void - Called when datasets are added successfully
 * - currentCollectionDatasets: Dataset[] - Datasets already in the collection being edited
 * - targetCollectionName: string (optional) - Name of the collection being edited (shown in title)
 * - defaultTab: string (optional) - Initial active tab (default: 'collections')
 */
const AddDatasetsModal = ({
  open,
  onClose,
  onAddDatasets,
  currentCollectionDatasets = [],
  targetCollectionName,
  defaultTab = 'collections',
}) => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);
  const [showCloseWarning, setShowCloseWarning] = useState(false);

  // Map defaultTab string to tab index
  const tabMap = {
    collections: 0,
    catalog: 1,
    spatial: 2,
  };

  // Initialize active tab from defaultTab prop
  React.useEffect(() => {
    if (defaultTab && tabMap[defaultTab] !== undefined) {
      setActiveTab(tabMap[defaultTab]);
    }
  }, [defaultTab]);

  // Connect to Zustand stores
  const {
    selectedCollectionId,
    selectedCollectionSummary,
    isLoadingDatasets,
    loadError,
    sourceCollectionDatasets,
    selectedDatasetIds,
    currentCollectionDatasetIds,
    showSwitchCollectionWarning,
    pendingCollectionId,
    openModal,
    closeModal,
    selectCollection,
    loadCollectionDatasets,
    retryLoad,
    toggleDatasetSelection,
    addSelectedDatasets,
    showSwitchWarning,
    confirmSwitch,
    cancelSwitch,
  } = useAddDatasetsStore();

  // Get collections from collectionsStore
  // Combine both user collections and public collections for search
  const userCollections = useCollectionsStore((state) => state.userCollections);
  const publicCollections = useCollectionsStore(
    (state) => state.publicCollections,
  );

  // Combine and deduplicate collections (user might own public collections)
  const allCollections = React.useMemo(() => {
    const seen = new Set();
    const combined = [];

    [...userCollections, ...publicCollections].forEach((collection) => {
      if (!seen.has(collection.id)) {
        seen.add(collection.id);
        combined.push({
          id: collection.id,
          name: collection.name,
          datasetCount: collection.datasetCount || 0,
          isPublic: collection.isPublic || false,
          // Include additional metadata for CollectionSummaryCard
          ownerName: collection.ownerName,
          ownerAffiliation: collection.ownerAffiliation,
          description: collection.description,
          createdDate: collection.createdDate,
        });
      }
    });

    return combined;
  }, [userCollections, publicCollections]);

  // Effect: Initialize modal when opened
  React.useEffect(() => {
    if (open) {
      openModal(currentCollectionDatasets);
    }
  }, [open, currentCollectionDatasets, openModal]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  /**
   * handleClose - Handle modal close request with selection check
   * Contract: AddDatasetsModal.contract.md lines 237-246
   */
  const handleClose = () => {
    // Check if there are any selections
    if (selectedDatasetIds.size > 0) {
      // Show confirmation dialog
      setShowCloseWarning(true);
    } else {
      // No selections, close immediately
      closeModal();
      onClose();
    }
  };

  /**
   * handleConfirmClose - Close modal and discard selections
   * Contract: AddDatasetsModal.contract.md lines 249-256
   */
  const handleConfirmClose = () => {
    closeModal();
    setShowCloseWarning(false);
    onClose();
  };

  /**
   * handleCancelClose - Cancel close operation and keep modal open
   */
  const handleCancelClose = () => {
    setShowCloseWarning(false);
  };

  /**
   * handleConfirmSwitch - Confirm collection switch and load pending collection
   * Contract: AddDatasetsModal.contract.md lines 260-271
   */
  const handleConfirmSwitch = () => {
    const state = useAddDatasetsStore.getState();
    const { pendingCollectionId } = state;

    if (pendingCollectionId) {
      // Find the pending collection from allCollections
      const pendingCollection = allCollections.find(
        (c) => c.id === pendingCollectionId,
      );

      if (pendingCollection) {
        // Confirm switch (clears selections and hides warning)
        confirmSwitch();

        // Select the pending collection
        const summary = {
          id: pendingCollection.id,
          name: pendingCollection.name,
          datasetCount: pendingCollection.datasetCount || 0,
          isPublic: pendingCollection.isPublic || false,
        };
        selectCollection(pendingCollectionId, summary);
      }
    }
  };

  /**
   * handleCancelSwitch - Cancel collection switch and keep current collection
   */
  const handleCancelSwitch = () => {
    cancelSwitch();
  };

  /**
   * handleSelectCollection - Handle collection selection with confirmation logic
   * Contract: AddDatasetsModal.contract.md lines 260-271
   *
   * @param {number} collectionId - ID of selected collection
   * @param {object} summary - Collection summary from search (contains id, name, datasetCount, isPublic)
   */
  const handleSelectCollection = (collectionId, summary) => {
    // Check if there are any selections
    if (selectedDatasetIds.size > 0) {
      // Show confirmation dialog for switching collections
      showSwitchWarning(collectionId);
    } else {
      // No selections, set the collection immediately
      selectCollection(collectionId, summary);
    }
  };

  // Handler for loading collection datasets
  const handleLoadCollection = async () => {
    await loadCollectionDatasets();
  };

  // Handler for retrying failed load
  const handleRetryLoad = async () => {
    await retryLoad();
  };

  // Handler for toggling dataset selection
  const handleToggleDataset = (datasetShortName) => {
    toggleDatasetSelection(datasetShortName);
  };

  // Handler for adding selected datasets
  const handleAddSelected = () => {
    addSelectedDatasets((datasets) => {
      onAddDatasets(datasets);
    });
  };

  // Transform selectedCollectionSummary to match CollectionSummaryCard's expected format
  // This includes additional metadata like creator info and description
  const cardSummary = React.useMemo(() => {
    if (!selectedCollectionSummary) {
      return null;
    }

    // Find the full collection object from allCollections to get all metadata
    const fullCollection = allCollections.find(
      (c) => c.id === selectedCollectionSummary.id,
    );

    const totalDatasets = selectedCollectionSummary.datasetCount || 0;

    // Base data from selectedCollectionSummary
    const baseData = {
      collectionName: selectedCollectionSummary.name,
      isPublic: selectedCollectionSummary.isPublic || false,
      // Additional fields that might be in the collection object
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
    allCollections,
  ]);

  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      classes={{ paper: classes.dialogPaper, root: classes.dialogRoot }}
      aria-labelledby="add-datasets-dialog-title"
      aria-describedby="add-datasets-dialog-description"
      aria-modal="true"
      disableScrollLock={true}
      maxWidth={false}
    >
      <DialogTitle
        id="add-datasets-dialog-title"
        className={classes.dialogTitle}
      >
        <Typography variant="h4" component="div" className={classes.modalTitle}>
          Add Datasets to Collection
          {targetCollectionName && `: ${targetCollectionName}`}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          className={classes.closeButton}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className={classes.tabsRoot}
          indicatorColor="primary"
          textColor="primary"
          aria-label="add datasets tabs"
        >
          <Tab label="From Collections" id="add-datasets-tab-0" />
          <Tab label="Catalog Filtering" id="add-datasets-tab-1" disabled />
          <Tab
            label="Spatial-Temporal Overlap"
            id="add-datasets-tab-2"
            disabled
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box className={classes.searchAndButtonRow}>
            <Box className={classes.searchContainer}>
              <SearchProvider items={allCollections} searchKeys={['name']}>
                <CollectionSearchSection
                  collections={allCollections}
                  selectedCollectionId={selectedCollectionId}
                  onSelectCollection={handleSelectCollection}
                />
              </SearchProvider>
            </Box>
            <UniversalButton
              variant="primary"
              size="large"
              onClick={loadError ? handleRetryLoad : handleLoadCollection}
              disabled={!selectedCollectionId || isLoadingDatasets}
            >
              {isLoadingDatasets
                ? 'LOADING...'
                : loadError
                  ? 'RETRY'
                  : 'LOAD COLLECTION'}
            </UniversalButton>
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
            onToggleSelection={handleToggleDataset}
            isLoading={isLoadingDatasets}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography>
            Catalog filtering will be available in a future release
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography>
            Spatial-temporal overlap will be available in a future release
          </Typography>
        </TabPanel>
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Typography variant="body2" className={classes.selectionCount}>
          {selectedDatasetIds.size} dataset
          {selectedDatasetIds.size !== 1 ? 's' : ''} selected
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <UniversalButton onClick={handleClose} variant="default" size="large">
            CANCEL
          </UniversalButton>
          <UniversalButton
            onClick={handleAddSelected}
            variant="primary"
            size="large"
            disabled={selectedDatasetIds.size === 0}
          >
            ADD VALID DATASETS ({selectedDatasetIds.size})
          </UniversalButton>
        </Box>
      </DialogActions>

      {/* Close with selections confirmation dialog */}
      <ConfirmationDialog
        open={showCloseWarning}
        onClose={handleCancelClose}
        title="Discard selection?"
        message="You have selected datasets that have not been added. Closing now will discard your selection."
        actions={[
          {
            label: 'Cancel',
            onClick: handleCancelClose,
            variant: 'primary',
            autoFocus: true,
          },
          {
            label: 'Discard',
            onClick: handleConfirmClose,
            variant: 'secondary',
          },
        ]}
      />

      {/* Switch collection confirmation dialog */}
      <ConfirmationDialog
        open={showSwitchCollectionWarning}
        onClose={handleCancelSwitch}
        title="Discard selection?"
        message="Switching to a different collection will discard your current selection. Do you want to continue?"
        actions={[
          {
            label: 'Cancel',
            onClick: handleCancelSwitch,
            variant: 'primary',
            autoFocus: true,
          },
          {
            label: 'Discard',
            onClick: handleConfirmSwitch,
            variant: 'secondary',
          },
        ]}
      />
    </Dialog>
  );
};

export default AddDatasetsModal;
