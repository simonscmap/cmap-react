import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Box, Typography, CircularProgress } from '@material-ui/core';
import UniversalButton from '../../../../shared/components/UniversalButton';
import { useAddDatasetsStyles } from '../styles/addDatasetsStyles';
import { snackbarOpen } from '../../../../Redux/actions/ui';

/**
 * CollectionSummaryBanner Component
 *
 * Responsibilities:
 * - Display selected collection name
 * - Show total datasets, valid datasets, invalid datasets counts
 * - Show validation status during/after loading
 *
 * Visual States:
 * - No selection: Banner hidden
 * - Collection selected: Banner shows collection name and stats
 * - Loading: Shows loading message
 * - Error: Shows error via Redux snackbar
 *
 * @param {Object} props
 * @param {Object|null} props.summary - Collection summary (null if no collection selected)
 * @param {boolean} props.isLoading - True during dataset fetch
 * @param {string|null} props.loadError - Error message if fetch failed
 */
const CollectionSummaryBanner = ({ summary, isLoading, loadError }) => {
  const classes = useAddDatasetsStyles();
  const dispatch = useDispatch();

  // Show error snackbar when loadError changes
  React.useEffect(() => {
    if (loadError) {
      dispatch(
        snackbarOpen(loadError, {
          severity: 'error',
        }),
      );
    }
  }, [loadError, dispatch]);

  // If no summary, don't render the banner
  if (!summary) {
    return null;
  }

  const {
    collectionName,
    totalDatasets,
    validDatasets,
    alreadyInCollection,
    invalidDatasets,
  } = summary;

  return (
    <Box
      className={`${classes.summaryBanner} ${!summary ? classes.summaryBannerDisabled : ''}`}
    >
      <Box className={classes.summaryInfo}>
        <Typography className={classes.summaryTitle}>
          {isLoading ? (
            'Loading collection...'
          ) : (
            <>
              <strong>Collection loaded:</strong> {collectionName}
            </>
          )}
        </Typography>
        <Box className={classes.summaryStats}>
          {isLoading ? (
            <Typography variant="body2">Validating datasets...</Typography>
          ) : (
            <>
              <Box className={classes.statItem}>
                <Typography variant="body2">
                  Total: <strong>{totalDatasets}</strong>
                </Typography>
              </Box>
              <Box className={classes.statItem}>
                <Typography variant="body2">
                  ✓ <strong>{validDatasets}</strong> valid
                </Typography>
              </Box>
              {alreadyInCollection > 0 && (
                <Box className={classes.statItem}>
                  <Typography variant="body2" style={{ color: '#808080' }}>
                    ⊙ <strong>{alreadyInCollection}</strong> already in
                    collection
                  </Typography>
                </Box>
              )}
              {invalidDatasets > 0 && (
                <Box className={classes.statItem}>
                  <Typography variant="body2" style={{ color: '#ffeb3b' }}>
                    ⚠ <strong>{invalidDatasets}</strong> unavailable
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {isLoading && (
        <Box className={classes.summaryActions}>
          <CircularProgress size={20} />
        </Box>
      )}
    </Box>
  );
};

CollectionSummaryBanner.propTypes = {
  summary: PropTypes.shape({
    collectionName: PropTypes.string,
    totalDatasets: PropTypes.number,
    validDatasets: PropTypes.number,
    alreadyInCollection: PropTypes.number,
    invalidDatasets: PropTypes.number,
  }),
  isLoading: PropTypes.bool.isRequired,
  loadError: PropTypes.string,
};

CollectionSummaryBanner.defaultProps = {
  summary: null,
  loadError: null,
};

export default CollectionSummaryBanner;
