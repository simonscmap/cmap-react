import * as newsActionTypes from '../actionTypes/news';

// LIST
export const requestNewsList = () => ({
  type: newsActionTypes.REQUEST_NEWS_LIST_SEND,
});

export const requestNewsListStore = (stories) => ({
  payload: { stories },
  type: newsActionTypes.REQUEST_NEWS_LIST_SUCCESS,
});

export const requestNewsListFailure = (error) => ({
  payload: { error },
  type: newsActionTypes.REQUEST_NEWS_LIST_FAILURE,
});

// CREATE
export const createNewsItem = (item) => ({
  payload: { item },
  type: newsActionTypes.CREATE_NEWS_ITEM_SEND,
});

export const createNewsItemSuccess = () => ({
  type: newsActionTypes.CREATE_NEWS_ITEM_SUCCESS,
});

export const createNewsItemFailure = () => ({
  type: newsActionTypes.CREATE_NEWS_ITEM_FAILURE,
});

// UPDATE
export const updateNewsItem = (item) => ({
  payload: { item },
  type: newsActionTypes.UPDATE_NEWS_ITEM_SEND,
});

export const updateNewsItemFailure = () => ({
  type: newsActionTypes.UPDATE_NEWS_ITEM_FAILURE,
});

export const updateNewsItemSuccess = () => ({
  type: newsActionTypes.UPDATE_NEWS_ITEM_SUCCESS,
});

// UPDATE RANKS
export const updateNewsRanks = (ranks) => {
  return {
    payload: { ranks },
    type: newsActionTypes.UPDATE_NEWS_RANKS_SEND,
  };
};

export const updateNewsRanksSuccess = () => ({
  type: newsActionTypes.UPDATE_NEWS_RANKS_SUCCESS,
});

export const updateNewsRanksFailure = () => ({
  type: newsActionTypes.UPDATE_NEWS_RANKS_FAILURE,
});

// Publish
export const publishNewsItem = (id) => ({
  payload: { id },
  type: newsActionTypes.PUBLISH_NEWS_ITEM_SEND,
});

export const publishNewsItemSuccess = () => ({
  type: newsActionTypes.PUBLISH_NEWS_ITEM_SUCCESS,
});

export const publishNewsItemFailure = () => ({
  type: newsActionTypes.PUBLISH_NEWS_ITEM_FAILURE,
});

// Preview
export const previewNewsItem = (id) => ({
  payload: { id },
  type: newsActionTypes.PREVIEW_NEWS_ITEM_SEND,
});

export const previewNewsItemSuccess = () => ({
  type: newsActionTypes.PREVIEW_NEWS_ITEM_SUCCESS,
});

export const previewNewsItemFailure = () => ({
  type: newsActionTypes.PREVIEW_NEWS_ITEM_FAILURE,
});

// Draft
export const draftNewsItem = (id) => ({
  payload: { id },
  type: newsActionTypes.DRAFT_NEWS_ITEM_SEND,
});

export const draftNewsItemSuccess = () => ({
  type: newsActionTypes.DRAFT_NEWS_ITEM_SUCCESS,
});

export const draftNewsItemFailure = () => ({
  type: newsActionTypes.DRAFT_NEWS_ITEM_FAILURE,
});

// Unpublish
export const unpublishNewsItem = (id) => ({
  payload: { id },
  type: newsActionTypes.UNPUBLISH_NEWS_ITEM_SEND,
});
export const unpublishNewsItemSuccess = (id) => ({
  payload: { id },
  type: newsActionTypes.UNPUBLISH_NEWS_ITEM_SUCCESS,
});
export const unpublishNewsItemFailure = () => ({
  type: newsActionTypes.UNPUBLISH_NEWS_ITEM_FAILURE,
});

// Feature / Unfeature (works as toggle)
export const featureNewsItem = (id) => ({
  payload: { id },
  type: newsActionTypes.FEATURE_NEWS_ITEM_SEND,
});
export const featureNewsItemSuccess = () => ({
  type: newsActionTypes.FEATURE_NEWS_ITEM_SUCCESS,
});
export const featureNewsItemFailure = () => ({
  type: newsActionTypes.FEATURE_NEWS_ITEM_FAILURE,
});

// Categorize
export const categorizeNewsItem = (id, category) => ({
  payload: { id, category },
  type: newsActionTypes.CATEGORIZE_NEWS_ITEM_SEND,
});
export const categorizeNewsItemSuccess = () => ({
  type: newsActionTypes.CATEGORIZE_NEWS_ITEM_SUCCESS,
});
export const categorizeNewsItemFailure = () => ({
  type: newsActionTypes.CATEGORIZE_NEWS_ITEM_FAILURE,
});

// Admin State

export const setViewStateFilter = (filter) => ({
  payload: { filter },
  type: newsActionTypes.SET_VIEW_STATE_FILTER,
});

export const setRankFilter = (filter) => ({
  payload: { filter },
  type: newsActionTypes.SET_RANK_FILTER,
});

export const setSortTerm = (sortTerm) => ({
  payload: { sortTerm },
  type: newsActionTypes.SET_SORT_TERM,
});

export const setOrderOfImportance = (orderOfImportance) => ({
  payload: { orderOfImportance },
  type: newsActionTypes.SET_ORDER_OF_IMPORTANCE,
});

export const setOpenRanksEditor = (openRanksEditor) => ({
  payload: { openRanksEditor },
  type: newsActionTypes.OPEN_RANKS_EDITOR,
});

export const setNewsRanks = (ranks) => ({
  payload: { ranks },
  type: newsActionTypes.SET_NEWS_RANKS,
});

export const addRank = (story) => ({
  payload: { story },
  type: newsActionTypes.ADD_RANK,
});
