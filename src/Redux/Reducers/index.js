import catalog from './catalog';
import user from './user';
import ui from './ui';
import news from './news';
import notifications from './notifications';
import visualization from './visualization';
import dataSubmission from './dataSubmission.js';
import help from './help.js';
import highlights from './highlights';
import data from './data';
import dropbox from '../../features/datasetDownloadDropbox/state/reducer';
import reduceReducers from 'reduce-reducers';
import { combineReducers } from 'redux';
// localStorageIntroState and localStorageHintState now imported directly in help reducer
// Import initial states from migrated reducers for single source of truth
import { initialHelpState } from './help';
import { initialHighlightsState } from './highlights';
import { initialUserState } from './user';
import { initialDataSubmissionState } from './dataSubmission';
// Consider building this object from initial states from each reducer
// ** When adding new keys to redux store consider whether they need to be
// reset on navigation for UI purposes. If so, add them with a default state
// to the uiResetState in the ui reducer **

const initialState = {
  // catalog state pieces moved to catalog slice reducer
  // UI state pieces moved to ui slice reducer
  // User state pieces moved to user slice reducer

  preferences: {},
  // intros and hints now managed by help slice reducer

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Visualization state pieces moved to visualization slice reducer

  getTableStatsRequestState: null,

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // Data Submission state pieces - MIGRATED to dataSubmission slice reducer

  // News - news initial state moved to slice reducer in news.js

  // Notifications && Subscriptions
  notificationHistory: {},
  notificationRecipientProjections: {},
  notificationRecipientProjectionsRequestStatus: {},
  sentNotifications: [],
  sendNotificationsStatus: [],
  reSendNotificationsStatus: [],
  // subscribeIntroActive moved to ui slice reducer
  // dropbox initial state moved to slice reducer in dropbox/reducer.js
};

// Stage 1: Create combineReducers structure for migrated slice reducers
// This function is updated as individual reducers are migrated to slice pattern
const createCombinedSliceReducers = () => {
  return combineReducers({
    user: user, // Migrated to slice reducer pattern
    dropbox: dropbox, // Migrated to slice reducer pattern
    help: help, // Migrated to slice reducer pattern
    highlights: highlights, // Migrated to slice reducer pattern
    dataSubmission: dataSubmission, // Migrated to slice reducer pattern
  });
};

// Stage 2: Initialize the slice reducers foundation

// Stage 3: Hybrid root reducer combining slice-based and full-state patterns
// Custom hybrid reducer that properly partitions state between combineReducers and full-state reducers
const reducedReducer = (state = initialState, action) => {
  // Step 1: Extract slice state for combineReducers (only the keys it manages)
  // Note: For newly migrated slices, state.sliceName might not exist yet on first initialization
  const sliceState = {
    user: state.user || undefined, // user slice manages its own state now, undefined allows reducer to use default
    dropbox: state.dropbox,
    help: state.help || undefined, // help slice manages its own state now, undefined allows reducer to use default
    highlights: state.highlights || undefined, // highlights slice manages its own state now, undefined allows reducer to use default
    dataSubmission: state.dataSubmission || undefined, // dataSubmission slice manages its own state now, undefined allows reducer to use default
  };

  // Step 2: Process slice reducers with combineReducers
  const combinedSliceReducer = createCombinedSliceReducers();
  const newSliceState = combinedSliceReducer(sliceState, action);

  // Step 3: Create updated state with slice changes and compatibility mappings
  // SINGLE SOURCE OF TRUTH PATTERN: Use imported initial states from each reducer
  // instead of hardcoded fallbacks to eliminate duplication and ensure consistency
  const stateWithSliceUpdates = {
    ...state,
    ...newSliceState, // Direct merge for state shape compatible slices (e.g., dropbox, user)
    // STATE SHAPE TRANSFORMATIONS: Required when slice shape differs from original

    ...(newSliceState.user || initialUserState),
    intros: newSliceState.help
      ? newSliceState.help.intros
      : initialHelpState.intros,
    hints: newSliceState.help
      ? newSliceState.help.hints
      : initialHelpState.hints,
    home: {
      ...state.home,
      highlights: newSliceState.highlights || initialHighlightsState,
    },
    // Spread dataSubmission slice state directly into root state shape
    ...(newSliceState.dataSubmission || initialDataSubmissionState),
  };

  // Step 4: Process through full-state reducers in sequence
  return reduceReducers(
    stateWithSliceUpdates,
    catalog, // Full-state reducer (reverted from slice pattern)
    ui, // Full-state reducer (reverted from slice pattern)
    visualization, // Full-state reducer (reverted from slice pattern)
    news, // Full-state reducer (reverted from slice pattern)
    // user, // MIGRATED to slice reducer pattern
    // dataSubmission, // MIGRATED to slice reducer pattern
    // highlights, // MIGRATED to slice reducer pattern
    data, // Full-state reducer (unmigrated)
    notifications, // Full-state reducer (unmigrated)
  )(stateWithSliceUpdates, action);
};

// Export the hybrid reducer as default (current usage)
export default reducedReducer;
