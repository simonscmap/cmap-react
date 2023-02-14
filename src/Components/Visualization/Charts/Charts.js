// Wrapper for charts
import React from 'react';
import ChartWrapper from './ChartWrapper';

import { useSelector } from 'react-redux';

const ChartsList = () => {
  let charts = useSelector(({ charts }) => charts);
  return charts.map((chart, index) => (
    <ChartWrapper chart={chart} index={index} key={chart.id} />
  ));
};

export default ChartsList;
