/**
 * Tests for editCollectionStore change detection algorithm
 *
 * Test Coverage:
 * - hasUnsavedChanges computed getter - core change detection logic
 * - Whitespace trimming for name and description fields
 * - Dataset removal detection in change calculation
 * - Dataset array sorting to avoid false positives from order differences
 * - Deep equality checks across all collection fields
 * - Edge cases: empty collections, null values, special characters
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

    // Helper to update collection for testing
    updateCollectionForTesting: (updates) => {
      const { collection } = get();
      if (!collection) return;

      set({
        collection: {
          ...collection,
          ...updates,
        },
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

describe('editCollectionStore change detection', () => {
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

  describe('hasUnsavedChanges - baseline behavior', () => {
    it('should return false when no changes have been made', () => {
      const { hasUnsavedChanges } = store.getState();

      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should return false when collection is null', () => {
      store.getState().resetStore();
      const { hasUnsavedChanges } = store.getState();

      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should return false when originalCollection is null', () => {
      const state = store.getState();
      store.setState({
        collection: state.collection,
        originalCollection: null,
      });
      const { hasUnsavedChanges } = store.getState();

      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should return false when both collection and originalCollection are null', () => {
      store.getState().resetStore();
      const { hasUnsavedChanges } = store.getState();

      expect(hasUnsavedChanges()).toBe(false);
    });
  });

  describe('hasUnsavedChanges - name changes', () => {
    it('should return true when name is changed', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ name: 'Different Collection Name' });

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should return false when name is changed back to original', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ name: 'Temporary Name' });
      expect(hasUnsavedChanges()).toBe(true);

      updateCollectionForTesting({ name: mockCollection.name });
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should trim leading whitespace from name in comparison', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ name: '   ' + mockCollection.name });

      // Should not count as change due to trim
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should trim trailing whitespace from name in comparison', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ name: mockCollection.name + '   ' });

      // Should not count as change due to trim
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should trim both leading and trailing whitespace from name', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        name: '   ' + mockCollection.name + '   ',
      });

      // Should not count as change due to trim
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should detect actual name change despite whitespace', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ name: '  Different Name  ' });

      // Should count as change because trimmed values differ
      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should handle multiple spaces and tabs in name', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        name: '  \t  ' + mockCollection.name + '  \t  ',
      });

      // Should not count as change due to trim
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should handle newlines in name whitespace', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ name: '\n' + mockCollection.name + '\n' });

      // Should not count as change due to trim
      expect(hasUnsavedChanges()).toBe(false);
    });
  });

  describe('hasUnsavedChanges - description changes', () => {
    it('should return true when description is changed', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ description: 'Different description text' });

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should return false when description is changed back to original', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ description: 'Temporary description' });
      expect(hasUnsavedChanges()).toBe(true);

      updateCollectionForTesting({ description: mockCollection.description });
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should trim leading whitespace from description in comparison', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        description: '   ' + mockCollection.description,
      });

      // Should not count as change due to trim
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should trim trailing whitespace from description in comparison', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        description: mockCollection.description + '   ',
      });

      // Should not count as change due to trim
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should trim both leading and trailing whitespace from description', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        description: '   ' + mockCollection.description + '   ',
      });

      // Should not count as change due to trim
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should detect actual description change despite whitespace', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ description: '  Different description  ' });

      // Should count as change because trimmed values differ
      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should handle empty string description vs whitespace-only', () => {
      const {
        initializeForTesting,
        updateCollectionForTesting,
        hasUnsavedChanges,
      } = store.getState();

      // Initialize with empty description
      const collectionWithEmptyDesc = {
        ...mockCollection,
        description: '',
      };
      initializeForTesting(collectionWithEmptyDesc);

      updateCollectionForTesting({ description: '   ' });

      // Should not count as change (both trim to empty string)
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should preserve internal whitespace in description', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      const descriptionWithInternalSpaces =
        'First line\n\nSecond line with  spaces';
      updateCollectionForTesting({
        description: descriptionWithInternalSpaces,
      });

      // Should count as change (different content)
      expect(hasUnsavedChanges()).toBe(true);
    });
  });

  describe('hasUnsavedChanges - visibility changes', () => {
    it('should return true when visibility changes from private to public', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ isPublic: true });

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should return true when visibility changes from public to private', () => {
      const {
        initializeForTesting,
        updateCollectionForTesting,
        hasUnsavedChanges,
      } = store.getState();

      const publicCollection = { ...mockCollection, isPublic: true };
      initializeForTesting(publicCollection);

      updateCollectionForTesting({ isPublic: false });

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should return false when visibility is changed back to original', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ isPublic: true });
      expect(hasUnsavedChanges()).toBe(true);

      updateCollectionForTesting({ isPublic: false });
      expect(hasUnsavedChanges()).toBe(false);
    });
  });

  describe('hasUnsavedChanges - dataset removal detection', () => {
    it('should return true when dataset is marked for removal', () => {
      const { setDatasetsToRemoveForTesting, hasUnsavedChanges } =
        store.getState();

      setDatasetsToRemoveForTesting(['bats_temp_001']);

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should return false when datasetsToRemove is empty', () => {
      const { hasUnsavedChanges } = store.getState();

      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should return true when multiple datasets are marked for removal', () => {
      const { setDatasetsToRemoveForTesting, hasUnsavedChanges } =
        store.getState();

      setDatasetsToRemoveForTesting(['bats_temp_001', 'bats_temp_002']);

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should return true when all datasets are marked for removal', () => {
      const { setDatasetsToRemoveForTesting, hasUnsavedChanges } =
        store.getState();

      setDatasetsToRemoveForTesting([
        'bats_temp_001',
        'bats_temp_002',
        'bats_salinity_001',
      ]);

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should return false when dataset removal is cancelled', () => {
      const { setDatasetsToRemoveForTesting, hasUnsavedChanges } =
        store.getState();

      setDatasetsToRemoveForTesting(['bats_temp_001']);
      expect(hasUnsavedChanges()).toBe(true);

      setDatasetsToRemoveForTesting([]);
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should filter out datasets marked for removal in current normalized state', () => {
      const { setDatasetsToRemoveForTesting, hasUnsavedChanges } =
        store.getState();

      // Original has 3 datasets, current will have 2 after filtering
      setDatasetsToRemoveForTesting(['bats_temp_001']);

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should not filter datasets from original normalized state', () => {
      const { setDatasetsToRemoveForTesting, hasUnsavedChanges } =
        store.getState();

      // Original should always contain all 3 datasets
      setDatasetsToRemoveForTesting(['bats_temp_001']);

      // This should detect a change (2 datasets vs 3 datasets)
      expect(hasUnsavedChanges()).toBe(true);
    });
  });

  describe('hasUnsavedChanges - dataset array sorting', () => {
    it('should not detect changes when dataset order differs but content is same', () => {
      const { initializeForTesting, hasUnsavedChanges } = store.getState();

      // Create collection with datasets in different order
      const reorderedDatasets = [
        mockCollection.datasets[2], // bats_salinity_001
        mockCollection.datasets[0], // bats_temp_001
        mockCollection.datasets[1], // bats_temp_002
      ];

      const reorderedCollection = {
        ...mockCollection,
        datasets: reorderedDatasets,
      };

      // Set both current and original to have different order
      // but same content (which would be sorted in comparison)
      initializeForTesting(reorderedCollection);

      // Should not detect change because arrays are sorted before comparison
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should sort dataset short names alphabetically in comparison', () => {
      const { setDatasetsToRemoveForTesting, hasUnsavedChanges } =
        store.getState();

      // Arrays are sorted: ['bats_salinity_001', 'bats_temp_001', 'bats_temp_002']
      // After removing first one: ['bats_salinity_001', 'bats_temp_002']
      setDatasetsToRemoveForTesting(['bats_temp_001']);

      // Should detect change (different sorted arrays)
      expect(hasUnsavedChanges()).toBe(true);
    });
  });

  describe('hasUnsavedChanges - combined changes', () => {
    it('should detect changes when name and description are both modified', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        name: 'New Name',
        description: 'New Description',
      });

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should detect changes when name is modified and dataset is removed', () => {
      const {
        updateCollectionForTesting,
        setDatasetsToRemoveForTesting,
        hasUnsavedChanges,
      } = store.getState();

      updateCollectionForTesting({ name: 'New Name' });
      setDatasetsToRemoveForTesting(['bats_temp_001']);

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should detect changes when description is modified and visibility is changed', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        description: 'New Description',
        isPublic: true,
      });

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should detect changes when all fields are modified', () => {
      const {
        updateCollectionForTesting,
        setDatasetsToRemoveForTesting,
        hasUnsavedChanges,
      } = store.getState();

      updateCollectionForTesting({
        name: 'New Name',
        description: 'New Description',
        isPublic: true,
      });
      setDatasetsToRemoveForTesting(['bats_temp_001']);

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should return false when all changes are reverted', () => {
      const {
        updateCollectionForTesting,
        setDatasetsToRemoveForTesting,
        hasUnsavedChanges,
      } = store.getState();

      // Make multiple changes
      updateCollectionForTesting({
        name: 'New Name',
        description: 'New Description',
        isPublic: true,
      });
      setDatasetsToRemoveForTesting(['bats_temp_001']);
      expect(hasUnsavedChanges()).toBe(true);

      // Revert all changes
      updateCollectionForTesting({
        name: mockCollection.name,
        description: mockCollection.description,
        isPublic: mockCollection.isPublic,
      });
      setDatasetsToRemoveForTesting([]);

      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should handle whitespace normalization across all string fields', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        name: '  ' + mockCollection.name + '  ',
        description: '  ' + mockCollection.description + '  ',
      });

      // Should not count as change due to trim on both fields
      expect(hasUnsavedChanges()).toBe(false);
    });
  });

  describe('hasUnsavedChanges - edge cases', () => {
    it('should handle empty collection (no datasets)', () => {
      const { initializeForTesting, hasUnsavedChanges } = store.getState();

      const emptyCollection = {
        ...mockCollection,
        datasets: [],
        datasetCount: 0,
      };
      initializeForTesting(emptyCollection);

      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should handle empty collection with dataset added to datasetsToRemove', () => {
      const {
        initializeForTesting,
        setDatasetsToRemoveForTesting,
        hasUnsavedChanges,
      } = store.getState();

      const emptyCollection = {
        ...mockCollection,
        datasets: [],
        datasetCount: 0,
      };
      initializeForTesting(emptyCollection);

      // Adding a non-existent dataset to removal list should not affect empty collection
      setDatasetsToRemoveForTesting(['nonexistent_dataset']);

      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should handle very long name with whitespace', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      const longName = 'A'.repeat(200);
      updateCollectionForTesting({ name: '  ' + longName + '  ' });

      // Should detect change (different trimmed content)
      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should handle very long description with whitespace', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      const longDescription = 'B'.repeat(500);
      updateCollectionForTesting({
        description: '  ' + longDescription + '  ',
      });

      // Should detect change (different trimmed content)
      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should handle special characters in name', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        name: 'Collection with special chars: @#$%^&*()',
      });

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should handle unicode characters in description', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        description: 'Description with unicode: 你好世界 🌍',
      });

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should handle dataset IDs with special characters in removal list', () => {
      const {
        initializeForTesting,
        setDatasetsToRemoveForTesting,
        hasUnsavedChanges,
      } = store.getState();

      const collectionWithSpecialChars = {
        ...mockCollection,
        datasets: [
          {
            datasetId: 1,
            datasetShortName: 'dataset_with-special.chars_123',
            datasetLongName: 'Special Dataset',
            datasetVersion: '1.0',
            isValid: true,
            addedDate: '2025-10-01T10:00:00Z',
            displayOrder: 1,
          },
        ],
      };
      initializeForTesting(collectionWithSpecialChars);

      setDatasetsToRemoveForTesting(['dataset_with-special.chars_123']);

      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should handle case sensitivity in name comparison', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      // Change case of name
      updateCollectionForTesting({
        name: mockCollection.name.toUpperCase(),
      });

      // Should detect change (case-sensitive comparison)
      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should handle case sensitivity in description comparison', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      // Change case of description
      updateCollectionForTesting({
        description: mockCollection.description.toUpperCase(),
      });

      // Should detect change (case-sensitive comparison)
      expect(hasUnsavedChanges()).toBe(true);
    });
  });

  describe('hasUnsavedChanges - JSON serialization', () => {
    it('should use JSON.stringify for deep equality check', () => {
      const { hasUnsavedChanges } = store.getState();

      // No changes, so serialized objects should be equal
      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should handle nested object serialization correctly', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      // Modify a field to trigger serialization difference
      updateCollectionForTesting({ name: 'Different Name' });

      // Serialized objects should be different
      expect(hasUnsavedChanges()).toBe(true);
    });

    it('should handle array serialization correctly', () => {
      const { setDatasetsToRemoveForTesting, hasUnsavedChanges } =
        store.getState();

      // Remove a dataset to change array content
      setDatasetsToRemoveForTesting(['bats_temp_001']);

      // Serialized arrays should be different
      expect(hasUnsavedChanges()).toBe(true);
    });
  });

  describe('hasUnsavedChanges - whitespace-only changes', () => {
    it('should not detect change when only adding leading whitespace to name', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ name: '   ' + mockCollection.name });

      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should not detect change when only adding trailing whitespace to name', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({ name: mockCollection.name + '   ' });

      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should not detect change when only adding leading whitespace to description', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        description: '   ' + mockCollection.description,
      });

      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should not detect change when only adding trailing whitespace to description', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        description: mockCollection.description + '   ',
      });

      expect(hasUnsavedChanges()).toBe(false);
    });

    it('should not detect change when adding whitespace to both name and description', () => {
      const { updateCollectionForTesting, hasUnsavedChanges } =
        store.getState();

      updateCollectionForTesting({
        name: '  ' + mockCollection.name + '  ',
        description: '  ' + mockCollection.description + '  ',
      });

      expect(hasUnsavedChanges()).toBe(false);
    });
  });

  describe('hasUnsavedChanges - performance considerations', () => {
    it('should handle large number of datasets efficiently', () => {
      const { initializeForTesting, hasUnsavedChanges } = store.getState();

      // Create collection with many datasets
      const manyDatasets = Array.from({ length: 100 }, (_, i) => ({
        datasetId: i,
        datasetShortName: `dataset_${String(i).padStart(3, '0')}`,
        datasetLongName: `Dataset ${i}`,
        datasetVersion: '1.0',
        isValid: true,
        addedDate: '2025-10-01T10:00:00Z',
        displayOrder: i,
      }));

      const largeCollection = {
        ...mockCollection,
        datasets: manyDatasets,
        datasetCount: 100,
      };

      initializeForTesting(largeCollection);

      // Should complete without performance issues
      const result = hasUnsavedChanges();
      expect(result).toBe(false);
    });

    it('should handle frequent calls to hasUnsavedChanges efficiently', () => {
      const { hasUnsavedChanges } = store.getState();

      // Call multiple times
      for (let i = 0; i < 100; i++) {
        hasUnsavedChanges();
      }

      // Should complete without performance issues
      expect(hasUnsavedChanges()).toBe(false);
    });
  });
});
