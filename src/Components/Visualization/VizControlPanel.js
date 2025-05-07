// Monolith component for charts/plots control

import React from 'react';
import { connect } from 'react-redux';
import { throttle } from 'throttle-debounce';

import {
  Badge,
  Button,
  Drawer,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  withStyles,
} from '@material-ui/core';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Info,
  Language,
  Search,
  ShowChart,
} from '@material-ui/icons';
import { ImLock } from 'react-icons/im';
import { ImUnlocked } from 'react-icons/im';
import { LuAlertTriangle } from 'react-icons/lu';
import CloseIcon from '@material-ui/icons/Close';

import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

import ChartControl from './Charts/ChartControl';
import VariableSelector from './VariableSelector/VariableSelector';
import { RestrictDataHint, SearchHint } from './help';
import getTargetFeatures from './ControlPanel/getTargetFeatures';
import manageDateParams from './ControlPanel/manageDateParams';
import transformDateStringToMonth from './ControlPanel/transformDateStringToMonth';
import prepareQueryPayload from './ControlPanel/prepareQueryPayload';

import {
  // aggregateChartDataSize,
  cleanSPParams,
  generateVariableSampleRangeParams,
  mapVizType,
} from './helpers';

import SparseDataMaxSizeNotification from './SparseDataMaxSizeNotification';
import VariableDetailsDialog from './VariableDetailsDialog';
import vizControlStyles from './vizControlStyles';
import handleChangeFormInput, {
  shiftMinMaxDate,
} from './ControlPanel/handleChangeFormInput';
import handleValidation from './ControlPanel/handleValidation';
import Hint from '../Navigation/Help/Hint';

// redux
import { snackbarOpen } from '../../Redux/actions/ui';
import {
  checkVizQuerySize,
  clearCharts,
  cruiseTrajectoryRequestSend,
  csvDownloadRequestSend,
  guestPlotLimitNotificationSetIsVisible,
  plotsActiveTabSet,
  setControlPanelVisibility,
  setDataSearchMenuVisibility,
  setLockAlertsOpen,
  setParamLock,
  sparseDataQuerySend,
  storedProcedureRequestSend,
  vizPageDataTargetSetAndFetchDetails,
} from '../../Redux/actions/visualization';

// enums
import spatialResolutions from '../../enums/spatialResolutions';
import storedProcedures from '../../enums/storedProcedures';
import temporalResolutions from '../../enums/temporalResolutions';

// common
import { Warning } from '../../Components/Common/Alert';
import initLogger from '../../Services/log-service';

const log = initLogger('VizControlPanel');

const mapStateToProps = (state) => ({
  data: state.data,
  catalog: state.catalog,
  catalogRequestState: state.catalogRequestState,
  cruiseTrajectory: state.cruiseTrajectory,
  showHelp: state.showHelp,
  datasets: state.datasets,
  charts: state.charts,
  dataTarget: state.vizPageDataTarget,
  vizPageDataTargetDetails: state.vizPageDataTargetDetails,
  user: state.user,
  showControlPanel: state.showControlPanel,
  dataSearchMenuOpen: state.dataSearchMenuOpen,
  paramLock: state.viz.chart.controls.paramLock,
  dateTypeMismatch: state.viz.chart.controls.dateTypeMismatch,
  variableResolutionMismatch:
    state.viz.chart.controls.variableResolutionMismatch,
  lockAlertsOpen: state.viz.chart.controls.lockAlertsOpen,
  sizeCheckStatus: state.viz.chart.validation.sizeCheck.status,
  sizeCheck: state.viz.chart.validation.sizeCheck.result,
});

const mapDispatchToProps = {
  checkVizQuerySize,
  clearCharts,
  cruiseTrajectoryRequestSend,
  csvDownloadRequestSend,
  guestPlotLimitNotificationSetIsVisible,
  plotsActiveTabSet,
  setControlPanelVisibility,
  setDataSearchMenuVisibility,
  setLockAlertsOpen,
  setParamLock,
  snackbarOpen,
  sparseDataQuerySend,
  storedProcedureRequestSend,
  vizPageDataTargetSetAndFetchDetails,
};

const overrideDisabledStyle = {
  backgroundColor: 'transparent',
};

const polygonSymbol = {
  type: 'polygon-3d',
  symbolLayers: [
    {
      type: 'fill',
      material: {
        color: [0, 255, 255, 0.3],
      },
      outline: {
        color: [0, 255, 255, 1],
        size: '2px',
      },
    },
  ],
};
const defaultParamState = {
  depth1: 0,
  depth2: 0,
  dt1: '1900-01-01T00:00:00.000Z',
  dt2: new Date().toISOString(),
  lat1: 0,
  lat2: 0,
  lon1: 0,
  lon2: 0,
};
const defaultBaseState = {
  variableDetailsID: null,
  tableName: '',
  selectedVizType: '',
  surfaceOnly: false,
  irregularSpatialResolution: false,
  addedGlobeUIListeners: false,
  showDrawHelp: false,
};
const defaultState = {
  ...defaultParamState,
  ...defaultBaseState,
};

