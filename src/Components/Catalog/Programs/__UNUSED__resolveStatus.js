import states from '../../../enums/asyncRequestStates';

const {
  notTried,
  inProgress,
  streaming,
  processing,
  failed,
  succeeded,
  expired,
} = states;

// prioritize states, where failures are higher priority than successes
const sortAsyncStates = (a, b) => {
  const enumMap = {};
  enumMap[notTried] = 0;
  enumMap[failed] = 1;
  enumMap[expired] = 2;
  enumMap[inProgress] = 3;
  enumMap[streaming] = 4;
  enumMap[processing] = 5;
  enumMap[succeeded] = 6;

  if (enumMap[a] < enumMap[b]) {
    return -1;
  } else if (enumMap[a] === enumMap[b]) {
    return 0;
  } else {
    return 1;
  }
};

const isAsyncState = (s) => Boolean(states[s]);

// TODO: also pass an array of predicates, which allow for
// readiness checks, not just the state of the request,
// to determine the overall status

const resolveStatus = (asyncStatuses = []) => {
  let overallStatus = states.notTried;

  let sortedAsyncStates = asyncStatuses
    .filter(isAsyncState)
    .sort(sortAsyncStates);

  if (sortedAsyncStates.length) {
    overallStatus = sortedAsyncStates[0];
  }

  return [overallStatus, sortedAsyncStates];
};

export default resolveStatus;
