/**
 * Tests for addDatasetsStore
 *
 * Following TDD approach: These tests are written BEFORE implementation
 * and are expected to FAIL until the corresponding actions are implemented.
 *
 * Test Coverage:
 * - T006: openModal initializes de-duplication state
 * - T007: selectCollection sets state and handles confirmation logic
 * - T008: toggleDatasetSelection adds/removes from Set
 * - T009: getSelectableDatasets filters correctly
 * - T010: getSelectionState computes counts and button label
 * - T011: confirmSwitch clears selections and loads new collection
 * - T012: addSelectedDatasets maps IDs to full dataset objects
 * - T013: loadCollectionDatasets success flow
 * - T014: loadCollectionDatasets error handling
 */

import { useAddDatasetsStore } from '../addDatasetsStore';
import collectionsAPI from '../../../api/collectionsApi';

// Mock the collections API
jest.mock('../../../api/collectionsApi');

// Reset store to initial state before each test
beforeEach(() => {
  const store = useAddDatasetsStore.getState();
  // Reset to initial state by calling closeModal if implemented
  // For now, manually reset critical state
  useAddDatasetsStore.setState({
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
  // Clear all mocks before each test
  jest.clearAllMocks();
});

describe('addDatasetsStore', () => {
  describe('T007: selectCollection sets state and handles confirmation logic', () => {
    /**
     * Contract requirement: addDatasetsStore.contract.md lines 87-109
     * Test scenario 1: No selections → sets selectedCollectionId and selectedCollectionSummary immediately
     */
    it('scenario 1: no selections - sets selectedCollectionId and selectedCollectionSummary immediately', () => {
      const store = useAddDatasetsStore.getState();

      // Arrange: Empty selectedDatasetIds (no selections)
      expect(store.selectedDatasetIds.size).toBe(0);

      const collectionId = 42;
      const summary = {
        id: 42,
        name: 'Ocean Temperature Data',
        totalDatasets: 15,
        validDatasets: 12,
        invalidDatasets: 3,
        isPublic: true,
      };

      // Act: Call selectCollection
      store.selectCollection(collectionId, summary);

      // Assert: selectedCollectionId and selectedCollectionSummary should be set immediately
      const updatedStore = useAddDatasetsStore.getState();
      expect(updatedStore.selectedCollectionId).toBe(collectionId);
      expect(updatedStore.selectedCollectionSummary).toEqual(summary);

      // Assert: No confirmation dialog should be shown
      expect(updatedStore.showSwitchCollectionWarning).toBe(false);
      expect(updatedStore.pendingCollectionId).toBeNull();

      // Assert: Previous sourceCollectionDatasets should be cleared
      // (per contract lines 95-96: "Clears any previous sourceCollectionDatasets")
      expect(updatedStore.sourceCollectionDatasets).toBeNull();
    });

    /**
     * Contract requirement: addDatasetsStore.contract.md lines 87-109
     * Test scenario 2: With selections → sets showSwitchCollectionWarning and pendingCollectionId
     */
    it('scenario 2: with selections - sets showSwitchCollectionWarning and pendingCollectionId', () => {
      const store = useAddDatasetsStore.getState();

      // Arrange: Set up existing selections
      const initialCollectionId = 10;
      const initialSummary = {
        id: 10,
        name: 'Initial Collection',
        totalDatasets: 5,
        validDatasets: 5,
        invalidDatasets: 0,
        isPublic: false,
      };

      const mockDatasets = [
        { Dataset_Short_Name: 'DATASET_A', isInvalid: false },
        { Dataset_Short_Name: 'DATASET_B', isInvalid: false },
      ];

      useAddDatasetsStore.setState({
        selectedCollectionId: initialCollectionId,
        selectedCollectionSummary: initialSummary,
        selectedDatasetIds: new Set(['ARGO_001', 'HOT_001', 'BATS_001']),
        sourceCollectionDatasets: mockDatasets,
      });

      const currentStore = useAddDatasetsStore.getState();
      expect(currentStore.selectedDatasetIds.size).toBe(3);

      const newCollectionId = 42;
      const newSummary = {
        id: 42,
        name: 'Ocean Temperature Data',
        totalDatasets: 15,
        validDatasets: 12,
        invalidDatasets: 3,
        isPublic: true,
      };

      // Act: Call selectCollection with a different collection
      store.selectCollection(newCollectionId, newSummary);

      // Assert: Confirmation dialog should be triggered
      const updatedStore = useAddDatasetsStore.getState();
      expect(updatedStore.showSwitchCollectionWarning).toBe(true);
      expect(updatedStore.pendingCollectionId).toBe(newCollectionId);

      // Assert: Current collection should NOT change yet (waiting for confirmation)
      expect(updatedStore.selectedCollectionId).toBe(initialCollectionId);
      expect(updatedStore.selectedCollectionSummary).toEqual(initialSummary);

      // Assert: Selections should be preserved (not cleared yet)
      expect(updatedStore.selectedDatasetIds.size).toBe(3);

      // Assert: sourceCollectionDatasets should be preserved (not cleared yet)
      expect(updatedStore.sourceCollectionDatasets).toEqual(mockDatasets);
    });

    /**
     * Edge case: Selecting the same collection when already selected (no selections)
     * This should be idempotent and not trigger warnings
     */
    it('edge case: selecting same collection again (no selections) - idempotent behavior', () => {
      const store = useAddDatasetsStore.getState();

      // Arrange: Set up a selected collection with no selections
      const collectionId = 42;
      const summary = {
        id: 42,
        name: 'Ocean Temperature Data',
        totalDatasets: 15,
        validDatasets: 12,
        invalidDatasets: 3,
        isPublic: true,
      };

      useAddDatasetsStore.setState({
        selectedCollectionId: collectionId,
        selectedCollectionSummary: summary,
        selectedDatasetIds: new Set(),
      });

      // Act: Select the same collection again
      store.selectCollection(collectionId, summary);

      // Assert: State should remain the same
      const updatedStore = useAddDatasetsStore.getState();
      expect(updatedStore.selectedCollectionId).toBe(collectionId);
      expect(updatedStore.selectedCollectionSummary).toEqual(summary);
      expect(updatedStore.showSwitchCollectionWarning).toBe(false);
      expect(updatedStore.pendingCollectionId).toBeNull();
    });

    /**
     * Edge case: Selecting the same collection when already selected (with selections)
     * This should also be idempotent and NOT trigger confirmation dialog
     */
    it('edge case: selecting same collection again (with selections) - no confirmation dialog', () => {
      const store = useAddDatasetsStore.getState();

      // Arrange: Set up a selected collection with active selections
      const collectionId = 42;
      const summary = {
        id: 42,
        name: 'Ocean Temperature Data',
        totalDatasets: 15,
        validDatasets: 12,
        invalidDatasets: 3,
        isPublic: true,
      };

      useAddDatasetsStore.setState({
        selectedCollectionId: collectionId,
        selectedCollectionSummary: summary,
        selectedDatasetIds: new Set(['ARGO_001', 'HOT_001']),
      });

      const currentStore = useAddDatasetsStore.getState();
      expect(currentStore.selectedDatasetIds.size).toBe(2);

      // Act: Select the same collection again
      store.selectCollection(collectionId, summary);

      // Assert: State should remain the same, NO confirmation dialog
      const updatedStore = useAddDatasetsStore.getState();
      expect(updatedStore.selectedCollectionId).toBe(collectionId);
      expect(updatedStore.selectedCollectionSummary).toEqual(summary);
      expect(updatedStore.showSwitchCollectionWarning).toBe(false);
      expect(updatedStore.pendingCollectionId).toBeNull();

      // Assert: Selections should be preserved
      expect(updatedStore.selectedDatasetIds.size).toBe(2);
    });

    /**
     * Edge case: Switching from null collection (first selection) with no selections
     * Should set the collection immediately without confirmation
     */
    it('edge case: first collection selection (from null) - sets immediately', () => {
      const store = useAddDatasetsStore.getState();

      // Arrange: No collection selected yet
      expect(store.selectedCollectionId).toBeNull();
      expect(store.selectedDatasetIds.size).toBe(0);

      const collectionId = 42;
      const summary = {
        id: 42,
        name: 'Ocean Temperature Data',
        totalDatasets: 15,
        validDatasets: 12,
        invalidDatasets: 3,
        isPublic: true,
      };

      // Act: Select first collection
      store.selectCollection(collectionId, summary);

      // Assert: Collection should be set immediately
      const updatedStore = useAddDatasetsStore.getState();
      expect(updatedStore.selectedCollectionId).toBe(collectionId);
      expect(updatedStore.selectedCollectionSummary).toEqual(summary);

      // Assert: No confirmation dialog
      expect(updatedStore.showSwitchCollectionWarning).toBe(false);
      expect(updatedStore.pendingCollectionId).toBeNull();
    });
  });

  describe('T008: toggleDatasetSelection', () => {
    it('should add dataset to empty Set', () => {
      const store = useAddDatasetsStore.getState();

      // Initially, selectedDatasetIds should be empty
      const initialState = useAddDatasetsStore.getState();
      expect(initialState.selectedDatasetIds.size).toBe(0);

      // Toggle dataset - should add it
      store.toggleDatasetSelection('ARGO_001');

      // Verify dataset was added
      const state = useAddDatasetsStore.getState();
      expect(state.selectedDatasetIds.size).toBe(1);
      expect(state.selectedDatasetIds.has('ARGO_001')).toBe(true);
    });

    it('should remove dataset from Set', () => {
      const store = useAddDatasetsStore.getState();

      // First, add a dataset
      store.toggleDatasetSelection('ARGO_001');

      // Verify it was added
      let state = useAddDatasetsStore.getState();
      expect(state.selectedDatasetIds.size).toBe(1);
      expect(state.selectedDatasetIds.has('ARGO_001')).toBe(true);

      // Toggle again - should remove it
      store.toggleDatasetSelection('ARGO_001');

      // Verify dataset was removed
      state = useAddDatasetsStore.getState();
      expect(state.selectedDatasetIds.size).toBe(0);
      expect(state.selectedDatasetIds.has('ARGO_001')).toBe(false);
    });

    it('should toggle same dataset twice returns to original state', () => {
      const store = useAddDatasetsStore.getState();

      // Get initial state
      const initialSize =
        useAddDatasetsStore.getState().selectedDatasetIds.size;
      const initialHasDataset = useAddDatasetsStore
        .getState()
        .selectedDatasetIds.has('HOT_001');

      // Toggle dataset once
      store.toggleDatasetSelection('HOT_001');

      // State should have changed
      let state = useAddDatasetsStore.getState();
      const afterFirstToggleSize = state.selectedDatasetIds.size;
      const afterFirstToggleHas = state.selectedDatasetIds.has('HOT_001');
      expect(afterFirstToggleSize).not.toBe(initialSize);
      expect(afterFirstToggleHas).not.toBe(initialHasDataset);

      // Toggle same dataset again
      store.toggleDatasetSelection('HOT_001');

      // State should return to original
      state = useAddDatasetsStore.getState();
      expect(state.selectedDatasetIds.size).toBe(initialSize);
      expect(state.selectedDatasetIds.has('HOT_001')).toBe(initialHasDataset);
    });

    it('should handle multiple different datasets', () => {
      const store = useAddDatasetsStore.getState();

      // Add multiple datasets
      store.toggleDatasetSelection('ARGO_001');
      store.toggleDatasetSelection('HOT_001');
      store.toggleDatasetSelection('BATS_001');

      // Verify all were added
      let state = useAddDatasetsStore.getState();
      expect(state.selectedDatasetIds.size).toBe(3);
      expect(state.selectedDatasetIds.has('ARGO_001')).toBe(true);
      expect(state.selectedDatasetIds.has('HOT_001')).toBe(true);
      expect(state.selectedDatasetIds.has('BATS_001')).toBe(true);

      // Remove one dataset
      store.toggleDatasetSelection('HOT_001');

      // Verify only the selected one was removed
      state = useAddDatasetsStore.getState();
      expect(state.selectedDatasetIds.size).toBe(2);
      expect(state.selectedDatasetIds.has('ARGO_001')).toBe(true);
      expect(state.selectedDatasetIds.has('HOT_001')).toBe(false);
      expect(state.selectedDatasetIds.has('BATS_001')).toBe(true);
    });
  });

  describe('T010: getSelectionState', () => {
    it('should compute correct selection state with selections', () => {
      const store = useAddDatasetsStore.getState();

      // Setup: 10 total datasets (3 selectable, 7 unavailable)
      const sourceDatasets = [
        {
          datasetShortName: 'ARGO_001',
          datasetLongName: 'Argo Float',
          isInvalid: false,
        },
        {
          datasetShortName: 'HOT_001',
          datasetLongName: 'HOT Data',
          isInvalid: false,
        },
        {
          datasetShortName: 'BATS_001',
          datasetLongName: 'BATS Data',
          isInvalid: false,
        },
        {
          datasetShortName: 'INVALID_001',
          datasetLongName: null,
          isInvalid: true,
        },
        {
          datasetShortName: 'INVALID_002',
          datasetLongName: null,
          isInvalid: true,
        },
        {
          datasetShortName: 'EXISTING_001',
          datasetLongName: 'Already 1',
          isInvalid: false,
        },
        {
          datasetShortName: 'EXISTING_002',
          datasetLongName: 'Already 2',
          isInvalid: false,
        },
        {
          datasetShortName: 'EXISTING_003',
          datasetLongName: 'Already 3',
          isInvalid: false,
        },
        {
          datasetShortName: 'EXISTING_004',
          datasetLongName: 'Already 4',
          isInvalid: false,
        },
        {
          datasetShortName: 'EXISTING_005',
          datasetLongName: 'Already 5',
          isInvalid: false,
        },
      ];

      useAddDatasetsStore.setState({
        sourceCollectionDatasets: sourceDatasets,
        currentCollectionDatasetIds: new Set([
          'EXISTING_001',
          'EXISTING_002',
          'EXISTING_003',
          'EXISTING_004',
          'EXISTING_005',
        ]),
        selectedDatasetIds: new Set(['ARGO_001', 'HOT_001', 'BATS_001']),
      });

      const selectionState = store.getSelectionState();

      expect(selectionState.selectedCount).toBe(3);
      expect(selectionState.totalSelectable).toBe(3);
      expect(selectionState.totalUnavailable).toBe(7);
      expect(selectionState.canAdd).toBe(true);
      expect(selectionState.buttonLabel).toBe('Add Valid Datasets (3)');
    });

    it('should compute correct selection state with no selections', () => {
      const store = useAddDatasetsStore.getState();

      const sourceDatasets = [
        {
          datasetShortName: 'ARGO_001',
          datasetLongName: 'Argo',
          isInvalid: false,
        },
        {
          datasetShortName: 'HOT_001',
          datasetLongName: 'HOT',
          isInvalid: false,
        },
        {
          datasetShortName: 'BATS_001',
          datasetLongName: 'BATS',
          isInvalid: false,
        },
      ];

      useAddDatasetsStore.setState({
        sourceCollectionDatasets: sourceDatasets,
        currentCollectionDatasetIds: new Set(),
        selectedDatasetIds: new Set(),
      });

      const selectionState = store.getSelectionState();

      expect(selectionState.selectedCount).toBe(0);
      expect(selectionState.totalSelectable).toBe(3);
      expect(selectionState.totalUnavailable).toBe(0);
      expect(selectionState.canAdd).toBe(false);
      expect(selectionState.buttonLabel).toBe('Add Valid Datasets (0)');
    });

    it('should compute correct selection state when all datasets unavailable', () => {
      const store = useAddDatasetsStore.getState();

      const sourceDatasets = [
        {
          datasetShortName: 'INVALID_001',
          datasetLongName: null,
          isInvalid: true,
        },
        {
          datasetShortName: 'INVALID_002',
          datasetLongName: null,
          isInvalid: true,
        },
        {
          datasetShortName: 'EXISTING_001',
          datasetLongName: 'Already Present',
          isInvalid: false,
        },
      ];

      useAddDatasetsStore.setState({
        sourceCollectionDatasets: sourceDatasets,
        currentCollectionDatasetIds: new Set(['EXISTING_001']),
        selectedDatasetIds: new Set(),
      });

      const selectionState = store.getSelectionState();

      expect(selectionState.selectedCount).toBe(0);
      expect(selectionState.totalSelectable).toBe(0);
      expect(selectionState.totalUnavailable).toBe(3);
      expect(selectionState.canAdd).toBe(false);
      expect(selectionState.buttonLabel).toBe('Add Valid Datasets (0)');
    });

    it('should update button label dynamically as selections change', () => {
      const store = useAddDatasetsStore.getState();

      const sourceDatasets = [
        {
          datasetShortName: 'ARGO_001',
          datasetLongName: 'Dataset 1',
          isInvalid: false,
        },
        {
          datasetShortName: 'HOT_001',
          datasetLongName: 'Dataset 2',
          isInvalid: false,
        },
        {
          datasetShortName: 'BATS_001',
          datasetLongName: 'Dataset 3',
          isInvalid: false,
        },
      ];

      useAddDatasetsStore.setState({
        sourceCollectionDatasets: sourceDatasets,
        currentCollectionDatasetIds: new Set(),
        selectedDatasetIds: new Set(),
      });

      let selectionState = store.getSelectionState();
      expect(selectionState.buttonLabel).toBe('Add Valid Datasets (0)');

      useAddDatasetsStore.setState({
        selectedDatasetIds: new Set(['ARGO_001']),
      });
      selectionState = useAddDatasetsStore.getState().getSelectionState();
      expect(selectionState.buttonLabel).toBe('Add Valid Datasets (1)');

      useAddDatasetsStore.setState({
        selectedDatasetIds: new Set(['ARGO_001', 'HOT_001', 'BATS_001']),
      });
      selectionState = useAddDatasetsStore.getState().getSelectionState();
      expect(selectionState.buttonLabel).toBe('Add Valid Datasets (3)');
    });

    it('should correctly count unavailable datasets from multiple sources', () => {
      const store = useAddDatasetsStore.getState();

      const sourceDatasets = [
        {
          datasetShortName: 'ARGO_001',
          datasetLongName: 'Selectable',
          isInvalid: false,
        },
        {
          datasetShortName: 'INVALID_001',
          datasetLongName: null,
          isInvalid: true,
        },
        {
          datasetShortName: 'INVALID_002',
          datasetLongName: null,
          isInvalid: true,
        },
        {
          datasetShortName: 'INVALID_003',
          datasetLongName: null,
          isInvalid: true,
        },
        {
          datasetShortName: 'EXISTING_001',
          datasetLongName: 'Already 1',
          isInvalid: false,
        },
        {
          datasetShortName: 'EXISTING_002',
          datasetLongName: 'Already 2',
          isInvalid: false,
        },
      ];

      useAddDatasetsStore.setState({
        sourceCollectionDatasets: sourceDatasets,
        currentCollectionDatasetIds: new Set(['EXISTING_001', 'EXISTING_002']),
        selectedDatasetIds: new Set(['ARGO_001']),
      });

      const selectionState = store.getSelectionState();

      expect(selectionState.selectedCount).toBe(1);
      expect(selectionState.totalSelectable).toBe(1);
      expect(selectionState.totalUnavailable).toBe(5);
      expect(selectionState.canAdd).toBe(true);
    });
  });

  describe('T011: confirmSwitch', () => {
    it('should clear selections and load new collection', () => {
      const store = useAddDatasetsStore.getState();

      // Setup: Set pendingCollectionId and selectedDatasetIds
      useAddDatasetsStore.setState({
        pendingCollectionId: 42,
        selectedDatasetIds: new Set(['ARGO_001', 'HOT_001', 'NEW_DATASET_001']),
        showSwitchCollectionWarning: true,
        selectedCollectionId: 10, // Old collection
      });

      // Call confirmSwitch
      store.confirmSwitch();

      // Verify: selectedDatasetIds cleared
      const state = useAddDatasetsStore.getState();
      expect(state.selectedDatasetIds.size).toBe(0);

      // Verify: showSwitchCollectionWarning set to false
      expect(state.showSwitchCollectionWarning).toBe(false);

      // Verify: pendingCollectionId cleared (set to null)
      expect(state.pendingCollectionId).toBe(null);

      // Note: The actual loading of the new collection would be tested
      // in integration tests with API mocking (T013)
      // For this unit test, we verify the state changes only
    });

    it('should handle confirmSwitch when pendingCollectionId is null (edge case)', () => {
      const store = useAddDatasetsStore.getState();

      // Setup: No pendingCollectionId set
      useAddDatasetsStore.setState({
        pendingCollectionId: null,
        selectedDatasetIds: new Set(['ARGO_001']),
        showSwitchCollectionWarning: true,
      });

      // Call confirmSwitch - should handle gracefully
      // This tests the precondition check
      expect(() => {
        store.confirmSwitch();
      }).not.toThrow();

      // State should still be cleaned up
      const state = useAddDatasetsStore.getState();
      expect(state.showSwitchCollectionWarning).toBe(false);
    });

    it('should not affect other unrelated state when confirming switch', () => {
      const store = useAddDatasetsStore.getState();

      // Setup: Set some unrelated state
      useAddDatasetsStore.setState({
        pendingCollectionId: 42,
        selectedDatasetIds: new Set(['ARGO_001']),
        showSwitchCollectionWarning: true,
        isOpen: true, // Should remain true
        activeTab: 'collections', // Should remain 'collections'
        searchQuery: 'test query', // Should remain unchanged
      });

      // Call confirmSwitch
      store.confirmSwitch();

      // Verify: Unrelated state preserved
      const state = useAddDatasetsStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.activeTab).toBe('collections');
      expect(state.searchQuery).toBe('test query');

      // Verify: Only relevant state changed
      expect(state.selectedDatasetIds.size).toBe(0);
      expect(state.showSwitchCollectionWarning).toBe(false);
      expect(state.pendingCollectionId).toBe(null);
    });
  });

  describe('T012: addSelectedDatasets', () => {
    it('should map selected IDs to full dataset objects and call callback', () => {
      const store = useAddDatasetsStore.getState();

      // Setup: Mock sourceCollectionDatasets with 5 datasets
      const mockSourceDatasets = [
        {
          datasetId: 1,
          datasetShortName: 'ARGO_001',
          datasetLongName: 'Argo Float Data 2020',
          isInvalid: false,
        },
        {
          datasetId: 2,
          datasetShortName: 'HOT_001',
          datasetLongName: 'Hawaii Ocean Time-series',
          isInvalid: false,
        },
        {
          datasetId: 3,
          datasetShortName: 'BATS_001',
          datasetLongName: 'Bermuda Atlantic Time-series',
          isInvalid: false,
        },
        {
          datasetId: 4,
          datasetShortName: 'INVALID_001',
          datasetLongName: null,
          isInvalid: true,
        },
        {
          datasetId: 5,
          datasetShortName: 'OTHER_001',
          datasetLongName: 'Other Dataset',
          isInvalid: false,
        },
      ];

      // Setup: Mock selectedDatasetIds with 2 dataset short names
      useAddDatasetsStore.setState({
        sourceCollectionDatasets: mockSourceDatasets,
        selectedDatasetIds: new Set(['ARGO_001', 'HOT_001']),
        isOpen: true,
      });

      // Setup: Callback to capture passed datasets
      const mockCallback = jest.fn();

      // Act: Call addSelectedDatasets
      store.addSelectedDatasets(mockCallback);

      // Assert: Callback receives 2 full dataset objects matching selected IDs
      expect(mockCallback).toHaveBeenCalledTimes(1);
      const passedDatasets = mockCallback.mock.calls[0][0];
      expect(passedDatasets).toHaveLength(2);
      expect(passedDatasets).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            datasetShortName: 'ARGO_001',
            datasetLongName: 'Argo Float Data 2020',
          }),
          expect.objectContaining({
            datasetShortName: 'HOT_001',
            datasetLongName: 'Hawaii Ocean Time-series',
          }),
        ]),
      );

      // Assert: Modal closed after callback
      const state = useAddDatasetsStore.getState();
      expect(state.isOpen).toBe(false);
    });

    it('should handle edge case when no datasets selected', () => {
      const store = useAddDatasetsStore.getState();

      // Setup: sourceCollectionDatasets but no selections
      useAddDatasetsStore.setState({
        sourceCollectionDatasets: [
          {
            datasetShortName: 'ARGO_001',
            datasetLongName: 'Argo',
            isInvalid: false,
          },
        ],
        selectedDatasetIds: new Set(), // Empty
        isOpen: true,
      });

      const mockCallback = jest.fn();

      // Act: Call addSelectedDatasets with no selections
      store.addSelectedDatasets(mockCallback);

      // Assert: Callback should not be called (precondition check)
      expect(mockCallback).not.toHaveBeenCalled();

      // Assert: Modal should not close (operation did not complete)
      const state = useAddDatasetsStore.getState();
      expect(state.isOpen).toBe(true);
    });

    it('should handle edge case when sourceCollectionDatasets is null', () => {
      const store = useAddDatasetsStore.getState();

      // Setup: selectedDatasetIds but no sourceCollectionDatasets
      useAddDatasetsStore.setState({
        sourceCollectionDatasets: null,
        selectedDatasetIds: new Set(['ARGO_001']),
        isOpen: true,
      });

      const mockCallback = jest.fn();

      // Act: Call addSelectedDatasets with null source
      store.addSelectedDatasets(mockCallback);

      // Assert: Callback should not be called (precondition check)
      expect(mockCallback).not.toHaveBeenCalled();

      // Assert: Modal should not close (operation did not complete)
      const state = useAddDatasetsStore.getState();
      expect(state.isOpen).toBe(true);
    });

    it('should preserve dataset order from sourceCollectionDatasets', () => {
      const store = useAddDatasetsStore.getState();

      // Setup: sourceCollectionDatasets in specific order
      const mockSourceDatasets = [
        {
          datasetShortName: 'ZULU_001',
          displayOrder: 3,
          datasetLongName: 'Zulu',
        },
        {
          datasetShortName: 'ALPHA_001',
          displayOrder: 1,
          datasetLongName: 'Alpha',
        },
        {
          datasetShortName: 'BRAVO_001',
          displayOrder: 2,
          datasetLongName: 'Bravo',
        },
      ];

      // Select in different order than source
      useAddDatasetsStore.setState({
        sourceCollectionDatasets: mockSourceDatasets,
        selectedDatasetIds: new Set(['ALPHA_001', 'ZULU_001', 'BRAVO_001']),
        isOpen: true,
      });

      const mockCallback = jest.fn();

      // Act: Call addSelectedDatasets
      store.addSelectedDatasets(mockCallback);

      // Assert: Datasets returned in sourceCollectionDatasets order (not selection order)
      const passedDatasets = mockCallback.mock.calls[0][0];
      expect(passedDatasets[0].datasetShortName).toBe('ZULU_001');
      expect(passedDatasets[1].datasetShortName).toBe('ALPHA_001');
      expect(passedDatasets[2].datasetShortName).toBe('BRAVO_001');
    });

    it('should reset all state after closing modal', () => {
      const store = useAddDatasetsStore.getState();

      // Setup: Full state with selections
      useAddDatasetsStore.setState({
        sourceCollectionDatasets: [
          { datasetShortName: 'ARGO_001', isInvalid: false },
        ],
        selectedDatasetIds: new Set(['ARGO_001']),
        selectedCollectionId: 42,
        selectedCollectionSummary: { id: 42, name: 'Test' },
        isOpen: true,
      });

      const mockCallback = jest.fn();

      // Act: Call addSelectedDatasets
      store.addSelectedDatasets(mockCallback);

      // Assert: State reset to initial values (via closeModal)
      const state = useAddDatasetsStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.selectedCollectionId).toBe(null);
      expect(state.selectedCollectionSummary).toBe(null);
      expect(state.sourceCollectionDatasets).toBe(null);
      expect(state.selectedDatasetIds.size).toBe(0);
    });
  });

  describe('T013: loadCollectionDatasets success flow', () => {
    // Sample collection data matching the API contract
    const mockCollection = {
      id: 42,
      name: 'Ocean Temperature Data',
      description: 'Collection of temperature datasets',
      isPublic: true,
      createdDate: '2025-10-01T10:00:00Z',
      modifiedDate: '2025-10-08T14:23:45Z',
      ownerName: 'Jane Scientist',
      ownerAffiliation: 'Ocean Research Institute',
      datasetCount: 3,
      isOwner: false,
      views: 25,
      downloads: 10,
      copies: 3,
      datasets: [
        {
          datasetId: 1,
          datasetShortName: 'ARGO_001',
          datasetLongName: 'Argo Float Temperature Profiles 2020',
          datasetVersion: '1.0',
          isInvalid: false,
          addedDate: '2025-10-01T10:00:00Z',
          displayOrder: 1,
        },
        {
          datasetId: 2,
          datasetShortName: 'ARGO_002',
          datasetLongName: 'Argo Float Temperature Profiles 2021',
          datasetVersion: '1.0',
          isInvalid: false,
          addedDate: '2025-10-02T10:00:00Z',
          displayOrder: 2,
        },
        {
          datasetId: 3,
          datasetShortName: 'INVALID_001',
          datasetLongName: 'Deleted Dataset',
          datasetVersion: '1.0',
          isInvalid: true,
          addedDate: '2025-10-03T10:00:00Z',
          displayOrder: 3,
        },
      ],
    };

    it('should set isLoadingDatasets to true during fetch', async () => {
      const store = useAddDatasetsStore.getState();

      // Set up store with selected collection
      useAddDatasetsStore.setState({
        selectedCollectionId: 42,
      });

      // Mock API to return a promise that we can control
      let resolvePromise;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      collectionsAPI.getCollectionById.mockReturnValue(mockPromise);

      // Start the load (don't await yet)
      const loadPromise = store.loadCollectionDatasets();

      // Check loading state immediately (should be true)
      // Note: We need to wait a tick for the promise to update state
      await Promise.resolve();
      const state = useAddDatasetsStore.getState();
      expect(state.isLoadingDatasets).toBe(true);

      // Resolve the promise to clean up
      resolvePromise({
        ok: true,
        json: async () => mockCollection,
      });

      // Wait for the load to complete
      await loadPromise;
    });

    it('should populate sourceCollectionDatasets on success', async () => {
      const store = useAddDatasetsStore.getState();

      // Set up store with selected collection
      useAddDatasetsStore.setState({
        selectedCollectionId: 42,
      });

      // Mock successful API response
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      // Call loadCollectionDatasets
      await store.loadCollectionDatasets();

      // Verify sourceCollectionDatasets is populated
      const state = useAddDatasetsStore.getState();
      expect(state.sourceCollectionDatasets).toEqual(mockCollection.datasets);
      expect(state.sourceCollectionDatasets).toHaveLength(3);
    });

    it('should set isLoadingDatasets to false on success', async () => {
      const store = useAddDatasetsStore.getState();

      // Set up store with selected collection
      useAddDatasetsStore.setState({
        selectedCollectionId: 42,
      });

      // Mock successful API response
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      // Call loadCollectionDatasets
      await store.loadCollectionDatasets();

      // Verify isLoadingDatasets is false
      const state = useAddDatasetsStore.getState();
      expect(state.isLoadingDatasets).toBe(false);
    });

    it('should clear loadError on success', async () => {
      const store = useAddDatasetsStore.getState();

      // Set up store with selected collection and previous error
      useAddDatasetsStore.setState({
        selectedCollectionId: 42,
        loadError: 'Previous error',
      });

      // Mock successful API response
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      // Call loadCollectionDatasets
      await store.loadCollectionDatasets();

      // Verify loadError is cleared
      const state = useAddDatasetsStore.getState();
      expect(state.loadError).toBeNull();
    });

    it('should call API with correct parameters', async () => {
      const store = useAddDatasetsStore.getState();

      // Set up store with selected collection
      useAddDatasetsStore.setState({
        selectedCollectionId: 42,
      });

      // Mock successful API response
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      // Call loadCollectionDatasets
      await store.loadCollectionDatasets();

      // Verify API was called with correct parameters
      expect(collectionsAPI.getCollectionById).toHaveBeenCalledWith(42, {
        includeDatasets: true,
      });
    });

    it('should handle collection with no datasets', async () => {
      const store = useAddDatasetsStore.getState();

      // Set up store with selected collection
      useAddDatasetsStore.setState({
        selectedCollectionId: 42,
      });

      const emptyCollection = {
        ...mockCollection,
        datasetCount: 0,
        datasets: [],
      };

      // Mock successful API response
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: true,
        json: async () => emptyCollection,
      });

      // Call loadCollectionDatasets
      await store.loadCollectionDatasets();

      // Verify sourceCollectionDatasets is empty array
      const state = useAddDatasetsStore.getState();
      expect(state.sourceCollectionDatasets).toEqual([]);
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBeNull();
    });

    it('should preserve datasets with isInvalid flag', async () => {
      const store = useAddDatasetsStore.getState();

      // Set up store with selected collection
      useAddDatasetsStore.setState({
        selectedCollectionId: 42,
      });

      // Mock successful API response
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: true,
        json: async () => mockCollection,
      });

      // Call loadCollectionDatasets
      await store.loadCollectionDatasets();

      // Verify invalid dataset is preserved
      const state = useAddDatasetsStore.getState();
      const invalidDataset = state.sourceCollectionDatasets.find(
        (d) => d.datasetShortName === 'INVALID_001',
      );
      expect(invalidDataset).toBeDefined();
      expect(invalidDataset.isInvalid).toBe(true);
    });

    it('should handle collection with missing datasets array', async () => {
      const store = useAddDatasetsStore.getState();

      // Set up store with selected collection
      useAddDatasetsStore.setState({
        selectedCollectionId: 42,
      });

      const collectionWithoutDatasets = {
        ...mockCollection,
        datasets: undefined,
      };

      // Mock successful API response
      collectionsAPI.getCollectionById.mockResolvedValue({
        ok: true,
        json: async () => collectionWithoutDatasets,
      });

      // Call loadCollectionDatasets
      await store.loadCollectionDatasets();

      // Verify sourceCollectionDatasets defaults to empty array
      const state = useAddDatasetsStore.getState();
      expect(state.sourceCollectionDatasets).toEqual([]);
      expect(state.isLoadingDatasets).toBe(false);
      expect(state.loadError).toBeNull();
    });
  });
});
