import { create } from 'zustand';
import { areConstraintsEqual } from '../../../shared/utility/constraintComparison';
import {
  isValidTemporalRange,
  isValidDepthRange,
} from '../../../shared/utility/spatialTemporalDepthValidation';
import logInit from '../../../Services/log-service';
import { captureError } from '../../../shared/errorCapture';
import {
  isEligibleForEstimation,
  estimateRowCountForDataset,
} from '../estimation';
import { getSearchDatabaseApi } from '../../catalogSearch/api';
import { queryRowCountsApi } from '../api/queryRowCountsApi';
import {
  isDatasetFullyWithinConstraints,
  hasNoOverlapWithConstraints,
  queryDatasetMetadata,
  normalizeAllDatasetsForEstimation,
} from './rowCountCalculationHelpers';

const log = logInit('rowCount/rowCountCalculationStore');

// Store contains only state (private - not exported)
const useRowCountCalculationStore = create(() => ({
  calculatedRowCounts: {},
  originalRowCounts: {},
  datasetMetadata: {},
  rowCountsLoading: false,
  rowCountLoadingDatasets: new Set(),
  rowCountError: null,
  skippedDatasets: [],
  failedRowCounts: [],
  estimatedRowCounts: new Set(),
  datasetConstraintSnapshots: {},

  lastSearchDatasetIds: new Set(),
  abortController: null,
  staleDatasets: [], // Datasets that need backend calculation (non-estimable)
}));

export const useCalculatedRowCounts = () =>
  useRowCountCalculationStore((state) => state.calculatedRowCounts);

export const useOriginalRowCounts = () =>
  useRowCountCalculationStore((state) => state.originalRowCounts);

export const useRowCountsLoading = () =>
  useRowCountCalculationStore((state) => state.rowCountsLoading);

export const useRowCountLoadingDatasets = () =>
  useRowCountCalculationStore((state) => state.rowCountLoadingDatasets);

export const useRowCountError = () =>
  useRowCountCalculationStore((state) => state.rowCountError);

export const useSkippedDatasets = () =>
  useRowCountCalculationStore((state) => state.skippedDatasets);

export const useFailedRowCounts = () =>
  useRowCountCalculationStore((state) => state.failedRowCounts);

export const useEstimatedRowCounts = () =>
  useRowCountCalculationStore((state) => state.estimatedRowCounts);

export const useDatasetConstraintSnapshots = () =>
  useRowCountCalculationStore((state) => state.datasetConstraintSnapshots);

export const useLastSearchDatasetIds = () =>
  useRowCountCalculationStore((state) => state.lastSearchDatasetIds);

export const useStaleDatasets = () =>
  useRowCountCalculationStore((state) => state.staleDatasets);

export const useHasStaleDatasets = () =>
  useRowCountCalculationStore((state) => state.staleDatasets.length > 0);

export function getEffectiveRowCount(shortName, calculatedRowCounts, originalRowCounts) {
  return calculatedRowCounts[shortName] ?? originalRowCounts[shortName] ?? 0;
}

export function isDatasetStale(shortName, currentConstraints) {
  const {
    datasetConstraintSnapshots,
    calculatedRowCounts,
    lastSearchDatasetIds,
    datasetMetadata,
  } = useRowCountCalculationStore.getState();
  const datasetSnapshot = datasetConstraintSnapshots[shortName];
  const metadata = datasetMetadata[shortName];

  const canEstimate = isEligibleForEstimation({
    spatialResolution: metadata?.spatialResolution,
    temporalResolution: metadata?.temporalResolution,
  });
  if (canEstimate) {
    return { isStale: false, reason: null };
  }

  // Dataset no longer in search results but has calculated row count
  if (lastSearchDatasetIds.size > 0 && !lastSearchDatasetIds.has(shortName)) {
    if (calculatedRowCounts[shortName] !== undefined) {
      return { isStale: true, reason: 'dataset_not_in_results' };
    }
  }

  // No snapshot exists: check if constraints would affect row count
  if (!datasetSnapshot) {
    if (metadata && currentConstraints) {
      const fullyContained = isDatasetFullyWithinConstraints(
        metadata,
        currentConstraints,
      );
      if (!fullyContained) {
        return { isStale: true, reason: 'constraints_restrict_dataset' };
      }
    }
    return { isStale: false, reason: null };
  }

  // No constraints means user wants unfiltered data - not stale
  if (!currentConstraints) {
    return { isStale: false, reason: null };
  }

  // Snapshot exists: invalid constraints can't make row counts stale
  if (currentConstraints.temporalEnabled) {
    const temporalConstraints = {
      enabled: true,
      ...currentConstraints.temporalRange,
    };
    if (!isValidTemporalRange(temporalConstraints)) {
      return { isStale: false, reason: null };
    }
  }

  if (currentConstraints.depthEnabled) {
    const depthConstraints = {
      enabled: true,
      ...currentConstraints.depthRange,
    };
    if (!isValidDepthRange(depthConstraints)) {
      return { isStale: false, reason: null };
    }
  }

  const constraintsMatch = areConstraintsEqual(
    currentConstraints,
    datasetSnapshot,
  );

  if (!constraintsMatch) {
    return { isStale: true, reason: 'constraints_changed' };
  }

  return { isStale: false, reason: null };
}

