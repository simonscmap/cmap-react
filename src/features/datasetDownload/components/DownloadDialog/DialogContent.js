import {
  DialogActions,
  DialogContent,
  Button,
  Dialog,
  CircularProgress,
} from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { ImDownload } from 'react-icons/im';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'throttle-debounce';

import { DownloadDialogTitle } from './Header';
import { DownloadIntro } from './Intro';
import { AncillaryDataExplainer } from './AncillaryDataDownload';
import ToggleWithHelp from '../../../../shared/components/ToggleWithHelp';
import DownloadStep from './DownloadStep';
import ValidationIndicatorBar from '../Helpers/ValidationIndicatorBar';
import ErrorMessage from '../Helpers/ErrorMessage';
import { validationMessages, buttonStates } from '../../utils/buttonStates';
import SubsetControls from '../../../../shared/filtering/SubsetControls';
import useSubsetFiltering from '../../../../shared/filtering/useSubsetFiltering';
import {
  parseDataset,
  makeDownloadQuery,
} from '../../utils/downloadDialogHelpers';
import styles from '../../styles/downloadDialogStyles';
import DownloadStepWithWarning from './DownloadStepWithWarning';
import {
  DropboxFileSelectionModal,
  useAutoDownload,
} from '../../../datasetDownloadDropbox';

import { datasetDownloadRequestSend, checkQuerySize } from '../../state';

import { useDatasetFeatures } from '../../../../Utility/Catalog/useDatasetFeatures';
import states from '../../../../enums/asyncRequestStates';
import reduxStore from '../../../../Redux/store';
import logInit from '../../../../Services/log-service';
import {
  selectAvailableFolders,
  selectMainFolder,
} from '../../../datasetDownloadDropbox/state/selectors';

const log = logInit(
  'features/datasetDownload/components/DownloadDialog/DialogContent',
);

const DOWNLOAD_ROWS_LIMIT = 2000000;
const CHECK_QUERY_DEBOUNCE_TIME_MS = 2000;
const DIRECT_DOWNLOAD_SUGGESTION_THRESHOLD = 200000;

// We need to declare this outside the component (or else pass it in through props)
// because otherwise the debounce clock will get reset every re-render
let checkQuerySizeDispatch = debounce(CHECK_QUERY_DEBOUNCE_TIME_MS, (query) => {
  console.log('debounced dispatch: checkQuerySize');
  reduxStore.dispatch(checkQuerySize(query));
});

