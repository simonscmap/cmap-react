// An individual result from catalog search

import React, { useState } from 'react';
import {
  Button,
  Chip,
  Grid,
  Hidden,
  Link,
  Paper,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import CartAddOrRemove from './CartAddOrRemove';
import Hint from '../Navigation/Help/Hint';
import AddToFavorites from '../Catalog/help/addToFavoritesHint';
import DatasetTitleHint from './help/datasetTitleHint';
import DownloadDialog from './DownloadDialog';
import api from '../../api/api';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { downloadMetadata } from './DownloadMetaData';
import { useDatasetFeatures } from '../../Utility/Catalog/useDatasetFeatures';
import { setShowCart } from '../../Redux/actions/ui';
import styles from './searchResult2styles';

const useStyles = makeStyles (styles);

const SearchResult = (props) => {
  const cl = useStyles ();
  const { index } = props;
  const {
    // Dataset_ID,
    Data_Source,
    // Depth_Max,
    Icon_URL,
    Long_Name,
    Process_Level,
    // Sensors,
    Short_Name,
    // Temporal_Resolution,
    Time_Max,
    Time_Min,
    // Visualize,
    // Spatial_Resolution,
    Table_Name,
    Regions,
  } = props.dataset;

  const cart = useSelector ((state) => state.cart);
  const tablesWithAncillaryData = ((state) => state.tablesWithAncillaryData);

  const dispatch = useDispatch ();

  const showCart = (val) => dispatch (setShowCart (val));

  /* Dataset Features (Chips) */
  const features = useDatasetFeatures (Table_Name);

  const AncillaryDataChip = () => {
    if (features && features.ancillary) {
      return <Chip color="primary" size="small" label="Ancillary Data" />;
    } else {
      return '';
    }
  };

  const CIDataChip = () => {
    if (features && features.ci) {
      return <Chip color="primary" size="small" label="Continuously Updated" />;
    } else {
      return '';
    }
  };

  /* Cart */
  const AddToCartButton = ({ dataset, customId }) => {
    return (
      <CartAddOrRemove
        customId={customId}
        dataset={dataset}
        cartButtonClass={cl.cartButtonClass}
      />
    );
  };

  const AddToCart = ({ dataset }) => {
    return index !== 0 ? (
      <AddToCartButton dataset={dataset} />
    ) : (
      <Hint
        content={AddToFavorites}
        styleOverride={{ wrapper: { display: 'inline-block' } }}
        position={{ beacon: 'right-start', hint: 'bottom-end' }}
        size={'small'}
      >
        <AddToCartButton customId={'catalog-add-to-cart'} dataset={dataset} />
      </Hint>
    );
  };

  const DatasetTitleLink = () => {
    return index !== 0 ? (
      <React.Fragment>
        <Link
          component={RouterLink}
          to={`/catalog/datasets/${Short_Name}`}
          className={cl.longName}
          onClick={() => showCart(false)}
        >
          {Long_Name}
        </Link>

      </React.Fragment>
    ) : (
      <React.Fragment>
        <Hint
          content={DatasetTitleHint}
          styleOverride={{ beacon: { left: '-1.5em' } }}
          position={{ beacon: 'left', hint: 'bottom-end' }}
          size={'medium'}
        >
          <Link
            component={RouterLink}
            to={`/catalog/datasets/${Short_Name}`}
            className={cl.longName}
            id="catalog-dataset-title-link"
            onClick={() => showCart(false)}
          >
            {Long_Name}
          </Link>
        </Hint>

      </React.Fragment>
    );
  };

  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [fullDataset, setDataset] = useState();

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

  const basicDataOverview = (<Typography className={cl.denseText}>
              {Process_Level} Data from {Data_Source}
    </Typography>);

  return (
    <div className={cl.resultSpacingWrapper}>
      <Paper className={cl.resultPaper} elevation={4}>
        <Grid container className={cl.resultWrapper}>
          <Grid item md={12} lg={8} className={cl.gridRow}>
            <DownloadDialog
              dialogOpen={downloadDialogOpen}
              dataset={(fullDataset && fullDataset.dataset)}
              handleClose={() => setDownloadDialogOpen(false)}
            />

            <DatasetTitleLink />

            <div className={cl.resultActions}>
              <AncillaryDataChip />
              <CIDataChip />

              <Button onClick={onDownloadClick} className={cl.downloadLink}>
                <CloudDownloadIcon />
                <Hidden lgDown>
                  <span className={cl.bottomAlignedText}>Download</span>
                </Hidden>
              </Button>
            </div>

            {/* sensors removed */}

            <Typography className={cl.denseText}>
              Temporal Coverage:{' '}
              {Time_Min && Time_Max
                ? ` ${Time_Min.slice(0, 10)} to ${Time_Max.slice(0, 10)}`
                : 'NA'}
            </Typography>


            <Typography className={cl.denseText}>
              Regions:{' '}
              {Regions && Regions}
            </Typography>

            <Typography component={'span'}className={cl.denseText}>
              Table Name:{' '}
            </Typography>
            <Typography component={'span'}className={cl.fixedWidthText}>
              {Table_Name}
            </Typography>




          </Grid>
          <Hidden mdDown>
            <Grid item md={12} lg={4}>
              <div
                className={cl.imageWrapper}
                style={{ backgroundImage: `url('${Icon_URL}')` }}
              ></div>
            </Grid>

          </Hidden>
        </Grid>
      </Paper>
    </div>
  );
};

export default SearchResult;
