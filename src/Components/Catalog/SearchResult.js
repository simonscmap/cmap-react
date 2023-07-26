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
  Chip,
} from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';

import { Link as RouterLink } from 'react-router-dom';
import CartAddOrRemove from './CartAddOrRemove';
import { setShowCart } from '../../Redux/actions/ui';
// import colors from '../Home/theme';
import Hint from '../Navigation/Help/Hint';
import AddToFavorites from '../Catalog/help/addToFavoritesHint';
import DatasetTitleHint from './help/datasetTitleHint';
import DownloadDialog from './DownloadDialog';
import api from '../../api/api';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { downloadMetadata } from './DownloadMetaData';
import { useDatasetFeatures } from '../../Utility/Catalog/useDatasetFeatures';

const mapStateToProps = ({ cart, tablesWithAncillaryData }) => ({
  cart,
  tablesWithAncillaryData,
});

const mapDispatchToProps = {
  setShowCart,
};

const styles = (theme) => ({
  resultWrapper: {
    padding: '4px 12px',
  },
  imageWrapper: {
    height: '180px',
    margin: '10px 3px -27px 0',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
    backgroundPosition: 'center right',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    backgroundOrigin: 'content-box',
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
    color: theme.palette.primary.main,
  },
  resultPaper: {
    marginTop: '22px',
    margin: '0 20px 0 0',
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
  '@media (min-width: 1280px) and (max-width: 1482px)': {
    downloadLink: {
      backgroundColor: 'rgb(33, 82, 108, 0.9)',
      boxShadow:
        '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      '&:hover': {
        background: 'rgb(33, 82, 108, 0.4)',
      },
    },
  },
  [theme.breakpoints.down('sm')]: {
    downloadLink: {
      backgroundColor: 'none',
      boxShadow: 'none',
      '&:hover': {
        background: 'none',
      },
    },
  },
  resultSpacingWrapper: {
    padding: '0 0 20px 0',
  },
  resultActions: {
    display: 'flex',
    flexDirection: 'row',
    textAlign: 'left',
  },
  '@media (max-width: 690px)': {
    resultActions: {
      flexDirection: 'column',
    },
    downloadLink: {
      margin: 0,
      justifyContent: 'left',
    },
  },
  bottomAlignedText: {
    display: 'inline-block',
    marginBottom: '-5px',
  },
});

const SearchResult = (props) => {
  const { classes, cart, index } = props;
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
    Table_Name,
  } = props.dataset;

  let features = useDatasetFeatures(Table_Name);

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
      <React.Fragment>
        <Link
          component={RouterLink}
          to={`/catalog/datasets/${Short_Name}`}
          className={classes.longName}
          onClick={() => props.setShowCart(false)}
        >
          {Long_Name}
        </Link>
        <AncillaryDataChip />
        <CIDataChip />
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
            className={classes.longName}
            id="catalog-dataset-title-link"
            onClick={() => props.setShowCart(false)}
          >
            {Long_Name}
          </Link>
        </Hint>
        <AncillaryDataChip />
        <CIDataChip />
      </React.Fragment>
    );
  };

  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [queueDownload, setQueueDownload] = useState(false);
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
                dataset={fullDataset.dataset}
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
            <div
              className={classes.imageWrapper}
              style={{ backgroundImage: `url('${Icon_URL}')` }}
            ></div>
          </Grid>

          <div className={classes.resultActions}>
            <AddToCart dataset={props.dataset} />

            <Button onClick={onDownloadClick} className={classes.downloadLink}>
              <CloudDownloadIcon />
              <span className={classes.bottomAlignedText}>Download Data</span>
            </Button>

            {false && (
              <Button
                onClick={onDownloadMetaClick}
                className={classes.downloadLink}
              >
                <CloudDownloadIcon />
                <span className={classes.bottomAlignedText}>
                  Download MetaData
                </span>
              </Button>
            )}
          </div>
        </Grid>
      </Paper>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(SearchResult));
