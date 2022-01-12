// Wrapper for charts
import React from 'react';
import ChartWrapper from './ChartWrapper';

import { useSelector } from 'react-redux';

const Charts = () => {
  let charts = useSelector(({ charts }) => charts);
  return charts.map((chart, index) => (
    <ChartWrapper chart={chart} index={index} key={chart.id} />
  ));
};

export default Charts;
