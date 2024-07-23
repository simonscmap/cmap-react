// An individual result from catalog search

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  makeStyles,
  Paper,
} from '@material-ui/core';

import DownloadDialog from './DownloadDialog';
import api from '../../api/api';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { useDatasetFeatures } from '../../Utility/Catalog/useDatasetFeatures';
import styles from './searchResultStyles';
import MetadataContent from './SearchResultMetaDataContent';
import HideAtBreakPoint from './Display/HideAtBreakPoint';
import AncillaryDataChip from './Display/AncillaryDataChip';
import ContinuousIngestionChip from './Display/ContinuousIngestionChip';
import DatasetTitleLink from './Display/DatasetTitleLink';
import DownloadButton from './Display/DownloadButton';

const useStyles = makeStyles(styles);

// a rendering component for a search result
export const SearchResultPure = (props) => {
  const {
    dataset,
    fullDataset,
    onDownloadClick,
    setDownloadDialogOpen,
    downloadDialogOpen,
    features,
    style,
    index,
    options = {},
  } = props;

  const cl = useStyles();

  const { Icon_URL } = dataset;

  return (
    <div style={style} className="result-wrapper">
      <DownloadDialog
        dialogOpen={downloadDialogOpen}
        dataset={(fullDataset && fullDataset.dataset)}
        handleClose={() => setDownloadDialogOpen(false)}
      />
      <div className={cl.wrapper_} key={`${index}_fsl_item`}>
        <Paper className={cl.resultPaper} elevation={4}>
          <div className={cl.wrapper}>
            <div className={cl.title}>
              <DatasetTitleLink dataset={dataset} />
              <DownloadButton onClick={onDownloadClick} >
                <div className={cl.buttonTextSpacer}>
                  <CloudDownloadIcon />{' '}
                  <span>Download</span>
                </div>
              </DownloadButton>
            </div>
            <div className={cl.contentBox}>
              <div className={cl.textContainer}>
                <div className={cl.metadataContainer}>
                  <div className={cl.actionBox}>
                    <div className={cl.leftGroup}>
                      <AncillaryDataChip features={features} />
                      <ContinuousIngestionChip features={features} />
                    </div>
                    <div className={cl.rightGroup}>
                    </div>
                  </div>
                  <MetadataContent dataset={dataset} />
                </div>
              </div>
              <div className={cl.rightContent}>
                <HideAtBreakPoint lt={1570}>
                  <div className={cl.graphicContainer} >
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

  const searchResults = useSelector((state) => state.searchResults);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [fullDataset, setDataset] = useState();

  const dataset = searchResults[index];

  const features = useDatasetFeatures(dataset && dataset.Table_Name);

  if (!searchResults || typeof index !== 'number') {
    return <React.Fragment />;
  }

  const {
    Short_Name,
    // Visualize,
  } = dataset;

  const fetchDataset = async () => {
    let data;
    try {
      data = await api.catalog.datasetMetadata(Short_Name);
      if (data.ok) {
        data = await data.json();
        setDataset(data);
      }
    } catch (e) {
      console.error(`There was an error attempting to fetch ${Short_Name}`);
      // TODO: alert user that there was an error
    }
    return await data;
  };

  const onDownloadClick = async () => {
    setDownloadDialogOpen(true);
    await fetchDataset();
  };

  return <SearchResultPure
           dataset={dataset}
           fullDataset={fullDataset}
           onDownloadClick={onDownloadClick}
           setDownloadDialogOpen={setDownloadDialogOpen}
           downloadDialogOpen={downloadDialogOpen}
           features={features}
           style={style}
           index={index}
  />
};

export default SearchResultState;
