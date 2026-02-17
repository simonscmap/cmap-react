import { useState, useEffect, useRef, useCallback } from 'react';
import loadEsriModules from './esriModuleLoader';

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

  let viewRef = useRef(null);
  let graphicsLayerRef = useRef(null);
  let boundsGraphicRef = useRef(null);
  let containerRef = useRef(null);

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

  let updateGraphicFromBounds = useCallback(() => {
    if (!graphicsLayerRef.current || !modules) {
      return;
    }

    graphicsLayerRef.current.removeAll();

    let graphic = createBoundsGraphic(latStart, latEnd, lonStart, lonEnd);
    if (graphic) {
      graphicsLayerRef.current.add(graphic);
      boundsGraphicRef.current = graphic;
    }
  }, [modules, latStart, latEnd, lonStart, lonEnd, createBoundsGraphic]);

  useEffect(() => {
    updateGraphicFromBounds();
  }, [updateGraphicFromBounds]);

  let destroyView = useCallback(() => {
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

      view.when(() => {
        updateGraphicFromBounds();
      });

      return () => {
        destroyView();
      };
    },
    [modules, destroyView, updateGraphicFromBounds],
  );

  return {
    modules,
    loading,
    error,
    initializeView,
  };
};

export default useMapBoundsSelector;
