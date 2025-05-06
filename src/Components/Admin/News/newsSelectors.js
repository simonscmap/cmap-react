// News Selectors
import { createSelector } from 'reselect';
import { safePath } from '../../../Utility/objectUtils';
import { sortStories } from './lib';

export const datasetNamesFullList = createSelector(
  [(state) => state.datasetNamesFullList],
  (list) => {
    if (list) {
      return list.map((record) => ({
        shortName: record.Dataset_Name,
        longName: record.Dataset_Long_Name,
        id: record.ID,
      }));
    } else {
      return [];
    }
  },
);

export const sortedStories = createSelector(
  [
    safePath(['news', 'stories']),
    safePath(['news', 'sortTerm']),
    safePath(['news', 'orderOfImportance']),
    safePath(['news', 'viewStateFilter']),
    safePath(['news', 'rankFilter']),
  ],
  (stories, sortTerm, orderOfImportance, viewStateFilter, rankFilter) => {
    if (!stories) {
      return [];
    }

    const filteredStories = stories.filter(
      ({ view_status, rank }) =>
        viewStateFilter.includes(view_status) &&
        (!rankFilter || (rankFilter && typeof rank === 'number')),
    );

    const sortedStories = sortStories(
      sortTerm,
      filteredStories,
      orderOfImportance,
    );
    return sortedStories;
  },
);

export const notificationHistory = (state) => state.notificationHistory;
export const notificationRecipientProjections = (state) =>
  state.notificationRecipientProjections;
export const notificationRecipientProjectionsRequestStatus = (state) =>
  state.notificationRecipientProjectionsRequestStatus;
