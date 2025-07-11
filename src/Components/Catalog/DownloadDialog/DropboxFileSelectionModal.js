import React, { useState, useEffect } from 'react';
import {
  DialogActions,
  DialogContent,
  Button,
  Dialog,
  Checkbox,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import styles from './downloadDialogStyles';
import {
  dropboxFilesDownloadRequest,
  dropboxFilesDownloadClear,
  fetchVaultFilesPage,
  resetVaultFilesPagination,
} from '../../../Redux/actions/dropbox';
import { useDispatch, useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  ...styles(theme),
  container: {
    marginTop: theme.spacing(2),
    maxHeight: '400px',
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
  },
  table: {
    '& th': {
      fontWeight: 'bold',
      backgroundColor: 'rgba(30, 67, 113, 1)',
      color: theme.palette.common.white,
    },
    '& td': {
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: 'rgba(30, 67, 113, 0.2)',
    },
  },
  paginationControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
  },
  paginationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  loadingOverlay: {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  loadingSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1,
  },
}));

const DropboxFileSelectionModal = (props) => {
  const { open, handleClose, vaultLink } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Redux state selectors
  const dropboxDownloadState = useSelector((state) => state.dropbox || {});
  const vaultFilesPagination = useSelector(
    (state) => state.dropbox.vaultFilesPagination || {},
  );

  // Reset pagination when modal closes
  useEffect(() => {
    return () => {
      if (!open) {
        dispatch(resetVaultFilesPagination());
        setSelectedFiles([]); // Clear selections when modal closes
      }
    };
  }, [open, dispatch]);

  // Handle saga results
  useEffect(() => {
    if (dropboxDownloadState.success && dropboxDownloadState.downloadLink) {
      // Trigger download using the provided download link
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = dropboxDownloadState.downloadLink;
      a.download = `${vaultLink?.shortName || 'dataset'}_files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clear the dropbox download state to prevent re-triggering
      dispatch(dropboxFilesDownloadClear());

      // Close modal with success state
      handleClose(true, { isSuccess: true });
    } else if (dropboxDownloadState.error) {
      // Close modal with error state
      handleClose(false, {
        isError: true,
        message: dropboxDownloadState.error,
      });
    }
  }, [dropboxDownloadState, handleClose, vaultLink]);

  // Use files from vaultLink - now paginated
  const allFiles = React.useMemo(() => {
    if (!vaultLink || !vaultLink.files) {
      return [];
    }

    // Backend now returns paginated files from only one directory (REP, NRT, or RAW)
    return vaultLink.files || [];
  }, [vaultLink]);

  // Calculate total size and count for selected files
  const totalSize = React.useMemo(() => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  }, [selectedFiles]);

  const formatBytes = (bytes) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  };

  // Toggle file selection
  const handleToggleFile = (file) => {
    const fileIndex = selectedFiles.findIndex((f) => f.path === file.path);
    if (fileIndex === -1) {
      setSelectedFiles([...selectedFiles, file]);
    } else {
      setSelectedFiles(selectedFiles.filter((_, index) => index !== fileIndex));
    }
  };

  // Handle select all files
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedFiles(allFiles);
    } else {
      setSelectedFiles([]);
    }
  };

  // Handle download button click
  const handleSubmit = () => {
    if (!vaultLink) {
      return;
    }

    // Show loading state
    const loadingState = {
      isLoading: true,
      message: 'Preparing your download...',
    };
    handleClose(false, loadingState);

    // Dispatch the redux action to start the download process
    dispatch(
      dropboxFilesDownloadRequest(
        vaultLink.shortName,
        vaultLink.datasetId,
        selectedFiles.map((file) => ({
          path: file.path,
          name: file.name,
        })),
      ),
    );
  };

  // Check if all files on current page are selected
  const areAllSelected =
    allFiles.length > 0 && selectedFiles.length === allFiles.length;

  // Handle page change
  const handlePageChange = (direction) => {
    if (direction === 'next' && vaultFilesPagination.hasMore) {
      dispatch(
        fetchVaultFilesPage(vaultLink.shortName, {
          cursor: vaultFilesPagination.cursor,
          pageSize: vaultFilesPagination.pageSize,
        }),
      );
    } else if (direction === 'prev' && vaultFilesPagination.page > 1) {
      // For previous page, we need to use page number
      dispatch(
        fetchVaultFilesPage(vaultLink.shortName, {
          page: vaultFilesPagination.page - 1,
          pageSize: vaultFilesPagination.pageSize,
        }),
      );
    }
  };

  // Handle page size change
  const handlePageSizeChange = (event) => {
    const newPageSize = event.target.value;
    // Reset to first page with new page size
    dispatch(
      fetchVaultFilesPage(vaultLink.shortName, {
        page: 1,
        pageSize: newPageSize,
      }),
    );
    // Clear selections when changing page size
    setSelectedFiles([]);
  };

  // Don't render if vaultLink is not available
  if (!vaultLink) {
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
          Dataset: {vaultLink.shortName}
          {vaultFilesPagination.totalCount && (
            <span> • Total Files: {vaultFilesPagination.totalCount}</span>
          )}
        </Typography>

        <Box position="relative">
          {vaultFilesPagination.isLoading && (
            <CircularProgress className={classes.loadingSpinner} />
          )}
          <TableContainer
            component={Paper}
            className={`${classes.container} ${
              vaultFilesPagination.isLoading ? classes.loadingOverlay : ''
            }`}
          >
            <Table stickyHeader className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedFiles.length > 0 &&
                        selectedFiles.length < allFiles.length
                      }
                      checked={areAllSelected}
                      onChange={handleSelectAll}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>Filename</TableCell>
                  <TableCell>Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allFiles.map((file, index) => (
                  <TableRow
                    key={`file-${index}`}
                    className={classes.row}
                    hover
                    onClick={() => handleToggleFile(file)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedFiles.some(
                          (f) => f.path === file.path,
                        )}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{file.name}</TableCell>
                    <TableCell>
                      {file.sizeFormatted || formatBytes(file.size)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Pagination Controls */}
        <div className={classes.paginationControls}>
          <div className={classes.paginationInfo}>
            <FormControl variant="outlined" size="small">
              <InputLabel>Page Size</InputLabel>
              <Select
                value={vaultFilesPagination.pageSize || 25}
                onChange={handlePageSizeChange}
                label="Page Size"
              >
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={250}>250</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body2">
              Page {vaultFilesPagination.page || 1}
              {vaultFilesPagination.totalPages &&
                ` of ${vaultFilesPagination.totalPages}`}
            </Typography>
          </div>

          <div>
            <Button
              onClick={() => handlePageChange('prev')}
              disabled={
                vaultFilesPagination.page <= 1 || vaultFilesPagination.isLoading
              }
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange('next')}
              disabled={
                !vaultFilesPagination.hasMore || vaultFilesPagination.isLoading
              }
            >
              Next
            </Button>
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* Summary */}
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
