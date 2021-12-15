// An individual result from catalog search

import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  withStyles,
  Grid,
  Typography,
  Paper,
  Tooltip,
  Link,
  Button,
} from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';

import { Link as RouterLink } from 'react-router-dom';
import CartAddOrRemove from './CartAddOrRemove';
import { setShowCart } from '../../Redux/actions/ui';
import colors from '../../enums/colors';
import Hint from '../Help/Hint';
import AddToFavorites from '../Catalog/help/addToFavoritesHint';
import DatasetTitleHint from './help/datasetTitleHint';
import DownloadDialog from './DownloadDialog';
import api from '../../api/api';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { downloadMetadata } from './DownloadMetaData';

const mapStateToProps = (state) => ({
  cart: state.cart,
});

const mapDispatchToProps = {
  setShowCart,
};

const styles = (theme) => ({
  resultWrapper: {
    padding: '4px 12px',
  },

  image: {
    maxWidth: '15vw',
    height: '170px',
    marginTop: '12px',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  gridRow: {
    textAlign: 'left',
  },

  longName: {
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '1.15rem',
    display: 'block',
    margin: '6px 0',
    color: colors.primary,
  },

  resultPaper: {
    marginTop: '22px',
    margin: '20px',
  },

  denseText: {
    fontSize: '.9rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  cartButtonClass: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    // paddingLeft: '4px',
  },

  warningIcon: {
    color: '#e3e61a',
    marginLeft: '14px',
    marginBottom: '-7px',
    fontSize: '1.45rem',
  },

  downloadLink: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    marginLeft: '2em',
    textTransform: 'none',
    textIndent: '.5em',
  },

  resultSpacingWrapper: {
    padding: '0 0 20px 0',
  },
  bottomAlignedText: {
    display: 'inline-block',
    marginBottom: '-5px',
  },
});

const SearchResult = (props) => {
  const { classes, cart, dataset, index } = props;
  const {
    // Dataset_ID,
    Data_Source,
    Depth_Max,
    Icon_URL,
    Long_Name,
    Process_Level,
    Sensors,
    Short_Name,
    Temporal_Resolution,
    Time_Max,
    Time_Min,
    Visualize,
    Spatial_Resolution,
  } = dataset;

  const AddToCartButton = ({ dataset, customId }) => {
    return (
      <CartAddOrRemove
        customId={customId}
        dataset={dataset}
        cartButtonClass={classes.cartButtonClass}
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
      <Link
        component={RouterLink}
        to={`/catalog/datasets/${Short_Name}`}
        className={classes.longName}
        onClick={() => props.setShowCart(false)}
      >
        {Long_Name}
      </Link>
    ) : (
      <Hint
        content={DatasetTitleHint}
        styleOverride={{ beacon: { left: '-1.5em' } }}
        position={{ beacon: 'left', hint: 'bottom-end' }}
        size={'medium'}
      >
        <Link
          component={RouterLink}
          to={`/catalog/datasets/${Short_Name}`}
          className={classes.longName}
          id="catalog-dataset-title-link"
          onClick={() => props.setShowCart(false)}
        >
          {Long_Name}
        </Link>
      </Hint>
    );
  };

  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [queueDownload, setQueueDownload] = useState(false);
  const [fullDataset, setDataset] = useState();
  const fetchDataset = async () => {
    let data;
    try {
      data = await api.catalog.datasetFullPageDataFetch(Short_Name);
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
    await fetchDataset();
    setQueueDownload(true);
  };

  useEffect(() => {
    if (fullDataset && queueDownload) {
      setDownloadDialogOpen(true);
      setQueueDownload(false);
    }
  }, [fullDataset, queueDownload]);

  const onDownloadMetaClick = async () => {
    let data = await fetchDataset();
    if (data) {
      downloadMetadata(Short_Name, data);
    } else {
      console.log('no data yet');
    }
  };

  return (
    <div className={classes.resultSpacingWrapper}>
      <Paper className={classes.resultPaper} elevation={4}>
        <Grid container className={classes.resultWrapper}>
          <Grid item xs={12} md={8} className={classes.gridRow}>
            {downloadDialogOpen && (
              <DownloadDialog
                dialogOpen={downloadDialogOpen}
                dataset={fullDataset}
                handleClose={() => setDownloadDialogOpen(false)}
              />
            )}
            <DatasetTitleLink />

            <Typography className={classes.denseText}>
              {Process_Level} Data from {Data_Source}
            </Typography>

            <Typography className={classes.denseText}>
              Sensor{Sensors.length > 1 ? 's' : ''}: {Sensors.join(', ')}
            </Typography>

            <Typography className={classes.denseText}>
              Temporal Resolution: {Temporal_Resolution}
            </Typography>

            <Typography className={classes.denseText}>
              Temporal Coverage:{' '}
              {Time_Min && Time_Max
                ? ` ${Time_Min.slice(0, 10)} to ${Time_Max.slice(0, 10)}`
                : 'NA'}
            </Typography>

            <Typography className={classes.denseText}>
              Spatial Resolution: {Spatial_Resolution}
            </Typography>

            <Typography className={classes.denseText}>
              {Depth_Max ? 'Multiple Depth Levels' : 'Surface Level Data'}
            </Typography>

            <AddToCart dataset={dataset} />

            <Button onClick={onDownloadClick} className={classes.downloadLink}>
              <CloudDownloadIcon />
              <span className={classes.bottomAlignedText}>Download Data</span>
            </Button>

            <Button
              onClick={onDownloadMetaClick}
              className={classes.downloadLink}
            >
              <CloudDownloadIcon />
              <span className={classes.bottomAlignedText}>
                Download MetaData
              </span>
            </Button>

            {!Visualize && cart[Long_Name] ? (
              <Tooltip
                title="This dataset contains no visualizable variables, and will not appear on the visualization page."
                placement="top"
              >
                <ErrorOutline className={classes.warningIcon} />
              </Tooltip>
            ) : (
              ''
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <img src={Icon_URL} alt={Short_Name} className={classes.image} />
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(SearchResult));
