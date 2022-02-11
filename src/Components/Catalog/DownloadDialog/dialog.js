// Pop-up dialog for downloading data on catalog pages
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  useMediaQuery,
  Typography,
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
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import AboutDownloadStep from './AboutDownloadStep';
import DownloadStep from './DownloadStep';
import AncillaryDataStep from './AncillaryDataStep';
import MetadataStep from './MetadataStep';
import useDownloadMetadata from './useDownloadMetadata';

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

  let [depthStart, setDepthStart] = useState(depth.start);
  let [depthEnd, setDepthEnd] = useState(depth.end);

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

  // steps state, controls, and content

  // default to TRUE to include ancillary data, if there is ancillary data
  let [includeAncillaryData, setIncludeAncillaryData] = useState(
    datasetHasAncillaryData && true,
  );

  // handler to toggle whether ancillary data is included
  let handleIncludeAncillaryData = (event) => {
    setIncludeAncillaryData(event.target.checked);
  };

  // metadata
  let [includeMetadata, setIncludeMetadata] = useState(false);

  let handleIncludeMetadata = (event) => {
    setIncludeMetadata(event.target.checked);
  };

  let SubsetControls = () => {
    let message;
    if (availabilities.fullDatasetAvailable) {
      message = 'The full dataset is available for download, but if you would like to download only a subset, you can control the spatial and temporal ranges here.';
    } else {
      if (availabilities.subsetAvailable) {
        message = 'The full dataset is too large but the subset defined here is available.'
      } else {
        message = `The full dataset is too large, and the subset defined below contains ${availabilities.subsetDataPointsCount.toLocaleString('en-US')} data points, please constrain the parameters until it contains less that 20,000,000 data points.`
      }
    }
    return (
      <React.Fragment>
      <Typography variant="h5" style={{ margin: '0 0 10px 0'}}>Define a subset</Typography>
      <Typography>{message}</Typography>

      <div className={classes.subsetStep}>
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
          setLatStart={setDepthStart}
          setLatEnd={setDepthEnd}
          subsetState={{ depthStart, depthEnd }}
        />
      </div>
      </React.Fragment>
    );
  };

  // steps
  let stepLabels = [
    'How To',
    'Include Ancillary Data',
    'Include Metadata',
    'Define Subset',
    'Download',
  ];

  // state for step ui
  const [activeStep, setActiveStep] = useState(0);

  function getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <AboutDownloadStep
            longName={dataset.Long_Name}
            availabilityStatus={availabilities}
          />
        );
      case 1:
        return (
          <AncillaryDataStep
            datasetHasAncillaryData={datasetHasAncillaryData}
            includeAncillaryData={includeAncillaryData}
            handleIncludeAncillaryData={handleIncludeAncillaryData}
          />
        );
      case 2:
        return (
          <MetadataStep
            includeMetadata={includeMetadata}
            handleIncludeMetadata={handleIncludeMetadata}
          />
        );
      case 3:
        return <SubsetControls />;
      case 4:
        return (
          <DownloadStep
            availabilities={availabilities}
            includeMetadata={includeMetadata}
            includeAncillaryData={includeAncillaryData}
            handleSubsetDownload={handleSubsetDownload}
            handleFullDatasetDownload={handleFullDatasetDownload}
            handleSubsetWithAncillaryDataDownload={
              handleSubsetWithAncillaryDataDownload
            }
            downloadMetadata={downloadMetadata}
          />
        );
      default:
        return '';
    }
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      let val =
        prevActiveStep < stepLabels.length
          ? prevActiveStep + 1
          : prevActiveStep;
      return val;
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep > 0 ? prevActiveStep - 1 : 0,
    );
  };

  let ForwardAndBackButtons = () => {
    return (
      <div>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          className={classes.backButton}
        >
          Back
        </Button>
        <Button
          disabled={activeStep === stepLabels.length - 1}
          variant="contained"
          color="primary"
          onClick={handleNext}
        >
          {'Next'}
        </Button>
      </div>
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
          <Stepper activeStep={activeStep} alternativeLabel>
            {stepLabels.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <div className={classes.stepContent}>
            {getStepContent(activeStep)}
          </div>
        </DialogContent>

      </div>
        <DialogActions>
          <div className={classes.stepActions}>
            <ForwardAndBackButtons />
          </div>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
    </Dialog>
  );
};

export default withStyles(styles)(DownloadDialog2);
