// Chart Template -- a common interface for every chart render
// handles common controls (delete, download, control modebar)
// handles use of common chart defaults, allowing overrides
// handles sole implementation of chart related Hints
import { withStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import Plotly from 'react-plotly.js';
import { useSelector } from 'react-redux';
import { VISUALIZATION_PAGE } from '../../../constants';
import Hint from '../../Help/Hint';
import ModebarHint from '../help/ModebarHint';
import PlotControlsHint from '../help/PlotControlsHint';
import { makeChartConfig } from './chartBase';
import ChartControlPanel from './ChartControlPanel2';
import CloseChartButton from './ChartControls/CloseChartButton';
import DownloadCSV from './ChartControls/DownloadCSV';
import PersistModeBar from './ChartControls/PersistModeBar';
import { chartTemplate } from './chartStyles';

// TODO: fix the plots.map -- this won't work. we need a new template for each plot

const ChartTemplate = (props) => {
  let {
    classes,
    downloadCSVArgs,
    chartData, // chart data
    chartControls, // Array of chart control definitons: [component, argsObject ]
    plots, // Array of plot objects
    chartIndex, // position in the array of charts currently rendered
  } = props;

  // keep state of mode bar persistence
  let [persistModeBar, setPersist] = useState(undefined);

  const hintsAreEnabled = useSelector(({ hints }) => hints[VISUALIZATION_PAGE]);

  useEffect(() => {
    if (hintsAreEnabled) {
      setPersist(true);
    }
}, [hintsAreEnabled]);

  // apply defaults to plot config object from chart base
  let plotObjects = plots.map(makeChartConfig);

  // apply user's choice to set the modebar
  plotObjects = plotObjects.map((plot) => {
    if (persistModeBar !== undefined) {
      plot.config.displayModeBar = persistModeBar;
    }
    return plot;
  });

  // assemble controls
  let DownloadCSVControlTuple = [DownloadCSV, { csvData: downloadCSVArgs }];
  let CloseChartButtonTuple = [CloseChartButton, { chartIndex }];
  let PersistModeBarTuple = [PersistModeBar, { setPersist, persistModeBar }];

  let controls = [
    DownloadCSVControlTuple,
    ...chartControls,
    PersistModeBarTuple,
    CloseChartButtonTuple,
  ];


  return (
    <div
      className={`${classes.chartTemplate} spName:${chartData.data.parameters.spName} subType${chartData.subType}`}
    >

      {/* Chart controls with Hint */}
      <Hint
        content={PlotControlsHint}
        position={{ beacon: 'right', hint: 'bottom-start' }}
        styleOverride={{ button: { zIndex: 999 }, wrapper: { zIndex: 998 } }}
        size={'medium'}
      >
        <ChartControlPanel controls={controls} chart={chartData} />
      </Hint>

      {/* ModeBar Hint (not attached to modebar, because that is a plotly internal) */}
      <Hint
        content={ModebarHint}
        position={{ beacon: 'right', hint: 'bottom-start' }}
        styleOverride={{ beacon: { top: '.2em' } }}
      ></Hint>

      {/* Plots */}
      {plotObjects.map((args, index) => {
        return <Plotly {...args} key={`plot-${index}`} />;
      })}
    </div>
  );
};

export default withStyles(chartTemplate)(ChartTemplate);
