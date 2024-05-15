export const polygonSymbol = {
  type: 'polygon-3d',
  symbolLayers: [
    {
      type: 'fill',
      material: {
        color: [0, 255, 255, 0.3],
      },
      outline: {
        color: [0, 255, 255, 1],
        size: '2px',
      },
    },
  ],
};

export const polylineSymbol = {
  type: 'line-3d',
  symbolLayers: [
    {
      type: 'line',
      size: '3px',
      material: {
        color: {
          r: 0,
          g: 255,
          b: 255,
          a: 0,
        },
      },
    },
  ],
};
