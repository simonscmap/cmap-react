import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { homeTheme, colors } from '../../Home/theme';
import { GiWireframeGlobe } from 'react-icons/gi';
const useStyles = makeStyles((theme) => ({
  grid: {
    display: 'inline-grid',
    gridTemplateColumns: 'auto auto auto',
    '& > div': {
      alignSelf: 'center',
      placeSelf: 'center',
    },
    lineHeight: '1.1em',
  },
  compass: {
    padding: '.3em',
    '& img': {
      width: '60px',
    },
  },
  label: {
    color: 'rgb(135, 255, 244)',
    fontFamily: 'mono',
  },
}));

const SpatialCoverage = (props) => {
  const cl = useStyles();
  const { dataset } = props;
  if (!dataset) {
    return '';
  }

  const { Lat_Min, Lat_Max, Lon_Min, Lon_Max } = dataset;
  const latmin = Lat_Min.toFixed(2);
  const latmax = Lat_Max.toFixed(2);
  const lonmin = Lon_Min.toFixed(2);
  const lonmax = Lon_Max.toFixed(2);

  return (
    <div className={cl.grid}>
      <div></div>
      <div className={cl.label}>{latmax}&deg;</div>
      <div></div>

      <div className={cl.label}>{lonmin}&deg;</div>
      <div className={cl.compass}>
        <img src="/images/compass.svg" width="50px" />
      </div>
      <div className={cl.label}>{lonmax}&deg;</div>
      <div></div>
      <div className={cl.label}>{latmin}&deg;</div>
      <div></div>
    </div>
  );
};

export default SpatialCoverage;
