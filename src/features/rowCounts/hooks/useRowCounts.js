import { useCallback, useMemo, useRef, useEffect } from 'react';
import useRowCountStore from '../store/rowCountStore';
import { areConstraintsEqual } from '../utils';
import logInit from '../../../Services/log-service';

var log = logInit('features/rowCounts/hooks/useRowCounts');

function useRowCounts(config) {
  var consumerId = config.consumerId;
  var getConstraints = config.getConstraints;
  var getShortNames = config.getShortNames;
  var getUtilization = config.getUtilization;
  var isRecalculationGated = config.isRecalculationGated || false;
  var isRecalculationAllowed = config.isRecalculationAllowed;

  if (!consumerId) {
    log.warn('useRowCounts: consumerId is required');
  }
  if (!getConstraints) {
    log.warn('useRowCounts: getConstraints is required');
  }
  if (!getShortNames) {
    log.warn('useRowCounts: getShortNames is required');
  }

  var store = useRowCountStore();

  var prevConstraintsRef = useRef(null);
  var isLoadedRef = useRef(false);

  useEffect(
    function () {
      var currentConstraints = getConstraints ? getConstraints() : null;
      var shortNames = getShortNames ? getShortNames() : [];

      if (shortNames.length === 0) {
        return;
      }

      if (!isLoadedRef.current && store.isInitialized) {
        isLoadedRef.current = true;
        prevConstraintsRef.current = currentConstraints;
        store.loadDatasets(shortNames);
        return;
      }

      if (
        prevConstraintsRef.current &&
        currentConstraints &&
        !areConstraintsEqual(prevConstraintsRef.current, currentConstraints)
      ) {
        log.debug('constraints changed, auto-updating estimates', {
          consumerId: consumerId,
        });
        prevConstraintsRef.current = currentConstraints;
        store.onConstraintsChanged(shortNames, currentConstraints);
      }
    },
    [store, getConstraints, getShortNames, consumerId],
  );

  var getDatasetInfo = useCallback(
    function (shortName) {
      var constraints = getConstraints ? getConstraints() : {};
      var utilizationMap = getUtilization ? getUtilization() : {};
      var utilization = utilizationMap[shortName] || 1;

      var rowCount = store.getRowCount(shortName);
      var source = store.getRowCountSource(shortName);
      var isLoading = store.isDatasetLoading(shortName);
      var error = store.getError(shortName);
      var stalenessResult = store.isDatasetStale(
        shortName,
        constraints,
        utilization,
      );

      return {
        rowCount: rowCount,
        source: source,
        isLoading: isLoading,
        error: error,
        isStale: stalenessResult.isStale,
        staleReason: stalenessResult.reason,
      };
    },
    [store, getConstraints, getUtilization],
  );

  var isAnyLoading = useMemo(
    function () {
      return store.isAnyLoading();
    },
    [store.loadingDatasets],
  );

  var hasAnyStale = useMemo(
    function () {
      var shortNames = getShortNames ? getShortNames() : [];
      var constraints = getConstraints ? getConstraints() : {};
      var utilizationMap = getUtilization ? getUtilization() : {};

      return store.hasAnyStale(shortNames, constraints, utilizationMap);
    },
    [store, getShortNames, getConstraints, getUtilization],
  );

  var staleDatasets = useMemo(
    function () {
      var shortNames = getShortNames ? getShortNames() : [];
      var constraints = getConstraints ? getConstraints() : {};
      var utilizationMap = getUtilization ? getUtilization() : {};

      return store.getStaleDatasets(shortNames, constraints, utilizationMap);
    },
    [store, getShortNames, getConstraints, getUtilization],
  );

  var nonEstimableDatasets = useMemo(
    function () {
      return store.getNonEstimableDatasets();
    },
    [store.nonEstimableDatasets],
  );

  var shouldShowRecalculateAll = useMemo(
    function () {
      if (isRecalculationGated && isRecalculationAllowed) {
        if (!isRecalculationAllowed()) {
          return false;
        }
      }

      return store.shouldShowRecalculateAll();
    },
    [store, isRecalculationGated, isRecalculationAllowed],
  );

  var recalculateSingle = useCallback(
    async function (shortName) {
      if (isRecalculationGated && isRecalculationAllowed) {
        if (!isRecalculationAllowed()) {
          log.warn('recalculateSingle blocked by gate', {
            consumerId: consumerId,
          });
          return null;
        }
      }

      var constraints = getConstraints ? getConstraints() : {};
      return store.recalculateSingle(shortName, constraints);
    },
    [
      store,
      getConstraints,
      isRecalculationGated,
      isRecalculationAllowed,
      consumerId,
    ],
  );

  var recalculateAll = useCallback(
    async function () {
      if (isRecalculationGated && isRecalculationAllowed) {
        if (!isRecalculationAllowed()) {
          log.warn('recalculateAll blocked by gate', {
            consumerId: consumerId,
          });
          return { results: {}, skipped: [], failed: [] };
        }
      }

      var shortNames = getShortNames ? getShortNames() : [];
      var constraints = getConstraints ? getConstraints() : {};
      var utilizationMap = getUtilization ? getUtilization() : {};

      return store.recalculateAllStale(shortNames, constraints, utilizationMap);
    },
    [
      store,
      getShortNames,
      getConstraints,
      getUtilization,
      isRecalculationGated,
      isRecalculationAllowed,
      consumerId,
    ],
  );

  var initialize = useCallback(
    async function () {
      await store.initialize();

      var shortNames = getShortNames ? getShortNames() : [];
      if (shortNames.length > 0) {
        isLoadedRef.current = true;
        var currentConstraints = getConstraints ? getConstraints() : {};
        prevConstraintsRef.current = currentConstraints;
        await store.loadDatasets(shortNames);
      }
    },
    [store, getShortNames, getConstraints],
  );

  var loadDatasets = useCallback(
    async function (shortNamesOverride) {
      var shortNames =
        shortNamesOverride || (getShortNames ? getShortNames() : []);
      return store.loadDatasets(shortNames);
    },
    [store, getShortNames],
  );

  var calculateEstimates = useCallback(
    async function (shortNamesOverride) {
      var shortNames =
        shortNamesOverride || (getShortNames ? getShortNames() : []);
      var constraints = getConstraints ? getConstraints() : {};
      return store.calculateEstimates(shortNames, constraints);
    },
    [store, getShortNames, getConstraints],
  );

  var resetRecalculation = useCallback(
    function () {
      store.resetGlobalRecalculation();
    },
    [store],
  );

  var clear = useCallback(
    function () {
      store.clearAll();
    },
    [store],
  );

  return {
    getDatasetInfo: getDatasetInfo,
    isAnyLoading: isAnyLoading,
    hasAnyStale: hasAnyStale,
    staleDatasets: staleDatasets,
    nonEstimableDatasets: nonEstimableDatasets,
    shouldShowRecalculateAll: shouldShowRecalculateAll,

    initialize: initialize,
    loadDatasets: loadDatasets,
    calculateEstimates: calculateEstimates,
    recalculateSingle: recalculateSingle,
    recalculateAll: recalculateAll,
    resetRecalculation: resetRecalculation,
    clear: clear,
  };
}

export default useRowCounts;
