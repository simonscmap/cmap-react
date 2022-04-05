// Pop-up dialog for downloading data on catalog pages
import {
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { datasetDownloadRequestSend } from '../../../Redux/actions/catalog';
import DateSubsetControl from './DateSubsetControl';
import LatitudeSubsetControl from './LatitudeSubsetControl';
import LongitudeSubsetControl from './LongitudeSubsetControl';
import DepthSubsetControl from './DepthSubsetControl';
import {
  getDownloadAvailabilites,
  getInitialRangeValues,
  parseDataset,
} from './downloadDialogHelpers';
import styles from './downloadDialogStyles';
import ErrorMessage from './ErrorMessage';
import { DownloadDialogTitle } from './Header';
import { useTableHasAncillaryData } from '../../../Utility/Catalog/ancillaryData';
import { DownloadIntro } from './Intro';
import { AncillaryDataExplainer } from './AncillaryDataDownload';
import DownloadOption from './DownloadOption';
import DownloadStep from './DownloadStep';

const DownloadDialog = (props) => {
  let { dataset: rawDataset, dialogOpen, handleClose, classes } = props;

  // parse dataset
  let dataset, error;

  try {
    dataset = parseDataset(rawDataset);
  } catch (e) {
    console.log(`error parsing dataset`, e);
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

  // time is represented as an integer day, 0 - 12
  let [timeStart, setTimeStart] = useState(time.start);
  let [timeEnd, setTimeEnd] = useState(time.end);

  let [depthStart, setDepthStart] = useState(depth.start);
  let [depthEnd, setDepthEnd] = useState(depth.end);

  // subset is defined

  let subsetIsDefined =
    latStart !== lat.start ||
    latEnd !== lat.end ||
    lonStart !== lon.start ||
    lonEnd !== lon.end ||
    timeStart !== time.start ||
    timeEnd !== time.end ||
    depthStart !== depth.start ||
    depthEnd !== depth.end;

  let subsetParams = {
    subsetIsDefined,
    temporalResolution: dataset.Temporal_Resolution,
    lonStart,
    lonEnd,
    latStart,
    latEnd,
    timeStart,
    Time_Max: dataset.Time_Max,
    Time_Min: dataset.Time_Min,
    timeEnd,
    depthStart,
    depthEnd,
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
    console.log(`restricted availability`, availabilities);
  }

  // download options (Mui Switch state)

  const [optionsState, setDownloadOptions] = useState({
    ancillaryData: datasetHasAncillaryData,
    subset: false,
    // TODO: add metadata switch (when we provide zip archive of data & metadata)
  });

  const handleSwitch = (event) => {
    setDownloadOptions({
      ...optionsState,
      [event.target.name]: event.target.checked,
    });
  };

  // download handler
  let handleDownload = () => {
    console.log(dataset);
    dispatch(
      datasetDownloadRequestSend({
        tableName: dataset.Table_Name,
        shortName: dataset.Short_Name,
        ancillaryData: optionsState.ancillaryData,
        subsetParams,
        fileName: dataset.Long_Name,
      }),
    );
  };
  // subset controls

  let SubsetControls = () => {
    return (
      <React.Fragment>
        <DownloadOption
          downloadOption={{
            handler: handleSwitch,
            switchState: optionsState.subset,
            name: 'subset',
            label: 'Define Subset',
          }}
          description={
            'Define a subset of the data for download by specifying time, lat, lon, and depth parameters.'
          }
        />

        <Collapse in={optionsState.subset}>
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

  let dialogWidth = 'md'; // https://v4.mui.com/components/dialogs/#optional-sizes

  return (
    <Dialog
      fullScreen={false}
      className={classes.muiDialog}
      PaperProps={{
        className: classes.dialogPaper,
      }}
      open={dialogOpen}
      onClose={handleClose}
      fullWidth={true}
      maxWidth={dialogWidth}
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

            <DownloadOption
              downloadOption={{
                handler: handleSwitch,
                switchState: optionsState.ancillaryData,
                name: 'ancillaryData',
                label: 'Ancillary Data',
                disabled: !datasetHasAncillaryData,
              }}
              description={
                <AncillaryDataExplainer
                  hasAncillaryData={datasetHasAncillaryData}
                />
              }
            />

            <SubsetControls />
          </div>
        </DialogContent>
      </div>
      <DialogActions>
        <DownloadStep
          handlers={{
            handleClose,
            handleDownload,
          }}
        />
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default withStyles(styles)(DownloadDialog);
