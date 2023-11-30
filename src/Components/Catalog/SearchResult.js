// An individual result from catalog search

import React, { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import {
  makeStyles,
  // Grid,
  // Typography,
  Paper,
  Tooltip,
  Link,
  Button,
  // Chip,
} from '@material-ui/core';
// import { ErrorOutline } from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
// import CartAddOrRemove from './CartAddOrRemove';
import { setShowCart } from '../../Redux/actions/ui';
// import { colors } from '../Home/theme';
// import Hint from '../Navigation/Help/Hint';
// import AddToFavorites from '../Catalog/help/addToFavoritesHint';
// import DatasetTitleHint from './help/datasetTitleHint';
import DownloadDialog from './DownloadDialog';
import api from '../../api/api';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { downloadMetadata } from './DownloadMetaData';
import { useDatasetFeatures } from '../../Utility/Catalog/useDatasetFeatures';
import styles from './searchResultStyles';
import MetadataContent from './SearchResultMetaDataContent';
// import { Star, StarBorder } from '@material-ui/icons';
// import { FaLayerGroup } from "react-icons/fa";
import HideAtBreakPoint from './Display/HideAtBreakPoint';
import AncillaryDataChip from './Display/AncillaryDataChip';
import ContinuousIngestionChip from './Display/ContinuousIngestionChip';
import DatasetTitleLink from './Display/DatasetTitleLink';
import DownloadButton from './Display/DownloadButton';
import { FaRegCopy } from "react-icons/fa6";

const useStyles = makeStyles(styles);

const SearchResult = (props) => {
  const { index, style } = props;

  const searchResults = useSelector((state) => state.searchResults);
  const cl = useStyles();
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [fullDataset, setDataset] = useState();

  const dataset = searchResults[index];

  const features = useDatasetFeatures(dataset && dataset.Table_Name);

  if (!searchResults || typeof index !== 'number') {
    return <React.Fragment />;
  }

  const {
    Icon_URL,
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

  const onDownloadMetaClick = async () => {
    let data = await fetchDataset();
    if (data) {
      downloadMetadata(Short_Name, data);
    } else {
      console.log('no data yet');
    }
  };

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

export default SearchResult;
