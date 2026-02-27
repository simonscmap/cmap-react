import { useMemo } from 'react';
import {
  useCalculatedRowCounts,
  useOriginalRowCounts,
  useRowCountsLoading,
  useStaleDatasets,
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

function calculateHybridSum(
  selectedDatasets,
  calculatedRowCounts,
  originalRowCounts,
  staleDatasets,
) {
  const staleSet = new Set(staleDatasets);
  let total = 0;

  for (const shortName of selectedDatasets) {
    if (staleSet.has(shortName)) {
      total += originalRowCounts[shortName] || 0;
    } else {
      total +=
        calculatedRowCounts[shortName] ?? originalRowCounts[shortName] ?? 0;
    }
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

  const totalRows = calculateHybridSum(
    selectedDatasets,
    calculatedRowCounts,
    originalRowCounts,
    staleDatasets,
  );

  const isOverThreshold = totalRows > MAX_ROW_THRESHOLD;
  const canDownload = !isLoading && !isOverThreshold;

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
