import { call, put, takeLatest, select } from 'redux-saga/effects';
import api from '../../api/api';
import * as newsActions from '../actions/news';
import * as interfaceActions from '../actions/ui';
import * as newsActionTypes from '../actionTypes/news';

import initLog from '../../Services/log-service';
const log = initLog ('sagas/news');

/* requestNewsList, watchNewsList
 */
export function* requestNewsList() {
  let response = yield call(api.news.list);
  if (response && response.ok) {
    let jsonResponse = yield response.json();
    // parse each story body, which is stored as a json string in the database
    let result = jsonResponse.map((story) => {
      let body;
      try {
        body = JSON.parse(story.body);
      } catch (e) {
        console.log(`unable to parse news story body (id: ${story.ID}`, e);
      }
      return {
        ...story,
        body,
      };
    });
    yield put(newsActions.requestNewsListStore(result));
  } else {
    // What should we do when this fails?
    // Need to have a fallback treatment of the news banner.
    // Should a different alert
    yield put(newsActions.requestNewsListFailure(response && response.message));
  }
} // ⮷ &. Watcher ⮷

export function* watchRequestNewsList() {
  yield takeLatest(newsActionTypes.REQUEST_NEWS_LIST_SEND, requestNewsList);
}

// UPDATE
export function* updateNewsItem(action) {
  const tag = { tag: 'updateNewsItem' };
  const response = yield call(api.news.update, action.payload.item);
  if (response.ok) {
    yield put(newsActions.updateNewsItemSuccess());
    yield put(interfaceActions.snackbarOpen('Update successful', tag));
  } else {
    let text = '';
    try {
      text = yield response.text();
    } catch (e) {
      log.error ('error parsing response text', { error: e})
    }
    yield put(newsActions.updateNewsItemFailure({ text }));
    yield put(interfaceActions.snackbarOpen('Failed to update news item', tag));
    }
  yield requestNewsList();
} // ⮷ &. Watcher ⮷ (2 watchers; trigger a refetch of news list after update)

export function* watchUpdateNewsItem() {
  yield takeLatest(newsActionTypes.UPDATE_NEWS_ITEM_SEND, updateNewsItem);
}

export function* watchUpdateNewsItemSuccess() {
  yield takeLatest(newsActionTypes.UPDATE_NEWS_ITEM_SUCCESS, requestNewsList);
}

// PUBLISH
export function* publishNewsItem(action) {
  let response = yield call(api.news.publish, action.payload.id);
  if (response.ok) {
    yield put(newsActions.publishNewsItemSuccess());
  } else {
    yield put(newsActions.publishNewsItemFailure());
  }
} // ⮷ &. Watcher ⮷ (2 watchers; trigger a refetch of news list after update)

export function* watchPublishNewsItem() {
  yield takeLatest(newsActionTypes.PUBLISH_NEWS_ITEM_SEND, publishNewsItem);
}
export function* watchPublishNewsItemSuccess() {
  yield takeLatest(newsActionTypes.PUBLISH_NEWS_ITEM_SUCCESS, requestNewsList);
}

// PREVIEW
export function* previewNewsItem(action) {
  let response = yield call(api.news.preview, action.payload.id);
  if (response.ok) {
    yield put(newsActions.previewNewsItemSuccess());
  } else {
    yield put(newsActions.previewNewsItemFailure());
  }
} // ⮷ &. Watcher ⮷ (2 watchers; trigger a refetch of news list after update)

export function* watchPreviewNewsItem() {
  yield takeLatest(newsActionTypes.PREVIEW_NEWS_ITEM_SEND, previewNewsItem);
}
export function* watchPreviewNewsItemSuccess() {
  yield takeLatest(newsActionTypes.PREVIEW_NEWS_ITEM_SUCCESS, requestNewsList);
}

// DRAFT
export function* draftNewsItem(action) {
  let response = yield call(api.news.draft, action.payload.id);
  if (response.ok) {
    yield put(newsActions.draftNewsItemSuccess());
  } else {
    yield put(newsActions.draftNewsItemFailure());
  }
} // ⮷ &. Watcher ⮷ (2 watchers; trigger a refetch of news list after update)

export function* watchDraftNewsItem() {
  yield takeLatest(newsActionTypes.DRAFT_NEWS_ITEM_SEND, draftNewsItem);
}
export function* watchDraftNewsItemSuccess() {
  yield takeLatest(newsActionTypes.DRAFT_NEWS_ITEM_SUCCESS, requestNewsList);
}

