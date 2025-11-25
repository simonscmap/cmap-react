import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CollectionStatusBadge from '../../components/CollectionStatusBadge';

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(3),
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
  },
  collectionTitle: {
    margin: 0,
    fontWeight: 500,
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  creatorInfo: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.875rem',
    marginBottom: theme.spacing(2),
  },
  descriptionBox: {
    borderLeft: '4px solid rgba(139, 195, 74, 0.5)',
    paddingLeft: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

/**
 * CollectionSummaryCard Component
 *
 * An alternative to CollectionSummaryBanner with a visual style inspired by PreviewModal.
 * Displays collection metadata (title, creator, description) and statistics about
 * the datasets being added.
 *
 * @param {Object} props
 * @param {Object|null} props.summary - Collection summary data
 * @param {string} props.summary.collectionName - Name of the collection
 * @param {string} [props.summary.creatorName] - Name of the collection creator
 * @param {string} [props.summary.creatorAffiliation] - Creator's affiliation
 * @param {boolean} props.summary.isPublic - Whether collection is public
 * @param {string} [props.summary.description] - Collection description
 * @param {number} props.summary.totalDatasets - Total datasets in source collection
 * @param {number} props.summary.validDatasets - Datasets that can be added
 * @param {number} props.summary.invalidDatasets - Datasets that are invalid
 * @param {number} props.summary.alreadyInCollection - Datasets already in target collection
 * @param {string} [props.summary.createdDate] - ISO date string of when collection was created
 * @param {boolean} props.isLoading - True during dataset fetch
 * @param {string|null} props.loadError - Error message if fetch failed
 */
const CollectionSummaryCard = ({ summary, isLoading, loadError }) => {
  const classes = useStyles();

  // If no summary, don't render the card
  if (!summary) {
    return null;
  }

  const {
    collectionName,
    creatorName,
    creatorAffiliation,
    isPublic,
    description,
    totalDatasets,
    validDatasets,
    invalidDatasets,
    alreadyInCollection,
    createdDate,
  } = summary;

  // Format date for display
  const formatCreatedDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  if (isLoading) {
    return (
      <Box className={classes.card}>
        <Box className={classes.loadingContainer}>
          <CircularProgress size={20} />
          <Typography variant="body1">Loading collection...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.card}>
      {/* Collection Title with Badge */}
      <Box className={classes.titleRow}>
        <Typography
          variant="h4"
          component="div"
          className={classes.collectionTitle}
        >
          <strong>Collection loaded:</strong> {collectionName}
        </Typography>
        <CollectionStatusBadge isPublic={isPublic} />
      </Box>

      {/* Creator Info */}
      <Typography className={classes.creatorInfo}>
        {creatorName && (
          <>
            Created by {creatorName}
            {creatorAffiliation && ` (${creatorAffiliation})`}
            {createdDate && ` on ${formatCreatedDate(createdDate)}`}
          </>
        )}
      </Typography>

      {/* Description */}
      {description && (
        <Box className={classes.descriptionBox}>
          <Typography className={classes.description}>{description}</Typography>
        </Box>
      )}
    </Box>
  );
};

CollectionSummaryCard.propTypes = {
  summary: PropTypes.shape({
    collectionName: PropTypes.string,
    creatorName: PropTypes.string,
    creatorAffiliation: PropTypes.string,
    isPublic: PropTypes.bool,
    description: PropTypes.string,
    totalDatasets: PropTypes.number,
    validDatasets: PropTypes.number,
    invalidDatasets: PropTypes.number,
    alreadyInCollection: PropTypes.number,
    createdDate: PropTypes.string,
  }),
  isLoading: PropTypes.bool.isRequired,
  loadError: PropTypes.string,
};

CollectionSummaryCard.defaultProps = {
  summary: null,
  loadError: null,
};

export default CollectionSummaryCard;
