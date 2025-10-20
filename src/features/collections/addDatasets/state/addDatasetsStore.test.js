/**
 * Tests for addDatasetsStore state management
 *
 * Test Coverage:
 * - T009: getSelectableDatasets - Filters out invalid and already-present datasets
 * - T014: loadCollectionDatasets error handling - HTTP and network error handling
 *
 * This test is part of the TDD approach where tests are written BEFORE implementation.
 * The tests should FAIL until the corresponding implementation tasks are completed.
 */

import { create } from 'zustand';
import collectionsAPI from '../../api/collectionsApi';

// Mock the collections API
jest.mock('../../api/collectionsApi');

// This will be replaced with the actual store implementation in Phase 3.3
// For now, we define the expected interface for TDD
const createAddDatasetsStore = () => {
  return create((set, get) => ({
    // Modal State
    isOpen: false,
    activeTab: 'collections',

    // Collection Search & Selection
    searchQuery: '',
    selectedCollectionId: null,
    selectedCollectionSummary: null,

    // Dataset Loading State
    isLoadingDatasets: false,
    loadError: null,
    sourceCollectionDatasets: null,

    // Dataset Selection State
    selectedDatasetIds: new Set(),

    // De-duplication State
    currentCollectionDatasetIds: new Set(),

    // Confirmation Dialog State
    showSwitchCollectionWarning: false,
    pendingCollectionId: null,

    // Actions for testing
    selectCollection: (collectionId, summary) => {
      const { selectedDatasetIds } = get();
      if (selectedDatasetIds.size > 0) {
        set({
          showSwitchCollectionWarning: true,
          pendingCollectionId: collectionId,
        });
      } else {
        set({
          selectedCollectionId: collectionId,
          selectedCollectionSummary: summary,
          sourceCollectionDatasets: null,
          loadError: null,
        });
      }
    },

    loadCollectionDatasets: async () => {
      const { selectedCollectionId } = get();
      if (!selectedCollectionId) return;

      set({ isLoadingDatasets: true, loadError: null });

      try {
        const response = await collectionsAPI.getCollectionById(
          selectedCollectionId,
          { includeDatasets: true },
        );

        if (!response.ok) {
          let errorMessage;
          if (response.status === 404) {
            errorMessage = 'Collection not found';
          } else if (response.status === 401) {
            errorMessage = 'You must be logged in';
          } else if (response.status === 403) {
            errorMessage = "You don't have access to this collection";
          } else if (response.status === 500) {
            errorMessage = 'Failed to load collection. Please try again.';
          } else {
            errorMessage = 'Failed to load collection. Please try again.';
          }
          throw new Error(errorMessage);
        }

        const collection = await response.json();

        set({
          sourceCollectionDatasets: collection.datasets || [],
          isLoadingDatasets: false,
          loadError: null,
        });
      } catch (error) {
        // Handle network errors
        let errorMessage = error.message;
        if (
          error.message === 'Failed to fetch' ||
          error.message === 'Network request failed' ||
          error.name === 'TypeError'
        ) {
          errorMessage = 'Network error. Please check your connection.';
        }

        set({
          isLoadingDatasets: false,
          loadError: errorMessage,
          sourceCollectionDatasets: null,
        });
      }
    },

    // Computed getter for selectable datasets
    // TODO: Implement in T029 - This is a placeholder that will make tests fail
    getSelectableDatasets: () => {
      const { sourceCollectionDatasets, currentCollectionDatasetIds } = get();

      if (!sourceCollectionDatasets) {
        return [];
      }

      // Filter out invalid datasets and datasets already in collection
      return sourceCollectionDatasets.filter(
        (dataset) =>
          dataset.isInvalid !== true &&
          !currentCollectionDatasetIds.has(dataset.Dataset_Short_Name),
      );
    },

    // Helper to initialize store for testing
    initializeForTesting: (state) => {
      set({
        ...state,
      });
    },

    // Helper to reset store for testing
    resetStore: () => {
      set({
        isOpen: false,
        activeTab: 'collections',
        searchQuery: '',
        selectedCollectionId: null,
        selectedCollectionSummary: null,
        isLoadingDatasets: false,
        loadError: null,
        sourceCollectionDatasets: null,
        selectedDatasetIds: new Set(),
        currentCollectionDatasetIds: new Set(),
        showSwitchCollectionWarning: false,
        pendingCollectionId: null,
      });
    },
  }));
};

