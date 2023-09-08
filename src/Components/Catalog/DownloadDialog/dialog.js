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
import ValidationIndicatorBar from './ValidationIndicatorBar';
import states from '../../../enums/asyncRequestStates';
import { validationMessages, buttonStates } from './buttonStates';

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


// DIALOG
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

  // Download Options (Mui Switch state)
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

  // Download Size Validation

  let downloadState = useSelector((state) => state.download);
  let querySizes = useSelector((state) => state.download.querySizeChecks);
  let checkSizeRequestState = useSelector ((state) => state.download.checkQueryRequestState);
  let currentRequest = useSelector ((state) => state.download.currentRequest);

  let [downloadButtonState, setDownloadButtonState] = useState({
    enabled: false,
    message: validationMessages[checkSizeRequestState] || '',
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
      // do nothing
      log.debug('query size check result is cached', cachedSizeCheck);
    } else if (query !== currentRequest) {
      // there's no cache that matches this query, and its not the current query
      // it takes a moment for redux state to update, so beat it to the punch and manually update component
      // state to indicate a check is in progress
      setDownloadButtonState({
        enabled: false,
        message: 'Initating Check...',
        status: buttonStates.checkInProgress
      });
      checkQuerySizeDispatch(query);
    }
  }, [latStart, latEnd, lonStart, lonEnd, timeStart, timeEnd, depthStart, depthEnd]);


  // manage button state; responds to redux state
  useEffect(() => {
    if ([states.notTried, states.inProgress, states.failed].includes(checkSizeRequestState)) {
      if (downloadButtonState.message !== validationMessages[checkSizeRequestState]) {
        let status = checkSizeRequestState === states.notTried ? buttonStates.notTried
                   : checkSizeRequestState === states.inProgress
                   ? buttonStates.checkInProgress
                   : checkSizeRequestState === states.failed
                   ? buttonStates.checkFailed
                   : buttonStates.notTried; // default

        setDownloadButtonState({
          enabled: false,
          message: validationMessages[checkSizeRequestState],
          status
        });
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
          `Subset too large (estimated ${size.toLocaleString()} matching rows). Try selecting a smaller subset.`,
          buttonStates.checkSucceededAndDownloadProhibited
        );
        setDownloadOptions({
          ...optionsState,
          subset: true,
        })
      } else if (responseStatus === 500) {
        enableButton(validationMessages[states.failed], buttonStates.checkFailed);
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
                    ? `An estimated ${projection.size.toLocaleString()} rows match the current subset.`
                    : (estimate && estimate < 0)
                    ? `The full dataset (${-estimate.toLocaleString()} rows) is under the download threshold`
                    : ''
        enableButton(message, buttonStates.checkSucceededAndDownloadAllowed);
      }
    }
  }, [querySizes, checkSizeRequestState]);



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
    <ValidationIndicatorBar downloadState={downloadState} buttonState={downloadButtonState}/>
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
    </Dialog>
  );
};

export default withStyles(styles)(DownloadDialog);
