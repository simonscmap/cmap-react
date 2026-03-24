import { useState, useEffect, useRef, useCallback } from 'react';
import loadEsriModules from './esriModuleLoader';
import {
  SPATIAL_REFERENCE,
  WORLD_EXTENT,
  ACTIVE_BASEMAP,
  CREATE_SYMBOL,
  STATIC_SYMBOL,
  HIGHLIGHT_OPTIONS,
} from './mapConfig';
import initLog from '../../../Services/log-service';
import {
  clampAndRound,
  normalizeLon,
  constrainLonSpan,
  constrainLatBounds,
  clampLatBounds,
} from './mapGeometryUtils';

let log = initLog('shared/filtering/map/useMapBoundsSelector');

const MODE_PAN = 'pan';
const MODE_SELECT = 'select';

const useMapBoundsSelector = ({
  latStart,
  latEnd,
  lonStart,
  lonEnd,
  setLatStart,
  setLatEnd,
  setLonStart,
  setLonEnd,
  onBoundsChange,
  onBoundsPreview,
}) => {
  let [modules, setModules] = useState(null);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(null);
  let [mode, setModeState] = useState(MODE_PAN);
  let [atMinZoom, setAtMinZoom] = useState(true);

  let viewRef = useRef(null);
  let sketchViewModelRef = useRef(null);
  let graphicsLayerRef = useRef(null);
  let boundsGraphicRef = useRef(null);
  let containerRef = useRef(null);
  let isUpdatingFromMapRef = useRef(false);
  let isUpdatingTimeoutRef = useRef(null);
  let minZoomThresholdRef = useRef(null);
  let modeRef = useRef(MODE_PAN);
  let settersRef = useRef({ setLatStart, setLatEnd, setLonStart, setLonEnd });
  let onBoundsChangeRef = useRef(onBoundsChange);
  let onBoundsPreviewRef = useRef(onBoundsPreview);
  let updateBoundsRef = useRef(null);
  let previewBoundsRef = useRef(null);
  let updateGraphicRef = useRef(null);
  let transformDebounceRef = useRef(null);
  let wheelHandlerRef = useRef(null);
  let prevExtentRef = useRef(null);

  settersRef.current = { setLatStart, setLatEnd, setLonStart, setLonEnd };
  onBoundsChangeRef.current = onBoundsChange;
  onBoundsPreviewRef.current = onBoundsPreview;

  useEffect(() => {
    let cancelled = false;

    loadEsriModules()
      .then((loadedModules) => {
        if (!cancelled) {
          setModules(loadedModules);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  let createBoundsGraphic = useCallback(
    (lat1, lat2, lon1, lon2) => {
      if (!modules) return null;

      let minLat = Math.min(lat1, lat2);
      let maxLat = Math.max(lat1, lat2);
      let minLon = lon1;
      let maxLon = lon2;

      if (minLon > maxLon) {
        maxLon = maxLon + 360;
      }

      let polygon = new modules.Polygon({
        rings: [
          [
            [minLon, minLat], [maxLon, minLat], [maxLon, maxLat],
            [minLon, maxLat], [minLon, minLat],
          ],
        ],
        spatialReference: SPATIAL_REFERENCE,
      });

      return new modules.Graphic({
        geometry: polygon,
        symbol: STATIC_SYMBOL,
      });
    },
    [modules],
  );

  let extractBoundsFromGeometry = function (geometry) {
    if (!geometry) return null;
    let extent = geometry.extent;
    if (!extent) return null;
    return {
      minLat: clampAndRound(extent.ymin, -90, 90),
      maxLat: clampAndRound(extent.ymax, -90, 90),
      westLon: clampAndRound(normalizeLon(extent.xmin), -180, 180),
      eastLon: clampAndRound(normalizeLon(extent.xmax), -180, 180),
    };
  };

  let markUpdatingFromMap = function () {
    isUpdatingFromMapRef.current = true;
    if (isUpdatingTimeoutRef.current) {
      clearTimeout(isUpdatingTimeoutRef.current);
    }
    isUpdatingTimeoutRef.current = setTimeout(() => {
      isUpdatingFromMapRef.current = false;
      isUpdatingTimeoutRef.current = null;
    }, 100);
  };

  let updateBoundsFromGeometry = function (geometry) {
    let bounds = extractBoundsFromGeometry(geometry);
    if (!bounds) {
      return;
    }

    markUpdatingFromMap();

    if (onBoundsChangeRef.current) {
      onBoundsChangeRef.current(bounds.minLat, bounds.maxLat, bounds.westLon, bounds.eastLon);
    } else {
      settersRef.current.setLatStart(bounds.minLat);
      settersRef.current.setLatEnd(bounds.maxLat);
      settersRef.current.setLonStart(bounds.westLon);
      settersRef.current.setLonEnd(bounds.eastLon);
    }
  };

  let previewBoundsFromGeometry = function (geometry) {
    let bounds = extractBoundsFromGeometry(geometry);
    if (!bounds) {
      return;
    }

    markUpdatingFromMap();

    if (onBoundsPreviewRef.current) {
      onBoundsPreviewRef.current(bounds.minLat, bounds.maxLat, bounds.westLon, bounds.eastLon);
    }
  };

  previewBoundsRef.current = previewBoundsFromGeometry;
  updateBoundsRef.current = updateBoundsFromGeometry;

  let updateGraphicFromBounds = useCallback(() => {
    if (!graphicsLayerRef.current || !modules || isUpdatingFromMapRef.current) {
      return;
    }
    prevExtentRef.current = null;

    if (sketchViewModelRef.current) {
      sketchViewModelRef.current.cancel();
    }
    graphicsLayerRef.current.removeAll();

    let graphic = createBoundsGraphic(latStart, latEnd, lonStart, lonEnd);
    if (graphic) {
      graphicsLayerRef.current.add(graphic);
      boundsGraphicRef.current = graphic;
      if (transformDebounceRef.current) {
        clearTimeout(transformDebounceRef.current);
      }
      transformDebounceRef.current = setTimeout(function () {
        if (sketchViewModelRef.current && boundsGraphicRef.current) {
          sketchViewModelRef.current.update([boundsGraphicRef.current], { tool: 'transform' });
        }
        transformDebounceRef.current = null;
      }, 150);
    }
  }, [modules, latStart, latEnd, lonStart, lonEnd, createBoundsGraphic]);

  updateGraphicRef.current = updateGraphicFromBounds;

  function resetAndRedraw() {
    if (isUpdatingTimeoutRef.current) {
      clearTimeout(isUpdatingTimeoutRef.current);
      isUpdatingTimeoutRef.current = null;
    }
    isUpdatingFromMapRef.current = false;
    if (sketchViewModelRef.current) {
      updateGraphicRef.current();
    }
  }

  let redrawGraphic = useCallback(function () {
    if (boundsGraphicRef.current) {
      return;
    }
    modeRef.current = MODE_PAN;
    setModeState(MODE_PAN);
    resetAndRedraw();
  }, []);

  useEffect(() => {
    updateGraphicFromBounds();
  }, [updateGraphicFromBounds]);

  let destroyView = useCallback(() => {
    if (transformDebounceRef.current) {
      clearTimeout(transformDebounceRef.current);
      transformDebounceRef.current = null;
    }
    if (isUpdatingTimeoutRef.current) {
      clearTimeout(isUpdatingTimeoutRef.current);
      isUpdatingTimeoutRef.current = null;
    }
    if (wheelHandlerRef.current) {
      wheelHandlerRef.current.container.removeEventListener(
        'wheel',
        wheelHandlerRef.current.handler,
        { capture: true }
      );
      wheelHandlerRef.current = null;
    }
    if (sketchViewModelRef.current) {
      sketchViewModelRef.current.destroy();
      sketchViewModelRef.current = null;
    }
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }
    graphicsLayerRef.current = null;
    boundsGraphicRef.current = null;
    minZoomThresholdRef.current = null;
  }, []);

  let initializeView = useCallback(
    (container) => {
      if (!modules || !container) return;

      containerRef.current = container;
      destroyView();

      let graphicsLayer = new modules.GraphicsLayer();
      graphicsLayerRef.current = graphicsLayer;

      let map = new modules.Map({
        basemap: new modules.Basemap({
          portalItem: { id: ACTIVE_BASEMAP },
        }),
        layers: [graphicsLayer],
      });

      let view = new modules.MapView({
        container: container,
        map: map,
        extent: WORLD_EXTENT,
        spatialReference: SPATIAL_REFERENCE,
        highlightOptions: HIGHLIGHT_OPTIONS,
        constraints: {
          rotationEnabled: false,
          snapToZoom: false,
        },
      });

      viewRef.current = view;

      view.ui.remove('zoom');
      view.ui.remove('attribution');

      view.when(function () {
        modules.reactiveUtils.whenOnce(function () {
          return !view.updating;
        }).then(function () {
          if (!viewRef.current || viewRef.current !== view) return;

          minZoomThresholdRef.current = view.scale;
          setAtMinZoom(true);

          view.watch('scale', function (newScale) {
            if (!viewRef.current || viewRef.current !== view) return;
            if (newScale > minZoomThresholdRef.current) {
              view.scale = minZoomThresholdRef.current;
              setAtMinZoom(true);
              return;
            }
            let nearLimit = newScale >= minZoomThresholdRef.current * 0.95;
            setAtMinZoom(nearLimit);
          });

          let wheelHandler = function (e) {
            let isZoomingOut = e.deltaY > 0;
            if (isZoomingOut && view.scale >= minZoomThresholdRef.current) {
              e.stopImmediatePropagation();
              e.preventDefault();
            }
          };
          container.addEventListener('wheel', wheelHandler, { capture: true, passive: false });
          wheelHandlerRef.current = { container: container, handler: wheelHandler };

          let sketchViewModel = new modules.SketchViewModel({
            view: view,
            layer: graphicsLayer,
            updateOnGraphicClick: true,
            polygonSymbol: CREATE_SYMBOL,
            defaultCreateOptions: {
              mode: 'freehand',
            },
            defaultUpdateOptions: {
              tool: 'transform',
              toggleToolOnClick: false,
              enableRotation: false,
            },
          });

          sketchViewModelRef.current = sketchViewModel;

          sketchViewModel.on('create', function (event) {
            if (event.state === 'start') {
              isUpdatingFromMapRef.current = true;
              prevExtentRef.current = null;
            } else if (event.state === 'active') {
              let extent = event.graphic.geometry && event.graphic.geometry.extent;
              if (extent) {
                let result = constrainLonSpan(extent, prevExtentRef.current) || extent;
                result = clampLatBounds(result) || result;
                if (result !== extent) {
                  event.graphic.geometry = new modules.Polygon({
                    rings: [[
                      [result.xmin, result.ymin], [result.xmax, result.ymin],
                      [result.xmax, result.ymax], [result.xmin, result.ymax],
                      [result.xmin, result.ymin],
                    ]],
                    spatialReference: SPATIAL_REFERENCE,
                  });
                }
                prevExtentRef.current = { xmin: result.xmin, xmax: result.xmax, ymin: result.ymin, ymax: result.ymax };
              }
              if (onBoundsPreviewRef.current) {
                previewBoundsRef.current(event.graphic.geometry);
              } else {
                updateBoundsRef.current(event.graphic.geometry);
              }
            } else if (event.state === 'complete') {
              updateBoundsRef.current(event.graphic.geometry);
              boundsGraphicRef.current = event.graphic;
              event.graphic.symbol = STATIC_SYMBOL;
              modeRef.current = MODE_PAN;
              setModeState(MODE_PAN);
              container.style.cursor = 'grab';
              sketchViewModel.update([event.graphic], { tool: 'transform' });
            } else if (event.state === 'cancel') {
              isUpdatingFromMapRef.current = false;
            }
          });

          sketchViewModel.on('update', function (event) {
            if (event.state === 'active' && event.graphics && event.graphics.length > 0) {
              let graphic = event.graphics[0];
              let extent = graphic.geometry && graphic.geometry.extent;
              if (extent) {
                let result = constrainLonSpan(extent, prevExtentRef.current) || extent;
                let isResize = event.toolEventInfo && event.toolEventInfo.type
                  && event.toolEventInfo.type.indexOf('scale') === 0;
                result = isResize ? (clampLatBounds(result) || result) : (constrainLatBounds(result) || result);
                if (result !== extent) {
                  graphic.geometry = new modules.Polygon({
                    rings: [[
                      [result.xmin, result.ymin], [result.xmax, result.ymin],
                      [result.xmax, result.ymax], [result.xmin, result.ymax],
                      [result.xmin, result.ymin],
                    ]],
                    spatialReference: SPATIAL_REFERENCE,
                  });
                }
                prevExtentRef.current = { xmin: result.xmin, xmax: result.xmax, ymin: result.ymin, ymax: result.ymax };
              }
              isUpdatingFromMapRef.current = true;
              let isMoveOrScaleStop = event.toolEventInfo && event.toolEventInfo.type
                && (event.toolEventInfo.type === 'move-stop' || event.toolEventInfo.type === 'scale-stop');
              if (isMoveOrScaleStop) {
                updateBoundsRef.current(graphic.geometry);
              } else if (onBoundsPreviewRef.current) {
                previewBoundsRef.current(graphic.geometry);
              } else {
                updateBoundsRef.current(graphic.geometry);
              }
            } else if (event.state === 'complete' && event.graphics && event.graphics.length > 0) {
              if (isUpdatingFromMapRef.current) {
                updateBoundsRef.current(event.graphics[0].geometry);
              }
            }
          });

          view.on('drag', function (event) {
            if (event.action === 'end' && modeRef.current === MODE_PAN) {
              container.style.cursor = 'grab';
            }
          });

          view.on('pointer-move', function (event) {
            if (modeRef.current !== MODE_PAN) {
              return;
            }
            view.hitTest(event).then(function (response) {
              if (!viewRef.current || viewRef.current !== view) {
                return;
              }
              let overGraphic = response.results && response.results.length > 0;
              container.style.cursor = overGraphic ? '' : 'grab';
            });
          });

          updateGraphicRef.current();

          if (boundsGraphicRef.current) {
            sketchViewModel.update([boundsGraphicRef.current], { tool: 'transform' });
          }
        }).catch(function (err) {
          if (err && err.name !== 'AbortError') {
            log.error('map view initialization failed', { error: err });
            setError(err);
          }
        });
      });

      return () => {
        destroyView();
      };
    },
    [modules, destroyView],
  );

  let setMode = useCallback((newMode) => {
    setModeState(newMode);
    modeRef.current = newMode;

    if (containerRef.current) {
      containerRef.current.style.cursor = '';
    }

    if (newMode === MODE_SELECT && sketchViewModelRef.current) {
      if (graphicsLayerRef.current) {
        graphicsLayerRef.current.removeAll();
      }
      boundsGraphicRef.current = null;
      sketchViewModelRef.current.create('rectangle');
    } else if (newMode === MODE_PAN) {
      resetAndRedraw();
    }
  }, []);

  let zoomIn = useCallback(() => {
    if (viewRef.current) {
      let targetScale = viewRef.current.scale / 2;
      viewRef.current.goTo({ scale: targetScale });
    }
  }, []);

  let zoomOut = useCallback(() => {
    if (viewRef.current && minZoomThresholdRef.current) {
      let targetScale = Math.min(
        viewRef.current.scale * 2,
        minZoomThresholdRef.current
      );
      viewRef.current.goTo({ scale: targetScale });
    }
  }, []);

  return {
    loading,
    error,
    mode,
    atMinZoom,
    initializeView,
    setMode,
    zoomIn,
    zoomOut,
    redrawGraphic,
  };
};

export { MODE_PAN, MODE_SELECT };
export default useMapBoundsSelector;
