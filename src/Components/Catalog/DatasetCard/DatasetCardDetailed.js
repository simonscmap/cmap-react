// An individual result from catalog search

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Chip } from '@material-ui/core';
import { useDatasetFeatures } from '../../../Utility/Catalog/useDatasetFeatures';
import styles from './DatasetCardDetailed.styles';
import MetadataContent from './DatasetCardContent';
import HideAtBreakPoint from './ContentComponents/HideAtBreakPoint';
import DatasetTitleLink from './DatasetTitleLink';
import { DownloadButtonOutlined } from '../DownloadDialog/DownloadButtons';

import SubscribeButton from '../../User/Subscriptions/SubscribeButton';
import { downloadDialogOpen } from '../../../Redux/actions/ui';

const useStyles = makeStyles(styles);

// a rendering component for a search result
export const SearchResultPure = (props) => {
  const { dataset, features, style, index } = props;

  const cl = useStyles();

  const { Icon_URL, Short_Name } = dataset;

  const titleProp = {};
  const subscribeProp = {};
  const extra = {};
  const downloadProp = {};
  if (index === 0) {
    titleProp.id = 'catalog-dataset-title-link';
    subscribeProp.id = 'subscribe-dataset-control';
    downloadProp.id = 'downoload-button';
    extra.id = 'catalog-dataset-title-link';
  }

  return (
    <div style={style} className="result-wrapper">
      <div className={cl.wrapper_} key={`${index}_fsl_item`}>
        <Paper className={cl.resultPaper} elevation={4}>
          <div className={cl.wrapper}>
            <div className={cl.title} {...extra}>
              <DatasetTitleLink dataset={dataset} componentId={titleProp} />
              <div className={cl.actionsContainer}>
                <SubscribeButton
                  shortName={Short_Name}
                  componentId={subscribeProp}
                />
                <DownloadButtonOutlined
                  shortName={Short_Name}
                  componentId={downloadProp}
                />
              </div>
            </div>
            <div className={cl.contentBox}>
              <div className={cl.textContainer}>
                <div className={cl.metadataContainer}>
                  <div className={cl.actionBox}>
                    <div className={cl.leftGroup}>
                      {features?.ancillary && (
                        <Chip
                          color="primary"
                          size="small"
                          label="Ancillary Data"
                        />
                      )}
                      {features?.ci && (
                        <Chip
                          color="primary"
                          size="small"
                          label="Continuously Updated"
                        />
                      )}
                    </div>
                    <div className={cl.rightGroup}></div>
                  </div>
                  <MetadataContent dataset={dataset} />
                </div>
              </div>
              <div className={cl.rightContent}>
                <HideAtBreakPoint lt={1570}>
                  <div className={cl.graphicContainer}>
                    <img src={Icon_URL} />
                  </div>
                </HideAtBreakPoint>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
};

const SearchResultState = (props) => {
  const { index, style } = props;

  const dispatch = useDispatch();
  const searchResults = useSelector((state) => state.searchResults);
  const subs = useSelector((state) => state.userSubscriptions);

  const dataset = searchResults[index];

  const features = useDatasetFeatures(dataset && dataset.Table_Name);

  if (!searchResults || typeof index !== 'number') {
    return <React.Fragment />;
  }

  const { Short_Name } = dataset;

  const onDownloadClick = () => {
    dispatch(downloadDialogOpen(Short_Name));
  };

  return (
    <SearchResultPure
      dataset={dataset}
      onDownloadClick={onDownloadClick}
      features={features}
      style={style}
      index={index}
      userSubscriptions={subs}
    />
  );
};

export default SearchResultState;
