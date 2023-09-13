// Pop-up dialog for downloading data on catalog pages
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Typography,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'throttle-debounce';
import { datasetDownloadRequestSend, checkQuerySize, clearFailedSizeChecks } from '../../../Redux/actions/catalog';
import SubsetControls from './SubsetControls';
import {
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
import Spinner from '../../UI/Spinner';
import Spacer from '../../Common/Spacer';
import Center from '../../Common/Center';
import LoginForm from '../../User/LoginForm';

import reduxStore from '../../../Redux/store';
import logInit from '../../../Services/log-service';
const log = logInit('dialog').addContext({
  src: 'Components/Catalog/DownloadDialog',
});

const CHECK_QUERY_DEBOUNCE_TIME_MS = 2000;
const DOWNLOAD_ROWS_LIMIT = 2000000;

// We need to declare this outside the component (or else pass it in through props)
// because otherwise the debounce clock will get reset every re-render
let checkQuerySizeDispatch = debounce(
  CHECK_QUERY_DEBOUNCE_TIME_MS,
  (query) => {
    console.log('debounced dispatch: checkQuerySize');
    reduxStore.dispatch(checkQuerySize(query));
});

const EmbeddedLogin = () => {
  return (
    <div>
      <Spacer>
        <Center>
          <LoginForm title="Please login to download data" />
        </Center>
      </Spacer>
    </div>
  );
}

const DialogWrapper = (props) => {
  let { dataset, dialogOpen, classes, handleClose } = props;
  let dispatch = useDispatch ();
  let user = useSelector((state) => state.user);

  let close = () => {
    dispatch (clearFailedSizeChecks ());
    handleClose();
  }

  let dialogWidth = 'md'; // https://v4.mui.com/components/dialogs/#optional-sizes
  if (!dialogOpen) {
    return '';
  } else {
   return (<Dialog
      fullScreen={false}
      className={classes.muiDialog}
      PaperProps={{
        className: classes.dialogPaper,
      }}
      open={dialogOpen}
      onClose={close}
      fullWidth={true}
      maxWidth={dialogWidth}
     >
     { (!!user && !!dataset)
       ? <DownloadDialog {...props} />
       : (!user)
       ? <EmbeddedLogin />
       : (user && !dataset)
       ? <Spacer><Spinner message="Loading Dataset" /></Spacer>
       : '' }
    </Dialog>);
  }
};


// DIALOG
const DownloadDialog = withStyles(styles)((props) => {
  let {
    dataset: rawDataset,
    handleClose,
    dialogOpen,
    classes
  } = props;

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
    //  (1) prevent an api call if we can deduce that the query is above or below the known dataset row count
    if (dataset && dataset.Row_Count) {
      if (dataset.Row_Count < DOWNLOAD_ROWS_LIMIT) {
        setDownloadButtonState({
          enabled: true,
          message: `The full dataset (${dataset.Row_Count} rows) is under the download threshold.`,
          status: buttonStates.checkSucceededAndDownloadAllowed
        });
        return;
      } else if (!subsetIsDefined) {
        // the row count is over the limit and the download is not constrained, so prevent it
        setDownloadButtonState({
          enabled: false,
          message: `Dataset is too large (${dataset.Row_Count.toLocaleString()} rows) to download in full.  Please select a subset matching less than ~2 million rows to download.`,
          status: buttonStates.checkSucceededAndDownloadProhibited
        });
        return;
      }
    }

    // (2)  use cache or make api call to get size check
    let query = makeDownloadQuery({
      subsetParams,
      ancillaryData: optionsState.ancillaryData,
      tableName: dataset.Table_Name,
    });

    let cachedSizeCheck = querySizes.find((item) => item.queryString === query);
    let cachedUnconstrainedQuery = querySizes
          .find((item) => item.queryString.toLowerCase() === `select%20*%20from%20${dataset.Table_Name}`.toLowerCase());
    let status = cachedSizeCheck && cachedSizeCheck.result && cachedSizeCheck.response && cachedSizeCheck.result.response.status;

    log.debug ('size state', {
      query,
      currentRequest,
      cachedSizeCheck,
      cachedUnconstrainedQuery,
      subsetIsDefined,
      params: {
        subset: {
          lat: [latStart, latEnd],
          lon: [lonStart, lonEnd],
          time:[ timeStart, timeEnd],
          depth: [depthStart, depthEnd]
        },
        limits: {
          lat: [lat.start, lat.end],
          lon: [lon.start, lon.end],
          time: [time.start, time.end],
          depth: [depth.start, depth.end],
        }
      }
    })

    if (cachedSizeCheck) {
      log.debug('query size check result is cached', cachedSizeCheck);
      if (status === 500) {
        // try again
        setDownloadButtonState({
          enabled: false,
          message: 'Re-attempting Query Size Validation ...',
          status: buttonStates.checkInProgress
        });
        checkQuerySizeDispatch(query);
      } else {
        // do nothing
      }
    } else if (!cachedSizeCheck && !subsetIsDefined && cachedUnconstrainedQuery) {
      // the subset options are all at their default, which is the same as
      // a query for the full dataset, and we have a cache for that query, so don't dispatch a new one
    } else if (query !== currentRequest) {
      // there's no cache that matches this query, and its not the current query
      // it takes a moment for redux state to update, so beat it to the punch and manually update component
      // state to indicate a check is in progress
      setDownloadButtonState({
        enabled: false,
        message: 'Initiating Size Validation ...',
        status: buttonStates.checkInProgress
      });
      checkQuerySizeDispatch(query);
    }
  }, [latStart, latEnd, lonStart, lonEnd, timeStart, timeEnd, depthStart, depthEnd, dialogOpen]);


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
    let cachedUnconstrainedQuery = querySizes
          .find((item) => item.queryString.toLowerCase() === `select%20*%20from%20${dataset.Table_Name}`.toLowerCase());

    // no result found
    if (!cachedSizeCheck) {
      if (!subsetIsDefined && cachedUnconstrainedQuery) {
        // the subset options are all at their default, which is the same as
        // a query for the full dataset, and we have a cache for that query, so don't dispatch a new one
        cachedSizeCheck = cachedUnconstrainedQuery;
      } else {
        return;
      }
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
                    ? `The selected subset of data is under the download threshold. An estimated ${projection.size.toLocaleString()} rows match the selected subset.`
                    : (estimate && estimate < 0)
                    ? `The dataset (${-estimate.toLocaleString()} rows) is under the download threshold and may be downloaded in full.`
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


  return (
    <div>
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
    </div>
  );
});

export default withStyles(styles)(DialogWrapper);
