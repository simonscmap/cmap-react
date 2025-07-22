import React, { useMemo } from 'react';
import {
  DialogActions,
  DialogContent,
  Button,
  Dialog,
  Typography,
  Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../../../../Components/Catalog/DownloadDialog/downloadDialogStyles';
import { dropboxFilesDownloadRequest } from '../../state/actions';
import {
  selectAvailableFolders,
  selectMainFolder,
  selectCurrentTab,
  selectFolderPagination,
  selectFolderFiles,
  selectFolderPaginationInfo,
} from '../../state/selectors';
import {
  useFileSelectionPerFolder,
  useDropboxDownload,
  useFolderPagination,
} from '../../hooks';
import { formatBytes, getTabConfiguration } from '../../utils';
import FileTable from '../FileTable';
import PaginationControls from '../PaginationControls';
import TabNavigation from '../TabNavigation';
import TabPanel from '../TabPanel';
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

  // Get folder-specific pagination
  const folderPagination = useSelector((state) =>
    selectFolderPagination(state, activeTab),
  );
  const folderFiles = useSelector((state) =>
    selectFolderFiles(state, activeTab),
  );
  const folderPaginationInfo = useSelector((state) =>
    selectFolderPaginationInfo(state, activeTab),
  );

  const allFiles = useMemo(() => {
    return folderFiles || [];
  }, [folderFiles]);

  const {
    selectedFiles,
    totalSize,
    handleToggleFile,
    handleSelectAll,
    handleSelectAllInFolder,
    handleClearPageSelections,
    clearSelections,
    areAllSelected,
    areIndeterminate,
  } = useFileSelectionPerFolder(allFiles, activeTab);

  useDropboxDownload(dropboxDownloadState, handleClose, dataset);

  const { handlePageChange, handlePageSizeChange } = useFolderPagination(
    dataset,
    folderPagination,
    activeTab,
  );

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
        totalSize,
      ),
    );
  };

  const onPageSizeChange = (event) => {
    handlePageSizeChange(event);
  };

  if (!dataset) {
    return null;
  }

  // Check if we're still loading initial data or no data exists yet
  const isInitialLoading =
    !folderPagination ||
    (!folderPagination && !folderFiles.length) ||
    (folderPaginationInfo.isLoading && !folderFiles.length);

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
          {folderPaginationInfo.totalFileCount && (
            <span> • Total Files: {folderPaginationInfo.totalFileCount}</span>
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
                isLoading={folderPaginationInfo.isLoading}
              />

              <PaginationControls
                currentPage={folderPaginationInfo.currentPage}
                totalPages={folderPaginationInfo.totalPages}
                pageSize={folderPaginationInfo.pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={onPageSizeChange}
                isLoading={folderPaginationInfo.isLoading}
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
          <Typography variant="subtitle1">
            <strong>Selected: {selectedFiles.length} files</strong>
            {selectedFiles.length > 0 && ` (${formatBytes(totalSize)})`}
          </Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={selectedFiles.length === 0}
        >
          Download {activeTab === 'raw' ? 'Raw' : 'Main'} Files
        </Button>
        <Button onClick={() => handleClose(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DropboxFileSelectionModal;
