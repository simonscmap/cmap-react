import React, { useState } from 'react';
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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import styles from './downloadDialogStyles';
import catalogAPI from '../../../api/catalogRequests';

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
}));

const DropboxFileSelectionModal = (props) => {
  const { open, handleClose, vaultLink } = props;
  const classes = useStyles();
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Prepare a flat list of all files - now simplified since backend returns files from one directory only
  const allFiles = React.useMemo(() => {
    if (!vaultLink || !vaultLink.files) {
      return [];
    }

    // Backend now returns files from only one directory (REP, NRT, or RAW)
    // We can directly use the files without folder categorization
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
  const handleSubmit = async () => {
    try {
      // Show loading state
      const loadingState = {
        isLoading: true,
        message: 'Preparing your download...',
      };
      handleClose(false, loadingState);

      const response = await catalogAPI.downloadDropboxVaultFiles(
        vaultLink.shortName,
        vaultLink.datasetId,
        selectedFiles.map((file) => ({
          filePath: file.path,
          name: file.name,
        })),
      );
      console.log(
        '🐛🐛🐛 DropboxFileSelectionModal.js:134 response:',
        response,
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Parse the JSON response to get the download link
      const responseData = await response.json();
      if (!responseData.success || !responseData.downloadLink) {
        throw new Error(responseData.message || 'Download link not received');
      }

      // Trigger download using the provided download link
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = responseData.downloadLink;
      a.download = `${vaultLink.shortName}_files.zip`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);

      // Close modal with success state
      handleClose(true, { isSuccess: true });
    } catch (error) {
      console.error('Download error:', error);
      // Close modal with error state
      handleClose(false, { isError: true, message: error.message });
    }
  };

  // Check if all files are selected
  const areAllSelected =
    allFiles.length > 0 && selectedFiles.length === allFiles.length;

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
          Dataset: {vaultLink && vaultLink.shortName}
        </Typography>

        <TableContainer component={Paper} className={classes.container}>
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
                      checked={selectedFiles.some((f) => f.path === file.path)}
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
