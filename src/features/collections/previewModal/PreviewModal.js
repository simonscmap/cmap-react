import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { format, parseISO } from 'date-fns';
import { usePreviewModalStyles } from './previewModalStyles';
import CollectionStatistics from '../components/CollectionStatistics';
import UniversalButton from '../../../shared/components/UniversalButton';
import { DatasetNameLink } from '../../../shared/components';
import CollectionDownloadModal from '../myCollections/CollectionDownloadModal';
import useCollectionsStore from '../state/collectionsStore';
import { snackbarOpen } from '../../../Redux/actions/ui';

const PreviewModal = ({ open, onClose, collection }) => {
  const classes = usePreviewModalStyles();
  const dispatch = useDispatch();

  // Zustand store selectors
  const copyCollection = useCollectionsStore((state) => state.copyCollection);
  const fetchPreviewData = useCollectionsStore(
    (state) => state.fetchPreviewData,
  );
  const clearPreviewData = useCollectionsStore(
    (state) => state.clearPreviewData,
  );
  const previewData = useCollectionsStore((state) => state.previewData);
  const isLoadingPreview = useCollectionsStore(
    (state) => state.isLoadingPreview,
  );

  // Local state (UI-specific)
  const [copying, setCopying] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // Fetch preview data when modal opens
  useEffect(() => {
    if (!open || !collection?.datasets) {
      return;
    }

    const loadPreviewData = async () => {
      try {
        const datasetShortNames = collection.datasets.map(
          (dataset) => dataset.datasetShortName,
        );

        const { missingDatasets } = await fetchPreviewData(datasetShortNames);

        if (missingDatasets.length > 0) {
          dispatch(
            snackbarOpen(
              `The following datasets did not return data or are unavailable: ${missingDatasets.join(', ')}`,
              {
                severity: 'warning',
                position: 'bottom',
              },
            ),
          );
        }
      } catch (error) {
        dispatch(
          snackbarOpen(error.message || 'Failed to load preview data', {
            severity: 'error',
            position: 'bottom',
          }),
        );
        onClose();
      }
    };

    loadPreviewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, collection?.id]);

  // Clear preview data when modal closes
  useEffect(() => {
    if (!open) {
      clearPreviewData();
    }
  }, [open, clearPreviewData]);

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

  const formatDateRange = (timeStart, timeEnd) => {
    try {
      const start = timeStart
        ? format(parseISO(timeStart), 'yyyy-MM-dd')
        : 'N/A';
      const end = timeEnd ? format(parseISO(timeEnd), 'yyyy-MM-dd') : 'N/A';
      return { start, end };
    } catch (error) {
      return { start: 'N/A', end: 'N/A' };
    }
  };

  const formatRegions = (regions) => {
    if (!regions || regions.length === 0) {
      return 'N/A';
    }
    return regions.join(', ');
  };

  // Calculate total rows from preview data
  const totalRows = previewData.reduce((sum, dataset) => {
    return sum + (dataset.Row_Count || 0);
  }, 0);

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
          <Typography variant="h4" className={classes.collectionTitle}>
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
            {isLoadingPreview ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={200}
              >
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                className={classes.tableContainer}
              >
                <Table className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Dataset Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Region</TableCell>
                      <TableCell>Date Range</TableCell>
                      <TableCell align="right">Rows</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="textSecondary">
                            No dataset data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      previewData.map((dataset, index) => {
                        const dateRange = formatDateRange(
                          dataset.timeStart,
                          dataset.timeEnd,
                        );
                        return (
                          <TableRow key={index} className={classes.tableRow}>
                            <TableCell
                              className={`${classes.tableCell} ${classes.datasetNameCell}`}
                            >
                              <DatasetNameLink
                                datasetShortName={dataset.shortName}
                                typographyProps={{
                                  variant: 'body2',
                                  noWrap: true,
                                }}
                              />
                            </TableCell>
                            <TableCell className={classes.tableCell}>
                              {dataset.type}
                            </TableCell>
                            <TableCell
                              className={`${classes.tableCell} ${classes.regionCell}`}
                            >
                              {formatRegions(dataset.regions)}
                            </TableCell>
                            <TableCell
                              className={`${classes.tableCell} ${classes.dateRangeCell}`}
                            >
                              {dateRange.start} to
                              <br />
                              {dateRange.end}
                            </TableCell>
                            <TableCell
                              className={`${classes.tableCell} ${classes.rowsCell}`}
                              align="right"
                            >
                              {dataset.Row_Count?.toLocaleString() ?? 'N/A'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
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
    </>
  );
};

export default PreviewModal;