// detect if spatial state has changed
const spatialStateHasChanged = (prevState, currState) => {
  return (
    prevState.lat1 !== currState.lat1 ||
    prevState.lat2 !== currState.lat2 ||
    prevState.lon1 !== currState.lon1 ||
    prevState.lon2 !== currState.lon2 ||
    prevState.depth1 !== currState.depth1 ||
    prevState.depth2 !== currState.depth2
  );
};

const temporalRangeHasChanged = (prevState, currState) => {
  return prevState.dt1 !== currState.dt1 || prevState.dt2 !== currState.dt2;
};

// Helper to handle re-drawing polygons on the globe
// when the region selection has changed
const updateGlobeWithPolygon = (mapRef, currState) => {
  if (!mapRef || !mapRef.current) {
    console.log(`<trace> could not update globe, no ref`);
    return;
  }
  const lat1 = parseFloat(currState.lat1);
  const lat2 = parseFloat(currState.lat2);
  const lon1 = parseFloat(currState.lon1);
  let _lon2 = parseFloat(currState.lon2);
  const lon2 = _lon2 < lon1 ? _lon2 + 360 : _lon2;

  // clear globe
  mapRef.current.regionLayer.removeAll();

  // define new polygon
  const polygon = {
    type: 'polygon',
    rings: [
      [lon1, lat1],
      [lon2, lat1],
      [lon2, lat2],
      [lon1, lat2],
      [lon1, lat1],
    ],
  };

  const regionGraphic = new mapRef.current.props.esriModules.Graphic({
    geometry: polygon,
    symbol: polygonSymbol,
  });

  // draw
  mapRef.current.regionLayer.add(regionGraphic);
};

const targetVariableIsNowNull = (prevProps, currProps) => {
  return (
    currProps.vizPageDataTargetDetails === null &&
    prevProps.vizPageDataTargetDetails !== null
  );
};

const newDataTargetDetails = (prevProps, currProps) => {
  // will help determine whether to reorient the globe to new region
  return (
    currProps.vizPageDataTargetDetails !== prevProps.vizPageDataTargetDetails
  );
};

const isSatelliteOrModel = (currProps) => {
  const { irregularSpatialResolution, monthlyClimatology } =
    getTargetFeatures(currProps);
  const isNotIrregularSpatialResolution = !irregularSpatialResolution;
  const isNotMonthlyClimatology = !monthlyClimatology;

  return isNotIrregularSpatialResolution && isNotMonthlyClimatology;
};

const reorientGlobe = (globeUIRef, currProps) => {
  if (!globeUIRef || !globeUIRef.current) {
    return;
  }
  const data = currProps.vizPageDataTargetDetails;
  const { irregularSpatialResolution } = getTargetFeatures(currProps);
  const derivedParams = generateVariableSampleRangeParams(data);
  const { lat1, lat2, lon1, lon2 } = derivedParams;

  if (irregularSpatialResolution) {
    globeUIRef.current.props.view.goTo(
      {
        target: [
          (parseFloat(lon1) + parseFloat(lon2)) / 2,
          (parseFloat(lat1) + parseFloat(lat2)) / 2,
        ],
        zoom: 3,
      },
      {
        maxDuration: 2500,
        speedFactor: 0.5,
      },
    );
  }
};

// help the monthly input fields display a meaningful value if the date range
// is locked with date-time values
const ensureMonthlyValue = (dateString) => {
  if (dateString === undefined) {
    return 1; // default to January
  } else if (typeof dateString !== 'string') {
    return dateString; // most likely a number
  } else if (dateString.length > 2) {
    return transformDateStringToMonth(dateString);
  } else {
    return dateString;
  }
};

const ensureTimeValue = (dateString) => {
  // if date string does not provide enough information,
  // default to 0 hours 0 minutes
  if (dateString === undefined) {
    return '00:00'; // default to January
  } else if (typeof dateString !== 'string') {
    return '00:00';
  } else if (dateString.length < 16) {
    return '00:00';
  } else {
    return dateString.slice(11, 16);
  }
};

/* ~~~~~~~~~   VizControlPanel   ~~~~~~~~~~~~ */
class VizControlPanel extends React.Component {
  state = Object.assign({}, defaultState);

  searchInputRef = React.createRef();