export function isDatasetSkipped(shortName) {
  const { skippedDatasets } = useRowCountCalculationStore.getState();
  return skippedDatasets.includes(shortName);
}

export async function queryRowCountsForDatasets(
  datasets,
  constraints,
  skippedDatasets = [],
) {
  if (!datasets || datasets.length === 0) {
    return;
  }

  const previousController =
    useRowCountCalculationStore.getState().abortController;
  if (previousController) {
    previousController.abort();
  }

  const controller = new AbortController();
  useRowCountCalculationStore.setState({ abortController: controller });

  const shortNames = datasets.map((d) => d.shortName);
  useRowCountCalculationStore.setState({
    rowCountLoadingDatasets: new Set(shortNames),
    rowCountsLoading: true,
    rowCountError: null,
  });

  try {
    let data = { results: {}, skipped: [], failed: [] };

    if (shortNames.length > 0) {
      const backendConstraints = {
        spatial: {
          latMin: constraints.spatialBounds.latMin,
          latMax: constraints.spatialBounds.latMax,
          lonMin: constraints.spatialBounds.lonMin,
          lonMax: constraints.spatialBounds.lonMax,
        },
      };

      if (
        constraints.temporalEnabled &&
        constraints.temporalRange.timeMin &&
        constraints.temporalRange.timeMax
      ) {
        backendConstraints.temporal = {
          startDate: constraints.temporalRange.timeMin
            .toISOString()
            .split('T')[0],
          endDate: constraints.temporalRange.timeMax
            .toISOString()
            .split('T')[0],
        };
      }

      if (
        constraints.depthEnabled &&
        constraints.depthRange.depthMin !== null &&
        constraints.depthRange.depthMax !== null
      ) {
        backendConstraints.spatial.depthMin = constraints.depthRange.depthMin;
        backendConstraints.spatial.depthMax = constraints.depthRange.depthMax;
      }

      const response = await queryRowCountsApi(
        shortNames,
        backendConstraints,
        controller.signal,
      );

      if (!response.ok) {
        throw new Error('Failed to calculate row counts');
      }

      data = await response.json();
    }

    const backendSkipped = Array.isArray(data.skipped) ? data.skipped : [];
    const allSkippedDatasets = Array.from(
      new Set([...skippedDatasets, ...backendSkipped]),
    );

    const currentState = useRowCountCalculationStore.getState();
    const newSnapshots = { ...currentState.datasetConstraintSnapshots };
    Object.keys(data.results).forEach((shortName) => {
      if (
        !data.failed.includes(shortName) &&
        !allSkippedDatasets.includes(shortName)
      ) {
        newSnapshots[shortName] = {
          spatialBounds: { ...constraints.spatialBounds },
          temporalRange: { ...constraints.temporalRange },
          depthRange: { ...constraints.depthRange },
          temporalEnabled: constraints.temporalEnabled,
          depthEnabled: constraints.depthEnabled,
          includePartialOverlaps: constraints.includePartialOverlaps,
          timestamp: new Date(),
        };
      }
    });

    const updatedEstimatedSet = new Set(currentState.estimatedRowCounts);
    Object.keys(data.results).forEach((shortName) => {
      updatedEstimatedSet.delete(shortName);
    });

    const successfullyRecalculated = new Set(Object.keys(data.results));
    const updatedStaleDatasets = currentState.staleDatasets.filter(
      (shortName) => !successfullyRecalculated.has(shortName),
    );

    useRowCountCalculationStore.setState({
      calculatedRowCounts: {
        ...currentState.calculatedRowCounts,
        ...data.results,
      },
      datasetConstraintSnapshots: newSnapshots,
      estimatedRowCounts: updatedEstimatedSet,
      skippedDatasets: allSkippedDatasets,
      failedRowCounts: data.failed,
      staleDatasets: updatedStaleDatasets,
      rowCountsLoading: false,
      rowCountLoadingDatasets: new Set(),
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }

    captureError(error, { action: 'calculateRowCounts', datasets: shortNames });

    useRowCountCalculationStore.setState({
      rowCountsLoading: false,
      rowCountLoadingDatasets: new Set(),
      rowCountError: error.message || 'Failed to calculate row counts',
    });
  }
}

export async function queryRowCounts(constraints) {
  const { lastSearchDatasetIds, datasetMetadata } =
    useRowCountCalculationStore.getState();

  if (!lastSearchDatasetIds || lastSearchDatasetIds.size === 0) {
    return;
  }

  const datasets = Array.from(lastSearchDatasetIds).map((shortName) => ({
    shortName,
  }));

  const staleDatasets = datasets.filter((dataset) => {
    const { isStale: stale } = isDatasetStale(dataset.shortName, constraints);
    return stale;
  });

  const datasetsToQuery = staleDatasets.filter((dataset) => {
    const metadata = datasetMetadata[dataset.shortName];
    const canEstimate = isEligibleForEstimation({
      spatialResolution: metadata?.spatialResolution,
      temporalResolution: metadata?.temporalResolution,
    });

    return !canEstimate;
  });

  await queryRowCountsForDatasets(datasetsToQuery, constraints);
}

async function _estimateMissingRowCountsUsingFullExtent(
  shortNames,
  metadataMap,
) {
  const datasetsNeedingEstimation = shortNames.filter((shortName) => {
    const metadata = metadataMap[shortName];
    const hasNoRowCount =
      metadata?.rowCount === null || metadata?.rowCount === undefined;
    if (!hasNoRowCount) {
      return false;
    }
    const canEstimate = isEligibleForEstimation({
      spatialResolution: metadata?.spatialResolution,
      temporalResolution: metadata?.temporalResolution,
    });
    return canEstimate;
  });

  if (datasetsNeedingEstimation.length === 0) {
    log.debug('no constraints provided, using original row counts', {
      datasetCount: shortNames.length,
    });
    useRowCountCalculationStore.setState({ staleDatasets: [] });
    return;
  }

  log.debug('estimating total row counts for datasets with missing rowCount', {
    count: datasetsNeedingEstimation.length,
    datasets: datasetsNeedingEstimation,
  });

  const normalizedDatasets = normalizeAllDatasetsForEstimation(
    datasetsNeedingEstimation,
    metadataMap,
  );

  const fullExtentConstraints = {
    spatialBounds: { latMin: -90, latMax: 90, lonMin: -180, lonMax: 180 },
    temporalEnabled: false,
    temporalRange: { timeMin: null, timeMax: null },
    depthEnabled: false,
    depthRange: { depthMin: null, depthMax: null },
  };

  await _estimateEligibleDatasets(normalizedDatasets, fullExtentConstraints);
  useRowCountCalculationStore.setState({ staleDatasets: [] });
}

// Internal function - estimates row counts for eligible datasets
async function _estimateEligibleDatasets(datasets, constraints) {
  if (!datasets || datasets.length === 0) {
    return;
  }

  try {
    const catalogDb = getSearchDatabaseApi();
    const estimated = [];

    for (const dataset of datasets) {
      try {
        const result = await estimateRowCountForDataset(
          dataset,
          constraints,
          catalogDb,
        );

        if (result.eligible) {
          estimated.push({
            shortName: dataset.shortName,
            rowCount: result.rowCount,
          });
        }
      } catch (error) {
        log.error('estimation failed', {
          shortName: dataset.shortName,
          error: error.message,
        });
      }
    }

    if (estimated.length > 0) {
      const estimatedRowCounts = {};
      estimated.forEach((e) => {
        estimatedRowCounts[e.shortName] = e.rowCount;
      });

      const currentState = useRowCountCalculationStore.getState();
      const newSnapshots = { ...currentState.datasetConstraintSnapshots };
      estimated.forEach((e) => {
        newSnapshots[e.shortName] = {
          spatialBounds: { ...constraints.spatialBounds },
          temporalRange: { ...constraints.temporalRange },
          depthRange: { ...constraints.depthRange },
          temporalEnabled: constraints.temporalEnabled,
          depthEnabled: constraints.depthEnabled,
          includePartialOverlaps: constraints.includePartialOverlaps,
          timestamp: new Date(),
        };
      });

      const newEstimatedSet = new Set(currentState.estimatedRowCounts);
      estimated.forEach((e) => newEstimatedSet.add(e.shortName));

      useRowCountCalculationStore.setState({
        calculatedRowCounts: {
          ...currentState.calculatedRowCounts,
          ...estimatedRowCounts,
        },
        datasetConstraintSnapshots: newSnapshots,
        estimatedRowCounts: newEstimatedSet,
      });
    }
  } catch (error) {
    log.error('estimation failed', { error: error.message });
  }
}

function _computeStaleDatasets(datasets, constraints) {
  if (!datasets || datasets.length === 0) {
    useRowCountCalculationStore.setState({ staleDatasets: [] });
    return;
  }

  const stale = [];
  const knownZeros = {};

  for (const dataset of datasets) {
    const eligible = isEligibleForEstimation({
      spatialResolution: dataset.spatialResolution,
      temporalResolution: dataset.temporalResolution,
    });

    if (eligible) {
      continue;
    }

    const fullyContained = isDatasetFullyWithinConstraints(
      dataset,
      constraints,
    );
    if (!fullyContained) {
      if (hasNoOverlapWithConstraints(dataset, constraints)) {
        knownZeros[dataset.shortName] = 0;
      } else {
        stale.push(dataset.shortName);
      }
    }
  }

  const currentState = useRowCountCalculationStore.getState();
  let stateUpdate = { staleDatasets: stale };

  if (Object.keys(knownZeros).length > 0) {
    const newSnapshots = { ...currentState.datasetConstraintSnapshots };
    Object.keys(knownZeros).forEach((shortName) => {
      newSnapshots[shortName] = {
        spatialBounds: { ...constraints.spatialBounds },
        temporalRange: { ...constraints.temporalRange },
        depthRange: { ...constraints.depthRange },
        temporalEnabled: constraints.temporalEnabled,
        depthEnabled: constraints.depthEnabled,
        includePartialOverlaps: constraints.includePartialOverlaps,
        timestamp: new Date(),
      };
    });

    stateUpdate.calculatedRowCounts = {
      ...currentState.calculatedRowCounts,
      ...knownZeros,
    };
    stateUpdate.datasetConstraintSnapshots = newSnapshots;
  }

  useRowCountCalculationStore.setState(stateUpdate);
}

/**
 * Main entry point for row count calculation.
 *
 * Fetches dataset metadata from catalog DB (rowCount, spatialResolution, temporalResolution),
 * estimates row counts for eligible datasets (client-side), and marks non-estimable datasets
 * as stale for later backend calculation.
 *
 * If no constraints are provided, just stores original row counts from catalog DB.
 *
 * @param {string[]} shortNames - Array of dataset short names
 * @param {Constraints} [constraints] - Optional constraint configuration
 */
export async function initializeRowCounts(shortNames, constraints) {
  if (!shortNames || shortNames.length === 0) {
    useRowCountCalculationStore.setState({
      staleDatasets: [],
      originalRowCounts: {},
      datasetMetadata: {},
    });
    return;
  }

  useRowCountCalculationStore.setState({
    lastSearchDatasetIds: new Set(shortNames),
  });

  const metadataMap = await queryDatasetMetadata(shortNames);

  const originalRowCounts = {};
  for (const shortName of shortNames) {
    const metadata = metadataMap[shortName];
    if (metadata && metadata.rowCount !== undefined) {
      originalRowCounts[shortName] = metadata.rowCount;
    }
  }
  useRowCountCalculationStore.setState({
    originalRowCounts,
    datasetMetadata: metadataMap,
  });

  if (!constraints) {
    await _estimateMissingRowCountsUsingFullExtent(shortNames, metadataMap);
    return;
  }

  const normalizedDatasets = normalizeAllDatasetsForEstimation(
    shortNames,
    metadataMap,
  );

  _computeStaleDatasets(normalizedDatasets, constraints);
  await _estimateEligibleDatasets(normalizedDatasets, constraints);
}

export function clearRowCounts() {
  const controller = useRowCountCalculationStore.getState().abortController;
  if (controller) {
    controller.abort();
  }

  useRowCountCalculationStore.setState({
    calculatedRowCounts: {},
    originalRowCounts: {},
    datasetMetadata: {},
    rowCountError: null,
    skippedDatasets: [],
    failedRowCounts: [],
    estimatedRowCounts: new Set(),
    rowCountLoadingDatasets: new Set(),
    rowCountsLoading: false,
    datasetConstraintSnapshots: {},
    abortController: null,
    staleDatasets: [],
  });
}

export async function reEstimateWithConstraints(constraints) {
  const { lastSearchDatasetIds, datasetMetadata } =
    useRowCountCalculationStore.getState();

  if (!lastSearchDatasetIds || lastSearchDatasetIds.size === 0) {
    log.debug('no datasets to re-estimate');
    return;
  }

  if (!constraints) {
    if (Object.keys(datasetMetadata).length === 0) {
      log.debug('no constraints but metadata not loaded yet, skipping');
      return;
    }
    useRowCountCalculationStore.setState({
      calculatedRowCounts: {},
      datasetConstraintSnapshots: {},
      staleDatasets: [],
    });

    await _estimateMissingRowCountsUsingFullExtent(
      Array.from(lastSearchDatasetIds),
      datasetMetadata,
    );
    return;
  }

  const normalizedDatasets = normalizeAllDatasetsForEstimation(
    Array.from(lastSearchDatasetIds),
    datasetMetadata,
  );

  log.debug('re-estimating row counts with new constraints', {
    datasetCount: normalizedDatasets.length,
  });

  _computeStaleDatasets(normalizedDatasets, constraints);
  await _estimateEligibleDatasets(normalizedDatasets, constraints);
}
