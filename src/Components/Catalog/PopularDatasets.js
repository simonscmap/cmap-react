import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core';
import { FixedSizeList } from 'react-window';
import { popularRecsRequestSend } from '../../Redux/actions/catalog';
import states from '../../enums/asyncRequestStates';
import RecResult from './DatasetCard/DatasetCardCompact';
import Spinner from '../UI/Spinner';

export const usePopularDatasetRecs = () => {
  const dispatch = useDispatch();

  const popularDatasets = useSelector((state) => state.popularDatasets);
  const popularDatasetsRequestState = useSelector(
    (state) => state.popularDatasetsRequestState,
  );

  useEffect(() => {
    if (popularDatasetsRequestState === states.notTried) {
      dispatch(popularRecsRequestSend());
    }
  }, [popularDatasets, popularDatasetsRequestState]);

  return popularDatasets;
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

const PopularDatasets = (props) => {
  const cl = useStyles();
  const { data: popularDatasets } = props;

  const popularDatasetsRequestState = useSelector(
    (state) => state.popularDatasetsRequestState,
  );

  const Row = ({ index, style }) => (
    <div style={style} key={`popular-dataset-${index}`}>
      <RecResult dataset={popularDatasets[index]} index={index} />
    </div>
  );

  if (popularDatasets) {
    return (
      <FixedSizeList
        className={cl.list}
        height={window.innerHeight - 250}
        itemSize={175}
        itemCount={popularDatasets ? popularDatasets.length : 0}
        itemData={popularDatasets || []}
      >
        {Row}
      </FixedSizeList>
    );
  } else if (popularDatasetsRequestState === states.inProgress) {
    return (
      <div className={cl.spinnerPositioner}>
        <Spinner />
      </div>
    );
  } else if (popularDatasetsRequestState === states.failed) {
    return <span>Failed to load popular datasets.</span>;
  } else {
    return '';
  }
};

export default PopularDatasets;
