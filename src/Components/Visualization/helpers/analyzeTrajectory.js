// given trajectory data, return the center point and maxDistance
// used to provide zoom & position for esri view
function analyze (trajectoryData) {
    const { lons, lats } = trajectoryData;

    let lonStart = lons[0];
    let latStart = lats[0];
    let maxDistance = 0;

    // Create a new path array each time 180 lon is crossed
    lons.forEach((lon, i) => {
      let lat = lats[i];

      let latDistance = Math.abs(lat - latStart);
      let _lonDistance = Math.abs(lon - lonStart);
      let lonDistance = _lonDistance > 180 ? 360 - _lonDistance : _lonDistance;

      let distance = Math.sqrt(
        latDistance * latDistance + lonDistance * lonDistance,
      );
      maxDistance = distance > maxDistance ? distance : maxDistance;
    });

    const center = [
      lons[Math.floor(lons.length / 2)],
      lats[Math.floor(lons.length / 2)]
    ];

    return {
      center,
      maxDistance,
    };
}

export default analyze;
