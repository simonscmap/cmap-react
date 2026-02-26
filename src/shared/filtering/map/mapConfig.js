let SPATIAL_REFERENCE = { wkid: 4326 };

let WORLD_EXTENT = {
  type: 'extent',
  xmin: -180,
  ymin: -90,
  xmax: 180,
  ymax: 90,
  spatialReference: SPATIAL_REFERENCE,
};

let BASEMAPS = {
  topographic: '6b4764e99107496f9193e4b68a77b73a', // best
  terrainWithLabels: 'ccb943d91c134188a8815452514983fc', // best
  imagery: '52bdc7ab7fb044d98add148764eaa30a', // stretching at extremes lats
  imageryHybrid: '4c2b44abaa4841d08c938f4bbb548561',// stretching at extremes lats
};

let ACTIVE_BASEMAP = BASEMAPS.terrainWithLabels;

let RECTANGLE_SYMBOL = {
  type: 'simple-fill',
  color: [0, 255, 255, 0.05],
  outline: {
    color: [255, 255, 255, 0.1],
    width: 4,
  },
};

let CREATE_SYMBOL = {
  type: 'simple-fill',
  color: [157, 209, 98, 0.3],
  outline: { color: [157, 209, 98, 1], width: 2 },
};

let STATIC_SYMBOL = {
  type: 'simple-fill',
  color: [105, 255, 242, 0.3],
  outline: { color: [105, 255, 242, 1], width: 2 },
}

let HIGHLIGHT_OPTIONS = {
  color: [105, 255, 242, .3],
  fillOpacity: 0.1,
  haloOpacity: .5,
};

let ESRI_VERSION = '4.24';

export {
  SPATIAL_REFERENCE,
  WORLD_EXTENT,
  BASEMAPS,
  ACTIVE_BASEMAP,
  RECTANGLE_SYMBOL,
  CREATE_SYMBOL,
  STATIC_SYMBOL,
  HIGHLIGHT_OPTIONS,
  ESRI_VERSION,
};
