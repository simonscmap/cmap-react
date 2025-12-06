import create from 'zustand';
import logInit from '../../../Services/log-service';
import { isEligibleForEstimation, estimateRowCount } from '../estimation';
import {
  checkStaleness,
  getStaleDatasets as getStaleDatasetsList,
} from '../utils/stalenessDetection';
import { rowCountsApi } from '../api';
import {
  initializeCatalogSearch,
  getSearchDatabaseApi,
} from '../../catalogSearch/api';

var log = logInit('features/rowCounts/store/rowCountStore');

async function queryDatasetsByShortNames(catalogDb, shortNames) {
  if (!shortNames || shortNames.length === 0) {
    return {};
  }

  var placeholders = shortNames
    .map(function () {
      return '?';
    })
    .join(', ');

  var sql =
    'SELECT ' +
    'shortName, ' +
    "json_extract(metadataJson, '$.spatialResolution') as spatialResolution, " +
    "json_extract(metadataJson, '$.temporalResolution') as temporalResolution, " +
    "json_extract(metadataJson, '$.tableName') as tableName, " +
    'latMin, ' +
    'latMax, ' +
    'lonMin, ' +
    'lonMax, ' +
    'timeMin, ' +
    'timeMax, ' +
    'depthMin, ' +
    'depthMax, ' +
    'rowCount, ' +
    'datasetType ' +
    'FROM datasets ' +
    'WHERE shortName IN (' +
    placeholders +
    ')';

  var rows = await catalogDb.executeSql(sql, shortNames);

  var result = {};
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    result[row.shortName] = {
      Short_Name: row.shortName,
      Spatial_Resolution: row.spatialResolution,
      Temporal_Resolution: row.temporalResolution,
      Table_Name: row.tableName,
      Lat_Min: row.latMin,
      Lat_Max: row.latMax,
      Lon_Min: row.lonMin,
      Lon_Max: row.lonMax,
      Time_Min: row.timeMin,
      Time_Max: row.timeMax,
      Depth_Min: row.depthMin,
      Depth_Max: row.depthMax,
      Row_Count: row.rowCount,
      Dataset_Type: row.datasetType,
      Has_Depth: row.depthMin !== null || row.depthMax !== null,
    };
  }

  return result;
}

function transformConstraints(constraints) {
  var result = {
    spatial: {
      latMin: constraints.spatialBounds.latMin,
      latMax: constraints.spatialBounds.latMax,
      lonMin: constraints.spatialBounds.lonMin,
      lonMax: constraints.spatialBounds.lonMax,
    },
  };

  if (constraints.depthEnabled && constraints.depthRange) {
    if (constraints.depthRange.depthMin !== null) {
      result.spatial.depthMin = constraints.depthRange.depthMin;
    }
    if (constraints.depthRange.depthMax !== null) {
      result.spatial.depthMax = constraints.depthRange.depthMax;
    }
  }

  if (constraints.temporalEnabled && constraints.temporalRange) {
    var timeMin = constraints.temporalRange.timeMin;
    var timeMax = constraints.temporalRange.timeMax;

    if (timeMin && timeMax) {
      var formatDate = function (date) {
        if (typeof date === 'string') {
          return date.split('T')[0];
        }
        if (date instanceof Date) {
          return date.toISOString().split('T')[0];
        }
        return null;
      };

      result.temporal = {
        startDate: formatDate(timeMin),
        endDate: formatDate(timeMax),
      };
    }
  }

  return result;
}

var initialState = {
  isInitialized: false,
  isInitializing: false,
  initError: null,

  datasetMetadata: {},

  rowCounts: {},
  snapshots: {},
  sources: {},

  loadingDatasets: new Set(),

  errors: {},

  estimatedDatasets: new Set(),
  nonEstimableDatasets: new Set(),
  skippedDatasets: new Set(),
  failedDatasets: new Set(),

  abortController: null,
  lastDatasetIds: new Set(),

  hasUsedGlobalRecalculation: false,
};

