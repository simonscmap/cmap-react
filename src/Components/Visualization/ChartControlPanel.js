// Wrapper for chart controls

import {
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  OutlinedInput,
  Popover,
  Tooltip,
  withStyles,
} from '@material-ui/core';
import {
  CloudDownload,
  DateRange,
  Gamepad,
  LineWeight,
  Palette,
  ShowChart,
  SwapVert,
  Tune,
  Warning,
} from '@material-ui/icons';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import colors from '../../enums/colors';
import SPARSE_DATA_QUERY_MAX_SIZE from '../../enums/sparseDataQueryMaxSize';
import spatialResolutions from '../../enums/spatialResolutions';
import temporalResolutions from '../../enums/temporalResolutions';
import z from '../../enums/zIndex';
import { sparseDataMaxSizeNotificationUpdate } from '../../Redux/actions/visualization';
import { lastRowTimeSpaceDataFromChart } from './helpers';
import Hint from '../Help/Hint';
import PlotControlsHint from './help/PlotControlsHint';

const mapDispatchToProps = {
  sparseDataMaxSizeNotificationUpdate,
};

const styles = (theme) => ({
  popover: {
    width: '470px',
    height: '120px',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    zIndex: z.CONTROL_PRIMARY,
  },

  iconButton: {
    boxShadow: '0px 1px 1px 1px #242424',
  },

  colorForm: {
    width: '100%',
  },

  lastIcon: {
    borderTopRightRadius: '10%',
    borderBottomRightRadius: '10%',
  },

  buttonGroup: {
    display: 'block',
    margin: '0px auto 8px auto',
    maxWidth: '700px',
    textAlign: 'center',
    pointerEvents: 'auto',
  },

  depressed: {
    boxShadow: 'inset 1px 1px 5px #262626',
  },

  colorscaleMenu: {
    maxHeight: '400px',
    zIndex: z.CONTROL_PRIMARY,
  },

  setPopoverZ: {
    zIndex: `${z.CONTROL_PRIMARY} !important`,
  },

  grayBackground: {
    backgroundColor: colors.backgroundGray,
  },

  sparseDataMaxSizeWarningIcon: {
    color: colors.errorYellow,
    position: 'absolute',
    top: '60px',
    left: 'calc(50% - 12px)',
    cursor: 'pointer',
    zIndex: z.CONTROL_PRIMARY - 1,
    pointerEvents: 'auto',
  },
});

const colorscaleOptions = [
  'Default',
  'Greys',
  'YlGnBu',
  'Greens',
  'YlOrRd',
  'Bluered',
  'RdBu',
  'Reds',
  'Blues',
  'Picnic',
  'Rainbow',
  'Portland',
  'Jet',
  'Hot',
  'Blackbody',
  'Earth',
  'Electric',
  'Viridis',
  'Cividis',
];

function usePreviousSize(value) {
  let size = value ? value.size : null;
  const ref = useRef();
  useEffect(() => {
    ref.current = size;
  });
  return ref.current;
}

function usePreviousColor(value) {
  let color = value ? value.color : null;
  const ref = useRef();
  useEffect(() => {
    ref.current = color;
  });
  return ref.current;
}

function usePreviousOpacity(value) {
  let opacity = value ? value.opacity : null;
  const ref = useRef();
  useEffect(() => {
    ref.current = opacity;
  });
  return ref.current;
}

