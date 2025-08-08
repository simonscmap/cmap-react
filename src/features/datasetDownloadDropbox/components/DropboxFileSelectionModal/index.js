import React, { useMemo } from 'react';
import {
  DialogActions,
  DialogContent,
  Button,
  Dialog,
  Typography,
  Divider,
  Box,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../../../../Components/Catalog/DownloadDialog/downloadDialogStyles';
import { dropboxFilesDownloadRequest } from '../../state/actions';
import {
  selectAvailableFolders,
  selectMainFolder,
  selectCurrentTab,
  selectFolderPagination,
  selectFolderAllCachedFiles,
  selectActivePageFiles,
  selectActivePaginationInfo,
} from '../../state/selectors';
import {
  useFileSelectionPerFolder,
  useDropboxDownload,
  useSearchPagination,
} from '../../hooks';
import {
  formatBytes,
  formatEstimatedTime,
  getTabConfiguration,
} from '../../utils';
import {
  MAX_FILES_LIMIT,
  MAX_SIZE_LIMIT_BYTES,
} from '../../constants/defaults';
import { SEARCH_ACTIVATION_THRESHOLD } from '../../constants/searchConstants';
import FileTable from '../FileTable';
import PaginationControls from '../PaginationControls';
import TabNavigation from '../TabNavigation';
import TabPanel from '../TabPanel';
import SearchInterface from '../SearchInterface';
// import SearchResults from '../SearchResults'; // Now integrated into SearchInput dropdown
import { setCurrentFolderTab } from '../../state/actions';

const useStyles = makeStyles((theme) => ({
  ...styles(theme),
}));

const DropboxFileSelectionModal = (props) => {
  const { open, handleClose, dataset } = props;
  const classes = useStyles();
  const dispatch = useDispatch();

  const dropboxDownloadState = useSelector((state) => state.dropbox || {});
  const availableFolders = useSelector(selectAvailableFolders);
  const mainFolder = useSelector(selectMainFolder);
  const currentTabFromState = useSelector(selectCurrentTab);

  // Tab configuration
  const tabConfig = useMemo(() => {
    return getTabConfiguration(availableFolders, mainFolder);
  }, [availableFolders, mainFolder]);

  // Use current tab from state or main folder
  const activeTab = currentTabFromState || mainFolder || 'rep';

  // Get active pagination (search or folder based on context)
  const folderPagination = useSelector((state) =>
    selectFolderPagination(state, activeTab),
  );
  const activePageFiles = useSelector((state) =>
    selectActivePageFiles(state, activeTab),
  );
  const activePaginationInfo = useSelector((state) =>
    selectActivePaginationInfo(state, activeTab),
  );
  const allCachedFiles = useSelector((state) =>
    selectFolderAllCachedFiles(state, activeTab),
  );

  // Use search pagination hook to manage dynamic pagination context
  const {
    handlePageChange: searchAwarePageChange,
    handlePageSizeChange: searchAwarePageSizeChange,
  } = useSearchPagination(dataset, activeTab);

  const allFiles = useMemo(() => {
    // Always use activePageFiles which comes from the correct pagination context
    return activePageFiles || [];
  }, [activePageFiles]);

  // Check if search interface should be shown (same logic as SearchInterface)
  const shouldShowSearchInterface =
    allCachedFiles.length > SEARCH_ACTIVATION_THRESHOLD;

  const {
    selectedFiles,
    estimatedTimeSeconds,
    handleToggleFile,
    handleSelectAll,
    handleSelectAllInFolder,
    handleClearPageSelections,
    clearSelections,
    areAllSelected,
    areIndeterminate,
    currentTabFileCount,
    currentTabTotalSize,
    isCurrentTabFileLimitReached,
    isCurrentTabSizeLimitReached,
    canSelectFile,
  } = useFileSelectionPerFolder(allFiles, activeTab);

  useDropboxDownload(dropboxDownloadState, handleClose, dataset);

  const handleSubmit = () => {
    if (!dataset) {
      return;
    }

    const loadingState = {
      isLoading: true,
      message: 'Preparing your download...',
    };
    handleClose(false, loadingState);

    dispatch(
      dropboxFilesDownloadRequest(
        dataset.Short_Name,
        dataset.Dataset_ID,
        selectedFiles.map((file) => ({
          path: file.path,
          name: file.name,
        })),
      ),
    );
  };

  const onPageSizeChange = (event) => {
    searchAwarePageSizeChange(event);
  };

  if (!dataset) {
    return null;
  }

  // Check if we're still loading initial data or no data exists yet
  const isInitialLoading =
    !folderPagination ||
    (!folderPagination && !activePageFiles.length) ||
    (activePaginationInfo.isLoading && !activePageFiles.length);

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={() => handleClose(false)}
      className={classes.muiDialog}
      PaperProps={{
        className: classes.dialogPaper,
        style: { overflow: 'visible' },
      }}
    >
      <DialogContent style={{ overflow: 'visible' }}>
        <Typography variant="h6">Select Files to Download</Typography>
        <Typography variant="body2" gutterBottom>
          Dataset: {dataset.Short_Name}
          {activePaginationInfo.totalFileCount && (
            <span> • Total Files: {activePaginationInfo.totalFileCount}</span>
          )}
        </Typography>

        {tabConfig.showTabs && (
          <TabNavigation
            currentTab={activeTab}
            tabs={tabConfig.tabs}
            onChange={(newTab) => dispatch(setCurrentFolderTab(newTab))}
          />
        )}

        {isInitialLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Typography variant="body1">Loading files...</Typography>
          </div>
        ) : (
          tabConfig.tabs.map((tab) => (
            <TabPanel key={tab.key} value={activeTab} index={tab.key}>
              {/* Show SearchInterface only when there are enough files */}
              {shouldShowSearchInterface && (
                <SearchInterface
                  files={allCachedFiles}
                  folderType={activeTab}
                />
              )}

              {/* Always show FileTable with dynamic file array */}
              <FileTable
                allFiles={allFiles}
                selectedFiles={selectedFiles}
                areAllSelected={areAllSelected}
                areIndeterminate={areIndeterminate}
                onSelectAll={handleSelectAll}
                onSelectAllInFolder={handleSelectAllInFolder}
                onClearPageSelections={handleClearPageSelections}
                onClearAll={clearSelections}
                onToggleFile={handleToggleFile}
                isLoading={activePaginationInfo.isLoading}
                isCurrentTabFileLimitReached={isCurrentTabFileLimitReached}
                canSelectFile={canSelectFile}
                isCurrentTabSizeLimitReached={isCurrentTabSizeLimitReached}
              />

              {/* Always show PaginationControls - they work for both search and folder contexts */}
              <PaginationControls
                currentPage={activePaginationInfo.currentPage}
                totalPages={activePaginationInfo.totalPages}
                pageSize={activePaginationInfo.pageSize}
                onPageChange={searchAwarePageChange}
                onPageSizeChange={onPageSizeChange}
                isLoading={activePaginationInfo.isLoading}
              />
            </TabPanel>
          ))
        )}

        <Divider style={{ margin: '16px 0' }} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="subtitle1"
            style={{
              visibility: currentTabFileCount > 0 ? 'visible' : 'hidden',
            }}
          >
            <strong>
              Selected: {currentTabFileCount}/{MAX_FILES_LIMIT} files
            </strong>
            {` (${formatBytes(currentTabTotalSize)} / ${formatBytes(
              MAX_SIZE_LIMIT_BYTES,
            )})`}
            <br />
            <span style={{ fontSize: '0.9em' }}>
              Estimated time to start download:{' '}
              {formatEstimatedTime(estimatedTimeSeconds)}
            </span>
          </Typography>
        </div>

        {/* File limit warnings */}
        {isCurrentTabFileLimitReached && (
          <Box mt={2}>
            <Alert severity="warning">
              File limit reached! You have selected the maximum of{' '}
              {MAX_FILES_LIMIT} files. To select more files, please remove some
              current selections first.
            </Alert>
          </Box>
        )}

        {/* Size limit warnings */}
        {isCurrentTabSizeLimitReached && (
          <Box mt={2}>
            <Alert severity="warning">
              Size limit reached! You have selected the maximum of{' '}
              {formatBytes(MAX_SIZE_LIMIT_BYTES)}. To select more files, please
              remove some current selections first.
            </Alert>
          </Box>
        )}

        {/* Show warning when approaching file limit */}
        {(() => {
          const remainingFileSlots = MAX_FILES_LIMIT - currentTabFileCount;
          return (
            !isCurrentTabFileLimitReached &&
            remainingFileSlots <= 50 &&
            remainingFileSlots > 0 && (
              <Box mt={2}>
                <Alert severity="info">
                  You can select {remainingFileSlots} more files before reaching
                  the {MAX_FILES_LIMIT} file limit.
                </Alert>
              </Box>
            )
          );
        })()}

        {/* Show warning when approaching size limit */}
        {(() => {
          const remainingSizeCapacity =
            MAX_SIZE_LIMIT_BYTES - currentTabTotalSize;
          return (
            !isCurrentTabSizeLimitReached &&
            remainingSizeCapacity <= 200 * 1024 * 1024 &&
            remainingSizeCapacity > 0 && (
              <Box mt={2}>
                <Alert severity="info">
                  You have {formatBytes(remainingSizeCapacity)} remaining before
                  reaching the {formatBytes(MAX_SIZE_LIMIT_BYTES)} size limit.
                </Alert>
              </Box>
            )
          );
        })()}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={currentTabFileCount === 0}
        >
          Download {activeTab === 'raw' ? 'Raw' : 'Main'} Files
        </Button>
        <Button onClick={() => handleClose(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DropboxFileSelectionModal;
