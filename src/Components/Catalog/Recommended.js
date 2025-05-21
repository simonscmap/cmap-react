import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core';
import { FixedSizeList } from 'react-window';
import { recommendedRecsRequestSend } from '../../Redux/actions/catalog';
import { FETCH_RECS_RECOMMENDED_SUCCESS } from '../../Redux/actionTypes/catalog';
import states from '../../enums/asyncRequestStates';
import RecResult from './DatasetCard/DatasetCardCompact';
import Spinner from '../UI/Spinner';
import { persistenceService } from '../../Services/persist';

// every time we fetch new recommendations, cache it in local storage
persistenceService.add({
  actionType: FETCH_RECS_RECOMMENDED_SUCCESS,
  key: 'seeAlsoRecs',
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
export const useRecommendedDatasets = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const recommendedDatasets = useSelector((state) => state.recommendedDatasets);
  const recommendedDatasetsRequestState = useSelector(
    (state) => state.recommendedDatasetsRequestState,
  );

  useEffect(() => {
    if (recommendedDatasetsRequestState === states.notTried && user) {
      dispatch(recommendedRecsRequestSend(user.id));
    }
  }, [recommendedDatasets, recommendedDatasetsRequestState, user]);

  return recommendedDatasets;
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

// "See Also"
const RecommendedDatasets = (props) => {
  const cl = useStyles();
  const { data: recommendedDatasets } = props;

  const recommendedDatasetsRequestState = useSelector(
    (state) => state.recommendedDatasetsRequestState,
  );

  const Row = ({ index, style }) => {
    if (recommendedDatasets && recommendedDatasets[index]) {
      return (
        <div style={style} key={`recommended-dataset-${index}`}>
          <RecResult dataset={recommendedDatasets[index]} index={index} />
        </div>
      );
    } else {
      return '';
    }
  };

  if (recommendedDatasets && recommendedDatasets.length) {
    return (
      <FixedSizeList
        className={cl.list}
        height={window.innerHeight - 250}
        itemSize={175}
        itemCount={recommendedDatasets ? recommendedDatasets.length : 0}
        itemData={recommendedDatasets || []}
      >
        {Row}
      </FixedSizeList>
    );
  } else if (recommendedDatasetsRequestState === states.inProgress) {
    return (
      <div className={cl.spinnerPositioner}>
        <Spinner />
      </div>
    );
  } else if (recommendedDatasetsRequestState === states.failed) {
    return <span>Failed to load recommended datasets.</span>;
  } else {
    return <span></span>;
  }
};

export default RecommendedDatasets;
