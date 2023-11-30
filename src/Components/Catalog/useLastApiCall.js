import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { localStorageApi } from '../../Services/persist/local';
import { requestUserApiCallsSend } from '../../Redux/actions/user';
import {
  recommendedRecsRequestSend,
  recentRecsRequestSend,
} from '../../Redux/actions/catalog';
import states from '../../enums/asyncRequestStates';

const getRecCacheCreationTimes = (userId) => {
  const result = {
    recentRecsCacheTime: null,
    seeAlsoCacheTime: null,
  };

  const recentRecs = localStorageApi.get('recentRecs');
  const seeAlsoRecs = localStorageApi.get('seeAlsoRecs');

  try {
    const parsedRecent = JSON.parse (recentRecs);
    if (parsedRecent && parsedRecent.updated) {
      if (parsedRecent.userId !== userId) {
        console.log ('user id mismatch');
      } else {
        result.recentRecsCacheTime = new Date(parsedRecent.updated);
      }
    }
  } catch (e) {
    console.log ('check cache time error', e);
  }

  try {
    const parsedSeeAlso = JSON.parse (seeAlsoRecs);
    console.log ('parsedSeeAlso', parsedSeeAlso)
    if (parsedSeeAlso && parsedSeeAlso.updated) {
      if (parsedSeeAlso.userId !== userId) {
        console.log ('user id mismatch');
      } else {
        result.seeAlsoCacheTime = new Date(parsedSeeAlso.updated);
      }
    }
  } catch (e) {
    console.log ('check cache time error', e);
  }

  return result;
}


export const useLastApiCall = () => {
  const dispatch = useDispatch();
  const user = useSelector ((state) => state.user);
  const userLastTouch = user && user.lastDatasetTouch;

  const recState = useSelector((state) => ({
    recentDatasets: state.recentDatasets,
    recentDatasetsRequestState: state.recentDatasetsRequestState,
    recommendedDatasets: state.recommendedDatasets,
    recommendedDatasetsRequestState: state.recommendedDatasetsRequestState,
    userApiCallsRequestStatus: state.userApiCallsRequestStatus,
  }));

  // if user is logged in
  // get last api call
  // compare against cached ttl
  // IF last api call is more recent
  //   1. clear cache
  //   2. trigger re-fetch of recommendation data

  useEffect (() => {
    const notTried = recState.userApiCallsRequestStatus === states.notTried;
    const loggedIn = Boolean (user);
    if (loggedIn && notTried) {
      console.log ('dispatching api calls request');
      dispatch (requestUserApiCallsSend (user.id));
    }
  }, [recState.userApiCallsRequestStatus]);

  useEffect(() => {
    const lastTouchSuccess =
      recState.userApiCallsRequestStatus === states.succeeded;
    const loggedIn = Boolean (user);

    if (loggedIn && user.lastDatasetTouch && lastTouchSuccess) {
      const lastTouch = user.lastDatasetTouch;
      const cacheTimes = getRecCacheCreationTimes(user.id);
      console.log ('comparing', lastTouch, cacheTimes);
      if (lastTouch > cacheTimes.recentRecsCacheTime) {
        console.log ('recent recs local cache is stale');
        localStorageApi.del('recentRecs');
        dispatch (recentRecsRequestSend (user.id));
      }
      if (lastTouch > cacheTimes.seeAlsoCacheTime) {
        console.log ('see-also local cache is stale');
        localStorageApi.del ('seeAlsoRecs');
        dispatch (recommendedRecsRequestSend (user.id));
      }
    }
  }, [user, recState.userApiCallsRequestStatus]);

  return [];
};

export default useLastApiCall;
