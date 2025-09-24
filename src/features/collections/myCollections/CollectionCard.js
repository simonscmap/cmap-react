import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  Button,
  IconButton,
  Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FileCopy as CopyIcon,
  Warning as WarningIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from '@material-ui/icons';
import useCollectionsStore from '../state/collectionsStore';

const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    '&:hover': {
      boxShadow: theme.shadows[4],
    },
  },
  cardContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing(1),
  },
  cardActions: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  description: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: 1.4,
  },
  metadata: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  metadataRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  metadataLabel: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  metadataValue: {
    fontSize: '0.75rem',
    color: theme.palette.text.primary,
  },
  statusChips: {
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
    flexWrap: 'wrap',
  },
  publicChip: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    fontSize: '0.7rem',
    height: 24,
  },
  privateChip: {
    backgroundColor: theme.palette.grey[600],
    color: theme.palette.common.white,
    fontSize: '0.7rem',
    height: 24,
  },
  warningChip: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    fontSize: '0.7rem',
    height: 24,
  },
  statsSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 0),
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(1),
  },
  statsItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  statsIcon: {
    fontSize: 16,
    color: theme.palette.text.secondary,
  },
  statsText: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  deleteButton: {
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: 'rgba(244, 67, 54, 0.04)',
    },
  },
}));

const CollectionCard = ({ collection }) => {
  const classes = useStyles();
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteCollection } = useCollectionsStore();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`,
      )
    ) {
      try {
        setIsDeleting(true);

        // TODO: Replace with actual API call once collectionsApi is implemented
        // await collectionsApi.deleteCollection(collection.id);

        // For now, just update the store
        deleteCollection(collection.id);
      } catch (err) {
        console.error('Failed to delete collection:', err);
        // TODO: Add proper error handling with snackbar
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log('Preview collection:', collection.id);
  };

  const handleCopy = () => {
    // TODO: Implement copy functionality
    console.log('Copy collection:', collection.id);
  };

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Box className={classes.statusChips}>
          <Chip
            icon={collection.isPublic ? <PublicIcon /> : <LockIcon />}
            label={collection.isPublic ? 'Public' : 'Private'}
            size="small"
            className={
              collection.isPublic ? classes.publicChip : classes.privateChip
            }
          />
          {collection.hasInvalidDatasets && (
            <Chip
              icon={<WarningIcon />}
              label="Contains inactive datasets"
              size="small"
              className={classes.warningChip}
            />
          )}
        </Box>

        <Typography variant="h6" className={classes.title}>
          {collection.name}
        </Typography>

        {collection.description && (
          <Typography variant="body2" className={classes.description}>
            {collection.description}
          </Typography>
        )}

        <Box className={classes.metadata}>
          <Box className={classes.metadataRow}>
            <Typography className={classes.metadataLabel}>Created:</Typography>
            <Typography className={classes.metadataValue}>
              {formatDate(collection.createdAt)}
            </Typography>
          </Box>
          <Box className={classes.metadataRow}>
            <Typography className={classes.metadataLabel}>Modified:</Typography>
            <Typography className={classes.metadataValue}>
              {formatDate(collection.lastModified)}
            </Typography>
          </Box>
          <Box className={classes.metadataRow}>
            <Typography className={classes.metadataLabel}>Datasets:</Typography>
            <Typography className={classes.metadataValue}>
              {collection.datasetIds?.length || 0}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Box className={classes.statsSection}>
          <Box className={classes.statsItem}>
            <VisibilityIcon className={classes.statsIcon} />
            <Typography className={classes.statsText}>
              {collection.previewCount || 0} views
            </Typography>
          </Box>
          <Box className={classes.statsItem}>
            <CopyIcon className={classes.statsIcon} />
            <Typography className={classes.statsText}>
              {collection.copyCount || 0} copies
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions className={classes.cardActions}>
        <Button
          size="small"
          color="primary"
          startIcon={<VisibilityIcon />}
          onClick={handlePreview}
        >
          Preview
        </Button>

        <Box className={classes.actionButtons}>
          <IconButton size="small" onClick={handleCopy} title="Copy collection">
            <CopyIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            className={classes.deleteButton}
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete collection"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default CollectionCard;
