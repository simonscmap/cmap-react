import * as actions from '../actionTypes/news';
import states from '../../enums/asyncRequestStates';

// News slice initial state
const initialNewsState = {
  stories: [],
  viewStateFilter: [1, 2, 3],
  rankFilter: false,
  sortTerm: 'modify_date',
  orderOfImportance: 'descending',
  openRanksEditor: false,
  ranks: [],
  addRank: [],
  adminMessages: [],
  requestStatus: {
    create: states.notTried,
    update: states.notTried,
    updateRanks: states.notTried,
    updateViewStatus: states.notTried,
    list: states.notTried,
  },
};

const actionToAdminMsg = (action) => {
  switch (action.type) {
    // LIST
    case actions.REQUEST_NEWS_LIST_SUCCESS:
      return 'Refreshed news items.';
    case actions.REQUEST_NEWS_LIST_FAILURE:
      return action.payload.error
        ? `Request to fetch news items failed with message: ${action.payload.error}`
        : undefined;

    // CREATE
    case actions.CREATE_NEWS_ITEM_SEND:
      return `Creating new news item`;
    case actions.CREATE_NEWS_ITEM_FAILURE:
      return `Failed to create news item ${action.payload.text}`;
    case actions.CREATE_NEWS_ITEM_SUCCESS:
      return `Successfully created news item`;

    //UPDATE
    case actions.UPDATE_NEWS_ITEM_SEND:
      return `Updating news item with id ${action.payload.item.id}`;
    case actions.UPDATE_NEWS_ITEM_FAILURE:
      return `Failed to update news item. ${action.payload.text}`;
    case actions.UPDATE_NEWS_ITEM_SUCCESS:
      return `Successfully updated news item.`;

    // UPDATE RANK
    case actions.UPDATE_NEWS_RANKS_SEND:
      return `Updating ranks.`;
    case actions.UPDATE_NEWS_RANKS_FAILURE:
      return `Failed to update ranks.`;
    case actions.UPDATE_NEWS_RANKS_SUCCESS:
      return `Successfully updated ranks.`;

    // CHANGING VIEW STATUS
    case actions.PUBLISH_NEWS_ITEM_SEND:
    case actions.PREVIEW_NEWS_ITEM_SEND:
    case actions.DRAFT_NEWS_ITEM_SEND:
    case actions.UNPUBLISH_NEWS_ITEM_SEND:
      return `Changing view status`;
    case actions.PUBLISH_NEWS_ITEM_FAILURE:
    case actions.PREVIEW_NEWS_ITEM_FAILURE:
    case actions.DRAFT_NEWS_ITEM_FAILURE:
    case actions.UNPUBLISH_NEWS_ITEM_FAILURE:
      return `Failed to change view status`;
    case actions.PUBLISH_NEWS_ITEM_SUCCESS:
    case actions.PREVIEW_NEWS_ITEM_SUCCESS:
    case actions.DRAFT_NEWS_ITEM_SUCCESS:
    case actions.UNPUBLISH_NEWS_ITEM_SUCCESS:
      return `Successfully changed view status`;

    case actions.FEATURE_NEWS_ITEM_SUCCESS:
      return 'Successfully changed feature status';
    case actions.FEATURE_NEWS_ITEM_FAILURE:
      return 'Failed to update feature status';

    case actions.CATEGORIZE_NEWS_ITEM_SUCCESS:
      return 'Successfully changed story category';
    case actions.CATEGORIZE_NEWS_ITEM_FAILURE:
      return 'Failed to update story category';

    // DASHBOARD STATE
    case actions.SET_VIEW_STATE_FILTER:
      return `Setting view state filter to ${action.payload.filter}`;

    case actions.SET_RANK_FILTER:
      return `Setting rank filter to ${action.payload.filter}`;

    case actions.SET_SORT_TERM:
      return `Setting sort by ${action.payload.sortTerm}`;

    case actions.SET_ORDER_OF_IMPORTANCE:
      return `Setting order of importance to ${action.payload.orderOfImportance}`;

    case actions.OPEN_RANKS_EDITOR:
      return action.payload.openRanksEditor
        ? `Opening ranks editor`
        : `Closing ranks editor`;

    case actions.SET_NEWS_RANKS:
      return `Adjusting ranks in ranks editor`;

    case actions.ADD_RANK:
      return `Added story with id ${action.payload.story.ID} to ranks editor`;

    default:
      return undefined;
  }
};

const computeAdminMessage = (newsState, action) => {
  let msg = actionToAdminMsg(action);
  if (msg) {
    // limit messages to the last 10
    return [`[${new Date().toLocaleTimeString()}]\n${msg}`].concat(
      newsState.adminMessages.slice(0, 100),
    );
  } else {
    return newsState.adminMessages;
  }
};

const merge = (newsState, action) => (stringMap) => ({
  ...newsState,
  adminMessages: computeAdminMessage(newsState, action),
  ...stringMap,
});

