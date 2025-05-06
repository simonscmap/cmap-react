import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core';
import { FixedSizeList } from 'react-window';
import { recentRecsRequestSend } from '../../Redux/actions/catalog';
import { FETCH_RECS_RECENT_SUCCESS } from '../../Redux/actionTypes/catalog';
import states from '../../enums/asyncRequestStates';
import RecResult from './SearchResult2';
import Spinner from '../UI/Spinner';
import { persistenceService } from '../../Services/persist';

// every time we fetch new recommendations, cache it in local storage
persistenceService.add({
  actionType: FETCH_RECS_RECENT_SUCCESS,
  key: 'recentRecs',
  payloadToValue: (currentLocalStateForKey, payload, store) => {
    const reduxState = store.getState();
    const userId = reduxState && reduxState.user && reduxState.user.id;
    return {
      userId,
      updated: new Date().toISOString(),
      data: payload,
    };
  },
});

export const useRecentDatasetRecs = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const recentDatasets = useSelector((state) => state.recentDatasets);
  const recentDatasetsRequestState = useSelector(
    (state) => state.recentDatasetsRequestState,
  );

  useEffect(() => {
    if (recentDatasetsRequestState === states.notTried && user) {
      dispatch(recentRecsRequestSend(user.id));
    }
  }, [recentDatasets, recentDatasetsRequestState, user]);

  return recentDatasets;
};

const useStyles = makeStyles((theme) => ({
  list: {
    width: '100%',
  },
  spinnerPositioner: {
    width: '100%',
    height: '100%',
    '& > div': {
      marginTop: '2em',
    },
  },
}));

const RecentDatasets = (props) => {
  const cl = useStyles();
  const { data: recentDatasets } = props;

  const recentDatasetsRequestState = useSelector(
    (state) => state.recentDatasetsRequestState,
  );

  const Row = ({ index, style }) => {
    if (recentDatasets && recentDatasets[index]) {
      return (
        <div style={style} key={`popular-dataset-${index}`}>
          <RecResult dataset={recentDatasets[index]} index={index} />
        </div>
      );
    } else {
      return '';
    }
  };

  if (recentDatasets) {
    return (
      <FixedSizeList
        className={cl.list}
        height={window.innerHeight - 250}
        itemSize={175}
        itemCount={recentDatasets ? recentDatasets.length : 0}
        itemData={recentDatasets || []}
      >
        {Row}
      </FixedSizeList>
    );
  } else if (recentDatasetsRequestState === states.inProgress) {
    return (
      <div className={cl.spinnerPositioner}>
        <Spinner />
      </div>
    );
  } else if (recentDatasetsRequestState === states.failed) {
    return <span>Failed to load recently viewed datasets.</span>;
  } else {
    return <span></span>;
  }
};

export default RecentDatasets;