// UNPUBLISH
export function* unpublishNewsItem(action) {
  let response = yield call(api.news.unpublish, action.payload.id);
  if (response.ok) {
    yield put(newsActions.unpublishNewsItemSuccess());
  } else {
    yield put(newsActions.unpublishNewsItemFailure());
  }
} // ⮷ &. Watcher ⮷ (2 watchers; trigger a refetch of news list after update)

export function* watchUnpublishNewsItem() {
  yield takeLatest(newsActionTypes.UNPUBLISH_NEWS_ITEM_SEND, unpublishNewsItem);
}
export function* watchUnpublishNewsItemSuccess() {
  yield takeLatest(
    newsActionTypes.UNPUBLISH_NEWS_ITEM_SUCCESS,
    requestNewsList,
  );
}

// Feature / Unfeature (toggle)
export function* featureNewsItem(action) {
  let storyToUpdate = yield select ((state) =>
    state.news.stories.find (s => s.ID === action.payload.id));
  if (!storyToUpdate) {
    yield put(newsActions.featureNewsItemFailure());
    return;
  }

  let response = yield call(api.news.feature, action.payload.id, storyToUpdate.Highlight);
  if (response.ok) {
    yield put(newsActions.featureNewsItemSuccess());
  } else {
    yield put(newsActions.featureNewsItemFailure());
  }
} // ⮷ &. Watcher ⮷ (2 watchers; trigger a refetch of news list after update)

export function* watchFeatureNewsItem() {
  yield takeLatest(newsActionTypes.FEATURE_NEWS_ITEM_SEND, featureNewsItem);
}
export function* watchFeatureNewsItemSuccess() {
  yield takeLatest(
    newsActionTypes.FEATURE_NEWS_ITEM_SUCCESS,
    requestNewsList,
  );
}

// Categorize
export function* categorizeNewsItem(action) {
  let response = yield call(api.news.categorize, action.payload.id, action.payload.category);
  if (response.ok) {
    yield put(newsActions.categorizeNewsItemSuccess());
  } else {
    yield put(newsActions.categorizeNewsItemFailure());
  }
} // ⮷ &. Watcher ⮷ (2 watchers; trigger a refetch of news list after update)

export function* watchCategorizeNewsItem() {
  yield takeLatest(newsActionTypes.CATEGORIZE_NEWS_ITEM_SEND, categorizeNewsItem);
}
export function* watchCategorizeNewsItemSuccess() {
  yield takeLatest(
    newsActionTypes.CATEGORIZE_NEWS_ITEM_SUCCESS,
    requestNewsList,
  );
}

// CREATE
export function* createNewsItem(action) {
  let response = yield call(api.news.create, { story: action.payload.item });
  if (response.ok) {
    yield put(newsActions.createNewsItemSuccess());
  } else {
    let text = '';
    try {
      text = yield response.text();
    } catch (e) {
      log.error ('error parsing response text', { error: e })
    }
    yield put(newsActions.createNewsItemFailure({ text }));
    yield put(interfaceActions.snackbarOpen('Failed to create news item'));
  }
} // ⮷ &. Watcher ⮷ (2 watchers; trigger a refetch of news list after update)

export function* watchCreateNewsItem() {
  yield takeLatest(newsActionTypes.CREATE_NEWS_ITEM_SEND, createNewsItem);
}
export function* watchCreateNewsItemSuccess() {
  yield takeLatest(newsActionTypes.CREATE_NEWS_ITEM_SUCCESS, requestNewsList);
}

// Update News Rakns
export function* updateNewsRanks(action) {
  let response = yield call(api.news.updateRanks, action.payload.ranks);
  if (response.ok) {
    yield put(newsActions.updateNewsRanksSuccess());
  } else {
    yield put(newsActions.updateNewsRanksFailure());
  }
} // ⮷ &. Watcher ⮷ (2 watchers; trigger a refetch of news list after update)

export function* watchUpdateNewsRanks() {
  yield takeLatest(newsActionTypes.UPDATE_NEWS_RANKS_SEND, updateNewsRanks);
}
export function* watchUpdateNewsRanksSuccess() {
  yield takeLatest(newsActionTypes.UPDATE_NEWS_RANKS_SUCCESS, requestNewsList);
}
