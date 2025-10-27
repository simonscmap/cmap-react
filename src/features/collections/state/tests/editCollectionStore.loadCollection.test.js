/**
 * Tests for editCollectionStore.loadCollection action
 *
 * Test Coverage:
 * - Successful collection load and state initialization
 * - Error handling for API failures
 * - State management during loading lifecycle
 * - Deep clone of originalCollection for change detection
 */

import { create } from 'zustand';
import collectionsAPI from '../../api/collectionsApi';

// Mock the collections API
jest.mock('../../api/collectionsApi');

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

    // Actions
    loadCollection: async (collectionId) => {
      set({ isLoading: true, error: null });

      try {
        const response = await collectionsAPI.getCollection(collectionId, {
          includeDatasets: true,
        });

        if (!response.ok) {
          const errorMessage =
            response.status === 404
              ? 'Collection not found'
              : response.status === 403
                ? 'You do not have permission to edit this collection'
                : `Failed to load collection: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const collection = await response.json();

        // Verify ownership (additional client-side check)
        if (!collection.isOwner) {
          throw new Error(
            'Unauthorized: You do not have permission to edit this collection',
          );
        }

        // Initialize state with collection data
        set({
          collection,
          originalCollection: JSON.parse(JSON.stringify(collection)), // deep clone
          datasetsToRemove: [],
          selectedDatasets: [],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error.message,
          collection: null,
          originalCollection: null,
        });
      }
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

describe('editCollectionStore.loadCollection', () => {
  let store;

  // Sample collection data matching the API contract
  const mockCollection = {
    id: 123,
    name: 'BATS In-Situ Temperature Profiles',
    description: 'Collection of temperature profile datasets from BATS station',
    isPublic: false,
    createdDate: '2025-10-01T10:00:00Z',
    modifiedDate: '2025-10-08T14:23:45Z',
    ownerName: 'John Doe',
    ownerAffiliation: 'University of Test',
    datasetCount: 2,
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
        isInvalid: false,
        addedDate: '2025-10-01T10:00:00Z',
        displayOrder: 1,
      },
      {
        datasetId: 2,
        datasetShortName: 'bats_temp_002',
        datasetLongName: 'BATS Temperature Profiles 2021',
        datasetVersion: '1.0',
        isInvalid: false,
        addedDate: '2025-10-02T10:00:00Z',
        displayOrder: 2,
      },
    ],
  };

  beforeEach(() => {
    // Create fresh store instance for each test
    store = createEditCollectionStore();
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('successful load', () => {
    it('should set isLoading to true when load starts', async () => {
      // Mock API to return a promise that never resolves (so we can check loading state)
      collectionsAPI.getCollection.mockImplementation(
        () => new Promise(() => {}),
      );

      const { loadCollection } = store.getState();
      const loadPromise = loadCollection(123);

      // Check loading state immediately
      const state = store.getState();
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should load collection data and initialize state on success', async () => {
      // Mock successful API response
      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();

      // Verify collection is loaded
      expect(state.collection).toEqual(mockCollection);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should create deep clone of collection as originalCollection', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();

      // Verify originalCollection exists and equals collection
      expect(state.originalCollection).toEqual(state.collection);

      // Verify they are different object references (deep clone)
      expect(state.originalCollection).not.toBe(state.collection);

      // Verify nested arrays are also cloned
      expect(state.originalCollection.datasets).not.toBe(
        state.collection.datasets,
      );
    });

    it('should initialize empty datasetsToRemove array', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.datasetsToRemove).toEqual([]);
    });

    it('should initialize empty selectedDatasets array', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.selectedDatasets).toEqual([]);
    });

    it('should call API with correct parameters', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      expect(collectionsAPI.getCollection).toHaveBeenCalledWith(123, {
        includeDatasets: true,
      });
    });

    it('should handle collection with no datasets', async () => {
      const emptyCollection = {
        ...mockCollection,
        datasetCount: 0,
        datasets: [],
      };

      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => emptyCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.collection.datasets).toEqual([]);
      expect(state.collection.datasetCount).toBe(0);
    });

    it('should handle collection with datasets marked as invalid', async () => {
      const collectionWithInvalidDataset = {
        ...mockCollection,
        datasets: [
          {
            datasetId: 1,
            datasetShortName: 'bats_temp_001',
            datasetLongName: 'BATS Temperature Profiles 2020',
            datasetVersion: '1.0',
            isInvalid: false,
            addedDate: '2025-10-01T10:00:00Z',
            displayOrder: 1,
          },
          {
            datasetId: 2,
            datasetShortName: 'deleted_dataset',
            datasetLongName: 'Deleted Dataset',
            datasetVersion: '1.0',
            isInvalid: true, // Dataset no longer exists
            addedDate: '2025-10-02T10:00:00Z',
            displayOrder: 2,
          },
        ],
      };

      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => collectionWithInvalidDataset,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.collection.datasets).toHaveLength(2);
      expect(state.collection.datasets[1].isInvalid).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle 404 Not Found error', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const { loadCollection } = store.getState();
      await loadCollection(999);

      const state = store.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Collection not found');
      expect(state.collection).toBeNull();
      expect(state.originalCollection).toBeNull();
    });

    it('should handle 403 Forbidden error', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(
        'You do not have permission to edit this collection',
      );
      expect(state.collection).toBeNull();
      expect(state.originalCollection).toBeNull();
    });

    it('should handle generic API errors', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(
        'Failed to load collection: 500 Internal Server Error',
      );
      expect(state.collection).toBeNull();
      expect(state.originalCollection).toBeNull();
    });

    it('should handle network errors', async () => {
      collectionsAPI.getCollection.mockRejectedValue(
        new Error('Network request failed'),
      );

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network request failed');
      expect(state.collection).toBeNull();
      expect(state.originalCollection).toBeNull();
    });

    it('should handle collection with isOwner=false', async () => {
      const notOwnedCollection = {
        ...mockCollection,
        isOwner: false,
      };

      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => notOwnedCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(
        'Unauthorized: You do not have permission to edit this collection',
      );
      expect(state.collection).toBeNull();
      expect(state.originalCollection).toBeNull();
    });

    it('should clear previous error state on new load attempt', async () => {
      // First call fails
      collectionsAPI.getCollection.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      let state = store.getState();
      expect(state.error).toBeTruthy();

      // Second call succeeds
      collectionsAPI.getCollection.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCollection,
      });

      await loadCollection(123);

      state = store.getState();
      expect(state.error).toBeNull();
      expect(state.collection).toEqual(mockCollection);
    });
  });

  describe('state lifecycle', () => {
    it('should clear error when starting a new load', async () => {
      // Set initial error state
      store.setState({ error: 'Previous error' });

      collectionsAPI.getCollection.mockImplementation(
        () => new Promise(() => {}),
      );

      const { loadCollection } = store.getState();
      loadCollection(123);

      const state = store.getState();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(true);
    });

    it('should maintain datasetsToRemove and selectedDatasets as empty after load', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.datasetsToRemove).toEqual([]);
      expect(state.selectedDatasets).toEqual([]);
      expect(Array.isArray(state.datasetsToRemove)).toBe(true);
      expect(Array.isArray(state.selectedDatasets)).toBe(true);
    });

    it('should set isLoading to false after successful load', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.isLoading).toBe(false);
    });

    it('should set isLoading to false after failed load', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.isLoading).toBe(false);
    });

    it('should not modify isSaving state during load', async () => {
      // Set isSaving to true
      store.setState({ isSaving: true });

      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      expect(state.isSaving).toBe(true); // Should remain unchanged
    });
  });

  describe('data integrity', () => {
    it('should preserve all collection fields from API response', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();

      // Verify all top-level fields are preserved
      expect(state.collection.id).toBe(mockCollection.id);
      expect(state.collection.name).toBe(mockCollection.name);
      expect(state.collection.description).toBe(mockCollection.description);
      expect(state.collection.isPublic).toBe(mockCollection.isPublic);
      expect(state.collection.createdDate).toBe(mockCollection.createdDate);
      expect(state.collection.modifiedDate).toBe(mockCollection.modifiedDate);
      expect(state.collection.ownerName).toBe(mockCollection.ownerName);
      expect(state.collection.ownerAffiliation).toBe(
        mockCollection.ownerAffiliation,
      );
      expect(state.collection.datasetCount).toBe(mockCollection.datasetCount);
      expect(state.collection.isOwner).toBe(mockCollection.isOwner);
      expect(state.collection.views).toBe(mockCollection.views);
      expect(state.collection.downloads).toBe(mockCollection.downloads);
      expect(state.collection.copies).toBe(mockCollection.copies);
    });

    it('should preserve all dataset fields in datasets array', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      const state = store.getState();
      const dataset = state.collection.datasets[0];

      expect(dataset.datasetId).toBe(mockCollection.datasets[0].datasetId);
      expect(dataset.datasetShortName).toBe(
        mockCollection.datasets[0].datasetShortName,
      );
      expect(dataset.datasetLongName).toBe(
        mockCollection.datasets[0].datasetLongName,
      );
      expect(dataset.datasetVersion).toBe(
        mockCollection.datasets[0].datasetVersion,
      );
      expect(dataset.isInvalid).toBe(mockCollection.datasets[0].isInvalid);
      expect(dataset.addedDate).toBe(mockCollection.datasets[0].addedDate);
      expect(dataset.displayOrder).toBe(
        mockCollection.datasets[0].displayOrder,
      );
    });

    it('should maintain separate instances of collection and originalCollection', async () => {
      collectionsAPI.getCollection.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      const { loadCollection } = store.getState();
      await loadCollection(123);

      let state = store.getState();

      // Verify they are different object references (deep clone test)
      // by checking that the objects and nested arrays are not the same references
      expect(state.collection).not.toBe(state.originalCollection);
      expect(state.collection.datasets).not.toBe(
        state.originalCollection.datasets,
      );

      // To test that mutations don't affect originalCollection, we need to
      // create a new object and update the store (Zustand pattern)
      const mutatedCollection = {
        ...state.collection,
        name: 'Modified Name',
        datasets: [
          ...state.collection.datasets,
          {
            datasetId: 99,
            datasetShortName: 'new_dataset',
            datasetLongName: 'New Dataset',
            datasetVersion: '1.0',
            isInvalid: false,
            addedDate: '2025-10-09T10:00:00Z',
            displayOrder: 3,
          },
        ],
      };

      store.setState({ collection: mutatedCollection });

      // Get fresh state after mutation
      state = store.getState();

      // Collection should be mutated
      expect(state.collection.name).toBe('Modified Name');
      expect(state.collection.datasets).toHaveLength(3);

      // Original should remain unchanged
      expect(state.originalCollection.name).toBe(mockCollection.name);
      expect(state.originalCollection.datasets).toHaveLength(2);
    });
  });
});
