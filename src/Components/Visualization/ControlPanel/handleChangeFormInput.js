// An extracted class component method from VizControlPanel
// handles updating local state when pertinent form fields emit new values
// several caveats
// - switching between monthly and daily dates after param lock
// - allowing separate inputs for date and time but needing to store state as one value
// - handling timezone obfuscation of the date picker
import temporalResolutions from '../../../enums/temporalResolutions';

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

function handleChangeFormInput (e) {
  const targetDetails = this.props.vizPageDataTargetDetails;
  const isMonthly =
        targetDetails.Temporal_Resolution ===
        temporalResolutions.monthlyClimatology;

  console.log ('param change', { value: e.target.value, name: e.target.name, isMonthly });

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

export default handleChangeFormInput;
