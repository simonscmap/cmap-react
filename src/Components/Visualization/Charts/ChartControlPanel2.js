// Wrapper for chart controls

import {
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  OutlinedInput,
  Popover,
  Tooltip,
  withStyles,
} from '@material-ui/core';
import { DateRange, LineWeight, SwapVert, Warning } from '@material-ui/icons';
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
  // PREV props
  const {
    classes,
    onToggleSplitByDate,
    splitByDate,
    onToggleSplitBySpace,
    splitBySpace,
    orientation,
    handleZValueConfirm,
    zValues,
    chart,
  } = props;

  // NEW props
  let { controls } = props; // Array of components

  const [
    zScalePopoverAnchorElement,
    setZScalePopoverAnchorElement,
  ] = React.useState(null);
  const [localZMin, setLocalZMin] = React.useState(zValues && zValues[0]);
  const [localZMax, setLocalZMax] = React.useState(zValues && zValues[1]);

  const zScalePopoverOpen = Boolean(zScalePopoverAnchorElement);
  const zScalePopoverID = zScalePopoverOpen ? 'zscale-popover' : undefined;

  const handleZScalePopoverClose = () => {
    setZScalePopoverAnchorElement(null);
  };

  const checkLocalZMin = () => {
    if (localZMin > localZMax) return `Min must be higher than max`;
    if (!/^[-+]?[0-9]*\.?[0-9]+$/.test(localZMin)) return 'Invalid value';
  };

  const checkLocalZMax = () => {
    if (localZMin > localZMax) return `Min must be higher than max`;
    if (!/^[-+]?[0-9]*\.?[0-9]+$/.test(localZMax)) return 'Invalid value';
  };

  const zScaleValidations = [checkLocalZMin(), checkLocalZMax()];

  const [zMinMessage, zMaxMessage] = zScaleValidations;

  const handleLocalZConfirm = () => {
    handleZValueConfirm([localZMin, localZMax]);
    handleZScalePopoverClose();
  };

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
          {/*
            Render the provided controls
            Each control is a tuple, consinting of a Component, and an args object
          */}
          {controls.map(([Component, argsObject], index) => (
            <Component {...argsObject} key={`controls-${index}`} />
          ))}

          {Boolean(onToggleSplitByDate) && (
            <Tooltip placement="top" title="Split By Date">
              <IconButton
                color="inherit"
                className={`${classes.iconButton} ${
                  splitByDate && classes.depressed
                }`}
                onClick={onToggleSplitByDate}
              >
                <DateRange />
              </IconButton>
            </Tooltip>
          )}

          {Boolean(onToggleSplitBySpace) && (
            <Tooltip
              placement="top"
              title={
                orientation === 'zonal'
                  ? 'Split by Latitude'
                  : 'Split by Longitude'
              }
            >
              <IconButton
                color="inherit"
                className={`${classes.iconButton} ${
                  splitBySpace && classes.depressed
                }`}
                onClick={onToggleSplitBySpace}
              >
                <LineWeight />
              </IconButton>
            </Tooltip>
          )}

          {Boolean(handleZValueConfirm) && (
            <Tooltip title="Change Colorscale Range" placement="top">
              <IconButton
                color="inherit"
                onClick={(event) =>
                  setZScalePopoverAnchorElement(event.currentTarget)
                }
                className={classes.iconButton}
              >
                <SwapVert />
              </IconButton>
            </Tooltip>
          )}
        </ButtonGroup>
      </div>

      {/* zscale popover */}
      <Popover
        id={zScalePopoverID}
        open={zScalePopoverOpen}
        anchorEl={zScalePopoverAnchorElement}
        onClose={handleZScalePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          className: classes.grayBackground,
        }}
        classes={{
          root: classes.setPopoverZ,
        }}
      >
        <div className={classes.popover}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <FormControl variant="outlined" error={Boolean(zMinMessage)}>
                <InputLabel htmlFor="z-min-input">Min</InputLabel>
                <OutlinedInput
                  id="z-min-input"
                  value={localZMin}
                  onChange={(event) => setLocalZMin(event.target.value)}
                  aria-describedby="local-zmin-error"
                  labelWidth={36}
                  name="local-zmin"
                />
                <FormHelperText id="local-zmin-error">
                  {zMinMessage}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl variant="outlined" error={Boolean(zMaxMessage)}>
                <InputLabel htmlFor="z-max-input">Max</InputLabel>
                <OutlinedInput
                  id="z-max-input"
                  value={localZMax}
                  onChange={(event) => setLocalZMax(event.target.value)}
                  aria-describedby="local-zmax-error"
                  labelWidth={36}
                  name="local-zmax"
                />
                <FormHelperText id="local-zmax-error">
                  {zMaxMessage}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={7}></Grid>

            <Grid item xs={2}>
              <Button onClick={handleZScalePopoverClose}>Cancel</Button>
            </Grid>

            <Grid item xs={2}>
              <Button
                color="primary"
                onClick={handleLocalZConfirm}
                disabled={Boolean(zMinMessage || zMaxMessage)}
              >
                Confirm
              </Button>
            </Grid>

            <Grid item xs={1}></Grid>
          </Grid>
        </div>
      </Popover>
    </React.Fragment>
  );
};

export default connect(
  null,
  mapDispatchToProps,
)(withStyles(chartControlPanelStyles)(ChartControlPanel));
