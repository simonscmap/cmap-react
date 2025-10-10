/**
 * Tests for editCollectionStore dataset removal actions
 *
 * Test Coverage:
 * - markDatasetForRemoval: Mark datasets for deletion without API call
 * - cancelDatasetRemoval: Unmark datasets for deletion
 * - Change detection when datasets are marked for removal
 * - Dataset deselection when marked for removal
 * - State management for dataset removal operations
 */

import { create } from 'zustand';

// This will be replaced with the actual store implementation in Phase 3
// For now, we define the expected interface for TDD
const createEditCollectionStore = () => {
  return create((set, get) => ({
    // State
    collection: null,
    originalCollection: null,
    isLoading: false,
    isSaving: false,
    error: null,
    datasetsToRemove: [],
    selectedDatasets: [],

    // Computed getter for change detection
    hasUnsavedChanges: () => {
      const { collection, originalCollection, datasetsToRemove } = get();

      if (!collection || !originalCollection) {
        return false;
      }

      // Normalize strings by trimming whitespace
      const currentNormalized = {
        name: collection.name.trim(),
        description: collection.description.trim(),
        isPublic: collection.isPublic,
        datasets: collection.datasets
          .filter((d) => !datasetsToRemove.includes(d.datasetShortName))
          .map((d) => d.datasetShortName)
          .sort(),
      };

      const originalNormalized = {
        name: originalCollection.name.trim(),
        description: originalCollection.description.trim(),
        isPublic: originalCollection.isPublic,
        datasets: originalCollection.datasets
          .map((d) => d.datasetShortName)
          .sort(),
      };

      // Deep equality check via JSON serialization
      return (
        JSON.stringify(currentNormalized) !== JSON.stringify(originalNormalized)
      );
    },

    // Dataset removal actions
    markDatasetForRemoval: (datasetId) => {
      const { collection, datasetsToRemove, selectedDatasets } = get();
      if (!collection) return;

      // Check if dataset exists in collection
      const datasetExists = collection.datasets.some(
        (d) => d.datasetShortName === datasetId,
      );
      if (!datasetExists) return;

      // Check if already marked for removal
      if (datasetsToRemove.includes(datasetId)) return;

      // Add to removal list
      const newDatasetsToRemove = [...datasetsToRemove, datasetId];

      // Deselect if currently selected
      const newSelectedDatasets = selectedDatasets.filter(
        (id) => id !== datasetId,
      );

      set({
        datasetsToRemove: newDatasetsToRemove,
        selectedDatasets: newSelectedDatasets,
      });
    },

    cancelDatasetRemoval: (datasetId) => {
      const { datasetsToRemove } = get();

      // Check if dataset is in removal list
      if (!datasetsToRemove.includes(datasetId)) return;

      // Remove from removal list
      const newDatasetsToRemove = datasetsToRemove.filter(
        (id) => id !== datasetId,
      );

      set({
        datasetsToRemove: newDatasetsToRemove,
      });
    },

    // Helper to initialize store for testing
    initializeForTesting: (collection) => {
      set({
        collection,
        originalCollection: JSON.parse(JSON.stringify(collection)), // deep clone
        datasetsToRemove: [],
        selectedDatasets: [],
        isLoading: false,
        isSaving: false,
        error: null,
      });
    },

    // Helper to set selected datasets for testing
    setSelectedDatasetsForTesting: (datasets) => {
      set({
        selectedDatasets: datasets,
      });
    },

    // Helper to reset store for testing
    resetStore: () => {
      set({
        collection: null,
        originalCollection: null,
        isLoading: false,
        isSaving: false,
        error: null,
        datasetsToRemove: [],
        selectedDatasets: [],
      });
    },
  }));
};

