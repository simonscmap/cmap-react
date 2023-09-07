// Pop-up dialog for downloading data on catalog pages
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'throttle-debounce';
import { datasetDownloadRequestSend, checkQuerySize } from '../../../Redux/actions/catalog';
import SubsetControls from './SubsetControls';
import {
  // getDownloadAvailabilites,
  getInitialRangeValues,
  parseDataset,
  makeDownloadQuery,
} from './downloadDialogHelpers';
import styles from './downloadDialogStyles';
import ErrorMessage from './ErrorMessage';
import { DownloadDialogTitle } from './Header';
import { useDatasetFeatures } from '../../../Utility/Catalog/useDatasetFeatures';
import { DownloadIntro } from './Intro';
import { AncillaryDataExplainer } from './AncillaryDataDownload';
import DownloadOption from './DownloadOption';
import DownloadStep from './DownloadStep';
import states from '../../../enums/asyncRequestStates';

import reduxStore from '../../../Redux/store';
import logInit from '../../../Services/log-service';
const log = logInit('dialog').addContext({
  src: 'Components/Catalog/DownloadDialog',
});

const CHECK_QUERY_DEBOUNCE_TIME_MS = 2000;

// We need to declare this outside the component (or else pass it in through props)
// because otherwise the debounce clock will get reset every re-render
let checkQuerySizeDispatch = debounce(
  CHECK_QUERY_DEBOUNCE_TIME_MS,
  (query) => {
    console.log('debounced dispatch: checkQuerySize');
    reduxStore.dispatch(checkQuerySize(query));
  });

const DownloadDialog = (props) => {
  let { dataset: rawDataset, dialogOpen, handleClose, classes } = props;

  // parse dataset
  let dataset, error;

  try {
    dataset = parseDataset(rawDataset);
  } catch (e) {
    log.error(`error parsing dataset`, { error: e });
    error = e;
  }

  let dispatch = useDispatch();

  let datasetHasAncillaryData = useDatasetFeatures(dataset.Table_Name, 'ancillary');

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

  let subsetSetters = {
    setTimeStart,
    setTimeEnd,
    setLatStart,
    setLatEnd,
    setLonStart,
    setLonEnd,
    setDepthStart,
    setDepthEnd,
  };

  // Download Button Messages
  let dlbtnMessages = {
    [states.inProgress]: 'Checking Query Size...',
    [states.notTried]: '',
    [states.failed]: 'Unable to determine query size. Download may fail due to size.',
  };

  // Button State
  const buttonStates = {
    notTried: 'not-tried',
    checkInProgress: 'in-progress',
    checkFailed: 'failed',
    checkSucceededAndDownloadAllowed: 'allowed',
    checkSucceededAndDownloadProhibited: 'prohibited',
  };

  let querySizes = useSelector((state) => state.download.querySizeChecks);
  let checkSizeRequestState = useSelector ((state) => state.download.checkQueryRequestState);
  let currentRequest = useSelector ((state) => state.download.currentRequest);


  let [downloadButtonState, setDownloadButtonState] = useState({
    enabled: false,
    message: dlbtnMessages[checkSizeRequestState] || '',
    status: buttonStates.notTried,
  });
  let disableButton = (message, status) => setDownloadButtonState({ enabled: false, message, status });
  let enableButton = (message, status) => setDownloadButtonState({ enabled: true, message, status });


  // when subset values update, initiate a querySizeCheck request (if no cached result is available)
  useEffect(() => {
    let query = makeDownloadQuery({
      subsetParams,
      ancillaryData: optionsState.ancillaryData,
      tableName: dataset.Table_Name,
    });

    let cachedSizeCheck = querySizes.find((item) => item.queryString === query);
    if (cachedSizeCheck) {
      log.debug('query size cached', cachedSizeCheck);
    } else if (query !== currentRequest && checkSizeRequestState !== states.failed) {
      // there's no cache that matches this query, and its not the current query
      checkQuerySizeDispatch(query);
    }
  }, [latStart, latEnd, lonStart, lonEnd, timeStart, timeEnd, depthStart, depthEnd]);

  // manage button state; responds to redux state
  useEffect(() => {
    console.log('use effect: querySizes', querySizes, checkSizeRequestState);
    if ([states.notTried, states.inProgress, states.failed].includes(checkSizeRequestState)) {
      console.log ('state', checkSizeRequestState);
      if (downloadButtonState.message !== dlbtnMessages[checkSizeRequestState]) {
        setDownloadButtonState({ enabled: false, message: dlbtnMessages[checkSizeRequestState] });
      }
      return;
    }

    // check if information about the current subset is cached
    let query = makeDownloadQuery({
      subsetParams,
      ancillaryData: optionsState.ancillaryData,
      tableName: dataset.Table_Name,
    });
    let cachedSizeCheck = querySizes.find((item) => item.queryString === query);

    // no result found
    if (!cachedSizeCheck) {
      return;
    }

    let responseStatus = cachedSizeCheck.result.response && cachedSizeCheck.result.response.status;
    let size = cachedSizeCheck.result.projection && cachedSizeCheck.result.projection.size;
    let allowed = cachedSizeCheck.result.allow;

    // prohibited
    if (allowed === false) {
      // update message (if needed) to disalow query
      if (responseStatus === 400 && downloadButtonState.status !== buttonStates.checkSucceededAndDownloadProhibited) {
        disableButton(
          `Subset too large (estimated ${size} matching rows)`,
          buttonStates.checkSucceededAndDownloadProhibited
        );
      } else if (responseStatus === 500) {
        enableButton(dlbtnMessages[states.failed], buttonStates.checkFailed);
      }
    }

    // allowed
    if (allowed === true) {
      // update message (if needed) to allow query
      if (downloadButtonState.status !== buttonStates.checkSucceededAndDownloadAllowed) {
        let { result: { projection } } = cachedSizeCheck;
        let estimate = (projection && projection.size && typeof projection.size === 'number') && projection.size;
        // a negative estimate is an indication that the matching rows is less than the abs(size)
        let message = (estimate && estimate > 0)
                    ? `Estimate: ${projection.size} matching rows`
                    : (estimate && estimate < 0)
                    ? `Estimate: less than ${-estimate} matching rows`
                    : ''
        enableButton(message, buttonStates.checkSucceededAndDownloadAllowed);
      }
    }
  }, [querySizes, checkSizeRequestState]);


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
    // log params, resulting query, table, & ancillary data flag
    log.debug('handleDownload', {
      subsetParams,
      query: makeDownloadQuery({
        subsetParams,
        ancillaryData: optionsState.ancillaryData,
        tableName: dataset.Table_Name,
      }),
      table: dataset.Table_Name,
      ancillaryData: optionsState.ancillaryData,
    });

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
            <DownloadIntro longName={dataset.Long_Name} />

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

            <SubsetControls
              subsetParams={subsetParams}
              subsetSetters={subsetSetters}
              dataset={dataset}
              handleSwitch={handleSwitch}
              optionsState={optionsState}
              maxDays={maxDays}
              classes={classes}
            />
          </div>
        </DialogContent>
      </div>
    <DialogActions>

        <DownloadStep
          buttonState={downloadButtonState}
          handlers={{
            handleClose,
            handleDownload,
          }}
        />
        <Button onClick={handleClose}>Cancel</Button>
    </DialogActions>
    <span>{downloadButtonState.message}</span>
    </Dialog>
  );
};

export default withStyles(styles)(DownloadDialog);
