// An individual result from used in reccommendation datasets

import React from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
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
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import styles from '../DatasetCardCompact.styles';
import DatasetTitleHint from '../help/datasetTitleHint';
import Hint from '../../Navigation/Help/Hint';
import { useDatasetFeatures } from '../../../Utility/Catalog/useDatasetFeatures';
import { downloadDialogOpen } from '../../../Redux/actions/ui';

const useStyles = makeStyles(styles);

const SearchResult = (props) => {
  const cl = useStyles();
  const { index } = props;
  const {
    Icon_URL,
    Long_Name,
    Short_Name,
    Time_Max,
    Time_Min,
    Table_Name,
    Regions,
  } = props.dataset;

  const dispatch = useDispatch();

  /* Dataset Features (Chips) */
  const features = useDatasetFeatures(Table_Name);

  const AncillaryDataChip = () => {
    if (features && features.ancillary) {
      return (
        <Chip
          className={cl.chip}
          color="primary"
          size="small"
          label="Ancillary Data"
        />
      );
    } else {
      return '';
    }
  };

  const CIDataChip = () => {
    if (features && features.ci) {
      return (
        <Chip
          className={cl.chip}
          color="primary"
          size="small"
          label="Continuously Updated"
        />
      );
    } else {
      return '';
    }
  };

  const DatasetTitleLink = () => {
    return index !== 0 ? (
      <React.Fragment>
        <Link
          component={RouterLink}
          to={`/catalog/datasets/${Short_Name}`}
          className={cl.longName}
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
          >
            {Long_Name}
          </Link>
        </Hint>
      </React.Fragment>
    );
  };

  const onDownloadClick = async () => {
    dispatch(downloadDialogOpen(Short_Name));
  };

  return (
    <div className={cl.resultSpacingWrapper}>
      <Paper className={cl.resultPaper} elevation={4}>
        <Grid container className={cl.resultWrapper}>
          <Grid item md={12} lg={8} className={cl.gridRow}>
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

            <Typography className={cl.denseText}>
              Temporal Coverage:{' '}
              {Time_Min && Time_Max
                ? ` ${Time_Min.slice(0, 10)} to ${Time_Max.slice(0, 10)}`
                : 'NA'}
            </Typography>

            <Typography className={cl.denseText}>
              Regions: {Regions && Regions}
            </Typography>

            <Typography component={'span'} className={cl.denseText}>
              Table Name:{' '}
            </Typography>
            <Typography component={'span'} className={cl.fixedWidthText}>
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
