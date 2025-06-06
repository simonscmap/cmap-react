// Validations functions and validation handler

import Cookies from 'js-cookie';

import { aggregateChartDataSize } from '../helpers';
import getDataSize from './estimateDataSize';
import validation from '../../../enums/validation';
import vizSubTypes from '../../../enums/visualizationSubTypes';
import temporalResolutions from '../../../enums/temporalResolutions';

// util
import countWebGLContexts from '../../../Utility/countWebGLContexts';
import depthUtils from '../../../Utility/depthCounter';
import isUtcDateTimeString from '../../../Utility/Time/isISO';

import states from '../../../enums/asyncRequestStates';

const dateStringToISO = (dateString) => new Date(dateString).toISOString();

function checkStartDepth() {
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
}

function checkEndDepth() {
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
}

function checkStartDateTime() {
  let isMonthly =
    this.props.vizPageDataTargetDetails.Temporal_Resolution ===
    temporalResolutions.monthlyClimatology;

  if (!isMonthly && !isUtcDateTimeString(this.state.dt1)) {
    return 'Invalid date/time';
  }
}

function checkEndDateTime() {
  let isMonthly =
    this.props.vizPageDataTargetDetails.Temporal_Resolution ===
    temporalResolutions.monthlyClimatology;
  if (!isMonthly && !isUtcDateTimeString(this.state.dt2)) {
    return 'Invalid date/time';
  }
}

