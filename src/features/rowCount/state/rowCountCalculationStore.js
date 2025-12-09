import { create } from 'zustand';
import { areConstraintsEqual } from '../../../shared/utility/constraintComparison';
import {
  isValidTemporalRange,
  isValidDepthRange,
} from '../../../shared/utility/spatialTemporalDepthValidation';
import logInit from '../../../Services/log-service';
import { isEligibleForEstimation, estimateRowCount } from '../estimation';
import { getSearchDatabaseApi } from '../../catalogSearch/api';
import { queryRowCountsApi } from '../api/rowCountApi';

const log = logInit('rowCount/rowCountCalculationStore');

// Store contains only state (private - not exported)
const useRowCountCalculationStore = create(() => ({
  calculatedRowCounts: {},
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

export function isDatasetStale(
  shortName,
  currentConstraints,
  datasetUtilization,
) {
  const {
    datasetConstraintSnapshots,
    calculatedRowCounts,
    lastSearchDatasetIds,
  } = useRowCountCalculationStore.getState();
  const datasetSnapshot = datasetConstraintSnapshots[shortName];

  // Dataset no longer in search results but has calculated row count
  if (lastSearchDatasetIds.size > 0 && !lastSearchDatasetIds.has(shortName)) {
    if (calculatedRowCounts[shortName] !== undefined) {
      return { isStale: true, reason: 'dataset_not_in_results' };
    }
  }

  // No snapshot exists: check if constraints would affect row count
  if (!datasetSnapshot) {
    if (currentConstraints.temporalEnabled) {
      const temporalConstraints = {
        enabled: true,
        ...currentConstraints.temporalRange,
      };
      if (isValidTemporalRange(temporalConstraints)) {
        return { isStale: true, reason: 'temporal_enabled' };
      }
    }

    if (currentConstraints.depthEnabled) {
      const depthConstraints = {
        enabled: true,
        ...currentConstraints.depthRange,
      };
      if (isValidDepthRange(depthConstraints)) {
        return { isStale: true, reason: 'depth_enabled' };
      }
    }

    if (datasetUtilization < 1.0) {
      return { isStale: true, reason: 'spatial_partial' };
    }

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
    useRowCountCalculationStore.setState({
      calculatedRowCounts: {},
      skippedDatasets: skippedDatasets,
      failedRowCounts: [],
      rowCountsLoading: false,
      rowCountLoadingDatasets: new Set(),
    });
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

    useRowCountCalculationStore.setState({
      calculatedRowCounts: {
        ...currentState.calculatedRowCounts,
        ...data.results,
      },
      datasetConstraintSnapshots: newSnapshots,
      estimatedRowCounts: updatedEstimatedSet,
      skippedDatasets: allSkippedDatasets,
      failedRowCounts: data.failed,
      rowCountsLoading: false,
      rowCountLoadingDatasets: new Set(),
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }

    useRowCountCalculationStore.setState({
      rowCountsLoading: false,
      rowCountLoadingDatasets: new Set(),
      rowCountError: error.message || 'Failed to calculate row counts',
    });
  }
}

/**
 * Triggers backend calculation for stale (non-estimable) datasets.
 * Call this when user clicks "Recalculate All" button.
 *
 * @param {Array} results - Array of datasets to check for staleness
 * @param {Constraints} constraints - Current constraint configuration
 */
export async function queryRowCounts(results, constraints) {
  if (!results || results.length === 0) {
    return;
  }

  const datasetsToRecalculate = results.filter((dataset) => {
    const { isStale: stale } = isDatasetStale(
      dataset.shortName,
      constraints,
      dataset.datasetUtilization,
    );
    return stale;
  });

  await queryRowCountsForDatasets(datasetsToRecalculate, constraints);
}

// Internal function - estimates row counts for eligible datasets
async function _estimateEligibleDatasets(datasets, constraints) {
  if (!datasets || datasets.length === 0) {
    useRowCountCalculationStore.setState({ staleDatasets: [] });
    return [];
  }

  try {
    const catalogDb = getSearchDatabaseApi();

    const estimated = [];
    const stale = [];

    for (const dataset of datasets) {
      try {
        const eligible = isEligibleForEstimation(
          {
            spatialResolution: dataset.spatialResolution,
            temporalResolution: dataset.temporalResolution,
            tableName: dataset.tableName,
            depthMin: dataset.depthMin,
            depthMax: dataset.depthMax,
          },
          constraints,
        );

        if (eligible) {
          const datasetMetadata = {
            Spatial_Resolution: dataset.spatialResolution,
            Temporal_Resolution: dataset.temporalResolution,
            Table_Name: dataset.tableName,
            Short_Name: dataset.shortName,
            Lat_Min: dataset.latMin,
            Time_Min: dataset.timeMin,
            Time_Max: dataset.timeMax,
            Has_Depth: dataset.hasDepth,
          };

          const count = await estimateRowCount(
            datasetMetadata,
            constraints,
            catalogDb,
          );
          estimated.push({ shortName: dataset.shortName, rowCount: count });
        } else {
          stale.push(dataset.shortName);
        }
      } catch (error) {
        log.error('estimation failed', {
          shortName: dataset.shortName,
          error: error.message,
        });
        stale.push(dataset.shortName);
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
        staleDatasets: stale,
      });
    } else {
      useRowCountCalculationStore.setState({
        staleDatasets: stale,
      });
    }

    return stale;
  } catch (error) {
    log.error('estimation failed', { error: error.message });
    const allShortNames = datasets.map((d) => d.shortName);
    useRowCountCalculationStore.setState({
      staleDatasets: allShortNames,
    });
    return allShortNames;
  }
}

/**
 * Main entry point for row count calculation.
 * Estimates row counts for eligible datasets (client-side) and marks
 * non-estimable datasets as stale for later backend calculation.
 *
 * @param {Array<RowCountDataset>} datasets - Array of datasets with normalized shape
 * @param {Constraints} constraints - Current constraint configuration
 *
 * Dataset shape (RowCountDataset):
 * - shortName: string - Dataset identifier
 * - rows: number - Total row count (fallback)
 * - datasetUtilization: number - Spatial coverage 0.0-1.0
 * - spatialResolution: string - e.g., "1/2° X 1/2°" or "Irregular"
 * - temporalResolution: string - e.g., "Weekly" or "Irregular"
 * - tableName: string - Database table name
 * - latMin: number - Dataset spatial bounds
 * - timeMin: string - Dataset temporal bounds (ISO date)
 * - timeMax: string
 * - hasDepth: boolean - Whether dataset has depth data
 * - depthMin: number|null - Dataset depth bounds
 * - depthMax: number|null
 */
export async function initializeRowCounts(datasets, constraints) {
  if (!datasets || datasets.length === 0) {
    useRowCountCalculationStore.setState({ staleDatasets: [] });
    return;
  }

  // Normalize dataset shape (handles both nested metadata and flat shapes)
  const normalizedDatasets = datasets.map((dataset) => ({
    shortName: dataset.shortName,
    rows: dataset.rows,
    datasetUtilization: dataset.datasetUtilization || 1.0,
    spatialResolution: dataset.metadata
      ? dataset.metadata.spatialResolution
      : dataset.spatialResolution,
    temporalResolution: dataset.metadata
      ? dataset.metadata.temporalResolution
      : dataset.temporalResolution,
    tableName: dataset.metadata
      ? dataset.metadata.tableName || dataset.shortName
      : dataset.tableName || dataset.shortName,
    latMin: dataset.spatial
      ? dataset.spatial.latMin
      : dataset.metadata
        ? dataset.metadata.latMin
        : dataset.latMin,
    timeMin: dataset.temporal
      ? dataset.temporal.timeMin
      : dataset.metadata
        ? dataset.metadata.timeMin
        : dataset.timeMin,
    timeMax: dataset.temporal
      ? dataset.temporal.timeMax
      : dataset.metadata
        ? dataset.metadata.timeMax
        : dataset.timeMax,
    hasDepth:
      (dataset.depth !== undefined &&
        (dataset.depth.depthMin !== null || dataset.depth.depthMax !== null)) ||
      (dataset.metadata &&
        (dataset.metadata.depthMin !== null ||
          dataset.metadata.depthMax !== null)) ||
      dataset.depthMin !== null ||
      dataset.depthMax !== null,
    depthMin: dataset.depth
      ? dataset.depth.depthMin
      : dataset.metadata
        ? dataset.metadata.depthMin
        : dataset.depthMin,
    depthMax: dataset.depth
      ? dataset.depth.depthMax
      : dataset.metadata
        ? dataset.metadata.depthMax
        : dataset.depthMax,
  }));

  // Track which datasets are in this calculation set
  const datasetIds = normalizedDatasets.map((d) => d.shortName);
  useRowCountCalculationStore.setState({
    lastSearchDatasetIds: new Set(datasetIds),
  });

  // Estimate eligible datasets, mark others as stale
  await _estimateEligibleDatasets(normalizedDatasets, constraints);
}

export function clearRowCounts() {
  const controller = useRowCountCalculationStore.getState().abortController;
  if (controller) {
    controller.abort();
  }

  useRowCountCalculationStore.setState({
    calculatedRowCounts: {},
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
