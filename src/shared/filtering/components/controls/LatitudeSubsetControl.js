import React from 'react';
import RangeSubsetControl from './RangeSubsetControl';

const LatitudeSubsetControl = (props) => {
  const {
    latMin,
    latMax,
    subsetState: { latStart, latEnd },
    setLatStart,
    setLatEnd,
  } = props;

  return (
    <RangeSubsetControl
      title="Latitude[°]"
      start={latStart}
      end={latEnd}
      setStart={setLatStart}
      setEnd={setLatEnd}
      min={latMin}
      max={latMax}
      defaultMin={-90}
      defaultMax={90}
      step={0.1}
      unit="°"
    />
  );
};

export default LatitudeSubsetControl;
