const generateSpatialArray = (start, resolution, end) => {
  let arr = [];

  for (let i = start; i <= end; i += resolution) {
    arr.push(i);
  }

  return arr;
};

export default generateSpatialArray;