function checkStartDate() {
  const dt1 = this.state.dt1;
  const dt2 = this.state.dt2;

  console.log('check start date', dt1, dt2);

  let isMonthly =
    this.props.vizPageDataTargetDetails.Temporal_Resolution ===
    temporalResolutions.monthlyClimatology;

  if (isMonthly) {
    let month1 = dt1;
    let month2 = dt2;

    if (typeof dt1 === 'string') {
      if (dt1.length <= 2) {
        month1 = parseInt(dt1);
      } else {
        month1 = new Date(dt1).getUTCMonth() + 1;
      }
    } else {
      month1 = parseInt(dt1);
    }

    if (typeof dt2 === 'string') {
      if (dt2.length <= 2) {
        month2 = parseInt(dt2);
      } else {
        month2 = new Date(dt2).getUTCMonth() + 1;
      }
    } else {
      month2 = parseInt(dt2);
    }

    console.log(month1, month2);
    if (month1 > month2) {
      return 'Start date cannot be greater than end';
    }
  } else {
    if (!dt1) {
      return 'Invalid date';
    }
    if (new Date(this.state.dt1) > new Date(this.state.dt2)) {
      return 'Start cannot be greater than end';
    }

    if (typeof dt1 === 'number') {
      // handle case where dt2 is not marked as monthly, but is a number type
      if (dt1 < 1 || dt1 > 12) {
        return 'Start date is not within range: 1 - 12';
      }
    } else if (typeof dt1 === 'string') {
      // Note the double slice looks odd
      // first, slice the time component off in order to get a date value that
      // is only significant to the day
      // then slice the ISO string so that the string comparison will be
      // between strings of the same length
      let isLessThanDatasetTimeMin =
        dt1.slice(0, 10) <
        dateStringToISO(
          this.props.vizPageDataTargetDetails.Time_Min.slice(0, 10),
        ).slice(0, 10);

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
}

function checkEndDate() {
  let isMonthly =
    this.props.vizPageDataTargetDetails.Temporal_Resolution ===
    temporalResolutions.monthlyClimatology;

  const dt1 = this.state.dt1;
  const dt2 = this.state.dt2;

  if (isMonthly) {
    let month1 = dt1;
    let month2 = dt2;

    if (typeof dt1 === 'string') {
      if (dt1.length <= 2) {
        month1 = parseInt(dt1);
      } else {
        month1 = new Date(dt1).getUTCMonth() + 1; // getUTCMonth is 0 indexed
      }
    } else {
      month1 = parseInt(dt1);
    }

    if (typeof dt2 === 'string') {
      if (dt2.length <= 2) {
        month2 = parseInt(dt2);
      } else {
        month2 = new Date(dt2).getUTCMonth() + 1; // getUTCMonth is 0 indexed
      }
    } else {
      month2 = parseInt(dt2);
    }

    if (month1 > month2) {
      return 'End date cannot be less than start';
    }
  } else {
    if (!this.state.dt2 || !isUtcDateTimeString(this.state.dt2)) {
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
        this.state.dt2.slice(0, 10) >
        dateStringToISO(
          this.props.vizPageDataTargetDetails.Time_Max.slice(0, 10),
        ).slice(0, 10);

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
}

function checkEndTime() {
  let isMonthly =
    this.props.vizPageDataTargetDetails.Temporal_Resolution ===
    temporalResolutions.monthlyClimatology;

  if (isMonthly || typeof this.state.dt2 !== 'string') {
    // don't check time
    return '';
  }

  let maxEndDate = this.props.vizPageDataTargetDetails.Time_Max.slice(0, 10);
  let maxEndTime = this.props.vizPageDataTargetDetails.Time_Max.slice(11, 16);

  let endDateTime = this.state.dt2;
  // check if time is greater that time max
  if (endDateTime.slice(0, 10) === maxEndDate) {
    if (endDateTime.slice(11, 16) > maxEndTime) {
      return `The maximum end time for ${maxEndDate} is ${maxEndTime}`;
    }
  }
  return '';
}

function checkStartTime() {
  let isMonthly =
    this.props.vizPageDataTargetDetails.Temporal_Resolution ===
    temporalResolutions.monthlyClimatology;

  if (isMonthly || typeof this.state.dt1 !== 'string') {
    // don't check time
    return '';
  }

  let minStartDate = this.props.vizPageDataTargetDetails.Time_Min.slice(0, 10);
  let minStartTime = this.props.vizPageDataTargetDetails.Time_Min.slice(11, 16);

  let startTime = this.state.dt1;
  // check if time is greater that time max
  if (startTime.slice(0, 10) === minStartDate) {
    if (startTime.slice(11, 16) < minStartTime) {
      return `The minimum start time for ${minStartDate} is ${minStartTime}`;
    }
  }

  return '';
}

function checkStartLat() {
  if (this.state.lat1 > this.props.vizPageDataTargetDetails.Lat_Max) {
    return `Maximum start lat is ${this.props.vizPageDataTargetDetails.Lat_Max}`;
  }
  if (this.state.lat1 > this.state.lat2) {
    return `Start cannot be greater than end`;
  }
  return '';
}

function checkEndLat() {
  if (this.state.lat2 < this.props.vizPageDataTargetDetails.Lat_Min) {
    return `Minimum end lat is ${this.props.vizPageDataTargetDetails.Lat_Min}`;
  }
  if (this.state.lat1 > this.state.lat2) {
    return `Start cannot be greater than end`;
  }
  return '';
}

function checkStartLon() {
  const { lon1, lon2 } = this.state;
  const { Lon_Min, Lon_Max } = this.props.vizPageDataTargetDetails;

  if (lon2 >= lon1) {
    if (lon1 > Lon_Max) {
      return `Maximum start lon is ${Lon_Max}`;
    }
  } else {
    if (Lon_Min > lon1 || Lon_Max > lon1 || Lon_Min < lon2 || Lon_Max < lon2) {
    } else {
      return `Longitude outside dataset coverage`;
    }
  }
  return '';
}

function checkEndLon() {
  const { lon1, lon2 } = this.state;
  const { Lon_Min } = this.props.vizPageDataTargetDetails;

  if (lon2 >= lon1) {
    if (lon2 < Lon_Min) {
      return `Minimum end lon is ${Lon_Min}`;
    }
  }

  return '';
}

function checkHeatmap() {
  if (this.state.irregularSpatialResolution) {
    return validation.type.dataIsIrregular.replace('$', 'Heatmap');
  }
  return '';
}

function checkContour() {
  if (this.state.irregularSpatialResolution) {
    return validation.type.dataIsIrregular.replace('$', 'Contour');
  }
  return '';
}

function checkSection() {
  if (this.state.surfaceOnly) {
    return validation.type.surfaceOnlyDataset.replace('$', 'variable');
  }
  if (this.state.irregularSpatialResolution) {
    return validation.type.dataIsIrregular.replace('$', 'Section Map');
  }
  return '';
}

function checkHistogram() {
  return '';
}

function checkTimeSeries() {
  if (this.state.irregularSpatialResolution) {
    return validation.type.dataIsIrregular.replace('$', 'Time Series');
  }
  return '';
}

function checkDepthProfile() {
  if (this.state.surfaceOnly) {
    return validation.type.surfaceOnlyDataset.replace('$', 'variable');
  }
  return '';
}

function checkSparseMap() {
  if (!this.state.irregularSpatialResolution) {
    return validation.type.irregularOnly;
  }
  return '';
}

function checkGeneralWarn(dataSize) {
  if (!this.props.selectedVizType) {
    return '';
  }
  if (dataSize > 1200000) {
    return validation.generic.dataSizeWarning;
  }
  return '';
}

function checkGeneralPrevent(dataSize) {
  const webGLCount = countWebGLContexts(this.props.charts);
  const aggregateSize = aggregateChartDataSize(this.props.charts);

  if (!this.props.user) {
    let guestPlotCount = parseInt(Cookies.get('guestPlotCount'));
    if (guestPlotCount && guestPlotCount >= 10) {
      return validation.generic.guestMaximumReached;
    }
  }

  if (!this.state.selectedVizType) {
    return validation.generic.vizTypeMissing;
  }
  if (this.state.selectedVizType === vizSubTypes.heatmap && webGLCount > 14) {
    return validation.type.webGLContextLimit;
  }
  if (this.state.selectedVizType === vizSubTypes.sparse && webGLCount > 11) {
    return validation.type.webGLContextLimit;
  }

  if (this.state.selectedVizType === vizSubTypes.heatmap) {
    let availableContexts = 16 - webGLCount;
    const depthCount =
      depthUtils.count(
        { data: this.props.vizPageDataTargetDetails },
        this.props.depth1,
        this.props.depth2,
      ) || 1;
    if (availableContexts - depthCount < 1) {
      return 'Too many distinct depths to render heatmap. Please reduce depth range or select section map.';
    }
  }

  // DATA SIZE CHECKS
  const sizeCheckStatus = this.props.sizeCheckStatus;
  const sizeCheckResult = this.props.sizeCheck;

  if (
    sizeCheckStatus === states.notTried ||
    sizeCheckStatus === states.inProgress
  ) {
    return 'Waiting for size check to complete.';
  }

  if (sizeCheckStatus === states.failed) {
    return 'Error estimating visualization size.';
  }

  if (sizeCheckResult === null) {
    return 'No size estimation available.';
  }

  if (
    sizeCheckStatus === states.succeeded &&
    sizeCheckResult &&
    !sizeCheckResult.allow
  ) {
    return `Extent is too large, select a smaller spatial or temporal range.`;
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
  if (!this.props.vizPageDataTargetDetails) {
    return validation.generic.variableMissing;
  }
  if (this.props.charts.length > 9) {
    return 'Total number of plots is too large. Please delete 1 or more';
  }

  // TODO extract magic number
  // AGGREGATO SIZE ACROSS ALL CHARTS
  if (aggregateSize + dataSize > 4000000) {
    return 'Total rendered data amount is too large. Please delete 1 or more plots.';
  }

  if (
    !this.state.irregularSpatialResolution &&
    this.state.selectedVizType !== vizSubTypes.timeSeries &&
    Date.parse(this.state.dt2) - Date.parse(this.state.dt1) > 86400000 * 365
  ) {
    return 'Maximum date range for non-time series plots of gridded data is 1 year';
  }
  return '';
}

function estimateDataSize() {
  const { vizPageDataTargetDetails } = this.props;
  return getDataSize(vizPageDataTargetDetails, this.state);
}

function handleValidation() {
  const details = this.props.vizPageDataTargetDetails;
  if (!details) {
    return {
      validationComplete: false,
      validations: {},
    };
  }

  const dataSize = estimateDataSize.call(this);

  const validations = {
    startDepthMessage: checkStartDepth.call(this),
    endDepthMessage: checkEndDepth.call(this),
    startLatMessage: checkStartLat.call(this),
    endLatMessage: checkEndLat.call(this),
    startLonMessage: checkStartLon.call(this),
    endLonMessage: checkEndLon.call(this),
    heatmapMessage: checkHeatmap.call(this),
    contourMessage: checkContour.call(this),
    sectionMapMessage: checkSection.call(this),
    histogramMessage: checkHistogram.call(this),
    timeSeriesMessage: checkTimeSeries.call(this),
    depthProfileMessage: checkDepthProfile.call(this),
    sparseMapMessage: checkSparseMap.call(this),
    generalWarnMessage: checkGeneralWarn.call(this, dataSize),
    generalPreventMessage: checkGeneralPrevent.call(this, dataSize),
    startDateMessage: checkStartDate.call(this),
    endDateMessage: checkEndDate.call(this),
    startTimeMessage: checkStartTime.call(this),
    endTimeMessage: checkEndTime.call(this),
    startDateTimeMessage: checkStartDateTime.call(this),
    endDateTimeMessage: checkEndDateTime.call(this),
  };

  // validations that should prevent visualization
  const checkDisableVisualizeList = [
    'startDepthMessage',
    'endDepthMessage',
    'startLatMessage',
    'endLatMessage',
    'startLonMessage',
    'endLonMessage',
    'generalPreventMessage',
    'startDateMessage',
    'endDateMessage',
    'startTimeMessage',
    'endTimeMessage',
    'startDateTimeMessage',
  ];

  const disableVisualizeMessages = checkDisableVisualizeList
    .map((name) => validations[name])
    .filter((message) => !!message);

  const disableVisualizeMessage = disableVisualizeMessages.length
    ? disableVisualizeMessages[0]
    : '';

  const visualizeButtonTooltip = validations.disableVisualizeMessage
    ? validations.disableVisualizeMessage
    : validations.generalPreventMessage
    ? validations.generalPreventMessage
    : null;

  const payload = {
    disableVisualizeMessage,
    visualizeButtonTooltip,
    validationComplete: true,
    validations,
  };

  console.log('validation complete', payload);
  return payload;
}

export default handleValidation;
