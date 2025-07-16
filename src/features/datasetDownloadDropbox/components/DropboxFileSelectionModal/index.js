import React, { useMemo, useState } from 'react';
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
} from '../../state/selectors';
import {
  useFileSelection,
  useDropboxDownload,
  useFilePagination,
} from '../../hooks';
import { formatBytes, getTabConfiguration } from '../../utils';
import FileTable from '../FileTable';
import PaginationControls from '../PaginationControls';
import TabNavigation from '../TabNavigation';
import TabPanel from '../TabPanel';

const useStyles = makeStyles((theme) => ({
  ...styles(theme),
}));

const DropboxFileSelectionModal = (props) => {
  const { open, handleClose, dataset } = props;
  const classes = useStyles();
  const dispatch = useDispatch();

  const dropboxDownloadState = useSelector((state) => state.dropbox || {});
  const vaultFilesPagination = useSelector(
    (state) => state.dropbox.vaultFilesPagination || {},
  );
  const availableFolders = useSelector(selectAvailableFolders);
  const mainFolder = useSelector(selectMainFolder);
  const currentTabFromState = useSelector(selectCurrentTab);

  // Tab configuration
  const tabConfig = useMemo(() => {
    return getTabConfiguration(availableFolders, mainFolder);
  }, [availableFolders, mainFolder]);

  // Local tab state - defaults to current tab from state or main folder
  const [activeTab, setActiveTab] = useState(currentTabFromState || mainFolder || 'rep');

  const allFiles = useMemo(() => {
    return vaultFilesPagination.currentPageFiles || [];
  }, [vaultFilesPagination.currentPageFiles]);

  const {
    selectedFiles,
    totalSize,
    handleToggleFile,
    handleSelectAll,
    clearSelections,
    areAllSelected,
  } = useFileSelection(allFiles);

  useDropboxDownload(dropboxDownloadState, handleClose, dataset);

  const { handlePageChange, handlePageSizeChange } = useFilePagination(
    dataset,
    vaultFilesPagination,
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
      ),
    );
  };

  const onPageSizeChange = (event) => {
    handlePageSizeChange(event, clearSelections);
  };

  if (!dataset) {
    return null;
  }

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={() => handleClose(false)}
      className={classes.muiDialog}
      style={{ zIndex: 9999 }}
      PaperProps={{
        className: classes.dialogPaper,
        style: { overflow: 'visible' },
      }}
    >
      <DialogContent style={{ overflow: 'visible' }}>
        <Typography variant="h6">Select Files to Download</Typography>
        <Typography variant="body2" gutterBottom>
          Dataset: {dataset.Short_Name}
          {vaultFilesPagination.totalFileCount && (
            <span> • Total Files: {vaultFilesPagination.totalFileCount}</span>
          )}
        </Typography>

        {tabConfig.showTabs && (
          <TabNavigation
            currentTab={activeTab}
            tabs={tabConfig.tabs}
            onChange={setActiveTab}
          />
        )}

        {tabConfig.tabs.map((tab) => (
          <TabPanel key={tab.key} value={activeTab} index={tab.key}>
            <FileTable
              allFiles={allFiles}
              selectedFiles={selectedFiles}
              areAllSelected={areAllSelected}
              onSelectAll={handleSelectAll}
              onToggleFile={handleToggleFile}
              isLoading={vaultFilesPagination.backend && vaultFilesPagination.backend.isLoading}
            />

            <PaginationControls
              currentPage={vaultFilesPagination.local && vaultFilesPagination.local.currentPage}
              totalPages={vaultFilesPagination.local && vaultFilesPagination.local.totalPages}
              pageSize={vaultFilesPagination.local && vaultFilesPagination.local.pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={onPageSizeChange}
              isLoading={vaultFilesPagination.backend && vaultFilesPagination.backend.isLoading}
            />
          </TabPanel>
        ))}

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
          Download Selected Files
        </Button>
        <Button onClick={() => handleClose(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DropboxFileSelectionModal;
