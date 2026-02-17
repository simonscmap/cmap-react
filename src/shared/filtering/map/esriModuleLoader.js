import { loadModules } from 'esri-loader';

let cachedModules = null;

const loadEsriModules = async () => {
  if (cachedModules) {
    return cachedModules;
  }

  let [Map, MapView, GraphicsLayer, Graphic, Polygon, SketchViewModel] =
    await loadModules(
      [
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/GraphicsLayer',
        'esri/Graphic',
        'esri/geometry/Polygon',
        'esri/widgets/Sketch/SketchViewModel',
      ],
      { version: '4.14' },
    );

  cachedModules = {
    Map,
    MapView,
    GraphicsLayer,
    Graphic,
    Polygon,
    SketchViewModel,
  };

  return cachedModules;
};

export default loadEsriModules;