  componentDidMount = () => {
    if (!this.props.user) {
      this.props.guestPlotLimitNotificationSetIsVisible(true);
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    const spatialExtentChange = spatialStateHasChanged(prevState, this.state);
    const temporalRangeChange = temporalRangeHasChanged(prevState, this.state);
    const vizTypeChange =
      prevState.selectedVizType !== this.state.selectedVizType;
    if (spatialExtentChange) {
      updateGlobeWithPolygon(this.props.mapContainerRef, this.state);
    }

    if (spatialExtentChange || temporalRangeChange || vizTypeChange) {
      this.handleCheckQuerySize();
    }

    // Reset state if the variable target has changed, and is null
    // NOTE because of the lifecycle of this component, there are several
    // renders between changing the target and getting the data in props
    // This will lead to many data processing bugs if not handled here
    if (targetVariableIsNowNull(prevProps, this.props)) {
      // keep spatial params if param lock is on
      this.setState({
        ...this.state,
        ...defaultBaseState,
        ...(this.props.paramLock ? {} : defaultParamState),
      });
      return;
    }

    if (newDataTargetDetails(prevProps, this.props)) {
      reorientGlobe(this.props.globeUIRef, this.props);

      if (isSatelliteOrModel(this.props)) {
        this.props.snackbarOpen(
          'Default parameters for satellite and model data will ' +
            'exceed the maximum visualizable size. Please ' +
            'reduce the time range or region size.',
        );
      }

      const { surfaceOnly, irregularSpatialResolution } = getTargetFeatures(
        this.props,
      );

      // derived params are lat, lon ranges
      const derivedParams = generateVariableSampleRangeParams(
        this.props.vizPageDataTargetDetails,
      );
      // if paramLock is active, do not update params
      const emptyParams = {};
      const params = this.props.paramLock ? emptyParams : derivedParams;

      this.setState({
        ...this.state,
        surfaceOnly,
        irregularSpatialResolution,
        ...params,
        selectedVizType: '', // reset viz type if new target
      });
    }
  };

  componentWillUnmount = () => {
    // dispatching null here goes to saga, and then to redux via a "set" action
    // which just sets "vizPageDataTargetDetails" to null
    // TODO: cancel any requests in-flight and directly set redux
    this.props.vizPageDataTargetSetAndFetchDetails(null);
    // remove all region layers
    this.props.mapContainerRef.current &&
      this.props.mapContainerRef.current.regionLayer &&
      this.props.mapContainerRef.current.regionLayer.removeAll();
  };

  /* updateDomainFromGraphicExtent
     take the drawn region from the globe
     and set state with its lat/lon range
     NOTE: this state update will trigger reorienting globe
   */
  updateDomainFromGraphicExtent = (extent) => {
    let _lon1 = extent.xmin;

    while (_lon1 < -180) _lon1 += 360;
    while (_lon1 > 180) _lon1 -= 360;

    let _lon2 = extent.xmax;

    while (_lon2 < -180) _lon2 += 360;
    while (_lon2 > 180) _lon2 -= 360;

    const newCoordinates = {
      lat1: parseFloat(extent.ymin.toFixed(3)),
      lat2: parseFloat(extent.ymax.toFixed(3)),
      lon1: parseFloat(_lon1.toFixed(3)),
      lon2: parseFloat(_lon2.toFixed(3)),
    };

    this.setState({
      ...this.state,
      ...newCoordinates,
    });
  };

  handleShowChartsClick = () => {
    if (this.props.plotsActiveTab === 0) {
      this.props.plotsActiveTabSet(1);
    } else {
      this.props.plotsActiveTabSet(0);
    }
  };

  handleCheckQuerySize = () => {
    const payload = prepareQueryPayload(this.state, this.props);
    if (!this.state.selectedVizType) {
      console.log('no selectedVizType, no dispatch');
      return;
    }
    console.log('dispatch check viz query size');
    payload.vizType = this.state.selectedVizType;
    this.props.checkVizQuerySize(payload);
  };

  // "create vizualization" button is clicked
  handleVisualize = () => {
    const { depth1, depth2, lat1, lat2, lon1, lon2, selectedVizType } =
      this.state;

    const isSparseVariable =
      this.props.vizPageDataTargetDetails.Spatial_Resolution ===
      spatialResolutions.irregular;

    const mapping = mapVizType(selectedVizType);
    const dateParams = manageDateParams(this.state, this.props);
    const parameters = cleanSPParams({
      depth1,
      depth2,
      ...dateParams,
      lat1,
      lat2,
      lon1,
      lon2,
      fields: this.props.vizPageDataTargetDetails.Variable,
      tableName: this.props.vizPageDataTargetDetails.Table_Name,
      spName: mapping.sp,
    });

    let payload = {
      parameters,
      subType: mapping.subType,
      metadata: this.props.vizPageDataTargetDetails,
    };

    // these actions are picked up by saga, and if the query is successful
    // a new chart is pushed onto "charts" in global state, and
    // saga will trigger showing the chart via visualizationActions.triggerShowCharts
    if (isSparseVariable && mapping.sp !== storedProcedures.depthProfile) {
      this.props.sparseDataQuerySend(payload);
    } else {
      this.props.storedProcedureRequestSend(payload);
    }
  };

  handleDrawClick = () => {
    const { esriModules, regionLayer } = this.props.globeUIRef.current.props;
    var { sketchModel } = this.props.globeUIRef.current;

    if (!this.state.addedGlobeUIListeners) {
      const throttledUpdate = throttle(75, (event) => {
        if (event.state === 'active') {
          this.updateDomainFromGraphicExtent(
            esriModules.Utils.webMercatorToGeographic(
              event.graphic.geometry.extent,
            ),
          );
        }
      });

      sketchModel.on('create', (event) => {
        if (
          event.state === 'active' &&
          event.toolEventInfo &&
          event.toolEventInfo.type === 'vertex-add'
        ) {
          sketchModel.complete();
        }

        if (event.graphic && event.graphic.visible) {
          event.graphic.visible = false;
        }

        if (event.state === 'cancel') {
          sketchModel.cancel();
          this.setState({ ...this.state, showDrawHelp: false });
        }

        if (event.state === 'start') {
          regionLayer.removeAll();
        }

        if (event.state === 'complete') {
          this.setState({ ...this.state, showDrawHelp: false });
          this.updateDomainFromGraphicExtent(
            esriModules.Utils.webMercatorToGeographic(
              event.graphic.geometry.extent,
            ),
          );
        }
      });

      sketchModel.on('create', throttledUpdate);

      sketchModel.on('update', (event) => {
        if (event.toolEventInfo && event.toolEventInfo.type === 'move-stop') {
          if (event.state === 'cancel') return;
          this.updateDomainFromGraphicExtent(event.graphics[0].geometry.extent);
        }
      });
    }

    this.setState({
      ...this.state,
      showDrawHelp: true,
      addedGlobeUIListeners: true,
    });

    if (this.state.showDrawHelp) sketchModel.cancel();
    else {
      sketchModel.create('polyline', {
        mode: 'click',
      });
    }
  };

  handleSelectDataTarget = (target) => {
    this.props.setDataSearchMenuVisibility(false);
    this.props.vizPageDataTargetSetAndFetchDetails(target);
  };

  handleCloseDataSearch = () => {
    if (this.props.dataSearchMenuOpen) {
      this.props.setDataSearchMenuVisibility(false);
    }
  };

  handleSetVariableDetailsID = (variableDetailsID) => {
    this.setState({ ...this.state, variableDetailsID });
  };

  /* for numeric fields, parse the value from the event object as a float
   * before updating state;
   * for date fields, combine date+time
   */
  handleChangeInputValue = (e) => {
    handleChangeFormInput.call(this, e);
  };

  handleToggleCharts = () => {};

  validate = () => {
    return handleValidation.call(this);
  };

  render = () => {
    const {
      classes,
      dataTarget,
      vizPageDataTargetDetails,
      charts,
      plotsActiveTab,
      showControlPanel,
      dataSearchMenuOpen,
      setControlPanelVisibility,
      setDataSearchMenuVisibility,
    } = this.props;

    const {
      variableDetailsID,
      depth1,
      depth2,
      dt1,
      dt2,
      lat1,
      lat2,
      lon1,
      lon2,
      selectedVizType,
    } = this.state;

    const {
      disableVisualizeMessage,
      visualizeButtonTooltip,
      validationComplete,
      validations,
    } = this.validate();

    const {
      startDepthMessage,
      endDepthMessage,
      startLatMessage,
      endLatMessage,
      startLonMessage,
      endLonMessage,
      heatmapMessage,
      contourMessage,
      sectionMapMessage,
      histogramMessage,
      timeSeriesMessage,
      depthProfileMessage,
      sparseMapMessage,
      generalWarnMessage,
      generalPreventMessage,
      startDateMessage,
      endDateMessage,
      startTimeMessage,
      endTimeMessage,
      startDateTimeMessage,
      endDateTimeMessage,
    } = validations;

    const details = vizPageDataTargetDetails;

    const alerts = [];

    if (this.props.paramLock && this.props.variableResolutionMismatch) {
      alerts.push(
        <Warning>
          <span>
            {`The selected varible belongs to a different dataset than the previous variable. The resulting visualization may have a different spatial or temporal resolution and thus incorporate more or fewer snapshots of data.`}
          </span>
        </Warning>,
      );
    }
    if (this.props.paramLock && this.props.dateTypeMismatch) {
      alerts.push(
        <Warning>
          <span>
            {`There is a mismatch between the locked date range type and the current variable's temporal resolution. Unlock the parameters controls to change the time range.`}
          </span>
        </Warning>,
      );
    }

    return (
      <React.Fragment>
        <VariableDetailsDialog
          variableDetailsID={variableDetailsID}
          handleSetVariableDetailsID={this.handleSetVariableDetailsID}
        />
        <SparseDataMaxSizeNotification />

        {this.state.showDrawHelp ? (
          <Typography className={classes.drawHelpText}>
            Click on the globe to start drawing, and again to finish.
          </Typography>
        ) : (
          ''
        )}

        {showControlPanel ? (
          <Tooltip title="Hide control panel" placement="right">
            <IconButton
              className={classes.closePanelChevron}
              aria-label="toggle-panel"
              color="primary"
              onClick={() => {
                setControlPanelVisibility(false);
              }}
            >
              <ChevronLeft />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Show control panel" placement="right">
            <IconButton
              className={classes.openPanelChevron}
              aria-label="toggle-panel"
              color="primary"
              onClick={() => {
                setControlPanelVisibility(true);
              }}
            >
              <ChevronRight style={{ fontSize: 32 }} />
            </IconButton>
          </Tooltip>
        )}

        <Drawer
          className={classes.drawer}
          variant="persistent"
          open={showControlPanel}
          classes={{
            paper: `${classes.drawerPaper}`,
          }}
          anchor="left"
        >
          {alerts.length > 0 && (
            <div className={classes.alertBoxHandle}>
              <IconButton
                onClick={() => {
                  this.props.setLockAlertsOpen(!this.props.lockAlertsOpen);
                }}
              >
                <LuAlertTriangle />
              </IconButton>
            </div>
          )}

          {alerts.length > 0 && (
            <div className={classes.alertBox}>
              {this.props.lockAlertsOpen && (
                <div className={classes.alertList}>{alerts}</div>
              )}

              {this.props.lockAlertsOpen && (
                <span>
                  <IconButton
                    onClick={() => {
                      this.props.setLockAlertsOpen(!this.props.lockAlertsOpen);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </span>
              )}
            </div>
          )}

          {/* Begin Variable Search Button */}
          {dataTarget ? (
            <Grid container style={{ borderBottom: '1px solid black' }}>
              <Grid item xs={10}>
                <Button
                  id={'viz-select-primary-variable'}
                  fullWidth={true}
                  className={classes.controlPanelItem}
                  startIcon={
                    <Search
                      style={{ fontSize: '22px', margin: '0 0 -6px 4px' }}
                    />
                  }
                  onClick={() => {
                    setDataSearchMenuVisibility(true);
                  }}
                  classes={{
                    label: classes.controlPanelItemLabel,
                    startIcon: classes.controlPanelItemStartIcon,
                  }}
                  disabled={
                    this.state.showDrawHelp || !vizPageDataTargetDetails
                  }
                >
                  <span
                    style={{
                      color: this.state.showDrawHelp
                        ? 'rgba(0, 0, 0, 0.38)'
                        : 'white',
                    }}
                  >
                    {dataTarget.Long_Name}
                  </span>
                </Button>
              </Grid>

              <Grid item xs={2} style={{ borderLeft: '1px solid black' }}>
                <Tooltip title="Show variable details" placement="top">
                  <span>
                    <IconButton
                      onClick={(e) => {
                        this.handleSetVariableDetailsID(dataTarget.ID);
                        e.stopPropagation();
                      }}
                      disabled={
                        this.state.showDrawHelp || !vizPageDataTargetDetails
                      }
                    >
                      <Info style={{ fontSize: '26px', marginTop: '3px' }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          ) : (
            <Hint
              content={SearchHint}
              position={{ beacon: 'right', hint: 'bottom-end' }}
              size={'medium'}
            >
              <Button
                id={'viz-select-primary-variable'}
                fullWidth={true}
                className={`${classes.controlPanelItem} ${classes.varSearchButton}`}
                style={{ borderBottom: '1px solid black' }}
                startIcon={
                  <Search
                    style={{ fontSize: '22px', margin: '0 0 -6px 4px' }}
                  />
                }
                onClick={() => {
                  setDataSearchMenuVisibility(true);
                  let searchEl = document.querySelector(
                    'input#charts-and-plots-search-field',
                  );
                  if (searchEl) {
                    // console.log('setting focus');
                    searchEl.focus();
                  } else {
                    console.log("couldn't find element");
                  }
                }}
                classes={{
                  label: classes.controlPanelItemLabel,
                  startIcon: classes.controlPanelItemStartIcon,
                }}
                disabled={this.state.showDrawHelp}
              >
                Select a Variable to Begin
              </Button>
            </Hint>
          )}
          {/* End Variable Search Button */}

          <>
            <Grid container>
              {/* Start Date Field, Varying on Monthly vs Daily  */}

              {details &&
              details.Temporal_Resolution ===
                temporalResolutions.monthlyClimatology ? (
                <>
                  {/* Monthly Date Picker  */}
                  <Grid item xs={6} className={classes.formGridItem}>
                    <TextField
                      name="dt1"
                      className={classes.textField}
                      id="dt1"
                      label="Start Month"
                      type="number"
                      min={1}
                      max={12}
                      step={1}
                      value={ensureMonthlyValue(dt1)}
                      error={Boolean(startDateMessage)}
                      FormHelperTextProps={{ className: classes.helperText }}
                      helperText={startDateMessage}
                      InputProps={{
                        className: classes.dateTimeInput,
                        inputProps: {
                          min: 1,
                          max: 12,
                        },
                      }}
                      InputLabelProps={{
                        shrink: true,
                        className: classes.padLeft,
                      }}
                      onChange={this.handleChangeInputValue}
                      disabled={
                        this.props.paramLock ||
                        this.state.showDrawHelp ||
                        !vizPageDataTargetDetails
                      }
                    />
                  </Grid>

                  <Grid item xs={6} className={classes.formGridItem}>
                    <TextField
                      name="dt2"
                      className={classes.textField}
                      id="dt2"
                      label="End Month"
                      type="number"
                      min={1}
                      max={12}
                      step={1}
                      value={ensureMonthlyValue(dt2)}
                      error={Boolean(endDateMessage)}
                      FormHelperTextProps={{ className: classes.helperText }}
                      helperText={endDateMessage}
                      InputProps={{
                        className: classes.dateTimeInput,
                        inputProps: {
                          min: 1,
                          max: 12,
                        },
                      }}
                      InputLabelProps={{
                        shrink: true,
                        className: classes.padLeft,
                      }}
                      onChange={this.handleChangeInputValue}
                      disabled={
                        this.props.paramLock ||
                        this.state.showDrawHelp ||
                        !vizPageDataTargetDetails
                      }
                    />
                  </Grid>
                </>
              ) : (
                <>
                  {/* Daily Date Picker */}

                  <Grid item xs={6} className={classes.formGridItem}>
                    <div className={classes.datePicker}>
                      <label>Start Date</label>
                      <DatePicker
                        disabled={!details || this.props.paramLock}
                        value={shiftMinMaxDate(dt1, details, 'min')}
                        onChange={(date) =>
                          this.handleChangeInputValue({
                            target: {
                              name: 'date1',
                              value: date,
                            },
                          })
                        }
                        clearIcon={null}
                        shouldOpenCalendar={({ reason }) =>
                          'buttonClick' === reason
                        }
                      />
                      {startDateMessage ? <span>{startDateMessage}</span> : ''}
                    </div>
                  </Grid>

                  <Grid item xs={6} className={classes.formGridItem}>
                    <div className={classes.datePicker}>
                      <label>Start Date</label>
                      <DatePicker
                        disabled={!details || this.props.paramLock}
                        value={shiftMinMaxDate(dt2, details, 'max')}
                        onChange={(date) =>
                          this.handleChangeInputValue({
                            target: {
                              name: 'date2',
                              value: date,
                            },
                          })
                        }
                        clearIcon={null}
                        shouldOpenCalendar={({ reason }) => {
                          console.log(reason);
                          return 'buttonClick' === reason;
                        }}
                      />
                      {endDateMessage ? <span>{endDateMessage}</span> : ''}
                    </div>
                  </Grid>

                  <Grid item xs={6} className={classes.formGridItem}>
                    <TextField
                      name="hour1"
                      id="hour1"
                      label="Start Time"
                      className={classes.textField}
                      type="time"
                      value={ensureTimeValue(dt1)}
                      onChange={this.handleChangeInputValue}
                      error={
                        Boolean(startTimeMessage) ||
                        Boolean(startDateTimeMessage)
                      }
                      helperText={startTimeMessage || startDateTimeMessage}
                      disabled={
                        this.props.paramLock ||
                        this.state.showDrawHelp ||
                        !vizPageDataTargetDetails
                      }
                      InputLabelProps={{
                        className: classes.padLeft,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} className={classes.formGridItem}>
                    <TextField
                      name="hour2"
                      id="hour2"
                      label="End Time"
                      className={classes.textField}
                      type="time"
                      value={ensureTimeValue(dt2)}
                      onChange={this.handleChangeInputValue}
                      error={
                        Boolean(endTimeMessage) || Boolean(endDateTimeMessage)
                      }
                      helperText={endTimeMessage || endDateTimeMessage}
                      disabled={
                        this.props.paramLock ||
                        this.state.showDrawHelp ||
                        !vizPageDataTargetDetails
                      }
                      InputLabelProps={{
                        className: classes.padLeft,
                      }}
                    />
                  </Grid>
                </>
              )}

              {/* End Date Field */}

              <Grid item xs={6} className={classes.formGridItem}>
                <TextField
                  type="number"
                  id="lat1-input"
                  label={'Start Lat(\xB0)'}
                  className={classes.textField}
                  value={lat1}
                  error={Boolean(startLatMessage)}
                  FormHelperTextProps={{ className: classes.helperText }}
                  helperText={startLatMessage}
                  InputProps={{
                    className: classes.padLeft,
                    inputProps: details
                      ? {
                          min: details.Lat_Min,
                          max: details.Lat_Max,
                          step: 0.001,
                        }
                      : {},
                  }}
                  InputLabelProps={{ className: classes.padLeft }}
                  name="lat1"
                  onChange={this.handleChangeInputValue}
                  disabled={
                    this.props.paramLock ||
                    this.state.showDrawHelp ||
                    !vizPageDataTargetDetails
                  }
                ></TextField>
              </Grid>

              <Grid item xs={6} className={classes.formGridItem}>
                <TextField
                  type="number"
                  id="lat2-input"
                  error={Boolean(endLatMessage)}
                  label={'End Lat(\xB0)'}
                  className={classes.textField}
                  value={lat2}
                  FormHelperTextProps={{ className: classes.helperText }}
                  helperText={endLatMessage}
                  name="lat2"
                  InputProps={{
                    className: classes.padLeft,
                    inputProps: details
                      ? {
                          min: details.Lat_Min,
                          max: details.Lat_Max,
                          step: 0.001,
                        }
                      : {},
                  }}
                  InputLabelProps={{ className: classes.padLeft }}
                  onChange={this.handleChangeInputValue}
                  disabled={
                    this.props.paramLock ||
                    this.state.showDrawHelp ||
                    !vizPageDataTargetDetails
                  }
                ></TextField>
              </Grid>

              <Grid item xs={6} className={classes.formGridItem}>
                <TextField
                  type="number"
                  id="lon1-input"
                  error={Boolean(startLonMessage)}
                  label={'Start Lon(\xB0)'}
                  className={classes.textField}
                  value={lon1}
                  FormHelperTextProps={{ className: classes.helperText }}
                  helperText={startLonMessage}
                  name="lon1"
                  InputProps={{
                    className: classes.padLeft,
                    inputProps: details
                      ? {
                          min: details.Lon_Min,
                          max: details.Lon_Max,
                          step: 0.001,
                        }
                      : {},
                  }}
                  InputLabelProps={{ className: classes.padLeft }}
                  onChange={this.handleChangeInputValue}
                  disabled={
                    this.props.paramLock ||
                    this.state.showDrawHelp ||
                    !vizPageDataTargetDetails
                  }
                ></TextField>
              </Grid>

              <Grid item xs={6} className={classes.formGridItem}>
                <TextField
                  type="number"
                  id="lon2-input"
                  error={Boolean(endLonMessage)}
                  label={'End Lon(\xB0)'}
                  className={classes.textField}
                  value={lon2}
                  FormHelperTextProps={{ className: classes.helperText }}
                  helperText={endLonMessage}
                  name="lon2"
                  InputProps={{
                    className: classes.padLeft,
                    inputProps: details
                      ? {
                          min: details.Lon_Min,
                          max: details.Lon_Max,
                          step: 0.001,
                        }
                      : {},
                  }}
                  InputLabelProps={{ className: classes.padLeft }}
                  onChange={this.handleChangeInputValue}
                  disabled={
                    this.props.paramLock ||
                    this.state.showDrawHelp ||
                    !vizPageDataTargetDetails
                  }
                ></TextField>
                {/* draw on globe*/}
              </Grid>

              <Grid item xs={6} className={classes.formGridItem}>
                <TextField
                  type="number"
                  id="depth1-input"
                  error={Boolean(startDepthMessage)}
                  label="Start Depth(m)"
                  className={classes.textField}
                  value={depth1}
                  FormHelperTextProps={{ className: classes.helperText }}
                  helperText={startDepthMessage}
                  name="depth1"
                  InputProps={{
                    className: classes.padLeft,
                    inputProps: details
                      ? {
                          min: details.Depth_Max ? details.Depth_Min : 0,
                          max: details.Depth_Max ? details.Depth_Max : 0,
                          step: 0.1,
                        }
                      : {},
                  }}
                  InputLabelProps={{ className: classes.padLeft }}
                  onChange={this.handleChangeInputValue}
                  disabled={this.props.paramLock || !vizPageDataTargetDetails}
                ></TextField>
              </Grid>

              <Grid item xs={6} className={classes.formGridItem}>
                <TextField
                  type="number"
                  id="depth2-input"
                  error={Boolean(endDepthMessage)}
                  label="End Depth(m)"
                  className={classes.textField}
                  value={depth2}
                  FormHelperTextProps={{ className: classes.helperText }}
                  helperText={endDepthMessage}
                  name="depth2"
                  InputProps={{
                    className: classes.padLeft,
                    inputProps: details
                      ? {
                          min: details.Depth_Max ? details.Depth_Min : 0,
                          max: details.Depth_Max ? details.Depth_Max : 0,
                          step: 0.1,
                        }
                      : {},
                  }}
                  InputLabelProps={{ className: classes.padLeft }}
                  onChange={this.handleChangeInputValue}
                  disabled={this.props.paramLock || !vizPageDataTargetDetails}
                ></TextField>
              </Grid>

              <ChartControl
                overrideDisabledStyle={overrideDisabledStyle}
                heatmapMessage={heatmapMessage}
                contourMessage={contourMessage}
                sectionMapMessage={sectionMapMessage}
                histogramMessage={histogramMessage}
                timeSeriesMessage={timeSeriesMessage}
                depthProfileMessage={depthProfileMessage}
                sparseMapMessage={sparseMapMessage}
                visualizeButtonTooltip={visualizeButtonTooltip}
                disableVisualizeMessage={disableVisualizeMessage}
                selectedVizType={selectedVizType}
                handleChangeInputValue={this.handleChangeInputValue}
                showChartControl={this.state.showChartControl}
                variableDetails={this.props.vizPageDataTargetDetails}
                handleVisualize={this.handleVisualize} // this seems to be used instead of onVisualize
                disabled={this.state.showDrawHelp || !vizPageDataTargetDetails}
              />

              {showControlPanel ? (
                <Paper className={classes.popoutButtonPaper}>
                  {' '}
                  {/* show globe button */}
                  <Tooltip
                    placement="right"
                    title={
                      this.props.paramLock
                        ? 'Unlock Space & Time Range'
                        : 'Lock Space & Time Range'
                    }
                  >
                    <span>
                      <IconButton
                        className={classes.lockButtonBase}
                        onClick={() =>
                          this.props.setParamLock(!this.props.paramLock)
                        }
                        disabled={!details}
                      >
                        {this.props.paramLock ? <ImLock /> : <ImUnlocked />}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={
                      plotsActiveTab !== 0 ? 'Return to Globe' : 'Show Charts'
                    }
                  >
                    <IconButton
                      disabled={charts.length === 0}
                      className={classes.popoutButtonBase}
                      onClick={this.handleShowChartsClick}
                    >
                      {plotsActiveTab !== 0 ? (
                        <Language className={classes.popoutButtonIcon} />
                      ) : (
                        <Badge badgeContent={charts.length} color="primary">
                          {' '}
                          {/* display chart count*/}
                          <ShowChart className={classes.popoutButtonIcon} />
                        </Badge>
                      )}
                    </IconButton>
                  </Tooltip>
                  <Hint
                    content={RestrictDataHint}
                    position={{ beacon: 'right', hint: 'bottom-end' }}
                    size={'medium'}
                  >
                    <Tooltip
                      placement="right"
                      title={'Draw Spatial Range on Globe'}
                    >
                      <span>
                        <IconButton
                          className={classes.popoutButtonBase}
                          onClick={this.handleDrawClick}
                          disabled={
                            !details ||
                            plotsActiveTab !== 0 ||
                            this.props.paramLock
                          }
                        >
                          <Edit className={classes.popoutButtonIcon} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Hint>
                </Paper>
              ) : (
                ''
              )}
            </Grid>
          </>
        </Drawer>
        <Paper
          className={classes.dataSearchMenuPaper}
          style={dataSearchMenuOpen ? {} : { display: 'none' }}
        >
          <VariableSelector
            handleSelectDataTarget={this.handleSelectDataTarget}
            handleSetVariableDetailsID={this.handleSetVariableDetailsID}
            handleCloseDataSearch={this.handleCloseDataSearch}
            searchInputRef={this.searchInputRef}
          />
        </Paper>
      </React.Fragment>
    );
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(vizControlStyles)(VizControlPanel));
