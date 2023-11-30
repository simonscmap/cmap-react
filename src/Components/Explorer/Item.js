import React, { useEffect, useState } from 'react';
import { Hidden } from '@material-ui/core';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import api from '../../api/api';
import { homeTheme, colors } from '../Home/theme';
import Plotly from 'react-plotly.js';
import data from './data';

import SearchResult from '../Catalog/SearchResult';
import SearchResult2 from '../Catalog/SearchResult2';
import useStyles from './styles';

const XYZ = (obj, i, component) => {
  const cl = useStyles();
  const Component = component;
  return <div>
    <Component dataset={obj} index={i} />
  </div>
}

const TestComponent = () => {
  const cl = useStyles();
  const user = useSelector((s) => s.user);

  return (
    <ThemeProvider theme={homeTheme}>
      <div className={cl.mainWrapper}>

        <div className={cl.alignmentWrapper}>
          <div className={cl.ruler} style={{ width: '100%' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', width: '900px' }}>XS</div>
            <div style={{ background: 'rgba(0,0,0,0.7)', width: '120px' }}>SM</div>
            <div style={{ background: 'rgba(0,0,0,0.2)', width: '260px' }}>MD</div>
            <div style={{ background: 'rgba(0,0,0,0.7)', width: '660px' }}>LG</div>
            <div style={{ background: 'rgba(0,0,0,0.2)', width: '200px' }}>XL</div>
          </div>
          <div>
            {data.results.map((obj, index) => XYZ(obj, index, SearchResult))}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default TestComponent;

export const testPageConfig = {
  route: '/test',
  video: false,
  tour: false,
  hints: false,
  navigationVariant: 'Left',
};
