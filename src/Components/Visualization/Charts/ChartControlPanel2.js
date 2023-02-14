// Wrapper for chart controls

import { Tooltip, withStyles } from '@material-ui/core';
import { Warning } from '@material-ui/icons';
import React from 'react';
import { connect } from 'react-redux';
import SPARSE_DATA_QUERY_MAX_SIZE from '../../../enums/sparseDataQueryMaxSize';
import spatialResolutions from '../../../enums/spatialResolutions';
import temporalResolutions from '../../../enums/temporalResolutions';
import { sparseDataMaxSizeNotificationUpdate } from '../../../Redux/actions/visualization';
import { lastRowTimeSpaceDataFromChart } from '../helpers';
import { chartControlPanelStyles } from './chartStyles';
import TabTemplate from './ChartControls/TabTemplate';

const mapDispatchToProps = {
  sparseDataMaxSizeNotificationUpdate,
};

const forceResize = () => {
  // TODO: the timeout is arbitrary 30ms
  setTimeout(() => window.dispatchEvent(new Event('resize')), 5);
};

const ChartControlPanel = (props) => {
  const { classes, chart, controls, tabContext } = props;

  const showMaxSizeWarningAndInfo = () => {
    props.sparseDataMaxSizeNotificationUpdate(
      lastRowTimeSpaceDataFromChart(props.chart.data),
    );
  };

  const showSparseDataSizeWarning = Boolean(
    chart &&
      (chart.data.metadata.Spatial_Resolution ===
        spatialResolutions.irregular ||
        chart.data.metadata.Temporal_Resolution ===
          temporalResolutions.irregular) &&
      chart.data &&
      chart.data.variableValues &&
      chart.data.variableValues.length >= SPARSE_DATA_QUERY_MAX_SIZE,
  );

  return (
    <React.Fragment>
      <div
        className="chartControlPanel"
        style={{
          position: 'relative',
        }}
      >
        {showSparseDataSizeWarning ? (
          <Tooltip title="Visualization does not contain all requested data. Click for more info.">
            <Warning
              className={classes.sparseDataMaxSizeWarningIcon}
              onClick={showMaxSizeWarningAndInfo}
            />
          </Tooltip>
        ) : (
          ''
        )}

    {/* TODO remove ButtonGroup; it causes console errors re: react not supporting fullWidth attribute */}

        <div className={classes.buttonGroup}>
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

          <div style={{ width: '10px' }}></div>

          {/* render each control component */}
          {/* TODO: hide controls for tabs that can't use their specific function */}
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
    </React.Fragment>
  );
};

export default connect(
  null,
  mapDispatchToProps,
)(withStyles(chartControlPanelStyles)(ChartControlPanel));
