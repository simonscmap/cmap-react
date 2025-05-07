export default (infoObject) => {
  let { lons } = infoObject;

  if (!(lons instanceof Set)) {
    console.log('expected type Set', typeof lons, lons);
  } else {
    console.log('handle X ticks', lons, Array.from(lons).sort());
  }

  // the lonMin & lonMax are calculated when the data object is marshalled
  // from the server response; if the server has detected an antimeridian crossing,
  // then the lon values will be altered, for example lonMax will be 184, which
  // actually represents (-360 + 184) or -176.

  let lonSet = Array.from(new Set(lons));
  let sxn = Math.floor(lonSet.length / 6);
  let tickvals = lonSet.sort().map((v, i) => {
    if (i % sxn === 0) {
      return v;
    } else {
      return undefined;
    }
  });

  // create tick text from values, handling values that are longer than 180
  // (indicating they are in the regative range and have been altered to accomodate
  // an antimeridian crossing)
  let ticktext = tickvals.map((e) => {
    if (e !== undefined) {
      return e > 180 ? '' + (e - 360) : '' + e;
    }
  });

  return {};

  return {
    tickmode: 'array',
    tickvals,
    ticktext,
  };
};
