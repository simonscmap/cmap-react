import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import { Warning as WarningIcon } from '@material-ui/icons';
import colors from '../../../enums/colors';
import MetadataRow from './MetadataRow';
import DeleteButton from '../components/DeleteButton';
import UniversalButton from '../../../shared/components/UniversalButton';
import CollectionDownloadButton from '../shared/CollectionDownloadButton';
import useCollectionsStore from '../state/collectionsStore';
import CollectionDownloadModal from './CollectionDownloadModal';
import EditCollectionModal from '../editCollection/EditCollectionModal';
import CollectionStatusBadge from '../components/CollectionStatusBadge';
import { snackbarOpen } from '../../../Redux/actions/ui';

const useStyles = makeStyles((theme) => ({
  cardContainer: {
    position: 'relative',
    height: '100%',
    minWidth: 0,
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${colors.teal}`,
    '&:hover': {
      boxShadow: theme.shadows[4],
    },
  },
  pendingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    borderRadius: theme.shape.borderRadius,
  },
  cardContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
  },
  metadataSection: {
    marginTop: 'auto',
  },
  cardActions: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginTop: 'auto',
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
  },
  title: {
    fontWeight: 400,
    lineHeight: 1.3,
    flexGrow: 1,
    minWidth: 0,
    fontSize: '1.4em',
    color: colors.teal,
    overflowWrap: 'break-word',
  },
  statusChips: {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  warningSection: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  warningText: {
    color: colors.errorYellow,
    fontSize: '0.75rem',
  },
  warningIcon: {
    color: colors.errorYellow,
    fontSize: '1rem',
  },
}));

const CollectionCard = ({ collection, isPending = false }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const deleteCollection = useCollectionsStore(
    (state) => state.deleteCollection,
  );
  const justCreatedId = useCollectionsStore((state) => state.justCreatedId);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Check if this collection is the newly created one
  const isNew = collection.id === justCreatedId;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE'); // YYYY-MM-DD format
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('sv-SE'); // YYYY-MM-DD format
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr}, ${timeStr}`;
  };

  const invalidDatasetCount = collection.datasets
    ? collection.datasets.filter((dataset) => dataset.isInvalid === true).length
    : 0;

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleDownload = () => {
    setDownloadModalOpen(true);
  };

  const handleCloseDownloadModal = () => {
    setDownloadModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteCollection(collection.id);
      dispatch(
        snackbarOpen(`Collection "${collection.name}" deleted successfully`, {
          position: 'top',
          severity: 'success',
        }),
      );
    } catch (error) {
      // Error already logged in store, show user-friendly message
      const errorMessage = error.message
        ? `${error.message.replace('collection', `collection "${collection.name}"`)}`
        : 'Failed to delete collection';
      dispatch(
        snackbarOpen(errorMessage, {
          position: 'top',
          severity: 'error',
        }),
      );
    }
  };

  return (
    <Box className={classes.cardContainer}>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Box className={classes.titleRow}>
            <Typography variant="h5" className={classes.title}>
              {collection.name}
            </Typography>
            <Box className={classes.statusChips}>
              <CollectionStatusBadge
                isPublic={collection.isPublic}
                isNew={isNew}
              />
            </Box>
          </Box>

          {collection.description && (
            <Typography
              variant="body2"
              paragraph
              style={{ color: 'white', fontSize: '1rem' }}
            >
              {collection.description}
            </Typography>
          )}

          <Box className={classes.metadataSection}>
            <MetadataRow
              label="Dataset Count"
              value={collection.datasetCount || 0}
              isCount={true}
            />
            <MetadataRow
              label="Last Modified"
              value={formatDateTime(collection.modifiedDate)}
            />
            {invalidDatasetCount > 0 && (
              <MetadataRow
                label="Invalid Datasets"
                value={invalidDatasetCount}
                isCount={true}
                labelColor={colors.errorYellow}
              />
            )}
          </Box>
        </CardContent>

        <CardActions className={classes.cardActions}>
          <DeleteButton
            title="Delete Collection?"
            message="Are you sure you want to delete this collection? This action is permanent and cannot be undone."
            onDelete={handleDelete}
          />
          <Box style={{ flexGrow: 1, marginLeft: 'auto' }}>
            {collection.hasInvalidDatasets && (
              <Box className={classes.warningSection}>
                <WarningIcon className={classes.warningIcon} />
                <Typography className={classes.warningText}>
                  Contains inactive datasets
                </Typography>
              </Box>
            )}
          </Box>
          <Box className={classes.buttonGroup}>
            <UniversalButton
              variant="primary"
              size="medium"
              onClick={handleEdit}
            >
              EDIT
            </UniversalButton>
            <CollectionDownloadButton
              disabled={!collection.datasetCount}
              onClick={handleDownload}
              size="medium"
            />
          </Box>
        </CardActions>

        {editModalOpen && (
          <EditCollectionModal
            open={editModalOpen}
            onClose={handleCloseEditModal}
            collectionId={collection.id}
          />
        )}

        <CollectionDownloadModal
          open={downloadModalOpen}
          onClose={handleCloseDownloadModal}
          collection={collection}
        />
      </Card>

      {isPending && (
        <Box className={classes.pendingOverlay}>
          <CircularProgress size={60} style={{ color: colors.primary }} />
        </Box>
      )}
    </Box>
  );
};

export default CollectionCard;
