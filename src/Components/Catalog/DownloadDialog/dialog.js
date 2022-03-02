// Pop-up dialog for downloading data on catalog pages
import {
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  useMediaQuery,
  Switch,
  FormControlLabel,
} from '@material-ui/core';
import { withStyles, useTheme } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { csvDownloadRequestSend } from '../../../Redux/actions/visualization';
import DateSubsetControl from './DateSubsetControl';
import LatitudeSubsetControl from './LatitudeSubsetControl';
import LongitudeSubsetControl from './LongitudeSubsetControl';
import DepthSubsetControl from './DepthSubsetControl';
import {
  getDownloadAvailabilites,
  getInitialRangeValues,
  makeSubsetQuery,
  makeSubsetQueryWithAncillaryData,
  parseDataset,
} from './downloadDialogHelpers';
import styles from './downloadDialogStyles';
import ErrorMessage from './ErrorMessage';
import { DownloadDialogTitle } from './Header';
import { useTableHasAncillaryData } from '../../../Utility/Catalog/ancillaryData';
import { DownloadIntro } from './Intro';
import AncillaryDataDownload from './AncillaryDataDownload';
import DownloadMetadata from './MetadataDownload';
import useDownloadMetadata from './useDownloadMetadata';
import DownloadFull from './DownloadFull';
import DownloadSubset from './DownloadSubset';

