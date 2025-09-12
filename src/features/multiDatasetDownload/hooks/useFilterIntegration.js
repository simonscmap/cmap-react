import useSubsetFiltering from '../../../shared/filtering/hooks/useSubsetFiltering';

/**
 * Integration hook for managing filter state and request cancellation logic
 * Provides utilities for determining when to cancel requests and how to display row counts
 */
const useFilterIntegration = () => {
  const filters = useSubsetFiltering();

  return {
    /**
     * Get current filter state
     * @returns {Object} Current filter values
     */
    getCurrentFilters: () => filters.filterValues,

    /**
     * Check if any filters are currently active
     * @returns {boolean} True if filters are applied
     */
    isFiltered: () => filters.isFiltered,

    /**
     * Determine if filter changes should cancel pending requests
     * @param {Object} newFilters - New filter state
     * @param {Object} oldFilters - Previous filter state
     * @returns {boolean} True if requests should be cancelled
     */
    shouldCancelRequests: (newFilters, oldFilters) => {
      return JSON.stringify(newFilters) !== JSON.stringify(oldFilters);
    },

    /**
     * Get appropriate display format for row counts based on selection and filter state
     * @param {string} datasetId - Dataset identifier
     * @param {number} unfilteredCount - Original unfiltered row count
     * @param {boolean} isSelected - Whether dataset is currently selected
     * @param {boolean} isFiltered - Whether any filters are active
     * @returns {string} Formatted display string for row count
     */
    getDisplayRowCount: (
      datasetId,
      unfilteredCount,
      isSelected,
      isFiltered,
    ) => {
      if (isSelected) {
        return 'Loading...'; // Will be replaced with actual count
      }
      if (isFiltered) {
        return `≤ ${unfilteredCount.toLocaleString()}`;
      }
      return unfilteredCount.toLocaleString();
    },
  };
};

export default useFilterIntegration;
