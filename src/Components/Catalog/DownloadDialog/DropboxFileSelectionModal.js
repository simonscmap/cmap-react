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

  // Prepare a flat list of all files with their folder information
  const allFiles = React.useMemo(() => {
    if (!vaultLink || !vaultLink.files) {
      return [];
    }

    const files = [];

    // Add files from each category with folder information
    if (vaultLink.files.rep) {
      vaultLink.files.rep.forEach((file) =>
        files.push({ ...file, folder: 'REP' }),
      );
    }

    if (vaultLink.files.nrt) {
      vaultLink.files.nrt.forEach((file) =>
        files.push({ ...file, folder: 'NRT' }),
      );
    }

    if (vaultLink.files.raw) {
      vaultLink.files.raw.forEach((file) =>
        files.push({ ...file, folder: 'RAW' }),
      );
    }

    return files;
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
    console.log('Selected files for download:', selectedFiles);
    handleClose();
  };

  // Check if all files are selected
  const areAllSelected =
    allFiles.length > 0 && selectedFiles.length === allFiles.length;

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
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
                <TableCell>Folder</TableCell>
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
                  <TableCell>{file.folder}</TableCell>
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
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DropboxFileSelectionModal;
