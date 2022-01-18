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
import CloseChartControl from './ChartControls/CloseChartControl';
import DownloadCSVControl from './ChartControls/DownloadCSVControl';
import makeModeBarControl from './ChartControls/ModeBarControl';
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
  // if 'undefined' it will fall through to Plotly default behavior (show Mode Bar on hover)
  // but 'true' and 'false' will persist visible and hidden respectively
  let [persistModeBar, setPersist] = useState(undefined);

  // read hint state, so that we can persist mode bar by default if they are enabled
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
  let DownloadCSVControlTuple = [DownloadCSVControl, { csvData: downloadCSVArgs }];
  let CloseChartButtonTuple = [CloseChartControl, { chartIndex }];
  let PersistModeBarTuple = [makeModeBarControl([persistModeBar, setPersist])];

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
