import React, { useState } from 'react';
import {
  DialogActions,
  DialogContent,
  Button,
  Dialog,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import styles from './downloadDialogStyles';

const useStyles = makeStyles(styles);

const DropboxFileSelectionModal = (props) => {
  const { open, handleClose, vaultLink } = props;
  const classes = useStyles();
  const [selectedFiles, setSelectedFiles] = useState([]);

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

  // Handle select all for a specific category
  const handleSelectCategory = (category, isSelected) => {
    if (isSelected) {
      const categoryFiles =
        (vaultLink && vaultLink.files && vaultLink.files[category]) || [];
      const newSelectedFiles = [...selectedFiles];
      categoryFiles.forEach((file) => {
        if (!selectedFiles.some((f) => f.path === file.path)) {
          newSelectedFiles.push(file);
        }
      });
      setSelectedFiles(newSelectedFiles);
    } else {
      const categoryFilePaths = (
        (vaultLink && vaultLink.files && vaultLink.files[category]) ||
        []
      ).map((file) => file.path);
      setSelectedFiles(
        selectedFiles.filter((file) => !categoryFilePaths.includes(file.path)),
      );
    }
  };

  // Check if all files in a category are selected
  const isCategorySelected = (category) => {
    const categoryFiles =
      (vaultLink && vaultLink.files && vaultLink.files[category]) || [];
    if (categoryFiles.length === 0) {
      return false;
    }
    return categoryFiles.every((file) =>
      selectedFiles.some((f) => f.path === file.path),
    );
  };

  // Handle download button click
  const handleSubmit = () => {
    console.log('Selected files for download:', selectedFiles);
    handleClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      className={classes.muiDialog}
      PaperProps={{
        className: classes.dialogPaper,
      }}
    >
      <DialogContent>
        <Typography variant="h6">Select Files to Download</Typography>
        <Typography variant="body2" gutterBottom>
          Dataset: {vaultLink && vaultLink.shortName}
        </Typography>

        {/* REP Files */}
        {vaultLink &&
          vaultLink.files &&
          vaultLink.files.rep &&
          vaultLink.files.rep.length > 0 && (
            <>
              <Typography variant="subtitle1" style={{ marginTop: 16 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCategorySelected('rep')}
                      onChange={(e) =>
                        handleSelectCategory('rep', e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label={
                    <strong>REP Files ({vaultLink.files.rep.length})</strong>
                  }
                />
              </Typography>
              <List dense>
                {vaultLink.files.rep.map((file, index) => (
                  <ListItem
                    key={`rep-${index}`}
                    dense
                    button
                    onClick={() => handleToggleFile(file)}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedFiles.some((f) => f.path === file.path)}
                      tabIndex={-1}
                      disableRipple
                      color="primary"
                    />
                    <ListItemText
                      primary={file.name}
                      secondary={file.sizeFormatted}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

        {/* NRT Files */}
        {vaultLink &&
          vaultLink.files &&
          vaultLink.files.nrt &&
          vaultLink.files.nrt.length > 0 && (
            <>
              <Typography variant="subtitle1" style={{ marginTop: 16 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCategorySelected('nrt')}
                      onChange={(e) =>
                        handleSelectCategory('nrt', e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label={
                    <strong>NRT Files ({vaultLink.files.nrt.length})</strong>
                  }
                />
              </Typography>
              <List dense>
                {vaultLink.files.nrt.map((file, index) => (
                  <ListItem
                    key={`nrt-${index}`}
                    dense
                    button
                    onClick={() => handleToggleFile(file)}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedFiles.some((f) => f.path === file.path)}
                      tabIndex={-1}
                      disableRipple
                      color="primary"
                    />
                    <ListItemText
                      primary={file.name}
                      secondary={file.sizeFormatted}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

        {/* RAW Files */}
        {vaultLink &&
          vaultLink.files &&
          vaultLink.files.raw &&
          vaultLink.files.raw.length > 0 && (
            <>
              <Typography variant="subtitle1" style={{ marginTop: 16 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCategorySelected('raw')}
                      onChange={(e) =>
                        handleSelectCategory('raw', e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label={
                    <strong>RAW Files ({vaultLink.files.raw.length})</strong>
                  }
                />
              </Typography>
              <List dense>
                {vaultLink.files.raw.map((file, index) => (
                  <ListItem
                    key={`raw-${index}`}
                    dense
                    button
                    onClick={() => handleToggleFile(file)}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedFiles.some((f) => f.path === file.path)}
                      tabIndex={-1}
                      disableRipple
                      color="primary"
                    />
                    <ListItemText
                      primary={file.name}
                      secondary={file.sizeFormatted}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

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
