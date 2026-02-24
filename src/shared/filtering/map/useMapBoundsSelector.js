import { useState, useEffect, useRef, useCallback } from 'react';
import loadEsriModules from './esriModuleLoader';
import initLog from '../../../Services/log-service';

let log = initLog('shared/filtering/map/useMapBoundsSelector');

const MODE_PAN = 'pan';
const MODE_SELECT = 'select';

const RECTANGLE_SYMBOL = {
  type: 'simple-fill',
  color: [0, 255, 255, 0.2],
  outline: {
    color: [0, 255, 255, 1],
    width: 2,
  },
};

const COASTLINE_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson';

const COASTLINE_SYMBOL = {
  type: 'simple-fill',
  color: [60, 80, 60, 0.4],
  outline: {
    color: [120, 140, 120, 0.6],
    width: 0.5,
  },
};

function clampAndRound(value, min, max) {
  return Math.round(Math.max(min, Math.min(max, value)) * 10) / 10;
}

function normalizeLon(lon) {
  return ((lon % 360) + 540) % 360 - 180;
}

const useMapBoundsSelector = ({
  latStart,
  latEnd,
  lonStart,
  lonEnd,
  setLatStart,
  setLatEnd,
  setLonStart,
  setLonEnd,
  spatialReference,
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
  let updateBoundsRef = useRef(null);
  let updateGraphicRef = useRef(null);
  let transformDebounceRef = useRef(null);
  let wheelHandlerRef = useRef(null);

  settersRef.current = { setLatStart, setLatEnd, setLonStart, setLonEnd };

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
        spatialReference: { wkid: 4326 },
      });

      return new modules.Graphic({
        geometry: polygon,
        symbol: RECTANGLE_SYMBOL,
      });
    },
    [modules],
  );

  let updateBoundsFromGeometry = function (geometry) {
    if (!geometry) return;

    isUpdatingFromMapRef.current = true;

    let extent = geometry.extent;
    if (!extent) {
      isUpdatingFromMapRef.current = false;
      return;
    }

    let westLon = clampAndRound(normalizeLon(extent.xmin), -180, 180);
    let eastLon = clampAndRound(normalizeLon(extent.xmax), -180, 180);
    let minLat = clampAndRound(extent.ymin, -90, 90);
    let maxLat = clampAndRound(extent.ymax, -90, 90);

    settersRef.current.setLatStart(minLat);
    settersRef.current.setLatEnd(maxLat);
    settersRef.current.setLonStart(westLon);
    settersRef.current.setLonEnd(eastLon);

    if (isUpdatingTimeoutRef.current) {
      clearTimeout(isUpdatingTimeoutRef.current);
    }
    isUpdatingTimeoutRef.current = setTimeout(() => {
      isUpdatingFromMapRef.current = false;
      isUpdatingTimeoutRef.current = null;
    }, 100);
  };

  updateBoundsRef.current = updateBoundsFromGeometry;

  let updateGraphicFromBounds = useCallback(() => {
    if (!graphicsLayerRef.current || !modules || isUpdatingFromMapRef.current) {
      return;
    }

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
        wheelHandlerRef.current.handler
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
  }, []);

  let initializeView = useCallback(
    (container) => {
      if (!modules || !container) return;

      containerRef.current = container;
      destroyView();

      let graphicsLayer = new modules.GraphicsLayer();
      graphicsLayerRef.current = graphicsLayer;

      let coastlineLayer = new modules.GeoJSONLayer({
        url: COASTLINE_URL,
        renderer: {
          type: 'simple',
          symbol: COASTLINE_SYMBOL,
        },
      });

      let map = new modules.Map({
        layers: [coastlineLayer, graphicsLayer],
      });

      let worldExtent = {
        xmin: -180,
        ymin: -90,
        xmax: 180,
        ymax: 90,
        spatialReference: { wkid: 4326 },
      };

      let view = new modules.MapView({
        container: container,
        map: map,
        extent: worldExtent,
        spatialReference: spatialReference || { wkid: 4326 },
        constraints: {
          rotationEnabled: false,
          snapToZoom: false,
        },
      });

      viewRef.current = view;

      view.ui.remove('zoom');
      view.ui.remove('attribution');

      view.when(function () {
        view.goTo(worldExtent, { animate: false }).then(function () {
          if (!viewRef.current || viewRef.current !== view) {
            return;
          }

          let wheelHandler = function (e) {
            e.preventDefault();
          };
          container.addEventListener('wheel', wheelHandler, { passive: false });
          wheelHandlerRef.current = { container: container, handler: wheelHandler };

          let sketchViewModel = new modules.SketchViewModel({
            view: view,
            layer: graphicsLayer,
            updateOnGraphicClick: true,
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

          sketchViewModel.on('create', (event) => {
            if (event.state === 'start') {
              isUpdatingFromMapRef.current = true;
            } else if (event.state === 'active') {
              updateBoundsRef.current(event.graphic.geometry);
            } else if (event.state === 'complete') {
              updateBoundsRef.current(event.graphic.geometry);
              boundsGraphicRef.current = event.graphic;
              event.graphic.symbol = RECTANGLE_SYMBOL;
              modeRef.current = MODE_PAN;
              setModeState(MODE_PAN);
              container.style.cursor = 'grab';
              sketchViewModel.update([event.graphic], { tool: 'transform' });
            } else if (event.state === 'cancel') {
              isUpdatingFromMapRef.current = false;
            }
          });

          sketchViewModel.on('update', (event) => {
            if (event.state === 'active' && event.graphics && event.graphics.length > 0) {
              isUpdatingFromMapRef.current = true;
              updateBoundsRef.current(event.graphics[0].geometry);
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
    } else if (newMode === MODE_PAN && sketchViewModelRef.current) {
      sketchViewModelRef.current.cancel();
    }
  }, []);

  let zoomIn = useCallback(() => {
    if (viewRef.current) {
      let targetZoom = Math.floor(viewRef.current.zoom) + 1;
      viewRef.current.goTo({ zoom: targetZoom });
    }
  }, []);

  let zoomOut = useCallback(() => {
    if (viewRef.current) {
      let targetScale = viewRef.current.scale * 2;
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
  };
};

export { MODE_PAN, MODE_SELECT };
export default useMapBoundsSelector;