export default function (newsState = initialNewsState, action) {
  let { payload } = action;
  let mergeWithState = merge(newsState, action);

  switch (action.type) {
    // CREATE
    case actions.CREATE_NEWS_ITEM_SEND:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          create: states.inProgress,
        },
      });

    case actions.CREATE_NEWS_ITEM_FAILURE:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          create: states.failed,
        },
      });

    case actions.CREATE_NEWS_ITEM_SUCCESS:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          create: states.succeeded,
        },
      });

    // LIST
    case actions.REQUEST_NEWS_LIST_SEND:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          list: states.inProgress,
        },
      });
    case actions.REQUEST_NEWS_LIST_SUCCESS:
      return mergeWithState({
        stories: payload.stories,
        requestStatus: {
          ...newsState.requestStatus,
          list: states.succeeded,
        },
      });
    case actions.REQUEST_NEWS_LIST_FAILURE:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          list: states.failed,
        },
      });
    // UPDATE
    case actions.UPDATE_NEWS_ITEM_SEND:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          update: states.inProgress,
        },
      });
    case actions.UPDATE_NEWS_ITEM_FAILURE:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          update: states.failed,
        },
      });
    case actions.UPDATE_NEWS_ITEM_SUCCESS:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          update: states.succeeded,
        },
      });
    // UDPATE RANKS
    case actions.UPDATE_NEWS_RANKS_SEND:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          updateRanks: states.inProgress,
        },
      });
    case actions.UPDATE_NEWS_RANKS_FAILURE:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          updateRanks: states.failed,
        },
      });
    case actions.UPDATE_NEWS_RANKS_SUCCESS:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          updateRanks: states.succeeded,
        },
      });
    // CHANGE VIEW STATUS
    case actions.PUBLISH_NEWS_ITEM_SEND:
    case actions.PREVIEW_NEWS_ITEM_SEND:
    case actions.DRAFT_NEWS_ITEM_SEND:
    case actions.UNPUBLISH_NEWS_ITEM_SEND:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          updateViewStatus: states.inProgress,
        },
      });
    case actions.PUBLISH_NEWS_ITEM_FAILURE:
    case actions.PREVIEW_NEWS_ITEM_FAILURE:
    case actions.DRAFT_NEWS_ITEM_FAILURE:
    case actions.UNPUBLISH_NEWS_ITEM_FAILURE:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          updateViewStatus: states.succeeded,
        },
      });
    case actions.PUBLISH_NEWS_ITEM_SUCCESS:
    case actions.PREVIEW_NEWS_ITEM_SUCCESS:
    case actions.DRAFT_NEWS_ITEM_SUCCESS:
    case actions.UNPUBLISH_NEWS_ITEM_SUCCESS:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          updateViewStatus: states.succeeded,
        },
      });
    // FEATURE / UNFEATURE
    case actions.FEATURE_NEWS_ITEM_SUCCESS:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          updateFeature: states.succeeded,
        },
        adminMessages: computeAdminMessage(newsState, action),
      });
    // FEATURE / UNFEATURE
    case actions.FEATURE_NEWS_ITEM_FAILURE:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          updateFeature: states.failed,
        },
        adminMessages: computeAdminMessage(newsState, action),
      });

    // CATEGORIZE
    case actions.CATEGORIZE_NEWS_ITEM_SUCCESS:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          updateCategory: states.succeeded,
        },
        adminMessages: computeAdminMessage(newsState, action),
      });
    case actions.CATEGORIZE_NEWS_ITEM_FAILURE:
      return mergeWithState({
        requestStatus: {
          ...newsState.requestStatus,
          updateCategory: states.failed,
        },
        adminMessages: computeAdminMessage(newsState, action),
      });

    // DASHBOARD STATE
    case actions.SET_VIEW_STATE_FILTER:
      return {
        ...newsState,
        viewStateFilter: payload.filter,
        adminMessages: computeAdminMessage(newsState, action),
      };
    case actions.SET_RANK_FILTER:
      return {
        ...newsState,
        rankFilter: payload.filter,
        adminMessages: computeAdminMessage(newsState, action),
      };
    case actions.SET_SORT_TERM:
      return {
        ...newsState,
        sortTerm: payload.sortTerm,
        // in addition to updating the sort term,
        // if the term is 'simulate', then update the
        // order and filters to simulate the news banner
        orderOfImportance:
          payload.sortTerm === 'simulate'
            ? 'descending'
            : newsState.orderOfImportance,
        viewStateFilter:
          payload.sortTerm === 'simulate' ? [2, 3] : newsState.viewStateFilter,
        adminMessages: computeAdminMessage(newsState, action),
      };
    case actions.SET_ORDER_OF_IMPORTANCE:
      return {
        ...newsState,
        orderOfImportance: payload.orderOfImportance,
        // if the order of importance is changing from descending to ascending
        // AND the sortTerm is set to 'simulate',
        // THEN deselect 'simulate' as the sort, term,
        // because changing the order of importance breaks the simulation
        sortTerm:
          payload.orderOfImportance === 'ascending' &&
          newsState.sortTerm === 'simulate'
            ? ''
            : newsState.sortTerm,
        adminMessages: computeAdminMessage(newsState, action),
      };
    case actions.OPEN_RANKS_EDITOR:
      return {
        ...newsState,
        openRanksEditor: payload.openRanksEditor,
        // when the editor closes, clear the addRank array
        addRank: payload.openRanksEditor ? newsState.addRank : [],
        adminMessages: computeAdminMessage(newsState, action),
      };
    case actions.SET_NEWS_RANKS:
      return {
        ...newsState,
        ranks: payload.ranks,
        // clean any items in the addRank array
        addRank: [],
        adminMessages: computeAdminMessage(newsState, action),
      };
    case actions.ADD_RANK:
      return {
        ...newsState,
        addRank: newsState.addRank.concat(payload.story),
        adminMessages: computeAdminMessage(newsState, action),
      };

    // for default, compute admin messages, so that we don't need a case
    // for all the actions that don't otherwise update state
    default:
      return {
        ...newsState,
        adminMessages: computeAdminMessage(newsState, action),
      };
  }
}

export { initialNewsState };
