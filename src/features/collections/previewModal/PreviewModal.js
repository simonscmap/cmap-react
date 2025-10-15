import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { usePreviewModalStyles } from './previewModalStyles';
import CollectionStatistics from '../components/CollectionStatistics';
import UniversalButton from '../../../shared/components/UniversalButton';
import CollectionDownloadModal from '../myCollections/CollectionDownloadModal';
import CollectionDatasetsTable from '../components/CollectionDatasetsTable';
import useCollectionsStore from '../state/collectionsStore';
import { snackbarOpen } from '../../../Redux/actions/ui';
import ConfirmationDialog from '../../../shared/components/ConfirmationDialog';
import { DialogContentText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useBulletListStyles = makeStyles((theme) => ({
  bulletList: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },
}));

const PreviewModal = ({ open, onClose, collection }) => {
  const classes = usePreviewModalStyles();
  const bulletListClasses = useBulletListStyles();
  const dispatch = useDispatch();

  // Zustand store selectors
  const copyCollection = useCollectionsStore((state) => state.copyCollection);

  // Local state (UI-specific)
  const [copying, setCopying] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [warningDialogData, setWarningDialogData] = useState(null);

  if (!collection) return null;

  const formatCreatedDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle data loaded from table
  const handleDataLoaded = (data, calculatedTotalRows) => {
    setTotalRows(calculatedTotalRows);
  };

  // Handle errors from table
  const handleTableError = (message, severity) => {
    dispatch(
      snackbarOpen(message, {
        severity: severity || 'error',
        position: 'bottom',
      }),
    );
  };

  // Prepare statistics for CollectionStatistics component
  const stats = [
    {
      value: collection.datasetCount || 0,
      label: 'Datasets',
    },
    {
      value: totalRows.toLocaleString(),
      label: 'Rows',
    },
    {
      value: collection.downloads || 0,
      label: 'Downloads',
    },
    {
      value: formatCreatedDate(collection.createdDate),
      label: 'Created',
    },
  ];

  const handleCopy = async () => {
    // Check for invalid datasets (data already loaded)
    const invalidDatasets =
      collection.datasets?.filter((d) => d.isInvalid === true) || [];
    const validDatasets =
      collection.datasets?.filter((d) => !d.isInvalid) || [];

    if (invalidDatasets.length > 0) {
      // Show warning dialog - wait for user confirmation
      setWarningDialogOpen(true);
      setWarningDialogData({
        invalidCount: invalidDatasets.length,
        validCount: validDatasets.length,
      });
      return; // Exit and wait for dialog response
    }

    // No invalid datasets - proceed directly
    await performCopy();
  };

  const performCopy = async () => {
    setCopying(true);
    try {
      const result = await copyCollection(collection.id);
      dispatch(
        snackbarOpen(`Collection "${result.name}" copied successfully`, {
          severity: 'info',
          position: 'bottom',
        }),
      );
    } catch (error) {
      console.error('Failed to copy collection:', error);
      dispatch(
        snackbarOpen(error.message || 'Failed to copy collection', {
          severity: 'error',
          position: 'bottom',
        }),
      );
    } finally {
      setCopying(false);
    }
  };

  const handleWarningConfirm = async () => {
    setWarningDialogOpen(false);
    await performCopy();
    setWarningDialogData(null);
  };

  const handleWarningCancel = () => {
    setWarningDialogOpen(false);
    setWarningDialogData(null);
  };

  const handleDownload = () => {
    setDownloadModalOpen(true);
  };

  const handleCloseDownloadModal = () => {
    setDownloadModalOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        classes={{ paper: classes.dialogPaper }}
        aria-labelledby="preview-collection-dialog-title"
        disableScrollLock={true}
      >
        <DialogTitle
          id="preview-collection-dialog-title"
          className={classes.dialogTitle}
        >
          <Typography
            variant="h4"
            component="div"
            className={classes.collectionTitle}
          >
            {collection.name}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            className={classes.closeButton}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          {/* Header Section */}
          <Box className={classes.headerSection}>
            <Typography className={classes.creatorInfo}>
              Created by {collection.ownerName}
              {collection.ownerAffiliation &&
                ` (${collection.ownerAffiliation})`}{' '}
              • Public Collection
            </Typography>
            {collection.description && (
              <Box className={classes.descriptionBox}>
                <Typography className={classes.description}>
                  {collection.description}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Stats Bar */}
          <Box className={classes.statsSection}>
            <CollectionStatistics stats={stats} itemsPerRow={4} />
          </Box>

          {/* Datasets Table */}
          <Box className={classes.datasetsSection}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Datasets
            </Typography>
            <CollectionDatasetsTable
              collectionId={collection.id}
              datasetShortNames={
                collection.datasets?.map((d) => d.datasetShortName) || []
              }
              columns={['name', 'type', 'region', 'dateRange', 'rows']}
              onDataLoaded={handleDataLoaded}
              onError={handleTableError}
              maxHeight={400}
            />
          </Box>
        </DialogContent>

        <DialogActions className={classes.dialogActions}>
          <UniversalButton onClick={onClose} variant="default" size="large">
            CLOSE
          </UniversalButton>
          <UniversalButton
            onClick={handleCopy}
            variant="primary"
            size="large"
            disabled={copying}
          >
            {copying ? (
              <CircularProgress
                size={14}
                style={{ color: 'rgba(105, 255, 242, 0.2)' }}
              />
            ) : (
              'COPY TO MY COLLECTIONS'
            )}
          </UniversalButton>
          <UniversalButton
            onClick={handleDownload}
            variant="primary"
            size="large"
          >
            DOWNLOAD COLLECTION
          </UniversalButton>
        </DialogActions>
      </Dialog>

      <CollectionDownloadModal
        open={downloadModalOpen}
        onClose={handleCloseDownloadModal}
        collection={collection}
      />

      <ConfirmationDialog
        open={warningDialogOpen}
        onClose={handleWarningCancel}
        title="Invalid Datasets Warning"
        message={
          <>
            <DialogContentText>
              This collection contains {warningDialogData?.invalidCount || 0}{' '}
              dataset
              {(warningDialogData?.invalidCount || 0) === 1
                ? ''
                : 's'} that{' '}
              {(warningDialogData?.invalidCount || 0) === 1 ? 'is' : 'are'} no
              longer available and will NOT be included in your copy.
            </DialogContentText>
            <DialogContentText
              className={bulletListClasses.bulletList}
              component="ul"
            >
              <li>
                {warningDialogData?.validCount || 0} valid dataset
                {(warningDialogData?.validCount || 0) === 1 ? '' : 's'} WILL be
                copied
              </li>
              <li>
                {warningDialogData?.invalidCount || 0} invalid dataset
                {(warningDialogData?.invalidCount || 0) === 1 ? '' : 's'} will
                be SKIPPED
              </li>
            </DialogContentText>
            <DialogContentText>
              Do you want to proceed with copying "{collection.name}"?
            </DialogContentText>
          </>
        }
        actions={[
          {
            label: 'Cancel',
            onClick: handleWarningCancel,
            variant: 'secondary',
          },
          {
            label: `OK - Copy ${warningDialogData?.validCount || 0} Valid Dataset${(warningDialogData?.validCount || 0) === 1 ? '' : 's'}`,
            onClick: handleWarningConfirm,
            variant: 'primary',
            autoFocus: true,
          },
        ]}
        ariaLabelId="invalid-datasets-warning-title"
        ariaDescriptionId="invalid-datasets-warning-description"
      />
    </>
  );
};

export default PreviewModal;
