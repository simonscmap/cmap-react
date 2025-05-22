import React from 'react';
import TableRowTextPair from './TableRowPair';

const SpatialCoverage = (props) => {
  const { dataset } = props;
  if (!dataset) {
    return '';
  }

  const { Lat_Min, Lat_Max, Lon_Min, Lon_Max } = dataset;
  const latmin = Lat_Min.toFixed(2);
  const latmax = Lat_Max.toFixed(2);
  const lonmin = Lon_Min.toFixed(2);
  const lonmax = Lon_Max.toFixed(2);

  const latitudeRange = `${latmin}°S – ${latmax}°N`;
  const longitudeRange = `${lonmin}°W – ${lonmax}°E`;

  return (
    <>
      <TableRowTextPair
        label="Latitude Range"
        value={latitudeRange}
        mono={true}
      />
      <TableRowTextPair
        label="Longitude Range"
        value={longitudeRange}
        mono={true}
      />
    </>
  );
};

export default SpatialCoverage;
