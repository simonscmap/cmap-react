import { loadModules } from 'esri-loader';

let cachedModules = null;

const loadEsriModules = async () => {
  if (cachedModules) {
    return cachedModules;
  }

  let [Map, MapView, GraphicsLayer, Graphic, Polygon, SketchViewModel, GeoJSONLayer] =
    await loadModules(
      [
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/GraphicsLayer',
        'esri/Graphic',
        'esri/geometry/Polygon',
        'esri/widgets/Sketch/SketchViewModel',
        'esri/layers/GeoJSONLayer',
      ],
      { version: '4.23' },
    );

  cachedModules = {
    Map,
    MapView,
    GraphicsLayer,
    Graphic,
    Polygon,
    SketchViewModel,
    GeoJSONLayer,
  };

  return cachedModules;
};

export default loadEsriModules;
