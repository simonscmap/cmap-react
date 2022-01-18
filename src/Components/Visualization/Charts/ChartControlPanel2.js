// Wrapper for chart controls

import { Button, ButtonGroup, Tooltip, withStyles } from '@material-ui/core';
import { Warning } from '@material-ui/icons';
import React from 'react';
import { connect } from 'react-redux';
import SPARSE_DATA_QUERY_MAX_SIZE from '../../../enums/sparseDataQueryMaxSize';
import spatialResolutions from '../../../enums/spatialResolutions';
import temporalResolutions from '../../../enums/temporalResolutions';
import { sparseDataMaxSizeNotificationUpdate } from '../../../Redux/actions/visualization';
import { lastRowTimeSpaceDataFromChart } from '../helpers';
import { chartControlPanelStyles } from './chartStyles';

const mapDispatchToProps = {
  sparseDataMaxSizeNotificationUpdate,
};

const ChartControlPanel = (props) => {
  const { classes, chart, controls } = props;

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

        <ButtonGroup className={classes.buttonGroup}>
          <Button>Tab</Button> {/* Tabs go here*/}
          <div style={{ width: '15px' }}></div>
          {controls.map((controlTuple, index) => {
            let [Component, argsObject = {}] = controlTuple;
            return <Component {...argsObject} key={`controls-${index}`} />;
          })}
        </ButtonGroup>
      </div>
    </React.Fragment>
  );
};

export default connect(
  null,
  mapDispatchToProps,
)(withStyles(chartControlPanelStyles)(ChartControlPanel));
