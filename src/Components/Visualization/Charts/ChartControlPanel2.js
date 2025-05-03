// Wrapper for chart controls

import { Tooltip, withStyles } from '@material-ui/core';
import { Warning } from '@material-ui/icons';
import React from 'react';
import { connect } from 'react-redux';
import SPARSE_DATA_QUERY_MAX_SIZE from '../../../enums/sparseDataQueryMaxSize';
import SAMPLE_VIS_MAX_QUERY_SIZE from '../../../enums/sampleVisMaxQuerySize';
import spatialResolutions from '../../../enums/spatialResolutions';
import temporalResolutions from '../../../enums/temporalResolutions';
import { sparseDataMaxSizeNotificationUpdate } from '../../../Redux/actions/visualization';
// import { lastRowTimeSpaceDataFromChart } from '../helpers';
import { chartControlPanelStyles } from './chartStyles';
import TabTemplate from './ChartControls/TabTemplate';
// import { SPARSE_DATA_QUERY_SEND } from '../../../Redux/actionTypes/visualization';
import { safePath } from '../../../Utility/objectUtils';
import logInit from '../../../Services/log-service';

const log = logInit('ChartControlPanel');

const mapDispatchToProps = {
  sparseDataMaxSizeNotificationUpdate,
};

const forceResize = () => {
  // TODO: the timeout is arbitrary 30ms
  setTimeout(() => window.dispatchEvent(new Event('resize')), 5);
};

const ChartControlPanel = (props) => {
  const { classes, chart, controls, tabContext } = props;

  const dataLength = safePath(['data', 'variableValues', 'length'])(chart);
  const Temporal_Resolution = safePath([
    'data',
    'metadata',
    'Temporal_Resolution',
  ])(chart);
  const Spatial_Resolution = safePath([
    'data',
    'metadata',
    'Spatial_Resolution',
  ])(chart);
  const isSampleVis = safePath([
    'tabContext',
    'plotOverrides',
    'isSampleVisualization',
  ])(props);

  const SIZE_LIMIT = isSampleVis
    ? SAMPLE_VIS_MAX_QUERY_SIZE
    : SPARSE_DATA_QUERY_MAX_SIZE;

  log.debug(
    `set query size limit to ${
      isSampleVis ? 'SAMPLE threshold' : 'regular SPARSE data threshold'
    }`,
    { SIZE_LIMIT },
  );

  const showSparseDataSizeWarning = Boolean(
    (Spatial_Resolution === spatialResolutions.irregular ||
      Temporal_Resolution === temporalResolutions.irregular) &&
      dataLength >= SIZE_LIMIT,
  );

  console.table({
    showSparseDataSizeWarning,
    Spatial_Resolution,
    Temporal_Resolution,
    dataLength,
  });

  const limit = SIZE_LIMIT.toLocaleString();
  const total = safePath(['data', 'metadata', 'count'])(chart);
  const totalStr =
    total && total.toLocaleString ? total.toLocaleString() : 'unknown';

  return (
    <React.Fragment>
      <div
        className="chartControlPanel"
        style={{
          position: 'relative',
        }}
      >
        {showSparseDataSizeWarning ? (
          <Tooltip
            title={`Visualization does not contain all requested data. The number of datapoints was limited to ${limit} out of ${totalStr}.`}
          >
            <Warning className={classes.sparseDataMaxSizeWarningIcon} />
          </Tooltip>
        ) : (
          ''
        )}

        {/* TODO remove ButtonGroup; it causes console errors re: react not supporting fullWidth attribute */}

        <div className={classes.buttonGroup}>
          <div className={classes.tabbedControls}>
            {/* if this chart has tabbed content, render tab controls*/}
            {tabContext &&
              tabContext.tabTitles.map((tabTitle, index) => {
                return (
                  <TabTemplate
                    tabTitle={tabTitle}
                    onClick={() => {
                      forceResize();
                      tabContext.setOpenTab(index);
                    }}
                    key={`tab-${index}`}
                    active={index === tabContext.openTab}
                  />
                );
              })}
          </div>

          {/* render each control component */}
          {/* TODO: hide controls for tabs that can't use their specific function */}
          <div>
            {controls.map((controlTuple, index) => {
              let [Component, argsObject = {}] = controlTuple;
              let disable =
                tabContext &&
                tabContext.getShouldDisableControl({
                  controlIndex: index,
                  activeTabIndex: tabContext.openTab,
                });
              return (
                <Component
                  {...argsObject}
                  disable={disable}
                  key={`controls-${index}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default connect(
  null,
  mapDispatchToProps,
)(withStyles(chartControlPanelStyles)(ChartControlPanel));
