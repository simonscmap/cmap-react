import { createSelector } from 'reselect';

export const trajectorySelector = createSelector(
  [ (state) => state.programDetails && state.programDetails.cruises ],
  (cruises) => {
    if (!cruises) {
      return [];
    } else {
      return Object.keys(cruises).reduce((acc, currKey) => {
        Object.assign(acc, { [currKey]: cruises[currKey] && cruises[currKey].trajectory })
        return acc;
      }, {});
    }
  }
);

export const cruiseSelector = createSelector(
  [ (state) => state.programDetails && state.programDetails.cruises ],
  (cruises) => {
    if (!cruises) {
      return [];
    } else {
      return Object.values(cruises);
    }
  }
);

export const activeTrajectorySelector = createSelector(
  [
    (state) => state.programDetails && state.programDetails.cruises,
    (state) => state.programDetailsCruiseFocus,
  ],
  (cruises, focusId) => {
    if (!cruises) {
      return null;
    } else if (!focusId) {
      return Object.values(cruises)[0].trajectory;
    } else {
      if (cruises[focusId]) {
        return cruises[focusId].trajectory;
      } else {
        return null;
      }
    }
  }
);
