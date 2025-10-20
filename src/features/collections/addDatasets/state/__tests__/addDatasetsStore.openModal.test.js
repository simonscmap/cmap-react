/**
 * Tests for addDatasetsStore.openModal action (T006)
 *
 * Test Coverage:
 * - T006: openModal initializes de-duplication state
 *
 * Contract: addDatasetsStore.contract.md lines 50-62
 *
 * Following TDD approach: Tests written before implementation
 * These tests should FAIL initially (Phase 3.2) and pass after implementation (Phase 3.3: T025)
 */

import { act, renderHook } from '@testing-library/react-hooks';
import { useAddDatasetsStore } from '../addDatasetsStore';

describe('addDatasetsStore.openModal (T006)', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useAddDatasetsStore());
    act(() => {
      // Reset to initial state
      if (result.current.closeModal) {
        result.current.closeModal();
      }
    });
  });

  describe('de-duplication state initialization', () => {
    it('should populate currentCollectionDatasetIds Set from input datasets', () => {
      const { result } = renderHook(() => useAddDatasetsStore());

      // Mock current collection datasets with Dataset_Short_Name field
      const currentCollectionDatasets = [
        {
          datasetId: 1,
          Dataset_Short_Name: 'ARGO_001',
          datasetLongName: 'Argo Float Dataset 001',
          isInvalid: false,
        },
        {
          datasetId: 2,
          Dataset_Short_Name: 'HOT_001',
          datasetLongName: 'Hawaii Ocean Time-series 001',
          isInvalid: false,
        },
        {
          datasetId: 3,
          Dataset_Short_Name: 'BATS_001',
          datasetLongName: 'Bermuda Atlantic Time-series 001',
          isInvalid: false,
        },
      ];

      act(() => {
        result.current.openModal(currentCollectionDatasets);
      });

      // Verify Set is populated with correct dataset short names
      expect(result.current.currentCollectionDatasetIds).toBeInstanceOf(Set);
      expect(result.current.currentCollectionDatasetIds.size).toBe(3);
      expect(result.current.currentCollectionDatasetIds.has('ARGO_001')).toBe(
        true,
      );
      expect(result.current.currentCollectionDatasetIds.has('HOT_001')).toBe(
        true,
      );
      expect(result.current.currentCollectionDatasetIds.has('BATS_001')).toBe(
        true,
      );
    });

    it('should handle empty datasets array', () => {
      const { result } = renderHook(() => useAddDatasetsStore());

      const currentCollectionDatasets = [];

      act(() => {
        result.current.openModal(currentCollectionDatasets);
      });

      // Verify Set is empty but initialized
      expect(result.current.currentCollectionDatasetIds).toBeInstanceOf(Set);
      expect(result.current.currentCollectionDatasetIds.size).toBe(0);
    });

    it('should handle datasets with invalid datasets', () => {
      const { result } = renderHook(() => useAddDatasetsStore());

      const currentCollectionDatasets = [
        {
          datasetId: 1,
          Dataset_Short_Name: 'VALID_001',
          datasetLongName: 'Valid Dataset',
          isInvalid: false,
        },
        {
          datasetId: 2,
          Dataset_Short_Name: 'INVALID_001',
          datasetLongName: 'Invalid Dataset',
          isInvalid: true, // This dataset is invalid
        },
      ];

      act(() => {
        result.current.openModal(currentCollectionDatasets);
      });

      // Verify both valid and invalid datasets are included
      // (de-duplication doesn't filter, it includes all)
      expect(result.current.currentCollectionDatasetIds.size).toBe(2);
      expect(result.current.currentCollectionDatasetIds.has('VALID_001')).toBe(
        true,
      );
      expect(
        result.current.currentCollectionDatasetIds.has('INVALID_001'),
      ).toBe(true);
    });
  });

  describe('modal state initialization', () => {
    it('should set isOpen to true', () => {
      const { result } = renderHook(() => useAddDatasetsStore());

      const currentCollectionDatasets = [
        {
          datasetId: 1,
          Dataset_Short_Name: 'ARGO_001',
          datasetLongName: 'Argo Float Dataset 001',
          isInvalid: false,
        },
      ];

      act(() => {
        result.current.openModal(currentCollectionDatasets);
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should reset all other state to defaults', () => {
      const { result } = renderHook(() => useAddDatasetsStore());

      // Set store to non-default state first
      act(() => {
        // Simulate previous state
        useAddDatasetsStore.setState({
          isOpen: false,
          activeTab: 'catalog', // Non-default
          searchQuery: 'previous search',
          selectedCollectionId: 42,
          selectedCollectionSummary: {
            id: 42,
            name: 'Previous Collection',
            totalDatasets: 10,
            validDatasets: 8,
            invalidDatasets: 2,
            isPublic: true,
          },
          isLoadingDatasets: true,
          loadError: 'Previous error',
          sourceCollectionDatasets: [
            { Dataset_Short_Name: 'OLD_001', datasetLongName: 'Old Dataset' },
          ],
          selectedDatasetIds: new Set(['SELECTED_001', 'SELECTED_002']),
          currentCollectionDatasetIds: new Set(['OLD_001']),
          showSwitchCollectionWarning: true,
          pendingCollectionId: 99,
        });
      });

      const currentCollectionDatasets = [
        {
          datasetId: 1,
          Dataset_Short_Name: 'NEW_001',
          datasetLongName: 'New Dataset',
          isInvalid: false,
        },
      ];

      act(() => {
        result.current.openModal(currentCollectionDatasets);
      });

      // Verify all state reset to defaults (except isOpen and currentCollectionDatasetIds)
      expect(result.current.isOpen).toBe(true); // Should be true
      expect(result.current.activeTab).toBe('collections'); // Reset to default
      expect(result.current.searchQuery).toBe(''); // Reset to default
      expect(result.current.selectedCollectionId).toBeNull(); // Reset to default
      expect(result.current.selectedCollectionSummary).toBeNull(); // Reset to default
      expect(result.current.isLoadingDatasets).toBe(false); // Reset to default
      expect(result.current.loadError).toBeNull(); // Reset to default
      expect(result.current.sourceCollectionDatasets).toBeNull(); // Reset to default
      expect(result.current.selectedDatasetIds).toBeInstanceOf(Set);
      expect(result.current.selectedDatasetIds.size).toBe(0); // Reset to empty Set
      expect(result.current.showSwitchCollectionWarning).toBe(false); // Reset to default
      expect(result.current.pendingCollectionId).toBeNull(); // Reset to default

      // Verify currentCollectionDatasetIds is updated (not reset)
      expect(result.current.currentCollectionDatasetIds.size).toBe(1);
      expect(result.current.currentCollectionDatasetIds.has('NEW_001')).toBe(
        true,
      );
    });
  });

  describe('edge cases', () => {
    it('should allow multiple openModal calls (re-initialization)', () => {
      const { result } = renderHook(() => useAddDatasetsStore());

      const firstDatasets = [
        {
          datasetId: 1,
          Dataset_Short_Name: 'FIRST_001',
          datasetLongName: 'First Dataset',
          isInvalid: false,
        },
      ];

      act(() => {
        result.current.openModal(firstDatasets);
      });

      expect(result.current.currentCollectionDatasetIds.has('FIRST_001')).toBe(
        true,
      );

      // Call openModal again with different datasets
      const secondDatasets = [
        {
          datasetId: 2,
          Dataset_Short_Name: 'SECOND_001',
          datasetLongName: 'Second Dataset',
          isInvalid: false,
        },
      ];

      act(() => {
        result.current.openModal(secondDatasets);
      });

      // Verify old datasets are replaced, not merged
      expect(result.current.currentCollectionDatasetIds.size).toBe(1);
      expect(result.current.currentCollectionDatasetIds.has('FIRST_001')).toBe(
        false,
      );
      expect(result.current.currentCollectionDatasetIds.has('SECOND_001')).toBe(
        true,
      );
    });

    it('should handle datasets with duplicate Dataset_Short_Name values', () => {
      const { result } = renderHook(() => useAddDatasetsStore());

      // Edge case: API shouldn't return duplicates, but Set should handle it
      const currentCollectionDatasets = [
        {
          datasetId: 1,
          Dataset_Short_Name: 'DUPLICATE_001',
          datasetLongName: 'Dataset 1',
          isInvalid: false,
        },
        {
          datasetId: 2,
          Dataset_Short_Name: 'DUPLICATE_001', // Same short name
          datasetLongName: 'Dataset 2',
          isInvalid: false,
        },
      ];

      act(() => {
        result.current.openModal(currentCollectionDatasets);
      });

      // Set should deduplicate automatically
      expect(result.current.currentCollectionDatasetIds.size).toBe(1);
      expect(
        result.current.currentCollectionDatasetIds.has('DUPLICATE_001'),
      ).toBe(true);
    });

    it('should handle datasets with null or undefined Dataset_Short_Name', () => {
      const { result } = renderHook(() => useAddDatasetsStore());

      const currentCollectionDatasets = [
        {
          datasetId: 1,
          Dataset_Short_Name: 'VALID_001',
          datasetLongName: 'Valid Dataset',
          isInvalid: false,
        },
        {
          datasetId: 2,
          Dataset_Short_Name: null,
          datasetLongName: 'Null Short Name',
          isInvalid: false,
        },
        {
          datasetId: 3,
          Dataset_Short_Name: undefined,
          datasetLongName: 'Undefined Short Name',
          isInvalid: false,
        },
      ];

      act(() => {
        result.current.openModal(currentCollectionDatasets);
      });

      // Set should include null/undefined if present
      expect(result.current.currentCollectionDatasetIds.size).toBe(3);
      expect(result.current.currentCollectionDatasetIds.has('VALID_001')).toBe(
        true,
      );
      expect(result.current.currentCollectionDatasetIds.has(null)).toBe(true);
      expect(result.current.currentCollectionDatasetIds.has(undefined)).toBe(
        true,
      );
    });
  });
});
