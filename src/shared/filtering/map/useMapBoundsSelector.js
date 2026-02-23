import { useState, useEffect, useRef, useCallback } from 'react';
import loadEsriModules from './esriModuleLoader';

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

      let effectiveMaxLon = maxLon;
      if (minLon > maxLon) {
        effectiveMaxLon = maxLon + 360;
      }

      let rings = [
        [minLon, minLat],
        [effectiveMaxLon, minLat],
        [effectiveMaxLon, maxLat],
        [minLon, maxLat],
        [minLon, minLat],
      ];

      let lonToX = function (lon) {
        return lon * 20037508.34 / 180;
      };
      let latToY = function (lat) {
        return Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
      };

      let mercPolygon;
      if (minLon > maxLon) {
        let mercRings = rings.map(function (coord) {
          return [lonToX(coord[0]), latToY(coord[1])];
        });
        mercPolygon = new modules.Polygon({
          rings: [mercRings],
          spatialReference: { wkid: 102100 },
        });
      } else {
        let geoPolygon = new modules.Polygon({
          rings: [rings],
          spatialReference: { wkid: 4326 },
        });
        mercPolygon = modules.webMercatorUtils.geographicToWebMercator(geoPolygon);
      }

      return new modules.Graphic({
        geometry: mercPolygon,
        symbol: RECTANGLE_SYMBOL,
      });
    },
    [modules],
  );

  let updateBoundsFromGeometry = function (geometry) {
    if (!geometry) return;

    isUpdatingFromMapRef.current = true;

    let geoGeometry = geometry;
    if (modules && modules.webMercatorUtils && geometry.spatialReference && geometry.spatialReference.isWebMercator) {
      geoGeometry = modules.webMercatorUtils.webMercatorToGeographic(geometry);
    }

    let extent = geoGeometry.extent;
    if (!extent) {
      isUpdatingFromMapRef.current = false;
      return;
    }

    let normalizeLon = function (lon) {
      return ((lon % 360) + 540) % 360 - 180;
    };

    let westLon = normalizeLon(extent.xmin);
    let eastLon = normalizeLon(extent.xmax);
    let minLat = Math.round(Math.max(-90, Math.min(90, extent.ymin)) * 10) / 10;
    let maxLat = Math.round(Math.max(-90, Math.min(90, extent.ymax)) * 10) / 10;

    westLon = Math.round(Math.max(-180, Math.min(180, westLon)) * 10) / 10;
    eastLon = Math.round(Math.max(-180, Math.min(180, eastLon)) * 10) / 10;

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

      let map = new modules.Map({
        basemap: 'satellite',
        layers: [graphicsLayer],
      });

      let viewOptions = {
        container: container,
        map: map,
        center: [0, 0],
        zoom: 1,
        constraints: {
          rotationEnabled: false,
          snapToZoom: false,
        },
      };

      if (spatialReference) {
        viewOptions.spatialReference = spatialReference;
      }

      let view = new modules.MapView(viewOptions);

      viewRef.current = view;

      view.ui.remove('zoom');
      view.ui.remove('attribution');

      view.when(function () {
        let baseLayer = view.map.basemap.baseLayers.getItemAt(0);
        let tileInfo = baseLayer.tileInfo;
        let lods = view.constraints.effectiveLODs;
        let tileSize = tileInfo.size[0];
        let containerWidth = container.clientWidth;
        let containerHeight = container.clientHeight;
        let scaleForWidth = lods[0].scale * (tileSize / containerWidth);
        let scaleForHeight = lods[0].scale * (tileSize / containerHeight);
        let worldFitScale = Math.max(scaleForWidth, scaleForHeight);

        minZoomThresholdRef.current = worldFitScale;
        view.constraints.minScale = lods[0].scale;

        view.goTo({ center: [0, 0], scale: worldFitScale }, { animate: false }).then(function () {
          if (!viewRef.current || viewRef.current !== view) {
            return;
          }

          setAtMinZoom(true);

          view.watch('scale', function (newScale) {
            let isAtMin = newScale >= worldFitScale * 0.99;
            setAtMinZoom(isAtMin);
            if (newScale > worldFitScale) {
              view.goTo({ scale: worldFitScale }, { animate: false });
            }
          });

          view.on('mouse-wheel', function (event) {
            if (event.deltaY > 0 && view.scale >= worldFitScale * 0.95) {
              event.stopPropagation();
            }
          });

          container.addEventListener('wheel', function (e) {
            e.preventDefault();
          }, { passive: false });

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
        }).catch(function () {});
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
      if (minZoomThresholdRef.current && targetScale > minZoomThresholdRef.current) {
        targetScale = minZoomThresholdRef.current;
      }
      viewRef.current.goTo({ scale: targetScale });
    }
  }, []);

  return {
    modules,
    loading,
    error,
    mode,
    atMinZoom,
    initializeView,
    setMode,
    zoomIn,
    zoomOut,
    MODE_PAN,
    MODE_SELECT,
  };
};

export { MODE_PAN, MODE_SELECT };
export default useMapBoundsSelector;