const ChartControlPanel = (props) => {
  const {
    classes,
    onToggleSplitByDate,
    splitByDate,
    onToggleSplitBySpace,
    splitBySpace,
    orientation,
    downloadCsv,
    handleZValueConfirm,
    zValues,
    markerOptions,
    handleMarkerOptionsConfirm,
    showErrorBars,
    handleSetShowErrorBars,
    showLines,
    handleSetShowLines,
    chart,
  } = props;

  const [paletteAnchorElement, setPaletteAnchorElement] = useState(null);

  let handleOpenPalette = (event) => {
    setPaletteAnchorElement(event.currentTarget);
  };

  // Local version, not from props
  let handlePaletteChoice = (option) => {
    setPaletteAnchorElement(null);
    props.handlePaletteChoice(option);
  };

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

  const [
    markerOptionsAnchorElement,
    setMarkerOptionsAnchorElement,
  ] = React.useState(null);
  const [localMarkerOpacity, setLocalMarkerOpacity] = React.useState(
    markerOptions && markerOptions.opacity,
  );
  const [localMarkerColor, setLocalMarkerColor] = React.useState(
    markerOptions && markerOptions.color,
  );
  const [localMarkerSize, setLocalMarkerSize] = React.useState(
    markerOptions && markerOptions.size,
  );

  var previousOpacity = usePreviousOpacity(markerOptions);
  var previousColor = usePreviousColor(markerOptions);
  var previousSize = usePreviousSize(markerOptions);

  useEffect(() => {
    if (markerOptions) {
      if (markerOptions.opacity !== previousOpacity) {
        setLocalMarkerOpacity(markerOptions.opacity);
      }

      if (markerOptions.color !== previousColor) {
        setLocalMarkerColor(markerOptions.color);
      }

      if (markerOptions.size !== previousSize) {
        setLocalMarkerSize(markerOptions.size);
      }
    }
  });

  const markerPopoverOpen = Boolean(markerOptionsAnchorElement);
  const markerPopoverID = markerPopoverOpen ? 'marker-popover' : undefined;

  const handleMarkerOptionsClose = () => {
    setMarkerOptionsAnchorElement(null);
  };

  const checkLocalMarkerOpacity = () => {
    if (
      localMarkerOpacity < 0.1 ||
      localMarkerOpacity > 1 ||
      !/^[-+]?[0-9]*\.?[0-9]+$/.test(localMarkerOpacity)
    ) {
      return 'Opacity should be 0.1 to 1';
    }
  };

  const checkLocalMarkerSize = () => {
    if (
      localMarkerSize < 1 ||
      localMarkerSize > 18 ||
      !/^[-+]?[0-9]*\.?[0-9]+$/.test(localMarkerSize)
    ) {
      return 'Size should be 1 to 18';
    }
  };

  const markerOptionsValidations = [
    checkLocalMarkerOpacity(),
    checkLocalMarkerSize(),
  ];

  const [
    localMarkerOpacityMessage,
    localMarkerSizeMessage,
  ] = markerOptionsValidations;

  const handleLocalMarkerOptionsConfirm = () => {
    handleMarkerOptionsConfirm({
      opacity: localMarkerOpacity,
      color: localMarkerColor,
      size: localMarkerSize,
    });
    handleMarkerOptionsClose();
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
    <Hint
      content={PlotControlsHint}
      position={{ beacon: 'bottom', hint: 'bottom-end' }}
      styleOverride={{ button: { zIndex: 999 }, wrapper: { zIndex: 998 } }}
      size={'medium'}
    >
      <div
        style={{
          position: 'relative',
          pointerEvents: 'none',
          margin: 'auto',
          maxWidth: '80%',
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

          <Tooltip placement="top" title="Download CSV">
            <IconButton
              color="inherit"
              onClick={downloadCsv}
              className={classes.iconButton}
            >
              <CloudDownload />
            </IconButton>
          </Tooltip>

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

          {Boolean(handleSetShowLines) && (
            <Tooltip
              title={showLines ? 'Hide Plot Line' : 'Show Plot Line'}
              placement="top"
            >
              <IconButton
                color="inherit"
                onClick={() => handleSetShowLines(!showLines)}
                className={`${classes.iconButton} ${
                  showLines && classes.depressed
                }`}
              >
                <ShowChart />
              </IconButton>
            </Tooltip>
          )}

          {Boolean(handleSetShowErrorBars) && (
            <Tooltip
              title={showErrorBars ? 'Hide Error Bars' : 'Show Error Bars'}
              placement="top"
            >
              <IconButton
                color="inherit"
                onClick={() => handleSetShowErrorBars(!showErrorBars)}
                className={`${classes.iconButton} ${
                  showErrorBars && classes.depressed
                }`}
              >
                <Tune />
              </IconButton>
            </Tooltip>
          )}

          {Boolean(props.handlePaletteChoice) && (
            <Tooltip title="Change Palette" placement="top">
              <IconButton
                disabled={!Boolean(props.handlePaletteChoice)}
                color="inherit"
                onClick={handleOpenPalette}
                className={classes.iconButton}
              >
                <Palette />
              </IconButton>
            </Tooltip>
          )}

          {Boolean(props.handleMarkerOptionsConfirm) && (
            <Tooltip title="Marker Options" placement="top">
              <IconButton
                color="inherit"
                onClick={(event) =>
                  setMarkerOptionsAnchorElement(event.currentTarget)
                }
                className={`${classes.iconButton} ${classes.lastIcon}`}
              >
                <Gamepad />
              </IconButton>
            </Tooltip>
          )}
        </ButtonGroup>
      </div>

      <Menu
        id="simple-menu"
        anchorEl={paletteAnchorElement}
        keepMounted
        open={Boolean(paletteAnchorElement)}
        onClose={() => setPaletteAnchorElement(null)}
        className={classes.colorscaleMenu}
        MenuListProps={{
          className: classes.grayBackground,
        }}
      >
        {colorscaleOptions.map((option, index) => (
          <MenuItem
            onClick={() =>
              handlePaletteChoice(option === 'Default' ? 'heatmap' : option)
            }
            key={index}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>

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

      {/* Marker popover */}
      <Popover
        id={markerPopoverID}
        open={markerPopoverOpen}
        anchorEl={markerOptionsAnchorElement}
        onClose={handleMarkerOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{
          root: classes.setPopoverZ,
        }}
        PaperProps={{
          className: classes.grayBackground,
        }}
      >
        <div className={classes.popover}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <FormControl
                variant="outlined"
                error={Boolean(localMarkerOpacityMessage)}
              >
                <InputLabel htmlFor="local-marker-opacity">Opacity</InputLabel>
                <OutlinedInput
                  id="local-marker-opacity"
                  value={localMarkerOpacity}
                  onChange={(event) =>
                    setLocalMarkerOpacity(event.target.value)
                  }
                  aria-describedby="local-marker-opacity"
                  labelWidth={44}
                  name="local-marker-opacity"
                />
                <FormHelperText id="local-marker-opacity-error">
                  {localMarkerOpacityMessage}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl
                variant="outlined"
                // error={Boolean(zMaxMessage)}
              >
                <InputLabel htmlFor="local-marker-size">Size</InputLabel>
                <OutlinedInput
                  error={Boolean(localMarkerSizeMessage)}
                  id="local-marker-size"
                  value={localMarkerSize}
                  onChange={(event) => setLocalMarkerSize(event.target.value)}
                  aria-describedby="local-marker-size"
                  labelWidth={36}
                  name="local-marker-size"
                />
                <FormHelperText id="local-marker-size-error">
                  {localMarkerSizeMessage}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl variant="outlined" className={classes.colorForm}>
                <InputLabel htmlFor="z-min-input">Color</InputLabel>
                <OutlinedInput
                  type="color"
                  id="marker-color"
                  value={localMarkerColor}
                  onChange={(event) => setLocalMarkerColor(event.target.value)}
                  aria-describedby="local-marker-color"
                  labelWidth={44}
                  name="local-marker-color"
                />
              </FormControl>
            </Grid>

            <Grid item xs={1}></Grid>

            <Grid item xs={2}>
              <Button onClick={handleMarkerOptionsClose}>Cancel</Button>
            </Grid>

            <Grid item xs={2}>
              <Button
                color="primary"
                onClick={handleLocalMarkerOptionsConfirm}
                disabled={Boolean(
                  localMarkerOpacityMessage || localMarkerSizeMessage,
                )}
              >
                Confirm
              </Button>
            </Grid>

            <Grid item xs={1}></Grid>
          </Grid>
        </div>
      </Popover>
    </Hint>
  );
};

export default connect(
  null,
  mapDispatchToProps,
)(withStyles(styles)(ChartControlPanel));
