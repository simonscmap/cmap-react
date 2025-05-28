// An individual result from catalog search

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Chip } from '@material-ui/core';
import { useDatasetFeatures } from '../../../Utility/Catalog/useDatasetFeatures';
import styles from './DatasetCardDetailed.styles';
import MetadataContent from './DatasetCardContent';
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
    <div style={style} className={cl.wrapper_} key={`${index}_fsl_item`}>
      <Paper className={cl.resultPaper} elevation={4}>
        <div className={cl.wrapper}>
          <div className={cl.title} {...extra}>
            <DatasetTitleLink dataset={dataset} componentId={titleProp} />
          </div>
          <div className={cl.contentBox}>
            <div className={cl.metadataContainer}>
              <div className={cl.actionBox}>
                <div className={cl.leftGroup}>
                  <div className={cl.actionsContainer}>
                    <div className={cl.buttonGroup}>
                      <SubscribeButton
                        shortName={Short_Name}
                        componentId={subscribeProp}
                      />
                      <DownloadButtonOutlined
                        style={{ marginTop: '1px' }}
                        shortName={Short_Name}
                        componentId={downloadProp}
                      />
                    </div>
                    <div className={cl.chipGroup}>
                      <FeatureChips features={features} />
                    </div>
                  </div>
                </div>
                <div className={cl.rightGroup}></div>
              </div>
              <div className={cl.contentContainer}>
                <MetadataContent id="metadata-content" dataset={dataset} />
                {Icon_URL && (
                  <img
                    src={Icon_URL}
                    className={cl.previewImage}
                    alt="Preview"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Paper>
    </div>
  );
};

// FeatureChips component to render feature chips with left margin
function FeatureChips({ features }) {
  if (!features) {
    return null;
  }
  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      {features.ancillary && (
        <Chip color="primary" size="small" label="Ancillary Data" />
      )}
      {features.ci && (
        <Chip color="primary" size="small" label="Continuously Updated" />
      )}
    </div>
  );
}

const DataSetCardDetailed = (props) => {
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

export default DataSetCardDetailed;