const DownloadDialog2 = (props) => {
  // detect small screen
  let theme = useTheme();
  let isMdOrSmaller = useMediaQuery(theme.breakpoints.down('md'));
  let isShort = window.innerHeight < 1000;
  let dialogShouldBeFullScreen = isMdOrSmaller || isShort;

  let { dataset: rawDataset, dialogOpen, handleClose, classes } = props;

  // parse dataset
  let dataset, error;

  try {
    dataset = parseDataset(rawDataset);
  } catch (e) {
    console.log(e);
    error = e;
  }

  let dispatch = useDispatch();

  let datasetHasAncillaryData = useTableHasAncillaryData(dataset.Table_Name);

  let { maxDays, lat, lon, time, depth } = getInitialRangeValues(dataset);

  // state for subset parameters
  let [latStart, setLatStart] = useState(lat.start);
  let [latEnd, setLatEnd] = useState(lat.end);

  let [lonStart, setLonStart] = useState(lon.start);
  let [lonEnd, setLonEnd] = useState(lon.end);

  // time is representes as an integer day, 0 - 12
  let [timeStart, setTimeStart] = useState(time.start);
  let [timeEnd, setTimeEnd] = useState(time.end);

  console.log(depth.start);
  let [depthStart, setDepthStart] = useState(depth.start);
  let [depthEnd, setDepthEnd] = useState(depth.end);

  let subsetIsNotTheSameAsDataset =
    depthStart !== depth.start ||
    depthEnd !== depth.end ||
    timeStart !== time.start ||
    timeEnd !== time.end ||
    lonStart !== lon.start ||
    lonEnd !== lon.end ||
    latStart !== lat.start ||
    latEnd !== lat.end;

  let [openSubsetControls, setOpenSubsetControls] = useState({
    openSubset: false,
  });

  // download handlers

  let [downloadMetadata] = useDownloadMetadata(dataset.Short_Name);

  let handleFullDatasetDownload = () => {
    let query = `select%20*%20from%20${dataset.Table_Name}`;
    const fileName = dataset.Long_Name;
    dispatch(csvDownloadRequestSend(query, fileName, dataset.Table_Name));
  };

  let handleSubsetDownload = () => {
    let {
      Table_Name,
      Long_Name,
      Temporal_Resolution,
      Time_Max,
      Time_Min,
    } = dataset;

    let query = makeSubsetQuery({
      tableName: Table_Name,
      temporalResolution: Temporal_Resolution,
      lonStart,
      lonEnd,
      latStart,
      latEnd,
      timeStart,
      Time_Max,
      Time_Min,
      timeEnd,
      depthStart,
      depthEnd,
    });

    let fileName = Long_Name;
    let tableName = Table_Name;
    dispatch(csvDownloadRequestSend(query, fileName, tableName));
  };

  let handleSubsetWithAncillaryDataDownload = () => {
    let {
      Table_Name,
      Long_Name,
      Time_Max,
      Time_Min,
      Temporal_Resolution,
    } = dataset;

    let query = makeSubsetQueryWithAncillaryData({
      tableName: Table_Name,
      temporalResolution: Temporal_Resolution,
      lonStart,
      lonEnd,
      latStart,
      latEnd,
      timeStart,
      timeEnd,
      Time_Max,
      Time_Min,
      depthStart,
      depthEnd,
    });

    let fileName = Long_Name;
    let tableName = Table_Name;
    dispatch(csvDownloadRequestSend(query, fileName, tableName));
  };

  // calculations used to allow/disallow size of download
  let subsetState = {
    lat: [latStart, latEnd],
    lon: [lonStart, lonEnd],
    time: [timeStart, timeEnd],
    depth: [depthStart, depthEnd],
  };

  // calculate availabilities (uses magic numbers, see helper for implementation)
  let downloadAvailabilities = getDownloadAvailabilites(dataset, subsetState);
  let availabilities = { ...downloadAvailabilities, datasetHasAncillaryData };

  if (!availabilities.fullDatasetAvailable) {
    console.log(availabilities);
  }

  let SubsetControls = () => {
    /* let message;
     * if (availabilities.fullDatasetAvailable) {
     *   message =
     *     'The full dataset is available for download, but if you would like to download only a subset, you can control the spatial and temporal ranges here.';
     * } else {
     *   if (availabilities.subsetAvailable) {
     *     message =
     *       'The full dataset is too large but the subset defined here is available.';
     *   } else {
     *     message = `The full dataset is too large, and the subset defined below contains ${availabilities.subsetDataPointsCount.toLocaleString(
     *       'en-US',
     *     )} data points, please constrain the parameters until it contains less that 20,000,000 data points.`;
     *   }
     * } */

    return (
      <React.Fragment>
        <FormControlLabel
          control={
            <Switch
              checked={openSubsetControls.openSubset}
              onChange={(event) =>
                setOpenSubsetControls({
                  openSubset: !openSubsetControls.openSubset,
                })
              }
              name="openSubset"
              color="primary"
            />
          }
          label="Subset Controls"
        />
        <Collapse in={openSubsetControls.openSubset}>
          <div
            className={classes.subsetStep}
          >
            <DateSubsetControl
              dataset={dataset}
              setTimeStart={setTimeStart}
              setTimeEnd={setTimeEnd}
              subsetState={{ timeStart, timeEnd, maxDays }}
            />

            <LatitudeSubsetControl
              dataset={dataset}
              setLatStart={setLatStart}
              setLatEnd={setLatEnd}
              subsetState={{ latStart, latEnd }}
            />

            <LongitudeSubsetControl
              dataset={dataset}
              setLonStart={setLonStart}
              setLonEnd={setLonEnd}
              subsetState={{ lonStart, lonEnd }}
            />

            <DepthSubsetControl
              dataset={dataset}
              setDepthStart={setDepthStart}
              setDepthEnd={setDepthEnd}
              subsetState={{ depthStart, depthEnd }}
            />
          </div>
        </Collapse>
      </React.Fragment>
    );
  };

  // Render

  if (error) {
    return <ErrorMessage description={error} />;
  }

  return (
    <Dialog
      fullScreen={dialogShouldBeFullScreen}
      className={classes.muiDialog}
      PaperProps={{
        className: classes.dialogPaper,
      }}
      open={dialogOpen}
      onClose={handleClose}
      maxWidth={false}
    >
      <DownloadDialogTitle longName={dataset.Long_Name} />

      <div className={classes.dialogInnerWrapper}>
        <DialogContent
          className={classes.dialogContent}
          classes={{ root: classes.dialogRoot }}
        >
          <div className={classes.stepContent}>
            <DownloadIntro
              longName={dataset.Long_Name}
              availabilityStatus={availabilities}
            />
            <DownloadFull
              handleFullDatasetDownload={handleFullDatasetDownload}
            />

            <DownloadMetadata downloadMetadata={downloadMetadata} />

            <AncillaryDataDownload
              datasetHasAncillaryData={datasetHasAncillaryData}
              handleSubsetWithAncillaryDataDownload={
                handleSubsetWithAncillaryDataDownload
              }
            />

            <DownloadSubset
              handleSubsetDownload={handleSubsetDownload}
              isDefined={subsetIsNotTheSameAsDataset}
            />

            <SubsetControls />
          </div>
        </DialogContent>
      </div>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default withStyles(styles)(DownloadDialog2);
