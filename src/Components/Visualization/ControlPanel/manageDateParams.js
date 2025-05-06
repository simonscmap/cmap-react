import getTargetFeatures from './getTargetFeatures';
import leadingZero from './leadingZero';
import transformDateStringToMonth from './transformDateStringToMonth';

/* manageDateParam
   returns adapted dt1 and dt2 values depending on context

   if target is monthlyClimatology, will return a MM-DD-YYYY date string

   if target is monthlyClimatology AND paramLock is active with a locked date-time string,
   will handle converting a locked date time to a date
 */
const manageDateParams = (currState, currProps) => {
  // const { paramLock } = currProps;
  const { monthlyClimatology } = getTargetFeatures(currProps);

  if (monthlyClimatology) {
    if (currState.dt1.length > 2) {
      // modify locked date-time to date string
      const newDt1 = `${transformDateStringToMonth(currState.dt1)}-01-1900`;
      const newDt2 = `${transformDateStringToMonth(currState.dt2)}-01-1900`;
      return {
        dt1: newDt1,
        dt2: newDt2,
      };
    } else {
      return {
        dt1: `${leadingZero(currState.dt1)}-01-1900`,
        dt2: `${leadingZero(currState.dt2)}-01-1900`,
      };
    }
  } else {
    return {
      dt1: currState.dt1,
      dt2: currState.dt2,
    };
  }
};

export default manageDateParams;
