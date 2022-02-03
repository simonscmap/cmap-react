// Pop-up dialog for downloading data on catalog pages
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
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
  parseDataset,
} from './downloadDialogHelpers';
import styles from './downloadDialogStyles';
import ErrorMessage from './ErrorMessage';
import { Availability, DownloadDialogTitle } from './Header';

const DownloadDialog2 = (props) => {
  let { dataset: rawDataset, dialogOpen, handleClose, classes } = props;
  let dispatch = useDispatch();

  let dataset, error;
  try {
    dataset = parseDataset(rawDataset);
  } catch (e) {
    console.log(e);
    error = e;
  }

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

  let handleFullDatasetDownload = (tableName) => {
    let query = `select%20*%20from%20${tableName}`;
    const fileName = dataset.Long_Name;
    dispatch(csvDownloadRequestSend(query, fileName, tableName));
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

  if (error) {
    return <ErrorMessage description={error} />;
  }

  // calculations used to allow/disallow size of download
  let subsetState = {
    lat: [latStart, latEnd],
    lon: [lonStart, lonEnd],
    time: [timeStart, timeEnd],
    depth: [depthStart, depthEnd],
  };

  // calculate availabilities (uses magic numbers, see helper for implementation)
  let availabilities = getDownloadAvailabilites(dataset, subsetState);

  return (
    <div id="data-download-dialog">
      <Dialog
        PaperProps={{
          className: classes.dialogPaper,
        }}
        open={dialogOpen}
        onClose={handleClose}
        maxWidth={false}
      >
        <DownloadDialogTitle longName={dataset.Long_Name} />

        <DialogContent
          className={classes.dialogContent}
          classes={{ root: classes.dialogRoot }}
        >
          <Availability availabilityStatus={availabilities} />

          {/* Ancillary Data Step */}
          {/* Metadata */}
          {/* Subset */}
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
            setLatStart={setLonStart}
            setLatEnd={setLonEnd}
            subsetState={{ lonStart, lonEnd }}
          />

          <DepthSubsetControl
            dataset={dataset}
            setLatStart={setDepthStart}
            setLatEnd={setDepthEnd}
            subsetState={{ depthStart, depthEnd }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button disabled={!availabilities.subsetAvailable} onClick={handleSubsetDownload}>
            Download Subset
          </Button>
          <Button
            disabled={!availabilities.fullDatasetAvailable}
            onClick={handleFullDatasetDownload}
          >
            Download Full Dataset
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default withStyles(styles)(DownloadDialog2);
