export default (infoObject) => {
  let { lons } = infoObject;

  // the lonMin & lonMax are calculated when the data object is marshalled
  // from the server response; if the server has detected an antimeridian crossing,
  // then the lon values will be altered, for example lonMax will be 184, which
  // actually represents (-360 + 184) or -176.
  if (!Array.isArray(lons) || !lons.some((lon) => lon > 180)) {
    return {};
  }

  let lonSet = Array.from(new Set(lons)).sort((a, b) => a - b);
  let tickStep = Math.max(1, Math.ceil(lonSet.length / 6));
  let tickvals = lonSet.filter(
    (_, index) => index % tickStep === 0 || index === lonSet.length - 1,
  );

  // Display unwrapped western longitudes in the conventional -180 to 180 range.
  return {
    tickmode: 'array',
    tickvals,
    ticktext: tickvals.map((lon) => String(lon > 180 ? lon - 360 : lon)),
  };
};
