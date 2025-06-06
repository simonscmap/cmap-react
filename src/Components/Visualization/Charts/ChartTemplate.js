// Chart Template -- a common interface for every chart render
// handles common controls (delete, download, control modebar)
// handles use of common chart defaults, allowing overrides
// handles sole implementation of chart related Hints
import { withStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import Plotly from 'react-plotly.js';
import { useSelector, useDispatch } from 'react-redux';
import { VISUALIZATION_PAGE } from '../../../constants';
import Hint from '../../Navigation/Help/Hint';
import ModebarHint from '../help/ModebarHint';
import PlotControlsHint from '../help/PlotControlsHint';
import { makeChartConfig } from './chartBase';
import ChartControlPanel from './ChartControlPanel2';
import CloseChartControl from './ChartControls/CloseChartControl';
import DownloadCSVControl from './ChartControls/DownloadCSVControl';
import makeModeBarControl from './ChartControls/ModeBarControl';
import { chartTemplate } from './chartStyles';
import { setDatasetVisTabPreference } from '../../../Redux/actions/catalog';
import { safePath } from '../../../Utility/objectUtils';

// TODO: fix the plots.map -- this won't work. we need a new template for each plot

const ChartTemplate = (props) => {
  let {
    classes,
    downloadCSVArgs, // Array: array of args for csv control
    chartData, // Object: chart data
    chartControls, // Array: array of chart control definitons: [component, argsObject ]
    plots, // Array: array of plot objects
    chartIndex, // Integer: position in the array of charts currently rendered
    isTabbedContent, // Boolean: is this a tabbed chart?
    getShouldDisableControl, // () -> bool: used for tabbed content
  } = props;

  // keep state of mode bar persistence
  // if 'undefined' it will fall through to Plotly default behavior (show Mode Bar on hover)
  // but 'true' and 'false' will persist visible and hidden respectively
  let [persistModeBar, setPersist] = useState(undefined);

  // read hint state, so that we can persist mode bar by default if they are enabled
  const hintsAreEnabled = useSelector(({ hints }) => hints[VISUALIZATION_PAGE]);

  // we're going to try to bridge local and app state for tab status
  const dispatch = useDispatch();

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

  // create tab controls, if tabs chart requires tabbed content
  // set default to tab preference, if it exists
  const tabPreference = useSelector(
    (state) => state.datasetDetailsPage.tabPreference,
  );
  const startingTab =
    tabPreference && !Number.isInteger(chartIndex) ? tabPreference : 0;
  let [openTab, setOpenTab] = useState(startingTab);

  const handleTabClick = (n) => {
    if (!Number.isInteger(chartIndex)) {
      // the absence of an index indicates this chart is not being rendered on the visualization page
      const variableShortName = safePath(['data', 'metadata', 'Short_Name'])(
        chartData,
      );
      if (variableShortName) {
        console.log('should set tab preference', variableShortName, n);
        dispatch(setDatasetVisTabPreference(variableShortName, n));
      } else {
        console.log('no variable short name???', variableShortName, chartData);
      }
    }
    setOpenTab(n);
  };

  let tabContext;
  if (isTabbedContent) {
    // these will be provided to the control panel in the same order
    // as the plots; so indexes will correspond
    let tabTitles = plotObjects.map((plot, index) => {
      return plot.tabTitle || `Tab ${index}`;
    });
    // provide the following context to the Control Panel
    // which will render tab buttons
    tabContext = {
      setOpenTab: handleTabClick,
      openTab,
      plotOverrides: plots && plots[openTab] && plots[openTab].cmapOverrides,
      tabTitles,
      getShouldDisableControl,
    };
  }

  // assemble controls
  let DownloadCSVControlTuple = [
    DownloadCSVControl,
    { csvData: downloadCSVArgs },
  ];
  let CloseChartButtonTuple = [CloseChartControl, { chartIndex }];
  let PersistModeBarTuple = [makeModeBarControl([persistModeBar, setPersist])];

  let controls = [DownloadCSVControlTuple, ...chartControls];

  // if the rendering context is the visualization page, this chart will have an index
  // and we can include these tools
  if (Number.isInteger(chartIndex)) {
    controls.push(PersistModeBarTuple, CloseChartButtonTuple);
  }

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
        <ChartControlPanel
          controls={controls}
          tabContext={isTabbedContent && tabContext}
          chart={chartData}
        />
      </Hint>

      {/* ModeBar Hint (not attached to modebar, because that is a plotly internal) */}
      <Hint
        content={ModebarHint}
        position={{ beacon: 'right', hint: 'bottom-start' }}
        styleOverride={{ beacon: { top: '.2em' } }}
      ></Hint>

      {/* Plots */}
      {plotObjects.map((args, index) => {
        // hide plot if this is tabbed content, and it is not the active index
        return (
          <div
            key={`plot-${index}`}
            hidden={isTabbedContent && openTab !== index}
          >
            <Plotly {...args} key={`plot-${index}`} />
          </div>
        );
      })}
    </div>
  );
};

export default withStyles(chartTemplate)(ChartTemplate);
