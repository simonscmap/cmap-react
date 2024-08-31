// News Selectors
import { createSelector } from 'reselect';
// import { safePath } from '../../../Utility/objectUtils';

export const datasetNamesFullList = createSelector (
  [ (state) => state.datasetNamesFullList ],
  (list) => {
    if (list) {
      return list.map (record => ({
        shortName: record.Dataset_Name,
        longName: record.Dataset_Long_Name,
        id: record.ID,
      }));
    } else {
      return [];
    }
  }
);