const useStyles = makeStyles(styles);
const InfoDialog = (props) => {
  const { open, handleClose } = props;
  const classes = useStyles();
  return (
    <Dialog
      fullScreen={false}
      className={classes.muiDialog}
      PaperProps={{
        className: classes.dialogPaper,
      }}
      open={open}
      onClose={handleClose}
    >
      <DialogContent>
        <p>
          Use the subset controls along with the "Download" button to specify a
          subset of the data to download, or to include ancillary data in your
          download.
        </p>
        <p>
          Click the "Direct Download..." button below to download the data files
          from CMAP storage directly, with the option on large datasets to
          download the files in bulk.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// DIALOG
const DownloadDialog = (props) => {
  let { dataset: rawDataset, handleClose, dialogOpen, classes } = props;

  // parse dataset
  let dataset, error;

  try {
    dataset = parseDataset(rawDataset);
  } catch (e) {
    log.error(`error parsing dataset`, { error: e });
    error = e;
  }

  let dispatch = useDispatch();

  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [largeDatasetWarningOpen, setLargeDatasetWarningOpen] = useState(false);
  const [fileSelectionModalOpen, setFileSelectionModalOpen] = useState(false);

  let datasetHasAncillaryData = useDatasetFeatures(
    dataset.Table_Name,
    'ancillary',
  );

  // Use subset filtering hook for filtering logic - now only need subsetParams and subsetIsDefined
  const {
    subsetParams,
    subsetIsDefined,
    setInvalidFlag: hookSetInvalidFlag,
  } = useSubsetFiltering(dataset);

  // UI-specific state (moved from useSubsetControls)
  const [optionsState, setOptionsState] = useState({
    ancillaryData: datasetHasAncillaryData,
    subset: false,
    // TODO: add metadata switch (when we provide zip archive of data & metadata)
  });

  // Options switch handler (UI-specific logic)
  const handleSwitch = (event) => {
    setOptionsState((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  // Destructure individual values for easier access
  const {
    latStart,
    latEnd,
    lonStart,
    lonEnd,
    timeStart,
    timeEnd,
    depthStart,
    depthEnd,
  } = subsetParams;

  // Dropbox state - new implementation
  const availableFolders = useSelector(selectAvailableFolders);
  const mainFolder = useSelector(selectMainFolder);

  // Check if vault files are loaded - we have folders available and a main folder set
  const isVaultFilesLoaded =
    (availableFolders.hasRep ||
      availableFolders.hasNrt ||
      availableFolders.hasRaw) &&
    mainFolder !== null;

  // Auto-download hook for smart download logic
  const { handleSmartDownload } = useAutoDownload();

  // Handle download click with smart download logic
  const handleDownloadClick = () => {
    const result = handleSmartDownload();
    if (result === 'openModal') {
      setFileSelectionModalOpen(true);
    } else if (result === 'autoDownload') {
      // Close the dialog when auto-download is triggered
      handleClose();
    }
  };
  // Download Size Validation

  let downloadState = useSelector((state) => state.download);
  let querySizes = useSelector((state) => state.download.querySizeChecks);
  let checkSizeRequestState = useSelector(
    (state) => state.download.checkQueryRequestState,
  );
  let currentRequest = useSelector((state) => state.download.currentRequest);

  let [isInvalid, setInvalidFlag] = useState(false);

  // Use hook's setInvalidFlag but also maintain local isInvalid state
  const handleSetInvalidFlag = (invalid) => {
    setInvalidFlag(invalid);
    hookSetInvalidFlag(invalid);
  };

  let [downloadButtonState, setDownloadButtonState] = useState({
    enabled: false,
    message: validationMessages[checkSizeRequestState] || '',
    status: buttonStates.notTried,
  });

  let disableButton = (message, status) =>
    setDownloadButtonState({ enabled: false, message, status });
  let enableButton = (message, status) =>
    setDownloadButtonState({ enabled: true, message, status });

  // when subset values update, initiate a querySizeCheck request (if no cached result is available)
  useEffect(() => {
    //  (1) prevent an api call if we can deduce that the query is above or below the known dataset row count
    if (dataset && dataset.Row_Count) {
      if (dataset.Row_Count < DOWNLOAD_ROWS_LIMIT) {
        setDownloadButtonState({
          enabled: true,
          message: `The full dataset (${dataset.Row_Count} rows) is under the download threshold.`,
          status: buttonStates.checkSucceededAndDownloadAllowed,
        });
        return;
      } else if (!subsetIsDefined) {
        // the row count is over the limit and the download is not constrained, so prevent it
        setDownloadButtonState({
          enabled: false,
          message: `Dataset is too large (${dataset.Row_Count.toLocaleString()} rows) to download in full.  Please select a subset matching less than ~2 million rows to download.`,
          status: buttonStates.checkSucceededAndDownloadProhibited,
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
    let cachedUnconstrainedQuery = querySizes.find(
      (item) =>
        item.queryString.toLowerCase() ===
        `select%20*%20from%20${dataset.Table_Name}`.toLowerCase(),
    );
    let status =
      cachedSizeCheck &&
      cachedSizeCheck.result &&
      cachedSizeCheck.response &&
      cachedSizeCheck.result.response.status;

    log.debug('size state', {
      query,
      currentRequest,
      cachedSizeCheck,
      cachedUnconstrainedQuery,
      subsetIsDefined,
      params: {
        subset: {
          lat: [latStart, latEnd],
          lon: [lonStart, lonEnd],
          time: [timeStart, timeEnd],
          depth: [depthStart, depthEnd],
        },
      },
    });

    if (cachedSizeCheck) {
      log.debug('query size check result is cached', cachedSizeCheck);
      if (status === 500) {
        // try again
        setDownloadButtonState({
          enabled: false,
          message: 'Re-attempting Query Size Validation ...',
          status: buttonStates.checkInProgress,
        });
        checkQuerySizeDispatch(query);
      } else {
        // do nothing
      }
    } else if (
      !cachedSizeCheck &&
      !subsetIsDefined &&
      cachedUnconstrainedQuery
    ) {
      // the subset options are all at their default, which is the same as
      // a query for the full dataset, and we have a cache for that query, so don't dispatch a new one
    } else if (query !== currentRequest) {
      // there's no cache that matches this query, and its not the current query
      // it takes a moment for redux state to update, so beat it to the punch and manually update component
      // state to indicate a check is in progress
      setDownloadButtonState({
        enabled: false,
        message: 'Initiating Size Validation ...',
        status: buttonStates.checkInProgress,
      });
      checkQuerySizeDispatch(query);
    }
  }, [
    latStart,
    latEnd,
    lonStart,
    lonEnd,
    timeStart,
    timeEnd,
    depthStart,
    depthEnd,
    dialogOpen,
  ]);

  // manage button state; responds to redux state
  useEffect(() => {
    if (
      [states.notTried, states.inProgress, states.failed].includes(
        checkSizeRequestState,
      )
    ) {
      if (
        downloadButtonState.message !==
        validationMessages[checkSizeRequestState]
      ) {
        let status =
          checkSizeRequestState === states.notTried
            ? buttonStates.notTried
            : checkSizeRequestState === states.inProgress
              ? buttonStates.checkInProgress
              : checkSizeRequestState === states.failed
                ? buttonStates.checkFailed
                : buttonStates.notTried; // default

        setDownloadButtonState({
          enabled: false,
          message: validationMessages[checkSizeRequestState],
          status,
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
    let cachedUnconstrainedQuery = querySizes.find(
      (item) =>
        item.queryString.toLowerCase() ===
        `select%20*%20from%20${dataset.Table_Name}`.toLowerCase(),
    );

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

    let responseStatus =
      cachedSizeCheck.result.response && cachedSizeCheck.result.response.status;
    let size =
      cachedSizeCheck.result.projection &&
      cachedSizeCheck.result.projection.size;
    let allowed = cachedSizeCheck.result.allow;

    // prohibited
    if (allowed === false) {
      // update message (if needed) to disalow query
      if (
        responseStatus === 400 &&
        downloadButtonState.status !==
          buttonStates.checkSucceededAndDownloadProhibited
      ) {
        disableButton(
          `Subset too large ${
            size
              ? '(estimated ' + size.toLocaleString() + ' matching rows)'
              : ''
          }. Try selecting a smaller subset.`,
          buttonStates.checkSucceededAndDownloadProhibited,
        );
        setOptionsState({
          ...optionsState,
          subset: true,
        });
      } else if (responseStatus === 500) {
        enableButton(
          validationMessages[states.failed],
          buttonStates.checkFailed,
        );
      }
    }

    // allowed
    if (allowed === true) {
      // update message (if needed) to allow query
      if (
        downloadButtonState.status !==
        buttonStates.checkSucceededAndDownloadAllowed
      ) {
        let {
          result: { projection },
        } = cachedSizeCheck;
        let estimate =
          projection &&
          projection.size &&
          typeof projection.size === 'number' &&
          projection.size;
        // a negative estimate is an indication that the matching rows is less than the abs(size)
        let message =
          estimate && estimate > 0
            ? `The selected subset of data is under the download threshold. An estimated ${projection.size.toLocaleString()} rows match the selected subset.`
            : estimate && estimate < 0
              ? `The dataset ${
                  estimate ? '(' + -estimate.toLocaleString() + ' rows)' : ''
                } is under the download threshold and may be downloaded in full.`
              : '';
        enableButton(message, buttonStates.checkSucceededAndDownloadAllowed);
      }
    }
  }, [
    querySizes,
    checkSizeRequestState,
    subsetParams,
    optionsState,
    dataset.Table_Name,
    downloadButtonState.message,
    downloadButtonState.status,
    subsetIsDefined,
  ]);

  // open dropbox modal

  // download handler
  let handleDownload = () => {
    if (
      dataset.Row_Count > DIRECT_DOWNLOAD_SUGGESTION_THRESHOLD &&
      !optionsState.ancillaryData &&
      !subsetIsDefined
    ) {
      setLargeDatasetWarningOpen(true);
      return;
    }

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
      <ValidationIndicatorBar
        downloadState={downloadState}
        buttonState={downloadButtonState}
      />
      <DownloadDialogTitle longName={dataset.Long_Name} />

      <div className={classes.dialogInnerWrapper}>
        <DialogContent
          className={classes.dialogContent}
          classes={{ root: classes.dialogRoot }}
        >
          <div className={classes.stepContent}>
            <DownloadIntro longName={dataset.Long_Name} />

            <ToggleWithHelp
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
              dataset={dataset}
              optionsState={optionsState}
              handleSwitch={handleSwitch}
              setInvalidFlag={handleSetInvalidFlag}
              classes={classes}
            />
          </div>
        </DialogContent>
      </div>
      <DialogActions>
        {dataset.Row_Count > DIRECT_DOWNLOAD_SUGGESTION_THRESHOLD &&
        !optionsState.ancillaryData &&
        !subsetIsDefined ? (
          <DownloadStepWithWarning
            onOpenWarning={() => setLargeDatasetWarningOpen(true)}
            buttonState={downloadButtonState}
            isInvalid={isInvalid}
          />
        ) : (
          <DownloadStep
            buttonState={downloadButtonState}
            isInvalid={isInvalid}
            handlers={{
              handleClose,
              handleDownload,
            }}
          />
        )}
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
      <div className={classes.bottomPlate}>
        <div className={classes.dropboxOptionWrapper}>
          {/* <Button
            className={classes.dropboxButton}
            onClick={() => window.open(vaultLink?.shareLink, '_blank')}
            disabled={!vaultLink?.shareLink}
            startIcon={
              !vaultLink?.shareLink ? (
                <CircularProgress size={20} />
              ) : (
                <ImDownload />
              )
            }
          >
            <span>
              {!vaultLink?.shareLink
                ? 'Loading Direct Download...'
                : 'Direct Download from CMAP Storage'}
            </span>
          </Button> */}
          <Button
            className={classes.dropboxButton}
            onClick={handleDownloadClick}
            disabled={!isVaultFilesLoaded}
            startIcon={
              !isVaultFilesLoaded ? (
                <CircularProgress size={20} />
              ) : (
                <ImDownload />
              )
            }
          >
            <span>
              {!isVaultFilesLoaded
                ? 'Loading Direct Download...'
                : 'Direct Download from CMAP Storage'}
            </span>
          </Button>
          <div className={classes.infoLink}>
            <InfoDialog
              open={infoDialogOpen}
              handleClose={() => setInfoDialogOpen(false)}
            />
            <a onClick={() => setInfoDialogOpen(true)}>
              <InfoOutlinedIcon />
            </a>
          </div>
        </div>
      </div>
      <LargeDatasetWarningDialog
        open={largeDatasetWarningOpen}
        handleClose={() => setLargeDatasetWarningOpen(false)}
        handleDownload={() => {
          setLargeDatasetWarningOpen(false);
          handleClose(); // Close the main dialog
          // Proceed with the actual download
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
        }}
        handleDirectDownload={() => {
          setLargeDatasetWarningOpen(false);
          handleDownloadClick();
        }}
        dataset={dataset}
        rowCount={dataset.Row_Count}
      />
      <DropboxFileSelectionModal
        open={fileSelectionModalOpen}
        handleClose={(closeParentToo) => {
          setFileSelectionModalOpen(false);
          if (closeParentToo) {
            handleClose(); // Close the parent dialog as well
          }
        }}
        dataset={dataset}
      />
    </div>
  );
};

const LargeDatasetWarningDialog = (props) => {
  const {
    open,
    handleClose,
    handleDownload,
    handleDirectDownload,
    // vaultLink,
    rowCount,
  } = props;
  const classes = useStyles();

  return (
    <Dialog
      fullScreen={false}
      className={classes.muiDialog}
      PaperProps={{
        className: classes.dialogPaper,
      }}
      open={open}
      onClose={handleClose}
    >
      <DialogContent>
        <p>
          This dataset contains{' '}
          {rowCount && rowCount.toLocaleString
            ? rowCount.toLocaleString()
            : rowCount}{' '}
          rows. For faster download, you can use the Direct Download option.
          Alternatively, you can continue with the standard download process.
        </p>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleDirectDownload}
          color="primary"
          variant="contained"
          style={{ minWidth: 120, marginRight: 8 }}
        >
          Direct Download
        </Button>
        <Button onClick={handleDownload} color="primary">
          Continue with Standard Download
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
export default withStyles(styles)(DownloadDialog);
