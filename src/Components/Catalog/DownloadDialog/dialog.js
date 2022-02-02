// Pop-up dialog for downloading data on catalog pages
import { Dialog, DialogActions, DialogContent } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import temporalResolutions from '../../../enums/temporalResolutions';
import { csvDownloadRequestSend } from '../../../Redux/actions/visualization';
import DateSubsetControl from './DateSubsetControl';
import {
  dayToDate,
  getInitialRangeValues,
  getSubsetDataPointsCount,
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

  let [latStart, setLatStart] = useState(lat.start);
  let [latEnd, setLatEnd] = useState(lat.end);

  let [lonStart, setLonStart] = useState(lon.start);
  let [lonEnd, setLonEnd] = useState(lon.end);

  // time is representes as an integer day, 0 - 12
  let [timeStart, setTimeStart] = useState(time.start);
  let [timeEnd, setTimeEnd] = useState(time.end);

  let [depthStart, setDepthStart] = useState(depth.start);
  let [depthEnd, setDepthEnd] = useState(depth.end);

  let handleFullDatasetDownload = (tableName) => {
    let query = `select%20*%20from%20${tableName}`;
    const fileName = dataset.Long_Name;
    dispatch(csvDownloadRequestSend(query, fileName, tableName));
  };

  let handleSubsetDownload = () => {
    let { Table_Name, Long_Name, Temporal_Resolution } = dataset;
    let query = makeSubsetQuery({
      tableName: dataset.Table_Name,
      temporalResolution: dataset.Temporal_Resolution,
      lonStart,
      lonEnd,
      latStart,
      latEnd,
      timeStart,
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

  const datasetIsMonthlyClimatology =
    dataset.Temporal_Resolution === temporalResolutions.monthlyClimatology;

  const [subsetDataPointsCount, totalDataPoints] = getSubsetDataPointsCount(
    dataset,
    {
      lat: [latStart, latEnd],
      lon: [lonStart, lonEnd],
      time: [timeStart, timeEnd],
      depth: [depthStart, depthEnd],
    },
  );

  const fullDatasetAvailable = totalDataPoints < 20000000;
  const subsetAvailable = subsetDataPointsCount <= 20000000;

  const availability = {
    fullDatasetAvailable,
    subsetAvailable,
    subsetDataPointsCount,
  };

  // these strings are for subset download
  // they are turned into Date objects by the handler
  const timeString1 = datasetIsMonthlyClimatology
    ? time[0]
    : dayToDate(time.start, timeStart);
  const timeString2 = datasetIsMonthlyClimatology
    ? time[1]
    : dayToDate(time.start, timeEnd);

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
          <Availability availabilityStatus={availability} />

          {/* Ancillary Data Step */}
          {/* Metadata */}
          {/* Subset */}
          <DateSubsetControl
            dataset={dataset}
            setTimeStart={setTimeStart}
            setTimeEnd={setTimeEnd}
            state={{ timeStart, timeEnd, maxDays }}
          />

          <LatitudeSubsetControl />
          <LongitudeSubsetControl />
          <DepthSubsetControl />
        </DialogContent>
        <DialogActions>
          <Execution />
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default withStyles(styles)(DownloadDialog2);
