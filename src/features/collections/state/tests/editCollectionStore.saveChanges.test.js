/**
 * Tests for editCollectionStore.saveChanges action
 *
 * Test Coverage:
 * - API integration with updateCollection endpoint
 * - Success state management and state updates
 * - Error handling for various HTTP status codes (400, 401, 403, 404, 409, 500)
 * - Payload construction with trimmed values
 * - State reset after successful save
 * - Navigation and notification integration
 */

import { create } from 'zustand';
import collectionsAPI from '../../api/collectionsApi';

// Mock the collections API
jest.mock('../../api/collectionsApi');

// Mock navigation (will be replaced with actual router integration)
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock Redux snackbar dispatch (legacy integration)
const mockDispatch = jest.fn();
const mockSnackbarOpen = jest.fn((message, options) => ({
  type: 'SNACKBAR_OPEN',
  message,
  options,
}));

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

    // Save changes action
    saveChanges: async (navigate, dispatch, snackbarOpen) => {
      const { collection, datasetsToRemove } = get();

      if (!collection) {
        return;
      }

      // Set saving state
      set({ isSaving: true, error: null });

      // Prepare request payload with trimmed values
      const payload = {
        collectionName: collection.name.trim(),
        description: collection.description.trim(),
        private: !collection.isPublic, // Convert isPublic to private
        datasets: collection.datasets
          .filter((d) => !datasetsToRemove.includes(d.datasetShortName))
          .map((d) => d.datasetShortName),
      };

      try {
        // Send PATCH request
        const response = await collectionsAPI.updateCollection(
          collection.id,
          payload,
        );

        // Handle non-200 responses
        if (!response.ok) {
          let errorMessage;

          switch (response.status) {
            case 400:
              errorMessage = 'Validation error. Please check your input.';
              break;
            case 401:
              errorMessage = 'You must be logged in to edit collections.';
              break;
            case 403:
              errorMessage =
                'You do not have permission to edit this collection.';
              break;
            case 404:
              errorMessage = 'Collection not found.';
              break;
            case 409:
              errorMessage =
                'A collection with this name already exists. Please choose a different name.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = `Failed to update collection: ${response.status} ${response.statusText}`;
          }

          throw new Error(errorMessage);
        }

        const responseData = await response.json();

        // Update state on success
        const updatedCollection = {
          ...collection,
          name: payload.collectionName,
          description: payload.description,
          isPublic: !payload.private,
          datasets: collection.datasets.filter(
            (d) => !datasetsToRemove.includes(d.datasetShortName),
          ),
          modifiedDate: new Date().toISOString(),
        };

        set({
          collection: updatedCollection,
          originalCollection: JSON.parse(JSON.stringify(updatedCollection)), // deep clone
          datasetsToRemove: [],
          selectedDatasets: [],
          isSaving: false,
          error: null,
        });

        // Show success notification (integration with Redux snackbar)
        if (dispatch && snackbarOpen) {
          dispatch(
            snackbarOpen('Collection updated successfully', {
              severity: 'success',
              position: 'bottom',
            }),
          );
        }

        // Navigate to collections list
        if (navigate) {
          navigate('/collections');
        }
      } catch (error) {
        // Handle errors
        set({
          isSaving: false,
          error: error.message,
        });

        // Show error notification
        if (dispatch && snackbarOpen) {
          dispatch(
            snackbarOpen(`Failed to update collection: ${error.message}`, {
              severity: 'error',
              position: 'bottom',
            }),
          );
        }
      }
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

    // Helper to set datasetsToRemove for testing
    setDatasetsToRemoveForTesting: (datasets) => {
      set({
        datasetsToRemove: datasets,
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

describe('editCollectionStore.saveChanges', () => {
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
    // Initialize with mock collection
    store.getState().initializeForTesting(mockCollection);
    // Reset all mocks
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockDispatch.mockClear();
    mockSnackbarOpen.mockClear();
  });

  describe('successful save', () => {
    it('should set isSaving to true when save starts', async () => {
      // Mock API to return a promise that never resolves (so we can check saving state)
      collectionsAPI.updateCollection.mockImplementation(
        () => new Promise(() => {}),
      );

      const { saveChanges } = store.getState();
      const savePromise = saveChanges(
        mockNavigate,
        mockDispatch,
        mockSnackbarOpen,
      );

      // Check saving state immediately
      const state = store.getState();
      expect(state.isSaving).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should call API with correct collection ID and payload', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      // Modify collection to trigger save
      const modifiedCollection = {
        ...mockCollection,
        name: 'Updated Collection Name',
        description: 'Updated description',
        isPublic: true,
      };
      store.setState({ collection: modifiedCollection });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(collectionsAPI.updateCollection).toHaveBeenCalledWith(123, {
        collectionName: 'Updated Collection Name',
        description: 'Updated description',
        private: false, // isPublic: true -> private: false
        datasets: ['bats_temp_001', 'bats_temp_002'],
      });
    });

    it('should trim name and description in payload', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      // Add whitespace to name and description
      const modifiedCollection = {
        ...mockCollection,
        name: '  BATS In-Situ Temperature Profiles  ',
        description: '  Collection of temperature profile datasets  ',
      };
      store.setState({ collection: modifiedCollection });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(collectionsAPI.updateCollection).toHaveBeenCalledWith(123, {
        collectionName: 'BATS In-Situ Temperature Profiles',
        description: 'Collection of temperature profile datasets',
        private: true,
        datasets: ['bats_temp_001', 'bats_temp_002'],
      });
    });

    it('should exclude datasets marked for removal from payload', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      // Mark one dataset for removal
      store.getState().setDatasetsToRemoveForTesting(['bats_temp_001']);

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(collectionsAPI.updateCollection).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          datasets: ['bats_temp_002'], // Only one dataset remains
        }),
      );
    });

    it('should handle empty datasets array (all removed)', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      // Mark all datasets for removal
      store
        .getState()
        .setDatasetsToRemoveForTesting(['bats_temp_001', 'bats_temp_002']);

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(collectionsAPI.updateCollection).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          datasets: [], // Empty array is valid
        }),
      );
    });

    it('should update state on successful save', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const modifiedCollection = {
        ...mockCollection,
        name: 'Updated Name',
        description: 'Updated Description',
        isPublic: true,
      };
      store.setState({ collection: modifiedCollection });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.collection.name).toBe('Updated Name');
      expect(state.collection.description).toBe('Updated Description');
      expect(state.collection.isPublic).toBe(true);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should reset datasetsToRemove after successful save', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      store.getState().setDatasetsToRemoveForTesting(['bats_temp_001']);

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.datasetsToRemove).toEqual([]);
    });

    it('should reset selectedDatasets after successful save', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      store.setState({ selectedDatasets: ['bats_temp_001'] });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.selectedDatasets).toEqual([]);
    });

    it('should update originalCollection to match collection after save', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const modifiedCollection = {
        ...mockCollection,
        name: 'Updated Name',
      };
      store.setState({ collection: modifiedCollection });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.originalCollection.name).toBe('Updated Name');
      expect(state.hasUnsavedChanges()).toBe(false);
    });

    it('should update modifiedDate after successful save', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const originalModifiedDate = mockCollection.modifiedDate;

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.collection.modifiedDate).not.toBe(originalModifiedDate);
      expect(new Date(state.collection.modifiedDate)).toBeInstanceOf(Date);
    });

    it('should call navigate with /collections on success', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(mockNavigate).toHaveBeenCalledWith('/collections');
    });

    it('should dispatch success snackbar notification', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(mockSnackbarOpen).toHaveBeenCalledWith(
        'Collection updated successfully',
        {
          severity: 'success',
          position: 'bottom',
        },
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SNACKBAR_OPEN',
          message: 'Collection updated successfully',
        }),
      );
    });

    it('should handle save without navigate function', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const { saveChanges } = store.getState();
      await saveChanges(null, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle save without dispatch/snackbar functions', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, null, null);

      const state = store.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should remove marked datasets from collection.datasets after save', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      store.getState().setDatasetsToRemoveForTesting(['bats_temp_001']);

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.collection.datasets).toHaveLength(1);
      expect(state.collection.datasets[0].datasetShortName).toBe(
        'bats_temp_002',
      );
    });
  });

  describe('error handling', () => {
    it('should handle 400 Bad Request error', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBe('Validation error. Please check your input.');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle 401 Unauthorized error', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBe('You must be logged in to edit collections.');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle 403 Forbidden error', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBe(
        'You do not have permission to edit this collection.',
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle 404 Not Found error', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBe('Collection not found.');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle 409 Conflict error (duplicate name)', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict',
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBe(
        'A collection with this name already exists. Please choose a different name.',
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle 500 Internal Server Error', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBe('Server error. Please try again later.');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle unknown HTTP error codes', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: false,
        status: 418,
        statusText: "I'm a teapot",
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBe("Failed to update collection: 418 I'm a teapot");
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      collectionsAPI.updateCollection.mockRejectedValue(
        new Error('Network request failed'),
      );

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBe('Network request failed');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should dispatch error snackbar notification on failure', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(mockSnackbarOpen).toHaveBeenCalledWith(
        'Failed to update collection: Server error. Please try again later.',
        {
          severity: 'error',
          position: 'bottom',
        },
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'SNACKBAR_OPEN',
        }),
      );
    });

    it('should not modify originalCollection on error', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const originalName = store.getState().originalCollection.name;

      const modifiedCollection = {
        ...mockCollection,
        name: 'Updated Name',
      };
      store.setState({ collection: modifiedCollection });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.originalCollection.name).toBe(originalName);
      expect(state.hasUnsavedChanges()).toBe(true);
    });

    it('should not modify datasetsToRemove on error', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      store.getState().setDatasetsToRemoveForTesting(['bats_temp_001']);

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.datasetsToRemove).toEqual(['bats_temp_001']);
    });

    it('should clear previous error when starting new save', async () => {
      // Set initial error state
      store.setState({ error: 'Previous error' });

      collectionsAPI.updateCollection.mockImplementation(
        () => new Promise(() => {}),
      );

      const { saveChanges } = store.getState();
      saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should not save when collection is null', async () => {
      store.getState().resetStore();

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(collectionsAPI.updateCollection).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle empty description', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const modifiedCollection = {
        ...mockCollection,
        description: '',
      };
      store.setState({ collection: modifiedCollection });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(collectionsAPI.updateCollection).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          description: '',
        }),
      );
    });

    it('should correctly convert isPublic to private field', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      // Test isPublic: true -> private: false
      const publicCollection = {
        ...mockCollection,
        isPublic: true,
      };
      store.setState({ collection: publicCollection });

      let { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(collectionsAPI.updateCollection).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          private: false,
        }),
      );

      // Reset mocks
      jest.clearAllMocks();

      // Test isPublic: false -> private: true
      const privateCollection = {
        ...mockCollection,
        isPublic: false,
      };
      store.setState({ collection: privateCollection });

      saveChanges = store.getState().saveChanges;
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(collectionsAPI.updateCollection).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          private: true,
        }),
      );
    });

    it('should handle collection with only unavailable datasets', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const collectionWithUnavailableDatasets = {
        ...mockCollection,
        datasets: [
          {
            datasetId: 1,
            datasetShortName: 'unavailable_dataset',
            datasetLongName: 'Unavailable Dataset',
            datasetVersion: '1.0',
            isInvalid: true,
            addedDate: '2025-10-01T10:00:00Z',
            displayOrder: 1,
          },
        ],
      };
      store.getState().initializeForTesting(collectionWithUnavailableDatasets);

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      expect(collectionsAPI.updateCollection).toHaveBeenCalledWith(
        123,
        expect.objectContaining({
          datasets: ['unavailable_dataset'],
        }),
      );
    });

    it('should preserve dataset order in payload', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const call = collectionsAPI.updateCollection.mock.calls[0];
      expect(call[1].datasets).toEqual(['bats_temp_001', 'bats_temp_002']);
    });

    it('should handle rapid successive save attempts', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const { saveChanges } = store.getState();

      // Start multiple saves (second should still work even if first is in progress)
      const save1 = saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);
      const save2 = saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      await Promise.all([save1, save2]);

      expect(collectionsAPI.updateCollection).toHaveBeenCalled();
    });
  });

  describe('state isolation', () => {
    it('should not modify isLoading when saving', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      store.setState({ isLoading: true });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.isLoading).toBe(true); // Should remain unchanged
    });

    it('should not modify createdDate when saving', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const originalCreatedDate = mockCollection.createdDate;

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.collection.createdDate).toBe(originalCreatedDate);
    });

    it('should not modify collection owner fields when saving', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.collection.ownerName).toBe(mockCollection.ownerName);
      expect(state.collection.ownerAffiliation).toBe(
        mockCollection.ownerAffiliation,
      );
      expect(state.collection.isOwner).toBe(mockCollection.isOwner);
    });

    it('should not modify collection statistics when saving', async () => {
      collectionsAPI.updateCollection.mockResolvedValue({
        ok: true,
        json: async () => ({ collectionId: 123 }),
      });

      const { saveChanges } = store.getState();
      await saveChanges(mockNavigate, mockDispatch, mockSnackbarOpen);

      const state = store.getState();
      expect(state.collection.views).toBe(mockCollection.views);
      expect(state.collection.downloads).toBe(mockCollection.downloads);
      expect(state.collection.copies).toBe(mockCollection.copies);
    });
  });
});
