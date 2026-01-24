import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  CircularProgress,
  Popover,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import colors from '../../../enums/colors';
import MetadataRow from './MetadataRow';
import UniversalButton from '../../../shared/components/UniversalButton';
import CollectionDownloadButton from '../shared/CollectionDownloadButton';
import useCollectionsStore from '../state/collectionsStore';
import CollectionDownloadModal from './CollectionDownloadModal';
import CollectionStatusBadge from '../components/CollectionStatusBadge';
import { snackbarOpen } from '../../../Redux/actions/ui';

const useStyles = makeStyles((theme) => ({
  cardContainer: {
    position: 'relative',
    height: '100%',
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${colors.secondary}`,
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
    color: 'rgb(105, 255, 242)',
  },
  statusChips: {
    display: 'flex',
    gap: theme.spacing(0.5),
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  popoverContent: {
    padding: theme.spacing(2),
    maxWidth: 320,
  },
  popoverTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    color: '#1565c0',
  },
  popoverMessage: {
    marginBottom: theme.spacing(2),
    color: 'rgba(0, 0, 0, 0.87)',
  },
  popoverActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
  },
}));

const FollowedCollectionCard = ({ collection, isPending }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const unfollowCollection = useCollectionsStore((state) => state.unfollowCollection);
  const followPendingIds = useCollectionsStore((state) => state.followPendingIds);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [unfollowAnchor, setUnfollowAnchor] = useState(null);

  const isUnfollowPending = followPendingIds.has(collection.id);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('sv-SE');
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr}, ${timeStr}`;
  };

  const handleUnfollowClick = (event) => {
    setUnfollowAnchor(event.currentTarget);
  };

  const handleUnfollowCancel = () => {
    setUnfollowAnchor(null);
  };

  const handleUnfollowConfirm = async () => {
    setUnfollowAnchor(null);
    try {
      await unfollowCollection(collection.id);
      dispatch(
        snackbarOpen(`Unfollowed "${collection.name}"`, {
          position: 'top',
          severity: 'info',
        }),
      );
    } catch (error) {
      dispatch(
        snackbarOpen(error.message || 'Failed to unfollow collection', {
          position: 'top',
          severity: 'error',
        }),
      );
    }
  };

  const handleDownload = () => {
    setDownloadModalOpen(true);
  };

  const handleCloseDownloadModal = () => {
    setDownloadModalOpen(false);
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
                isFollowing={true}
                ownerName={collection.ownerName}
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
          </Box>
        </CardContent>

        <CardActions className={classes.cardActions}>
          <UniversalButton
            variant="secondary"
            size="medium"
            onClick={handleUnfollowClick}
            disabled={isUnfollowPending}
          >
            {isUnfollowPending ? (
              <CircularProgress
                size={14}
                style={{ color: 'rgba(158, 158, 158, 0.5)' }}
              />
            ) : (
              'UNFOLLOW'
            )}
          </UniversalButton>
          <Box style={{ flexGrow: 1 }} />
          <Box className={classes.buttonGroup}>
            <CollectionDownloadButton
              disabled={!collection.datasetCount}
              onClick={handleDownload}
              size="medium"
            />
          </Box>
        </CardActions>

        <CollectionDownloadModal
          open={downloadModalOpen}
          onClose={handleCloseDownloadModal}
          collection={collection}
        />

        <Popover
          open={Boolean(unfollowAnchor)}
          anchorEl={unfollowAnchor}
          onClose={handleUnfollowCancel}
          disableScrollLock={true}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box className={classes.popoverContent}>
            <Typography className={classes.popoverTitle}>
              Unfollow Collection?
            </Typography>
            <Typography variant="body2" className={classes.popoverMessage}>
              This collection will be removed from your My Collections view.
            </Typography>
            <Box className={classes.popoverActions}>
              <UniversalButton
                onClick={handleUnfollowCancel}
                variant="default"
                size="medium"
              >
                CANCEL
              </UniversalButton>
              <UniversalButton
                onClick={handleUnfollowConfirm}
                variant="secondary"
                size="medium"
              >
                UNFOLLOW
              </UniversalButton>
            </Box>
          </Box>
        </Popover>
      </Card>

      {isPending && (
        <Box className={classes.pendingOverlay}>
          <CircularProgress size={60} style={{ color: colors.primary }} />
        </Box>
      )}
    </Box>
  );
};

FollowedCollectionCard.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    ownerName: PropTypes.string,
    datasetCount: PropTypes.number,
    modifiedDate: PropTypes.string,
  }).isRequired,
  isPending: PropTypes.bool,
};

FollowedCollectionCard.defaultProps = {
  isPending: false,
};

export default FollowedCollectionCard;
