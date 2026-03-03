import { loadModules } from 'esri-loader';
import { ESRI_VERSION } from './mapConfig';

let cachedModules = null;

const loadEsriModules = async () => {
  if (cachedModules) {
    return cachedModules;
  }

  let [Map, MapView, GraphicsLayer, Graphic, Polygon, SketchViewModel, Basemap, reactiveUtils] =
    await loadModules(
      [
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/GraphicsLayer',
        'esri/Graphic',
        'esri/geometry/Polygon',
        'esri/widgets/Sketch/SketchViewModel',
        'esri/Basemap',
        'esri/core/reactiveUtils',
      ],
      { version: ESRI_VERSION },
    );

  cachedModules = {
    Map,
    MapView,
    GraphicsLayer,
    Graphic,
    Polygon,
    SketchViewModel,
    Basemap,
    reactiveUtils,
  };

  return cachedModules;
};

export default loadEsriModules;
