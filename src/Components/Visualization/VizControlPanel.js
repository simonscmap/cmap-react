// Monolith component for charts/plots control

import React from 'react';
import Cookies from 'js-cookie';
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
import { ImLock } from "react-icons/im";
import { ImUnlocked } from "react-icons/im";
import { LuAlertTriangle } from "react-icons/lu";
import CloseIcon from '@material-ui/icons/Close';

import ChartControl from './Charts/ChartControl';
import VariableSelector from './VariableSelector/VariableSelector';
import { RestrictDataHint, SearchHint } from './help';
import getTargetFeatures from './ControlPanel/getTargetFeatures';
import manageDateParams from './ControlPanel/manageDateParams';
import transformDateStringToMonth from './ControlPanel/transformDateStringToMonth';
import prepareQueryPayload from './ControlPanel/prepareQueryPayload';

import {
  aggregateChartDataSize,
  cleanSPParams,
  generateVariableSampleRangeParams,
  mapVizType,
} from './helpers';

import SparseDataMaxSizeNotification from './SparseDataMaxSizeNotification';
import VariableDetailsDialog from './VariableDetailsDialog';
import vizControlStyles from './vizControlStyles';
import getDataSize from './ControlPanel/estimateDataSize';
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
import colors from '../../enums/colors';
import states from '../../enums/asyncRequestStates';
import spatialResolutions from '../../enums/spatialResolutions';
import storedProcedures from '../../enums/storedProcedures';
import temporalResolutions from '../../enums/temporalResolutions';
import validation from '../../enums/validation';
import vizSubTypes from '../../enums/visualizationSubTypes';

// util
import countWebGLContexts from '../../Utility/countWebGLContexts';
import depthUtils from '../../Utility/depthCounter';
import isISODateString from '../../Utility/Time/isISO';

// common
import { Warning } from '../../Components/Common/Alert';

import initLogger from '../../Services/log-service';

const log = initLogger ('VizControlPanel');

const dateStringToISO = (dateString) => (new Date(dateString)).toISOString();

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
  variableResolutionMismatch: state.viz.chart.controls.variableResolutionMismatch,
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
}
const defaultState = {
  ...defaultParamState,
  ...defaultBaseState,
};



// detect if spatial state has changed
const spatialStateHasChanged = (prevState, currState) => {
  return (prevState.lat1 !== currState.lat1 ||
          prevState.lat2 !== currState.lat2 ||
          prevState.lon1 !== currState.lon1 ||
          prevState.lon2 !== currState.lon2 ||
          prevState.depth1 !== currState.depth1 ||
          prevState.depth2 !== currState.depth2);
}

const temporalRangeHasChanged = (prevState, currState) => {
  return prevState.dt1 !== currState.dt1
    || prevState.dt2 !== currState.dt2;
}

// Helper to handle re-drawing polygons on the globe
// when the region selection has changed
const updateGlobeWithPolygon = (mapRef, currState) => {
  if (!mapRef || !mapRef.current) {
    console.log (`<trace> could not update globe, no ref`);
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
}

const targetVariableIsNowNull = (prevProps, currProps) => {
  return currProps.vizPageDataTargetDetails === null
    && prevProps.vizPageDataTargetDetails !== null;
}

const newDataTargetDetails = (prevProps, currProps) => {
  // will help determine whether to reorient the globe to new region
  return currProps.vizPageDataTargetDetails !== prevProps.vizPageDataTargetDetails
}

const isSatelliteOrModel = (currProps) => {
  const { irregularSpatialResolution, monthlyClimatology } = getTargetFeatures (currProps);
  const isNotIrregularSpatialResolution = !irregularSpatialResolution;
  const isNotMonthlyClimatology = !monthlyClimatology;

  return isNotIrregularSpatialResolution
    && isNotMonthlyClimatology;
}

const reorientGlobe = (globeUIRef, currProps) => {
  if (!globeUIRef || !globeUIRef.current) {
    return;
  }
  const data = currProps.vizPageDataTargetDetails;
  const { irregularSpatialResolution } = getTargetFeatures (currProps);
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
}



// help the monthly input fields display a meaningful value if the date range
// is locked with date-time values
const ensureMonthlyValue = (dateString) => {
  if (dateString === undefined) {
    return 1; // default to January
  } else if (typeof dateString !== 'string') {
    return dateString; // most likely a number
  } else if (dateString.length > 2) {
    return transformDateStringToMonth (dateString);
  } else {
    return dateString;
  }
}

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
    return dateString.slice(11,16);
  }
}