function createSnapshot(constraints) {
  return {
    spatialBounds: constraints.spatialBounds
      ? {
          latMin: constraints.spatialBounds.latMin,
          latMax: constraints.spatialBounds.latMax,
          lonMin: constraints.spatialBounds.lonMin,
          lonMax: constraints.spatialBounds.lonMax,
        }
      : null,
    temporalRange: constraints.temporalRange
      ? {
          timeMin: constraints.temporalRange.timeMin,
          timeMax: constraints.temporalRange.timeMax,
        }
      : null,
    depthRange: constraints.depthRange
      ? {
          depthMin: constraints.depthRange.depthMin,
          depthMax: constraints.depthRange.depthMax,
        }
      : null,
    temporalEnabled: constraints.temporalEnabled || false,
    depthEnabled: constraints.depthEnabled || false,
    includePartialOverlaps: constraints.includePartialOverlaps || false,
    timestamp: new Date(),
  };
}

var useRowCountStore = create(function (set, get) {
  return {
    ...initialState,

    getRowCount: function (shortName) {
      var count = get().rowCounts[shortName];
      return count !== undefined ? count : null;
    },

    getRowCountSource: function (shortName) {
      return get().sources[shortName] || null;
    },

    isDatasetLoading: function (shortName) {
      return get().loadingDatasets.has(shortName);
    },

    getError: function (shortName) {
      return get().errors[shortName] || null;
    },

    isAnyLoading: function () {
      return get().loadingDatasets.size > 0;
    },

    isDatasetStale: function (
      shortName,
      currentConstraints,
      datasetUtilization,
    ) {
      var state = get();
      var snapshot = state.snapshots[shortName] || null;
      var existingRowCount = state.rowCounts[shortName];

      return checkStaleness(
        shortName,
        currentConstraints,
        snapshot,
        datasetUtilization,
        state.lastDatasetIds,
        existingRowCount,
      );
    },

    hasAnyStale: function (shortNames, currentConstraints, utilizationMap) {
      var state = get();
      for (var i = 0; i < shortNames.length; i++) {
        var shortName = shortNames[i];
        var snapshot = state.snapshots[shortName] || null;
        var utilization = utilizationMap ? utilizationMap[shortName] : 1;
        var existingRowCount = state.rowCounts[shortName];

        var result = checkStaleness(
          shortName,
          currentConstraints,
          snapshot,
          utilization,
          state.lastDatasetIds,
          existingRowCount,
        );

        if (result.isStale) {
          return true;
        }
      }
      return false;
    },

    getStaleDatasets: function (
      shortNames,
      currentConstraints,
      utilizationMap,
    ) {
      var state = get();
      return getStaleDatasetsList(
        shortNames,
        currentConstraints,
        state.snapshots,
        utilizationMap || {},
        state.lastDatasetIds,
        state.rowCounts,
      );
    },

    getNonEstimableDatasets: function () {
      return Array.from(get().nonEstimableDatasets);
    },

    shouldShowRecalculateAll: function () {
      var state = get();
      return (
        state.nonEstimableDatasets.size > 0 && !state.hasUsedGlobalRecalculation
      );
    },

    initialize: async function () {
      var state = get();

      if (state.isInitialized || state.isInitializing) {
        return;
      }

      set({ isInitializing: true, initError: null });

      try {
        await initializeCatalogSearch();
        set({ isInitialized: true, isInitializing: false });
        log.debug('rowCountStore initialized');
      } catch (error) {
        log.error('rowCountStore initialization failed', {
          error: error.message,
        });
        set({
          isInitialized: false,
          isInitializing: false,
          initError: error.message,
        });
        throw error;
      }
    },

    loadDatasets: async function (shortNames) {
      log.debug('loadDatasets called', { count: shortNames.length });

      var state = get();

      if (!state.isInitialized) {
        await get().initialize();
      }

      var catalogDb = getSearchDatabaseApi();

      var metadataMap = await queryDatasetsByShortNames(catalogDb, shortNames);

      var newRowCounts = {};
      var newSources = {};
      var estimableSet = new Set();
      var nonEstimableSet = new Set();

      for (var i = 0; i < shortNames.length; i++) {
        var shortName = shortNames[i];
        var dataset = metadataMap[shortName];

        if (!dataset) {
          log.warn('dataset not found in catalog-db', { shortName: shortName });
          continue;
        }

        newRowCounts[shortName] = dataset.Row_Count;
        newSources[shortName] = 'catalog';

        var isEstimable =
          dataset.Spatial_Resolution !== 'Irregular' &&
          dataset.Temporal_Resolution !== 'Irregular';

        if (isEstimable) {
          estimableSet.add(shortName);
        } else {
          nonEstimableSet.add(shortName);
        }
      }

      set(function (s) {
        return {
          datasetMetadata: { ...s.datasetMetadata, ...metadataMap },
          rowCounts: { ...s.rowCounts, ...newRowCounts },
          sources: { ...s.sources, ...newSources },
          estimatedDatasets: estimableSet,
          nonEstimableDatasets: nonEstimableSet,
          lastDatasetIds: new Set(shortNames),
        };
      });

      log.debug('datasets loaded', {
        total: shortNames.length,
        estimable: estimableSet.size,
        nonEstimable: nonEstimableSet.size,
      });
    },

    onConstraintsChanged: async function (shortNames, constraints) {
      log.debug('onConstraintsChanged called', { count: shortNames.length });

      var state = get();

      if (!state.isInitialized) {
        await get().initialize();
      }

      var catalogDb = getSearchDatabaseApi();
      var newRowCounts = {};
      var newSources = {};
      var newSnapshots = {};

      for (var i = 0; i < shortNames.length; i++) {
        var shortName = shortNames[i];
        var dataset = state.datasetMetadata[shortName];

        if (!dataset) {
          var metadataMap = await queryDatasetsByShortNames(catalogDb, [
            shortName,
          ]);
          dataset = metadataMap[shortName];
          if (dataset) {
            set(function (s) {
              return {
                datasetMetadata: {
                  ...s.datasetMetadata,
                  [shortName]: dataset,
                },
              };
            });
          }
        }

        if (!dataset) {
          continue;
        }

        var metadata = {
          spatialResolution: dataset.Spatial_Resolution,
          temporalResolution: dataset.Temporal_Resolution,
        };

        if (isEligibleForEstimation(metadata, constraints)) {
          try {
            var count = await estimateRowCount(dataset, constraints, catalogDb);
            newRowCounts[shortName] = count;
            newSources[shortName] = 'estimated';
            newSnapshots[shortName] = createSnapshot(constraints);
            log.debug('auto-estimated', { shortName: shortName, count: count });
          } catch (error) {
            log.error('auto-estimation failed', {
              shortName: shortName,
              error: error.message,
            });
          }
        }
      }

      if (Object.keys(newRowCounts).length > 0) {
        set(function (s) {
          return {
            rowCounts: { ...s.rowCounts, ...newRowCounts },
            sources: { ...s.sources, ...newSources },
            snapshots: { ...s.snapshots, ...newSnapshots },
          };
        });
      }
    },

    calculateEstimates: async function (shortNames, constraints) {
      await get().loadDatasets(shortNames);
      await get().onConstraintsChanged(shortNames, constraints);
    },

    calculateRowCounts: async function (shortNames, constraints) {
      log.debug('calculateRowCounts called', {
        datasetCount: shortNames.length,
      });

      var currentController = get().abortController;
      if (currentController) {
        currentController.abort();
      }

      var abortController = new AbortController();
      set({ abortController: abortController });

      set(function (state) {
        var newLoading = new Set(state.loadingDatasets);
        shortNames.forEach(function (name) {
          newLoading.add(name);
        });
        return { loadingDatasets: newLoading };
      });

      try {
        var apiConstraints = transformConstraints(constraints);
        var response = await rowCountsApi.calculateRowCounts(
          shortNames,
          apiConstraints,
          abortController.signal,
        );

        if (!response.ok) {
          throw new Error('API error: ' + response.status);
        }

        var data = await response.json();

        set(function (state) {
          var newRowCounts = { ...state.rowCounts };
          var newSources = { ...state.sources };
          var newSnapshots = { ...state.snapshots };
          var newErrors = { ...state.errors };
          var newLoading = new Set(state.loadingDatasets);
          var newSkipped = new Set(state.skippedDatasets);
          var newFailed = new Set(state.failedDatasets);

          Object.keys(data.results || {}).forEach(function (name) {
            newRowCounts[name] = data.results[name];
            newSources[name] = 'calculated';
            newSnapshots[name] = createSnapshot(constraints);
            delete newErrors[name];
            newLoading.delete(name);
          });

          (data.skipped || []).forEach(function (name) {
            newSkipped.add(name);
            newLoading.delete(name);
          });

          (data.failed || []).forEach(function (name) {
            newFailed.add(name);
            newErrors[name] = 'Calculation failed';
            newLoading.delete(name);
          });

          return {
            rowCounts: newRowCounts,
            sources: newSources,
            snapshots: newSnapshots,
            errors: newErrors,
            loadingDatasets: newLoading,
            skippedDatasets: newSkipped,
            failedDatasets: newFailed,
            abortController: null,
          };
        });

        return data;
      } catch (error) {
        if (error.name === 'AbortError') {
          log.debug('calculateRowCounts aborted');
          throw error;
        }

        log.error('calculateRowCounts failed', { error: error.message });

        set(function (state) {
          var newLoading = new Set(state.loadingDatasets);
          var newErrors = { ...state.errors };

          shortNames.forEach(function (name) {
            newLoading.delete(name);
            newErrors[name] = error.message;
          });

          return {
            loadingDatasets: newLoading,
            errors: newErrors,
            abortController: null,
          };
        });

        throw error;
      }
    },

    recalculateSingle: async function (shortName, constraints) {
      log.debug('recalculateSingle called', { shortName: shortName });

      var state = get();

      if (!state.isInitialized) {
        await get().initialize();
      }

      try {
        var catalogDb = getSearchDatabaseApi();

        var dataset = state.datasetMetadata[shortName];
        if (!dataset) {
          var metadataMap = await queryDatasetsByShortNames(catalogDb, [
            shortName,
          ]);
          dataset = metadataMap[shortName];

          if (dataset) {
            set(function (s) {
              return {
                datasetMetadata: { ...s.datasetMetadata, [shortName]: dataset },
              };
            });
          }
        }

        if (!dataset) {
          log.warn('dataset not found in catalog-db', { shortName: shortName });
          return null;
        }

        var metadata = {
          spatialResolution: dataset.Spatial_Resolution,
          temporalResolution: dataset.Temporal_Resolution,
        };

        if (isEligibleForEstimation(metadata, constraints)) {
          log.debug('using frontend estimation', { shortName: shortName });
          var count = await estimateRowCount(dataset, constraints, catalogDb);

          set(function (s) {
            var newRowCounts = { ...s.rowCounts };
            var newSources = { ...s.sources };
            var newSnapshots = { ...s.snapshots };

            newRowCounts[shortName] = count;
            newSources[shortName] = 'estimated';
            newSnapshots[shortName] = createSnapshot(constraints);

            return {
              rowCounts: newRowCounts,
              sources: newSources,
              snapshots: newSnapshots,
            };
          });

          return count;
        }

        log.debug('using backend API', { shortName: shortName });
        var response = await get().calculateRowCounts([shortName], constraints);
        return response.results[shortName] || null;
      } catch (error) {
        if (error.name !== 'AbortError') {
          log.error('recalculateSingle failed', {
            shortName: shortName,
            error: error.message,
          });
        }
        return null;
      }
    },

    recalculateAllStale: async function (
      shortNames,
      constraints,
      utilizationMap,
    ) {
      log.debug('recalculateAllStale called', {
        datasetCount: shortNames.length,
      });

      var staleList = get().getStaleDatasets(
        shortNames,
        constraints,
        utilizationMap,
      );
      var staleShortNames = staleList.map(function (s) {
        return s.shortName;
      });

      log.debug('stale datasets identified', { count: staleShortNames.length });

      if (staleShortNames.length === 0) {
        return { results: {}, skipped: [], failed: [] };
      }

      try {
        var response = await get().calculateRowCounts(
          staleShortNames,
          constraints,
        );

        set({ hasUsedGlobalRecalculation: true });

        return response;
      } catch (error) {
        if (error.name !== 'AbortError') {
          log.error('recalculateAllStale failed', { error: error.message });
        }
        throw error;
      }
    },

    setLastDatasetIds: function (datasetIds) {
      set({ lastDatasetIds: new Set(datasetIds) });
    },

    resetGlobalRecalculation: function () {
      set({ hasUsedGlobalRecalculation: false });
    },

    clearAll: function () {
      var currentController = get().abortController;
      if (currentController) {
        currentController.abort();
      }

      set(initialState);
    },

    cancelPending: function () {
      var currentController = get().abortController;
      if (currentController) {
        currentController.abort();
        set({ abortController: null });
      }
    },
  };
});

export default useRowCountStore;
