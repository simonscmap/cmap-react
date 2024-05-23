import { createSelector } from 'reselect';

export const trajectorySelector = createSelector(
  [ (state) => state.programDetails && state.programDetails.cruises ],
  (cruises) => {
    if (!cruises) {
      return [];
    } else {
      return Object.keys(cruises).reduce((acc, currKey) => {
        if (cruises[currKey] && cruises[currKey].trajectory) {
          Object.assign(acc, { [currKey]: cruises[currKey].trajectory })
        }
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
      return null; // NOTE allow for no cruise to be in focus
      // return {
      //   cruiseId: Object.values(cruises)[0].ID,
      //   trajectory: Object.values(cruises)[0].trajectory
      // }
    } else {
      if (cruises[focusId]) {
        return {
          cruiseId: focusId,
          trajectory: cruises[focusId].trajectory,
        }
      } else {
        return null;
      }
    }
  }
);