describe('addDatasetsStore - getSelectableDatasets (T009)', () => {
  let store;

  // Sample test data
  const validDataset1 = {
    Dataset_Short_Name: 'ARGO_001',
    Dataset_Long_Name: 'Argo Float Data 2020',
    isInvalid: false,
  };

  const validDataset2 = {
    Dataset_Short_Name: 'HOT_001',
    Dataset_Long_Name: 'Hawaii Ocean Time-series 2020',
    isInvalid: false,
  };

  const validDataset3 = {
    Dataset_Short_Name: 'BATS_001',
    Dataset_Long_Name: 'Bermuda Atlantic Time-series 2020',
    isInvalid: false,
  };

  const invalidDataset1 = {
    Dataset_Short_Name: 'OLD_001',
    Dataset_Long_Name: 'Deprecated Dataset',
    isInvalid: true,
  };

  const invalidDataset2 = {
    Dataset_Short_Name: 'OLD_002',
    Dataset_Long_Name: 'Another Deprecated Dataset',
    isInvalid: true,
  };

  const alreadyInCollectionDataset1 = {
    Dataset_Short_Name: 'EXISTING_001',
    Dataset_Long_Name: 'Already in Collection Dataset 1',
    isInvalid: false,
  };

  const alreadyInCollectionDataset2 = {
    Dataset_Short_Name: 'EXISTING_002',
    Dataset_Long_Name: 'Already in Collection Dataset 2',
    isInvalid: false,
  };

  beforeEach(() => {
    // Create fresh store instance for each test
    store = createAddDatasetsStore();
  });

  describe('getSelectableDatasets filtering logic', () => {
    it('should return only valid datasets not in currentCollectionDatasetIds', () => {
      // Set up test data: 3 valid, 2 invalid, 2 already in collection
      const allDatasets = [
        validDataset1,
        validDataset2,
        validDataset3,
        invalidDataset1,
        invalidDataset2,
        alreadyInCollectionDataset1,
        alreadyInCollectionDataset2,
      ];

      const currentCollectionIds = new Set(['EXISTING_001', 'EXISTING_002']);

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: currentCollectionIds,
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      // Should return only the 3 valid datasets not in collection
      expect(selectableDatasets.length).toBe(3);
      expect(selectableDatasets).toContainEqual(validDataset1);
      expect(selectableDatasets).toContainEqual(validDataset2);
      expect(selectableDatasets).toContainEqual(validDataset3);
    });

    it('should filter out datasets with isInvalid === true', () => {
      const allDatasets = [validDataset1, invalidDataset1, invalidDataset2];

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      expect(selectableDatasets.length).toBe(1);
      expect(selectableDatasets).toContainEqual(validDataset1);
      expect(selectableDatasets).not.toContainEqual(invalidDataset1);
      expect(selectableDatasets).not.toContainEqual(invalidDataset2);
    });

    it('should filter out datasets already in currentCollectionDatasetIds', () => {
      const allDatasets = [
        validDataset1,
        alreadyInCollectionDataset1,
        alreadyInCollectionDataset2,
      ];

      const currentCollectionIds = new Set(['EXISTING_001', 'EXISTING_002']);

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: currentCollectionIds,
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      expect(selectableDatasets.length).toBe(1);
      expect(selectableDatasets).toContainEqual(validDataset1);
      expect(selectableDatasets).not.toContainEqual(
        alreadyInCollectionDataset1,
      );
      expect(selectableDatasets).not.toContainEqual(
        alreadyInCollectionDataset2,
      );
    });

    it('should return empty array when sourceCollectionDatasets is null', () => {
      store.getState().initializeForTesting({
        sourceCollectionDatasets: null,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      expect(selectableDatasets).toEqual([]);
    });

    it('should return empty array when all datasets are invalid', () => {
      const allDatasets = [invalidDataset1, invalidDataset2];

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      expect(selectableDatasets).toEqual([]);
    });

    it('should return empty array when all datasets are already in collection', () => {
      const allDatasets = [
        alreadyInCollectionDataset1,
        alreadyInCollectionDataset2,
      ];

      const currentCollectionIds = new Set(['EXISTING_001', 'EXISTING_002']);

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: currentCollectionIds,
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      expect(selectableDatasets).toEqual([]);
    });

    it('should return empty array when all datasets are either invalid or already in collection', () => {
      const allDatasets = [
        invalidDataset1,
        alreadyInCollectionDataset1,
        alreadyInCollectionDataset2,
      ];

      const currentCollectionIds = new Set(['EXISTING_001', 'EXISTING_002']);

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: currentCollectionIds,
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      expect(selectableDatasets).toEqual([]);
    });

    it('should handle dataset with isInvalid === false explicitly', () => {
      const dataset = {
        Dataset_Short_Name: 'EXPLICIT_VALID',
        Dataset_Long_Name: 'Explicitly Valid Dataset',
        isInvalid: false,
      };

      const allDatasets = [dataset];

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      expect(selectableDatasets.length).toBe(1);
      expect(selectableDatasets).toContainEqual(dataset);
    });

    it('should handle dataset with missing isInvalid property as valid', () => {
      const dataset = {
        Dataset_Short_Name: 'NO_INVALID_PROP',
        Dataset_Long_Name: 'Dataset without isInvalid property',
        // isInvalid property is not set
      };

      const allDatasets = [dataset];

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      // Should be included because isInvalid !== true (it's undefined)
      expect(selectableDatasets.length).toBe(1);
      expect(selectableDatasets).toContainEqual(dataset);
    });

    it('should be case-sensitive when checking currentCollectionDatasetIds', () => {
      const dataset = {
        Dataset_Short_Name: 'CASE_SENSITIVE',
        Dataset_Long_Name: 'Case Sensitive Dataset',
        isInvalid: false,
      };

      const allDatasets = [dataset];

      // Set with lowercase version of the ID
      const currentCollectionIds = new Set(['case_sensitive']);

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: currentCollectionIds,
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      // Should include the dataset because 'CASE_SENSITIVE' !== 'case_sensitive'
      expect(selectableDatasets.length).toBe(1);
      expect(selectableDatasets).toContainEqual(dataset);
    });

    it('should handle empty sourceCollectionDatasets array', () => {
      store.getState().initializeForTesting({
        sourceCollectionDatasets: [],
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      expect(selectableDatasets).toEqual([]);
    });

    it('should handle empty currentCollectionDatasetIds set', () => {
      const allDatasets = [validDataset1, validDataset2];

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      expect(selectableDatasets.length).toBe(2);
      expect(selectableDatasets).toContainEqual(validDataset1);
      expect(selectableDatasets).toContainEqual(validDataset2);
    });

    it('should preserve original dataset object references in returned array', () => {
      const allDatasets = [validDataset1];

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      // Should be the exact same object reference
      expect(selectableDatasets[0]).toBe(validDataset1);
    });

    it('should return new array instance on each call', () => {
      const allDatasets = [validDataset1];

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      const result1 = getSelectableDatasets();
      const result2 = getSelectableDatasets();

      // Should be different array instances
      expect(result1).not.toBe(result2);
      // But with the same content
      expect(result1).toEqual(result2);
    });
  });

  describe('integration with state updates', () => {
    it('should update results when sourceCollectionDatasets changes', () => {
      const initialDatasets = [validDataset1];
      const updatedDatasets = [validDataset1, validDataset2];

      store.getState().initializeForTesting({
        sourceCollectionDatasets: initialDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      let selectableDatasets = getSelectableDatasets();
      expect(selectableDatasets.length).toBe(1);

      // Update source datasets
      store.getState().initializeForTesting({
        sourceCollectionDatasets: updatedDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      selectableDatasets = store.getState().getSelectableDatasets();
      expect(selectableDatasets.length).toBe(2);
    });

    it('should update results when currentCollectionDatasetIds changes', () => {
      const allDatasets = [validDataset1, validDataset2];

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      let selectableDatasets = getSelectableDatasets();
      expect(selectableDatasets.length).toBe(2);

      // Update current collection IDs
      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: new Set(['ARGO_001']),
      });

      selectableDatasets = store.getState().getSelectableDatasets();
      expect(selectableDatasets.length).toBe(1);
      expect(selectableDatasets).toContainEqual(validDataset2);
    });
  });

  describe('edge cases', () => {
    it('should handle dataset with Dataset_Short_Name containing special characters', () => {
      const dataset = {
        Dataset_Short_Name: 'DATASET-WITH_SPECIAL.CHARS_123',
        Dataset_Long_Name: 'Special Characters Dataset',
        isInvalid: false,
      };

      const allDatasets = [dataset];

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      expect(selectableDatasets.length).toBe(1);
      expect(selectableDatasets).toContainEqual(dataset);
    });

    it('should handle dataset with very long Dataset_Short_Name', () => {
      const dataset = {
        Dataset_Short_Name: 'A'.repeat(200),
        Dataset_Long_Name: 'Long Name Dataset',
        isInvalid: false,
      };

      const allDatasets = [dataset];

      store.getState().initializeForTesting({
        sourceCollectionDatasets: allDatasets,
        currentCollectionDatasetIds: new Set(),
      });

      const { getSelectableDatasets } = store.getState();
      const selectableDatasets = getSelectableDatasets();

      expect(selectableDatasets.length).toBe(1);
      expect(selectableDatasets).toContainEqual(dataset);
    });

    it('should handle large number of datasets efficiently', () => {
      const largeDatasetArray = Array.from({ length: 100 }, (_, i) => ({
        Dataset_Short_Name: `DATASET_${i}`,
        Dataset_Long_Name: `Dataset ${i}`,
        isInvalid: i % 3 === 0, // Every 3rd dataset is invalid
      }));

      const currentCollectionIds = new Set(
        Array.from({ length: 20 }, (_, i) => `DATASET_${i * 2}`),
      );

      store.getState().initializeForTesting({
        sourceCollectionDatasets: largeDatasetArray,
        currentCollectionDatasetIds: currentCollectionIds,
      });

      const { getSelectableDatasets } = store.getState();
      const startTime = performance.now();
      const selectableDatasets = getSelectableDatasets();
      const endTime = performance.now();

      // Should complete in reasonable time (< 100ms as per contract)
      expect(endTime - startTime).toBeLessThan(100);

      // Verify filtering is correct
      expect(selectableDatasets.length).toBeGreaterThan(0);
      selectableDatasets.forEach((dataset) => {
        expect(dataset.isInvalid).not.toBe(true);
        expect(currentCollectionIds.has(dataset.Dataset_Short_Name)).toBe(
          false,
        );
      });
    });
  });
});

describe('addDatasetsStore - loadCollectionDatasets error handling (T014)', () => {
  let store;

  beforeEach(() => {
    // Create fresh store instance for each test
    store = createAddDatasetsStore();
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('HTTP error handling', () => {
    beforeEach(() => {
      // Set up store with selected collection
      store.getState().selectCollection(42, {
        id: 42,
        name: 'Test Collection',
        totalDatasets: 10,
        validDatasets: 8,
        invalidDatasets: 2,
        isPublic: true,
      });
    });

    it('should handle 404 Not Found error', async () => {
      // Mock API to return 404 error
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBe('Collection not found');
      expect(state.sourceCollectionDatasets).toBeNull();
    });

    it('should handle 401 Unauthorized error', async () => {
      // Mock API to return 401 error
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBe('You must be logged in');
      expect(state.sourceCollectionDatasets).toBeNull();
    });

    it('should handle 403 Forbidden error', async () => {
      // Mock API to return 403 error
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBe("You don't have access to this collection");
      expect(state.sourceCollectionDatasets).toBeNull();
    });

    it('should handle 500 Server Error', async () => {
      // Mock API to return 500 error
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBe(
        'Failed to load collection. Please try again.',
      );
      expect(state.sourceCollectionDatasets).toBeNull();
    });

    it('should handle other HTTP errors with generic message', async () => {
      // Mock API to return 503 error
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBe(
        'Failed to load collection. Please try again.',
      );
      expect(state.sourceCollectionDatasets).toBeNull();
    });
  });

  describe('Network error handling', () => {
    beforeEach(() => {
      // Set up store with selected collection
      store.getState().selectCollection(42, {
        id: 42,
        name: 'Test Collection',
        totalDatasets: 10,
        validDatasets: 8,
        invalidDatasets: 2,
        isPublic: true,
      });
    });

    it('should handle "Failed to fetch" network error', async () => {
      // Mock API to throw network error
      collectionsAPI.getCollectionById.mockRejectedValue(
        new Error('Failed to fetch'),
      );

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBe(
        'Network error. Please check your connection.',
      );
      expect(state.sourceCollectionDatasets).toBeNull();
    });

    it('should handle "Network request failed" error', async () => {
      // Mock API to throw network request error
      collectionsAPI.getCollectionById.mockRejectedValue(
        new Error('Network request failed'),
      );

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBe(
        'Network error. Please check your connection.',
      );
      expect(state.sourceCollectionDatasets).toBeNull();
    });

    it('should handle TypeError as network error', async () => {
      // Mock API to throw TypeError (common for network issues)
      const typeError = new TypeError('Network error');
      collectionsAPI.getCollectionById.mockRejectedValue(typeError);

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBe(
        'Network error. Please check your connection.',
      );
      expect(state.sourceCollectionDatasets).toBeNull();
    });
  });

  describe('Loading state management', () => {
    beforeEach(() => {
      // Set up store with selected collection
      store.getState().selectCollection(42, {
        id: 42,
        name: 'Test Collection',
        totalDatasets: 10,
        validDatasets: 8,
        invalidDatasets: 2,
        isPublic: true,
      });
    });

    it('should set isLoadingDatasets to false on 404 error', async () => {
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
    });

    it('should set isLoadingDatasets to false on 401 error', async () => {
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
    });

    it('should set isLoadingDatasets to false on 500 error', async () => {
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
    });

    it('should set isLoadingDatasets to false on network error', async () => {
      collectionsAPI.getCollectionById.mockRejectedValue(
        new Error('Failed to fetch'),
      );

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.isLoadingDatasets).toBe(false);
    });

    it('should clear loadError on retry after successful load', async () => {
      // First call fails
      collectionsAPI.getCollectionById.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await store.getState().loadCollectionDatasets();

      let state = store.getState();
      expect(state.loadError).toBe(
        'Failed to load collection. Please try again.',
      );

      // Second call succeeds
      const mockCollection = {
        id: 42,
        name: 'Test Collection',
        datasets: [
          {
            Dataset_Short_Name: 'dataset_001',
            Dataset_Long_Name: 'Test Dataset 001',
            isInvalid: false,
          },
        ],
      };

      collectionsAPI.getCollectionById.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCollection,
      });

      await store.getState().loadCollectionDatasets();

      state = store.getState();
      expect(state.loadError).toBeNull();
      expect(state.sourceCollectionDatasets).toEqual(mockCollection.datasets);
      expect(state.isLoadingDatasets).toBe(false);
    });
  });

  describe('State cleanup on error', () => {
    beforeEach(() => {
      // Set up store with selected collection and existing datasets
      store.getState().selectCollection(42, {
        id: 42,
        name: 'Test Collection',
        totalDatasets: 10,
        validDatasets: 8,
        invalidDatasets: 2,
        isPublic: true,
      });

      // Manually set some datasets first (simulating previous successful load)
      store.getState().initializeForTesting({
        sourceCollectionDatasets: [
          {
            Dataset_Short_Name: 'old_dataset',
            Dataset_Long_Name: 'Old Dataset',
            isInvalid: false,
          },
        ],
      });
    });

    it('should clear sourceCollectionDatasets on error', async () => {
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.sourceCollectionDatasets).toBeNull();
    });

    it('should preserve selectedCollectionId on error', async () => {
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.selectedCollectionId).toBe(42);
    });

    it('should preserve selectedCollectionSummary on error', async () => {
      const summary = {
        id: 42,
        name: 'Test Collection',
        totalDatasets: 10,
        validDatasets: 8,
        invalidDatasets: 2,
        isPublic: true,
      };

      // Reset and set up again to ensure clean state
      store.getState().resetStore();
      store.getState().selectCollection(42, summary);

      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.selectedCollectionSummary).toEqual(summary);
    });
  });

  describe('Edge cases', () => {
    it('should handle loadCollectionDatasets call with no selectedCollectionId', async () => {
      // No collection selected
      expect(store.getState().selectedCollectionId).toBeNull();

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      // Should not make API call or change state
      expect(collectionsAPI.getCollectionById).not.toHaveBeenCalled();
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBeNull();
    });

    it('should handle API returning collection with no datasets array', async () => {
      store.getState().selectCollection(42, {
        id: 42,
        name: 'Empty Collection',
        totalDatasets: 0,
        validDatasets: 0,
        invalidDatasets: 0,
        isPublic: true,
      });

      // Mock API to return collection without datasets
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 42,
          name: 'Empty Collection',
          // datasets field is missing
        }),
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.sourceCollectionDatasets).toEqual([]);
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBeNull();
    });

    it('should handle API returning collection with empty datasets array', async () => {
      store.getState().selectCollection(42, {
        id: 42,
        name: 'Empty Collection',
        totalDatasets: 0,
        validDatasets: 0,
        invalidDatasets: 0,
        isPublic: true,
      });

      // Mock API to return collection with empty datasets
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 42,
          name: 'Empty Collection',
          datasets: [],
        }),
      });

      await store.getState().loadCollectionDatasets();

      const state = store.getState();
      expect(state.sourceCollectionDatasets).toEqual([]);
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBeNull();
    });
  });
});