const getTimeFromDateStringOrDefault = (dateString) => {
  if (typeof dateString !== 'string' || dateString.length !== 16) {
    return '00:00';
  } else {
    return dateString.slice(11,16);
  }
}

const getDateFromDateStringOrDefault = (dateString) => {
  if (typeof dateString !== 'string' || dateString.length < 10) {
    return '1900-01-01';
  } else {
    return dateString.slice(0,10);
  }
}



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
    const spatialExtentChange = spatialStateHasChanged (prevState, this.state);
    const temporalRangeChange = temporalRangeHasChanged (prevState, this.state);
    const vizTypeChange = prevState.selectedVizType !== this.state.selectedVizType;
    if (spatialExtentChange) {
      updateGlobeWithPolygon (this.props.mapContainerRef, this.state);
    }

    if (spatialExtentChange || temporalRangeChange || vizTypeChange) {
      this.handleCheckQuerySize();
    }

    // Reset state if the variable target has changed, and is null
    // NOTE because of the lifecycle of this component, there are several
    // renders between changing the target and getting the data in props
    // This will lead to many data processing bugs if not handled here
    if (targetVariableIsNowNull (prevProps, this.props)) {
      // keep spatial params if param lock is on
      this.setState({
        ...this.state,
        ...defaultBaseState,
        ...(this.props.paramLock ? {} : defaultParamState),
      });
      return;
    }

    if (newDataTargetDetails (prevProps, this.props)) {
      reorientGlobe (this.props.globeUIRef, this.props);

      if (isSatelliteOrModel (this.props)) {
        this.props.snackbarOpen(
          'Default parameters for satellite and model data will ' +
            'exceed the maximum visualizable size. Please ' +
            'reduce the time range or region size.',
        );
      }

      const { surfaceOnly, irregularSpatialResolution } = getTargetFeatures (this.props);
      // derived params are lat, lon ranges
      const derivedParams = generateVariableSampleRangeParams(this.props.vizPageDataTargetDetails);
      // if paramLock is active, do not update params
      const emptyParams = {
      };
      const params = this.props.paramLock ? emptyParams : derivedParams;

      console.log ('update params', params, derivedParams);


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
    const payload = prepareQueryPayload (this.state, this.props);
    if (!this.state.selectedVizType) {
      console.log ('no selectedVizType, no dispatch')
      return;
    }
    console.log ('dispatch check viz query size')
    payload.vizType = this.state.selectedVizType;
    this.props.checkVizQuerySize (payload);
  }

  // "create vizualization" button is clicked
  handleVisualize = () => {
    const {
      depth1,
      depth2,
      lat1,
      lat2,
      lon1,
      lon2,
      selectedVizType,
    } = this.state;

    const isSparseVariable =
      this.props.vizPageDataTargetDetails.Spatial_Resolution ===
      spatialResolutions.irregular;

    const mapping = mapVizType(selectedVizType);
    const dateParams = manageDateParams (this.state, this.props);
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
    const targetDetails = this.props.vizPageDataTargetDetails;
    const isMonthly =
      targetDetails.Temporal_Resolution ===
      temporalResolutions.monthlyClimatology;


    console.log ('param change', { value: e.target.value, name: e.target.name, isMonthly }, this.state, this.props);

    const parseThese = ['lat1', 'lat2', 'lon1', 'lon2', 'depth1', 'depth2'];
    const parsed = parseFloat(e.target.value);
    // name and value will may be updated
    let name = e.target.name;
    let value = e.target.value;

    if (parseThese.includes(e.target.name)) {
      if (isNaN(parsed)) {
        value = e.target.value;
      } else {
        value = parsed;
      }
    } else {
      value = e.target.value;
    }

    if (['date1', 'hour1', 'date2', 'hour2'].includes(e.target.name)) {
      // in some cases, for example after the param lock has been disabled,
      // the state dt1 is not set, and we need to supplement with the target passed
      // in via props
      let dt1, dt2;
      if (this.state.dt1) {
        dt1 = this.state.dt1;
      } else if (targetDetails.Time_Min) {
        dt1 = (new Date(targetDetails.Time_Min)).toISOString();
      }

      if (this.state.dt2) {
        dt2 = this.state.dt2;
      } else if (targetDetails.Time_Max) {
        dt2 = (new Date(targetDetails.Time_Max)).toISOString();
      }



      if (typeof dt1 !== 'string' || typeof dt2 !== 'string') {
        console.error ('incorrect types for dt1 and dt1, could not update state', dt1, dt2);
        // return;
      }

      let isoTail = ':00.000Z';

      if (value === '' && (name === 'date1' || name === 'date2')) {
        console.log('date was zeroed out');
        value = '0000-00-00'
      }

      if (value === '' && (name === 'hour1' || name === 'hour2')) {
       value = '00:00';
      }

      if (value.length > 10 && (name === 'date1' || name === 'date2')) {
        console.log('date was provided too many characters');
        value = '0000-00-00';
      }

      // if prev dt1 is from locked monthly dataset, it will not be a date string
      switch (e.target.name) {
        case 'date1':
          name = 'dt1';
          value = value + 'T' + getTimeFromDateStringOrDefault (dt1) + isoTail;
          break;
        case 'hour1':
          name = 'dt1';
          value = getDateFromDateStringOrDefault (dt1) + 'T' + (value ? value : '00:00') + isoTail;
          break;
        case 'date2':
          name = 'dt2';
          value = value + 'T' + getTimeFromDateStringOrDefault (dt2) + isoTail;
          break;
        case 'hour2':
          name = 'dt2';
          value = getDateFromDateStringOrDefault (dt2) + 'T' + (value ? value : '00:00')+ isoTail;
          break;
      }
    }

    this.setState({
      ...this.state,
      [name]: value,
    });
  };

  handleToggleCharts = () => {};

  estimateDataSize = () => {
    const { vizPageDataTargetDetails } = this.props;
    return getDataSize(vizPageDataTargetDetails, this.state);
  };

  // ~~~~~~~~~~ the following methods are all validation checks ~~~~~~~~~~~~~~~~~ //
  // TODO: extract and simplify these
  checkStartDepth = () => {
    const targetDetails = this.props.vizPageDataTargetDetails;
    const { Has_Depth, Depth_Max } = targetDetails;
    if (this.state.depth1 < 0) {
      return 'Depth cannot be negative';
    }
    if (this.state.depth1 !== 0 && !Has_Depth) {
      return 'This variable has no depth parameter, set depth to zero';
    }
    if (this.state.depth1 > this.state.depth2) {
      return 'Start cannot be greater than end';
    }
    if (this.state.depth1 > Depth_Max) {
      return `Maximum depth start is ${Depth_Max}`;
    }

    return '';
  };

  checkEndDepth = () => {
    const targetDetails = this.props.vizPageDataTargetDetails;
    const { Has_Depth, Depth_Min } = targetDetails;
    if (this.state.depth2 < 0) {
      return 'Depth cannot be negative';
    }
    if (this.state.depth2 !== 0 && !Has_Depth) {
      return 'This variable has no depth parameter, set depth to zero';
    }
    if (this.state.depth1 > this.state.depth2) {
      return 'Start cannot be greater than end';
    }
    if (this.state.depth2 < Depth_Min) {
      return `Minimum depth end is ${Depth_Min}`;
    }
    return '';
  };

  checkStartDateTime = () => {
    let isMonthly =
      this.props.vizPageDataTargetDetails.Temporal_Resolution ===
      temporalResolutions.monthlyClimatology;

    if (!isMonthly && !isISODateString (this.state.dt1)) {
      return 'Invalid date/time';
    }
  }
  checkEndDateTime = () => {
    let isMonthly =
      this.props.vizPageDataTargetDetails.Temporal_Resolution ===
      temporalResolutions.monthlyClimatology;

    if (!isMonthly && !isISODateString (this.state.dt2)) {
      return 'Invalid date/time';
    }
  }

  checkStartDate = () => {
    let isMonthly =
      this.props.vizPageDataTargetDetails.Temporal_Resolution ===
      temporalResolutions.monthlyClimatology;

    if (isMonthly) {
      if (parseInt(this.state.dt1) > parseInt(this.state.dt2)) {
        return 'Start cannot be greater than end';
      }
    } else {
      if (!this.state.dt1 ) {
        return 'Invalid date';
      }
      if (new Date(this.state.dt1) > new Date(this.state.dt2)) {
        return 'Start cannot be greater than end';
      }

      if (typeof this.state.dt1 === 'number') {
        // handle case where dt2 is not marked as monthly, but is a number type
        if (this.state.dt1 < 1 || this.state.dt1 > 12) {
          return 'Start date is not within range: 1 - 12';
        }
      } else if (typeof this.state.dt1 === 'string') {
        // Note the double slice looks odd
        // first, slice the time component off in order to get a date value that
        // is only significant to the day
        // then slice the ISO string so that the string comparison will be
        // between strings of the same length
        let isLessThanDatasetTimeMin =
            this.state.dt1.slice(0, 10) <
            dateStringToISO(this.props.vizPageDataTargetDetails.Time_Min.slice(0, 10)).slice(0, 10);

        if (isLessThanDatasetTimeMin) {
          return `Minimum start date is ${
          this.props.vizPageDataTargetDetails.Time_Min.slice(5, 10) +
          '-' +
          this.props.vizPageDataTargetDetails.Time_Min.slice(0, 4)
        }`;
        }
      }
    }

    return '';
  };

  checkEndDate = () => {
    let isMonthly =
      this.props.vizPageDataTargetDetails.Temporal_Resolution ===
      temporalResolutions.monthlyClimatology;

    if (isMonthly) {
      if (parseInt(this.state.dt1) > parseInt(this.state.dt2)) {
        return 'Start cannot be greater than end';
      }
    } else {
      if (!this.state.dt2 || !isISODateString (this.state.dt2)) {
        return 'Invalid date';
      }
      if (new Date(this.state.dt1) > new Date(this.state.dt2)) {
        return 'Start cannot be greater than end';
      }

      if (typeof this.state.dt2 === 'number') {
        // handle case where dt2 is not marked as monthly, but is a number type
        if (this.state.dt2 < 1 || this.state.dt2 > 12) {
          return 'End date is not within range: 1 - 12';
        }
      } else if (typeof this.state.dt2 === 'string') {

        // see note on the double slice call in checkStartDate
        let isGreaterThanDatasetTimeMax =
            this.state.dt2.slice(0,10) >
            dateStringToISO (this.props.vizPageDataTargetDetails.Time_Max.slice(0,10)).slice(0,10);

        if (isGreaterThanDatasetTimeMax) {
          return `Maximum end date is ${
          this.props.vizPageDataTargetDetails.Time_Max.slice(5, 10) +
          '-' +
          this.props.vizPageDataTargetDetails.Time_Max.slice(0, 4)
        }`;
        }
      }
    }
    return '';
  };

  checkEndTime = () => {
    let isMonthly =
      this.props.vizPageDataTargetDetails.Temporal_Resolution ===
      temporalResolutions.monthlyClimatology;

    if (isMonthly || typeof this.state.dt2 !== 'string') {
      // don't check time
      return '';
    }


    let maxEndDate = this.props.vizPageDataTargetDetails.Time_Max.slice(0,10);
    let maxEndTime = this.props.vizPageDataTargetDetails.Time_Max.slice(11,16);

    let endDateTime = this.state.dt2;
    // check if time is greater that time max
    if (endDateTime.slice(0,10) === maxEndDate) {
      if (endDateTime.slice(11,16) > maxEndTime) {
        return `The maximum end time for ${maxEndDate} is ${maxEndTime}`
      }
    }
    return '';
  }

  checkStartTime = () => {
    let isMonthly =
      this.props.vizPageDataTargetDetails.Temporal_Resolution ===
      temporalResolutions.monthlyClimatology;

    if (isMonthly || typeof this.state.dt1 !== 'string') {
      // don't check time
      return '';
    }

    let minStartDate = this.props.vizPageDataTargetDetails.Time_Min.slice(0,10);
    let minStartTime = this.props.vizPageDataTargetDetails.Time_Min.slice(11,16);

    let startTime = this.state.dt1;
    // check if time is greater that time max
    if (startTime.slice(0,10) === minStartDate) {
      if (startTime.slice(11,16) < minStartTime) {
        return `The minimum start time for ${minStartDate} is ${minStartTime}`
      }
    }

    return '';
  }

  checkStartLat = () => {
    if (this.state.lat1 > this.props.vizPageDataTargetDetails.Lat_Max)
      return `Maximum start lat is ${this.props.vizPageDataTargetDetails.Lat_Max}`;
    if (this.state.lat1 > this.state.lat2)
      return `Start cannot be greater than end`;
    return '';
  };

  checkEndLat = () => {
    if (this.state.lat2 < this.props.vizPageDataTargetDetails.Lat_Min)
      return `Minimum end lat is ${this.props.vizPageDataTargetDetails.Lat_Min}`;
    if (this.state.lat1 > this.state.lat2)
      return `Start cannot be greater than end`;
    return '';
  };

  checkStartLon = () => {
    const { lon1, lon2 } = this.state;
    const { Lon_Min, Lon_Max } = this.props.vizPageDataTargetDetails;

    if (lon2 >= lon1) {
      if (lon1 > Lon_Max) return `Maximum start lon is ${Lon_Max}`;
    } else {
      if (
        Lon_Min > lon1 ||
        Lon_Max > lon1 ||
        Lon_Min < lon2 ||
        Lon_Max < lon2
      ) {
      } else return `Longitude outside dataset coverage`;
    }
    return '';
  };

  checkEndLon = () => {
    const { lon1, lon2 } = this.state;
    const { Lon_Min } = this.props.vizPageDataTargetDetails;

    if (lon2 >= lon1) {
      if (lon2 < Lon_Min) return `Minimum end lon is ${Lon_Min}`;
    }

    return '';
  };

  checkHeatmap = () => {
    if (this.state.irregularSpatialResolution)
      return validation.type.dataIsIrregular.replace('$', 'Heatmap');
    return '';
  };

  checkContour = () => {
    if (this.state.irregularSpatialResolution)
      return validation.type.dataIsIrregular.replace('$', 'Contour');
    return '';
  };

  checkSection = () => {
    if (this.state.surfaceOnly)
      return validation.type.surfaceOnlyDataset.replace('$', 'variable');
    if (this.state.irregularSpatialResolution)
      return validation.type.dataIsIrregular.replace('$', 'Section Map');
    return '';
  };

  checkHistogram = () => {
    return '';
  };

  checkTimeSeries = () => {
    if (this.state.irregularSpatialResolution)
      return validation.type.dataIsIrregular.replace('$', 'Time Series');
    return '';
  };

  checkDepthProfile = () => {
    if (this.state.surfaceOnly)
      return validation.type.surfaceOnlyDataset.replace('$', 'variable');
    return '';
  };

  checkSparseMap = () => {
    if (!this.state.irregularSpatialResolution)
      return validation.type.irregularOnly;
    return '';
  };

  checkGeneralWarn = (dataSize) => {
    if (!this.props.selectedVizType) return '';
    if (dataSize > 1200000) return validation.generic.dataSizeWarning;
    return '';
  };

  checkGeneralPrevent = (dataSize) => {
    const webGLCount = countWebGLContexts(this.props.charts);
    const aggregateSize = aggregateChartDataSize(this.props.charts);

    if (!this.props.user) {
      let guestPlotCount = parseInt(Cookies.get('guestPlotCount'));
      if (guestPlotCount && guestPlotCount >= 10)
        return validation.generic.guestMaximumReached;
    }

    if (!this.state.selectedVizType) return validation.generic.vizTypeMissing;
    if (this.state.selectedVizType === vizSubTypes.heatmap && webGLCount > 14)
      return validation.type.webGLContextLimit;
    if (this.state.selectedVizType === vizSubTypes.sparse && webGLCount > 11)
      return validation.type.webGLContextLimit;

    if (this.state.selectedVizType === vizSubTypes.heatmap) {
      let availableContexts = 16 - webGLCount;
      const depthCount =
        depthUtils.count(
          { data: this.props.vizPageDataTargetDetails },
          this.props.depth1,
          this.props.depth2,
        ) || 1;
      if (availableContexts - depthCount < 1)
        return 'Too many distinct depths to render heatmap. Please reduce depth range or select section map.';
    }

    // DATA SIZE CHECKS
    const sizeCheckStatus = this.props.sizeCheckStatus;
    const sizeCheckResult = this.props.sizeCheck;

    if (sizeCheckStatus === states.notTried || sizeCheckStatus === states.inProgress) {
      return 'Waiting for size check to complete.';
    }

    if (sizeCheckStatus === states.failed ) {
      return 'Error estimating visualization size.'
    }

    if (sizeCheckResult === null) {
      return 'No size estimation available.'
    }

    if (sizeCheckStatus === states.succeeded && (sizeCheckResult && !sizeCheckResult.allow)) {
      return `Extent is too large, select a smaller spatial or temporal range.`
    }



    // HISTOGRAM & HEATMAP < 1 500 000
    if (
      this.state.selectedVizType !== vizSubTypes.histogram &&
        this.props.selectedVizType !== vizSubTypes.heatmap &&
        dataSize > 1500000
    ) {
      return validation.generic.dataSizePrevent;
    }

    // GENERAL SIZE
    if (dataSize > 6000000) {
      return validation.generic.dataSizePrevent;
    }
    if (!this.props.vizPageDataTargetDetails)
      return validation.generic.variableMissing;
    if (this.props.charts.length > 9)
      return 'Total number of plots is too large. Please delete 1 or more';

    // TODO extract magic number
    // AGGREGATO SIZE ACROSS ALL CHARTS
    if (aggregateSize + dataSize > 4000000)
      return 'Total rendered data amount is too large. Please delete 1 or more plots.';

    if (
      !this.state.irregularSpatialResolution &&
      this.state.selectedVizType !== vizSubTypes.timeSeries &&
      Date.parse(this.state.dt2) - Date.parse(this.state.dt1) > 86400000 * 365
    )
      return 'Maximum date range for non-time series plots of gridded data is 1 year';
    return '';
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


    let details = vizPageDataTargetDetails;
    let validations;

    const dataSize = this.estimateDataSize();

    if (details) {
      validations = [
        this.checkStartDepth(),
        this.checkEndDepth(),
        this.checkStartLat(),
        this.checkEndLat(),
        this.checkStartLon(),
        this.checkEndLon(),
        this.checkHeatmap(),
        this.checkContour(),
        this.checkSection(),
        this.checkHistogram(),
        this.checkTimeSeries(),
        this.checkDepthProfile(),
        this.checkSparseMap(),
        this.checkGeneralWarn(dataSize),
        this.checkGeneralPrevent(dataSize),
        this.checkStartDate(),
        this.checkEndDate(),
        this.checkStartTime(),
        this.checkEndTime(),
        this.checkStartDateTime(),
        this.checkEndDateTime(),
      ];
    } else {
      validations = Array(14).fill('');
    }

    const [
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
      endDateTimeMessage
    ] = validations;

    const checkDisableVisualizeList = [
      startDepthMessage,
      endDepthMessage,
      startLatMessage,
      endLatMessage,
      startLonMessage,
      endLonMessage,
      generalPreventMessage,
      startDateMessage,
      endDateMessage,
      startTimeMessage,
      endTimeMessage,
      startDateTimeMessage
    ];

    const checkDisableVisualize = () => {
      for (let i = 0; i < checkDisableVisualizeList.length; i++) {
        if (checkDisableVisualizeList[i]) return checkDisableVisualizeList[i];
      }
      return false;
    };

    const disableVisualizeMessage = checkDisableVisualize();

    const visualizeButtonTooltip = disableVisualizeMessage
      ? disableVisualizeMessage
      : generalPreventMessage
      ? generalPreventMessage
          : '';

    const alerts = [];
    if (this.props.paramLock && this.props.variableResolutionMismatch) {
      alerts.push(
        (<Warning>
           <span>
             {`The selected varible belongs to a different dataset than the previous variable. The resulting visualization may have a different spatial or temporal resolution and thus incorporate more or fewer snapshots of data.`}
           </span>
         </Warning>)
      );
    }
    if (this.props.paramLock && this.props.dateTypeMismatch) {
      alerts.push (
        (<Warning>
           <span>
             {`There is a mismatch between the locked date range type and the current variable's temporal resolution. Unlock the parameters controls to change the time range.`}
           </span>
         </Warning>)
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
          {alerts.length > 0 &&
           <div className={classes.alertBoxHandle}>
             <IconButton
               onClick={() => {
                 this.props.setLockAlertsOpen (!this.props.lockAlertsOpen)}}
             >
               <LuAlertTriangle />
             </IconButton>
           </div>
          }

          {alerts.length > 0 &&
           <div className={classes.alertBox}>
             {this.props.lockAlertsOpen &&
              <div className={classes.alertList}>
                {alerts}
              </div>
             }

             {this.props.lockAlertsOpen &&
              <span>
                <IconButton
                  onClick={() => {
                    this.props.setLockAlertsOpen (!this.props.lockAlertsOpen)}}
                >
                  <CloseIcon />
                </IconButton>
              </span>
             }
           </div>
          }


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
                    searchEl.focus()
                  } else {
                    console.log('couldn\'t find element')
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
                      error={(Boolean(startDateMessage))}
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
                        this.props.paramLock
                          ||  this.state.showDrawHelp
                          || !vizPageDataTargetDetails
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
                      error={(Boolean(endDateMessage))}
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
                        this.props.paramLock
                          || this.state.showDrawHelp
                          || !vizPageDataTargetDetails
                      }
                    />
                  </Grid>
                </>
              ) : (
                <>
                 {/* Daily Date Picker */}
                  <Grid item xs={6} className={classes.formGridItem}>
                    <TextField
                      name="date1"
                      className={classes.textField}
                      id="date1"
                      label="Start Date(m/d/y)"
                      step={1}
                      type="date"
                      value={(typeof dt1 === 'string' ? dt1.slice(0,10) : dt1)}
                      error={(Boolean(startDateMessage) || Boolean(startDateTimeMessage))}
                      FormHelperTextProps={{ className: classes.helperText }}
                      helperText={startDateMessage || startDateTimeMessage}
                      InputProps={{
                        className: classes.dateTimeInput,
                        inputProps: details
                          ? {
                              min: details.Time_Min.slice(0, 10),
                              max: details.Time_Max.slice(0, 10),
                            }
                          : {},
                      }}
                      InputLabelProps={{
                        shrink: true,
                        className: classes.padLeft,
                      }}
                      onChange={this.handleChangeInputValue}
                      disabled={
                        this.props.paramLock
                          ||  this.state.showDrawHelp
                          || !vizPageDataTargetDetails
                      }
                    />
                  </Grid>

                  <Grid item xs={6} className={classes.formGridItem}>
                    <TextField
                      name="date2"
                      className={classes.textField}
                      id="date2"
                      label="End Date(m/d/y)"
                      type="date"
                      value={(typeof dt2 === 'string' ? dt2.slice(0,10) : dt2)}
                      error={(Boolean(endDateMessage) || Boolean(endDateTimeMessage))}
                      FormHelperTextProps={{ className: classes.helperText }}
                      helperText={endDateMessage || endDateTimeMessage }
                      InputProps={{
                        className: classes.dateTimeInput,
                        inputProps: details
                          ? {
                              min: details.Time_Min.slice(0, 10),
                              max: details.Time_Max.slice(0, 10),
                            }
                          : {},
                      }}
                      InputLabelProps={{
                        shrink: true,
                        className: classes.padLeft,
                      }}
                      onChange={this.handleChangeInputValue}
                      disabled={
                        this.props.paramLock
                          || this.state.showDrawHelp
                          || !vizPageDataTargetDetails
                      }
                    />
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
                        error={(Boolean(startTimeMessage) || Boolean (startDateTimeMessage))}
                        helperText={startTimeMessage || startDateTimeMessage}
                        disabled={
                          this.props.paramLock
                            ||  this.state.showDrawHelp
                            || !vizPageDataTargetDetails
                        }
                      />
                    </Grid><Grid item xs={6} className={classes.formGridItem}>
                      <TextField
                        name="hour2"
                        id="hour2"
                        label="End Time"
                        className={classes.textField}
                        type="time"
                        value={ensureTimeValue(dt2)}
                        onChange={this.handleChangeInputValue}
                        error={(Boolean(endTimeMessage) || Boolean(endDateTimeMessage))}
                        helperText={endTimeMessage || endDateTimeMessage}
                        disabled={
                          this.props.paramLock
                            ||this.state.showDrawHelp
                            || !vizPageDataTargetDetails
                        }
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
                    this.props.paramLock
                      || this.state.showDrawHelp
                      || !vizPageDataTargetDetails
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
                    this.props.paramLock
                      ||  this.state.showDrawHelp
                      || !vizPageDataTargetDetails
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
                    this.props.paramLock
                      || this.state.showDrawHelp
                      || !vizPageDataTargetDetails
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
                    this.props.paramLock
                      || this.state.showDrawHelp
                      || !vizPageDataTargetDetails
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
                  disabled={
                    this.props.paramLock ||
                    !vizPageDataTargetDetails
                  }
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
                  disabled={
                    this.props.paramLock ||
                    !vizPageDataTargetDetails
                  }
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
                <Paper className={classes.popoutButtonPaper}> {/* show globe button */}
                  <Tooltip placement="right" title={this.props.paramLock ? 'Unlock Space & Time Range' : 'Lock Space & Time Range'}>
                    <span>
                      <IconButton
                        className={classes.lockButtonBase}
                        onClick={() => this.props.setParamLock (!this.props.paramLock)}
                        disabled={!details}
                      >
                        {this.props.paramLock
                         ? <ImLock />
                         : <ImUnlocked />
                        }
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
                        <Language className={classes.popoutButtonIcon}/>
                      ) : (
                        <Badge badgeContent={charts.length} color="primary"> {/* display chart count*/}
                          <ShowChart className={classes.popoutButtonIcon}/>
                        </Badge>
                      )}
                    </IconButton>
                  </Tooltip>
                  <Hint
                    content={RestrictDataHint}
                    position={{ beacon: 'right', hint: 'bottom-end' }}
                    size={'medium'}
                  >
                    <Tooltip placement="right" title={'Draw Spatial Range on Globe'}>
                      <span>
                        <IconButton
                          className={classes.popoutButtonBase}
                          onClick={this.handleDrawClick}
                          disabled={
                            !details
                              || plotsActiveTab !== 0
                              || this.props.paramLock
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

               {showControlPanel ? (
                  <Paper className={classes.popoutButtonPaper}>
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
