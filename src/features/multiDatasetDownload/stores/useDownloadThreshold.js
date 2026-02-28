import { useMemo } from 'react';
import {
  useCalculatedRowCounts,
  useOriginalRowCounts,
  useRowCountsLoading,
  useStaleDatasets,
  getEffectiveRowCount,
} from '../../rowCount';
import { DOWNLOAD_LIMITS } from '../../../shared/constants/downloadConstants';

const MAX_ROW_THRESHOLD = DOWNLOAD_LIMITS.MAX_ROW_THRESHOLD;

function getStaleSelectedDatasets(selectedDatasets, staleDatasets) {
  if (!selectedDatasets || selectedDatasets.size === 0) {
    return [];
  }

  const staleSet = new Set(staleDatasets);
  const result = [];
  for (const shortName of selectedDatasets) {
    if (staleSet.has(shortName)) {
      result.push(shortName);
    }
  }
  return result;
}

function calculateTotalRows(selectedDatasets, calculatedRowCounts, originalRowCounts) {
  let total = 0;
  for (const shortName of selectedDatasets) {
    total += getEffectiveRowCount(shortName, calculatedRowCounts, originalRowCounts);
  }
  return total;
}

export function useDownloadThreshold(selectedDatasets) {
  const calculatedRowCounts = useCalculatedRowCounts();
  const originalRowCounts = useOriginalRowCounts();
  const isLoading = useRowCountsLoading();
  const staleDatasets = useStaleDatasets();

  const selectedStaleDatasets = useMemo(
    () => getStaleSelectedDatasets(selectedDatasets, staleDatasets),
    [selectedDatasets, staleDatasets],
  );
  const hasStaleDatasets = selectedStaleDatasets.length > 0;

  const totalRows = calculateTotalRows(
    selectedDatasets,
    calculatedRowCounts,
    originalRowCounts,
  );

  const isOverThreshold = totalRows > MAX_ROW_THRESHOLD;
  const canDownload = !isLoading && !isOverThreshold && !hasStaleDatasets;

  return {
    totalRows,
    maxRows: MAX_ROW_THRESHOLD,
    isLoading,
    isOverThreshold,
    hasStaleDatasets,
    selectedStaleDatasets,
    canDownload,
  };
}

export default useDownloadThreshold;