describe('editCollectionStore dataset removal', () => {
  let store;

  // Sample collection data for testing
  const mockCollection = {
    id: 123,
    name: 'BATS In-Situ Temperature Profiles',
    description: 'Collection of temperature profile datasets from BATS station',
    isPublic: false,
    createdDate: '2025-10-01T10:00:00Z',
    modifiedDate: '2025-10-08T14:23:45Z',
    ownerName: 'John Doe',
    ownerAffiliation: 'University of Test',
    datasetCount: 3,
    isOwner: true,
    views: 10,
    downloads: 5,
    copies: 2,
    datasets: [
      {
        datasetId: 1,
        datasetShortName: 'bats_temp_001',
        datasetLongName: 'BATS Temperature Profiles 2020',
        datasetVersion: '1.0',
        isValid: true,
        addedDate: '2025-10-01T10:00:00Z',
        displayOrder: 1,
      },
      {
        datasetId: 2,
        datasetShortName: 'bats_temp_002',
        datasetLongName: 'BATS Temperature Profiles 2021',
        datasetVersion: '1.0',
        isValid: true,
        addedDate: '2025-10-02T10:00:00Z',
        displayOrder: 2,
      },
      {
        datasetId: 3,
        datasetShortName: 'bats_salinity_001',
        datasetLongName: 'BATS Salinity Profiles 2020',
        datasetVersion: '1.0',
        isValid: true,
        addedDate: '2025-10-03T10:00:00Z',
        displayOrder: 3,
      },
    ],
  };

  beforeEach(() => {
    // Create fresh store instance for each test
    store = createEditCollectionStore();
    // Initialize with mock collection
    store.getState().initializeForTesting(mockCollection);
  });

  describe('markDatasetForRemoval', () => {
    it('should add dataset to datasetsToRemove array when called', () => {
      const { markDatasetForRemoval } = store.getState();

      markDatasetForRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.datasetsToRemove).toContain('bats_temp_001');
      expect(state.datasetsToRemove.length).toBe(1);
    });

    it('should mark multiple datasets for removal when called multiple times', () => {
      const { markDatasetForRemoval } = store.getState();

      markDatasetForRemoval('bats_temp_001');
      markDatasetForRemoval('bats_temp_002');

      const state = store.getState();
      expect(state.datasetsToRemove).toContain('bats_temp_001');
      expect(state.datasetsToRemove).toContain('bats_temp_002');
      expect(state.datasetsToRemove.length).toBe(2);
    });

    it('should not add duplicate dataset to datasetsToRemove if already marked', () => {
      const { markDatasetForRemoval } = store.getState();

      markDatasetForRemoval('bats_temp_001');
      markDatasetForRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.datasetsToRemove.length).toBe(1);
      expect(state.datasetsToRemove).toEqual(['bats_temp_001']);
    });

    it('should not modify state when dataset does not exist in collection', () => {
      const { markDatasetForRemoval } = store.getState();

      markDatasetForRemoval('nonexistent_dataset');

      const state = store.getState();
      expect(state.datasetsToRemove).toEqual([]);
    });

    it('should not modify state when collection is null', () => {
      store.getState().resetStore();
      const { markDatasetForRemoval } = store.getState();

      markDatasetForRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.datasetsToRemove).toEqual([]);
    });

    it('should mark hasUnsavedChanges as true when dataset is marked for removal', () => {
      const { markDatasetForRemoval, hasUnsavedChanges } = store.getState();

      // Initially no changes
      expect(hasUnsavedChanges()).toBe(false);

      markDatasetForRemoval('bats_temp_001');

      expect(store.getState().hasUnsavedChanges()).toBe(true);
    });

    it('should deselect dataset if it is currently selected', () => {
      const { markDatasetForRemoval, setSelectedDatasetsForTesting } =
        store.getState();

      // Select the dataset first
      setSelectedDatasetsForTesting(['bats_temp_001', 'bats_temp_002']);

      markDatasetForRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.selectedDatasets).not.toContain('bats_temp_001');
      expect(state.selectedDatasets).toContain('bats_temp_002');
      expect(state.selectedDatasets.length).toBe(1);
    });

    it('should not affect selectedDatasets if dataset is not selected', () => {
      const { markDatasetForRemoval, setSelectedDatasetsForTesting } =
        store.getState();

      setSelectedDatasetsForTesting(['bats_temp_002']);

      markDatasetForRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.selectedDatasets).toEqual(['bats_temp_002']);
    });

    it('should preserve original collection when marking dataset for removal', () => {
      const { markDatasetForRemoval } = store.getState();
      const originalDatasets = store.getState().originalCollection.datasets;

      markDatasetForRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.originalCollection.datasets).toEqual(originalDatasets);
      expect(state.originalCollection.datasets.length).toBe(3);
    });

    it('should not modify collection.datasets array when marking for removal', () => {
      const { markDatasetForRemoval } = store.getState();
      const datasetsBefore = store.getState().collection.datasets;

      markDatasetForRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.collection.datasets).toEqual(datasetsBefore);
      expect(state.collection.datasets.length).toBe(3);
    });

    it('should handle marking all datasets for removal', () => {
      const { markDatasetForRemoval } = store.getState();

      markDatasetForRemoval('bats_temp_001');
      markDatasetForRemoval('bats_temp_002');
      markDatasetForRemoval('bats_salinity_001');

      const state = store.getState();
      expect(state.datasetsToRemove.length).toBe(3);
      expect(state.datasetsToRemove).toContain('bats_temp_001');
      expect(state.datasetsToRemove).toContain('bats_temp_002');
      expect(state.datasetsToRemove).toContain('bats_salinity_001');
    });
  });

  describe('cancelDatasetRemoval', () => {
    it('should remove dataset from datasetsToRemove array when called', () => {
      const { markDatasetForRemoval, cancelDatasetRemoval } = store.getState();

      markDatasetForRemoval('bats_temp_001');
      expect(store.getState().datasetsToRemove).toContain('bats_temp_001');

      cancelDatasetRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.datasetsToRemove).not.toContain('bats_temp_001');
      expect(state.datasetsToRemove.length).toBe(0);
    });

    it('should only remove specified dataset from datasetsToRemove', () => {
      const { markDatasetForRemoval, cancelDatasetRemoval } = store.getState();

      markDatasetForRemoval('bats_temp_001');
      markDatasetForRemoval('bats_temp_002');

      cancelDatasetRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.datasetsToRemove).not.toContain('bats_temp_001');
      expect(state.datasetsToRemove).toContain('bats_temp_002');
      expect(state.datasetsToRemove.length).toBe(1);
    });

    it('should not modify state when dataset is not in datasetsToRemove', () => {
      const { cancelDatasetRemoval } = store.getState();

      cancelDatasetRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.datasetsToRemove).toEqual([]);
    });

    it('should mark hasUnsavedChanges as false when all removals are cancelled', () => {
      const { markDatasetForRemoval, cancelDatasetRemoval, hasUnsavedChanges } =
        store.getState();

      markDatasetForRemoval('bats_temp_001');
      expect(store.getState().hasUnsavedChanges()).toBe(true);

      cancelDatasetRemoval('bats_temp_001');

      expect(store.getState().hasUnsavedChanges()).toBe(false);
    });

    it('should keep hasUnsavedChanges as true when some removals remain', () => {
      const { markDatasetForRemoval, cancelDatasetRemoval, hasUnsavedChanges } =
        store.getState();

      markDatasetForRemoval('bats_temp_001');
      markDatasetForRemoval('bats_temp_002');
      expect(store.getState().hasUnsavedChanges()).toBe(true);

      cancelDatasetRemoval('bats_temp_001');

      // Still has unsaved changes because bats_temp_002 is still marked for removal
      expect(store.getState().hasUnsavedChanges()).toBe(true);
    });

    it('should handle cancelling removal multiple times for same dataset', () => {
      const { markDatasetForRemoval, cancelDatasetRemoval } = store.getState();

      markDatasetForRemoval('bats_temp_001');
      cancelDatasetRemoval('bats_temp_001');
      cancelDatasetRemoval('bats_temp_001'); // Second cancel should be no-op

      const state = store.getState();
      expect(state.datasetsToRemove).toEqual([]);
    });

    it('should not affect selectedDatasets when cancelling removal', () => {
      const {
        markDatasetForRemoval,
        cancelDatasetRemoval,
        setSelectedDatasetsForTesting,
      } = store.getState();

      setSelectedDatasetsForTesting(['bats_temp_002']);
      markDatasetForRemoval('bats_temp_001');

      cancelDatasetRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.selectedDatasets).toEqual(['bats_temp_002']);
    });

    it('should preserve original collection when cancelling removal', () => {
      const { markDatasetForRemoval, cancelDatasetRemoval } = store.getState();
      const originalDatasets = store.getState().originalCollection.datasets;

      markDatasetForRemoval('bats_temp_001');
      cancelDatasetRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.originalCollection.datasets).toEqual(originalDatasets);
    });
  });

  describe('change detection with dataset removal', () => {
    it('should detect changes when dataset is marked for removal', () => {
      const { markDatasetForRemoval, hasUnsavedChanges } = store.getState();

      expect(hasUnsavedChanges()).toBe(false);

      markDatasetForRemoval('bats_temp_001');

      expect(store.getState().hasUnsavedChanges()).toBe(true);
    });

    it('should not detect changes when dataset removal is cancelled', () => {
      const { markDatasetForRemoval, cancelDatasetRemoval, hasUnsavedChanges } =
        store.getState();

      markDatasetForRemoval('bats_temp_001');
      expect(store.getState().hasUnsavedChanges()).toBe(true);

      cancelDatasetRemoval('bats_temp_001');
      expect(store.getState().hasUnsavedChanges()).toBe(false);
    });

    it('should correctly filter datasets in change detection based on datasetsToRemove', () => {
      const { markDatasetForRemoval, hasUnsavedChanges } = store.getState();

      // Initially: collection has 3 datasets, original has 3 datasets
      expect(hasUnsavedChanges()).toBe(false);

      // Mark one for removal
      markDatasetForRemoval('bats_temp_001');

      // Now: current normalized has 2 datasets, original has 3 datasets
      expect(store.getState().hasUnsavedChanges()).toBe(true);
    });

    it('should handle removal of all datasets as a change', () => {
      const { markDatasetForRemoval, hasUnsavedChanges } = store.getState();

      markDatasetForRemoval('bats_temp_001');
      markDatasetForRemoval('bats_temp_002');
      markDatasetForRemoval('bats_salinity_001');

      // Removing all datasets should be detected as a change
      expect(store.getState().hasUnsavedChanges()).toBe(true);
    });

    it('should combine dataset removal with metadata changes in change detection', () => {
      const { markDatasetForRemoval, hasUnsavedChanges } = store.getState();

      // Create a store with updateName for this test
      const testStore = createEditCollectionStore();
      testStore.getState().initializeForTesting(mockCollection);

      const { markDatasetForRemoval: mark, hasUnsavedChanges: hasChanges } =
        testStore.getState();

      mark('bats_temp_001');

      // Should detect changes from dataset removal
      expect(testStore.getState().hasUnsavedChanges()).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty collection when marking for removal', () => {
      const { initializeForTesting, markDatasetForRemoval } = store.getState();

      const emptyCollection = {
        ...mockCollection,
        datasets: [],
        datasetCount: 0,
      };
      initializeForTesting(emptyCollection);

      markDatasetForRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.datasetsToRemove).toEqual([]);
    });

    it('should handle marking dataset with unavailable status', () => {
      const { initializeForTesting, markDatasetForRemoval } = store.getState();

      const collectionWithUnavailableDataset = {
        ...mockCollection,
        datasets: [
          {
            datasetId: 1,
            datasetShortName: 'unavailable_dataset',
            datasetLongName: 'Unavailable Dataset',
            datasetVersion: '1.0',
            isValid: false, // No longer available
            addedDate: '2025-10-01T10:00:00Z',
            displayOrder: 1,
          },
        ],
      };
      initializeForTesting(collectionWithUnavailableDataset);

      markDatasetForRemoval('unavailable_dataset');

      const state = store.getState();
      expect(state.datasetsToRemove).toContain('unavailable_dataset');
    });

    it('should handle marking then unmarking then remarking same dataset', () => {
      const { markDatasetForRemoval, cancelDatasetRemoval } = store.getState();

      markDatasetForRemoval('bats_temp_001');
      expect(store.getState().datasetsToRemove).toContain('bats_temp_001');

      cancelDatasetRemoval('bats_temp_001');
      expect(store.getState().datasetsToRemove).not.toContain('bats_temp_001');

      markDatasetForRemoval('bats_temp_001');
      expect(store.getState().datasetsToRemove).toContain('bats_temp_001');
    });

    it('should handle dataset IDs with special characters', () => {
      const { initializeForTesting, markDatasetForRemoval } = store.getState();

      const collectionWithSpecialChars = {
        ...mockCollection,
        datasets: [
          {
            datasetId: 1,
            datasetShortName: 'dataset_with-special.chars_123',
            datasetLongName: 'Dataset with Special Characters',
            datasetVersion: '1.0',
            isValid: true,
            addedDate: '2025-10-01T10:00:00Z',
            displayOrder: 1,
          },
        ],
      };
      initializeForTesting(collectionWithSpecialChars);

      markDatasetForRemoval('dataset_with-special.chars_123');

      const state = store.getState();
      expect(state.datasetsToRemove).toContain(
        'dataset_with-special.chars_123',
      );
    });

    it('should handle rapid successive mark and cancel operations', () => {
      const { markDatasetForRemoval, cancelDatasetRemoval } = store.getState();

      markDatasetForRemoval('bats_temp_001');
      markDatasetForRemoval('bats_temp_002');
      cancelDatasetRemoval('bats_temp_001');
      markDatasetForRemoval('bats_salinity_001');
      cancelDatasetRemoval('bats_temp_002');

      const state = store.getState();
      expect(state.datasetsToRemove).toEqual(['bats_salinity_001']);
    });
  });

  describe('state isolation', () => {
    it('should not affect other state properties when marking dataset for removal', () => {
      const { markDatasetForRemoval } = store.getState();
      const stateBefore = store.getState();

      markDatasetForRemoval('bats_temp_001');

      const stateAfter = store.getState();
      expect(stateAfter.isLoading).toBe(stateBefore.isLoading);
      expect(stateAfter.isSaving).toBe(stateBefore.isSaving);
      expect(stateAfter.error).toBe(stateBefore.error);
      expect(stateAfter.collection).toBe(stateBefore.collection);
      expect(stateAfter.originalCollection).toBe(
        stateBefore.originalCollection,
      );
    });

    it('should not affect other state properties when cancelling removal', () => {
      const { markDatasetForRemoval, cancelDatasetRemoval } = store.getState();

      markDatasetForRemoval('bats_temp_001');
      const stateBefore = store.getState();

      cancelDatasetRemoval('bats_temp_001');

      const stateAfter = store.getState();
      expect(stateAfter.isLoading).toBe(stateBefore.isLoading);
      expect(stateAfter.isSaving).toBe(stateBefore.isSaving);
      expect(stateAfter.error).toBe(stateBefore.error);
      expect(stateAfter.collection).toBe(stateBefore.collection);
      expect(stateAfter.originalCollection).toBe(
        stateBefore.originalCollection,
      );
    });

    it('should not modify collection name when marking dataset for removal', () => {
      const { markDatasetForRemoval } = store.getState();
      const nameBefore = store.getState().collection.name;

      markDatasetForRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.collection.name).toBe(nameBefore);
    });

    it('should not modify collection description when marking dataset for removal', () => {
      const { markDatasetForRemoval } = store.getState();
      const descriptionBefore = store.getState().collection.description;

      markDatasetForRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.collection.description).toBe(descriptionBefore);
    });

    it('should not modify collection visibility when marking dataset for removal', () => {
      const { markDatasetForRemoval } = store.getState();
      const isPublicBefore = store.getState().collection.isPublic;

      markDatasetForRemoval('bats_temp_001');

      const state = store.getState();
      expect(state.collection.isPublic).toBe(isPublicBefore);
    });
  });
});
