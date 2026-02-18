import { useState, useEffect, useRef, useCallback } from 'react';
import loadEsriModules from './esriModuleLoader';

const MODE_PAN = 'pan';
const MODE_SELECT = 'select';

const TILE_SIZE = 256;
const ZOOM1_WORLD_PX = TILE_SIZE * 2;

const calcWorldFitScale = (containerWidth, scaleAtZoom1) => {
  return scaleAtZoom1 * (ZOOM1_WORLD_PX / containerWidth);
};

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
  let minZoomThresholdRef = useRef(null);
  let settersRef = useRef({ setLatStart, setLatEnd, setLonStart, setLonEnd });
  let updateBoundsRef = useRef(null);
  let updateGraphicRef = useRef(null);

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

      let rings;
      if (minLon > maxLon) {
        rings = [
          [minLon, minLat],
          [180, minLat],
          [180, maxLat],
          [minLon, maxLat],
          [minLon, minLat],
        ];
        let rings2 = [
          [-180, minLat],
          [maxLon, minLat],
          [maxLon, maxLat],
          [-180, maxLat],
          [-180, minLat],
        ];
        return new modules.Graphic({
          geometry: new modules.Polygon({
            rings: [rings, rings2],
            spatialReference: { wkid: 4326 },
          }),
          symbol: RECTANGLE_SYMBOL,
        });
      }

      rings = [
        [minLon, minLat],
        [maxLon, minLat],
        [maxLon, maxLat],
        [minLon, maxLat],
        [minLon, minLat],
      ];

      return new modules.Graphic({
        geometry: new modules.Polygon({
          rings: [rings],
          spatialReference: { wkid: 4326 },
        }),
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

    let minLon = Math.max(-180, Math.min(180, extent.xmin));
    let maxLon = Math.max(-180, Math.min(180, extent.xmax));
    let minLat = Math.max(-90, Math.min(90, extent.ymin));
    let maxLat = Math.max(-90, Math.min(90, extent.ymax));

    settersRef.current.setLatStart(minLat);
    settersRef.current.setLatEnd(maxLat);
    settersRef.current.setLonStart(minLon);
    settersRef.current.setLonEnd(maxLon);

    setTimeout(() => {
      isUpdatingFromMapRef.current = false;
    }, 100);
  };

  updateBoundsRef.current = updateBoundsFromGeometry;

  let updateGraphicFromBounds = useCallback(() => {
    if (!graphicsLayerRef.current || !modules || isUpdatingFromMapRef.current) {
      return;
    }

    graphicsLayerRef.current.removeAll();

    let graphic = createBoundsGraphic(latStart, latEnd, lonStart, lonEnd);
    if (graphic) {
      graphicsLayerRef.current.add(graphic);
      boundsGraphicRef.current = graphic;
    }
  }, [modules, latStart, latEnd, lonStart, lonEnd, createBoundsGraphic]);

  updateGraphicRef.current = updateGraphicFromBounds;

  useEffect(() => {
    updateGraphicFromBounds();
  }, [updateGraphicFromBounds]);

  let destroyView = useCallback(() => {
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

      let view = new modules.MapView({
        container: container,
        map: map,
        center: [0, 0],
        zoom: 1,
        constraints: {
          rotationEnabled: false,
        },
      });

      viewRef.current = view;

      view.ui.remove('zoom');
      view.ui.remove('attribution');

      view.when(() => {
        let targetScale = calcWorldFitScale(container.clientWidth, view.scale);

        view.constraints.snapToZoom = false;
        view.constraints.minScale = targetScale;

        let minZoomLevel = Math.log2(container.clientWidth / TILE_SIZE);
        minZoomThresholdRef.current = Math.ceil(minZoomLevel);
        view.goTo({ scale: targetScale }, { animate: false });
        setAtMinZoom(true);

        view.watch('zoom', function (newZoom) {
          setAtMinZoom(newZoom <= minZoomThresholdRef.current);
          if (newZoom < minZoomLevel - 0.1) {
            view.goTo({ scale: targetScale }, { animate: false });
          }
        });

        view.on('mouse-wheel', function (event) {
          if (event.deltaY > 0 && view.scale >= targetScale * 0.9) {
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
          if (event.state === 'complete') {
            updateBoundsRef.current(event.graphic.geometry);
            boundsGraphicRef.current = event.graphic;
            event.graphic.symbol = RECTANGLE_SYMBOL;
            setModeState(MODE_PAN);
          }
        });

        sketchViewModel.on('update', (event) => {
          if (event.state === 'complete' && event.graphics && event.graphics.length > 0) {
            updateBoundsRef.current(event.graphics[0].geometry);
          }
        });

        updateGraphicRef.current();
      });

      return () => {
        destroyView();
      };
    },
    [modules, destroyView],
  );

  let setMode = useCallback((newMode) => {
    setModeState(newMode);

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
      let targetZoom = Math.max(0, Math.floor(viewRef.current.zoom) - 1);
      viewRef.current.goTo({ zoom: targetZoom });
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
