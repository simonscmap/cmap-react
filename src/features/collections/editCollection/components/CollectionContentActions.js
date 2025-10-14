import React from 'react';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import UniversalButton from '../../../../shared/components/UniversalButton';
import { DOWNLOAD_LIMITS } from '../../../../shared/constants/downloadConstants';

const useStyles = makeStyles((theme) => ({
  actionsContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(2),
  },
  spacer: {
    flex: 1,
  },
  statusText: {
    fontSize: '0.75rem',
    marginTop: theme.spacing(0.5),
    textAlign: 'left',
  },
  statusTextNormal: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusTextError: {
    color: '#f44336',
  },
}));

/**
 * CollectionContentActions
 *
 * Action buttons for collection content management:
 * - Remove Selected
 * - Download Selected (with row limit validation)
 * - Cancel
 * - Save Changes
 */
const CollectionContentActions = ({
  selectedDatasets = [],
  totalSelectedRows = 0,
  isOverDownloadLimit = false,
  canSave,
  isSaving,
  onRemoveSelected,
  onDownloadSelected,
  onCancel,
  onSave,
}) => {
  const classes = useStyles();

  const overByRows = totalSelectedRows - DOWNLOAD_LIMITS.MAX_ROW_THRESHOLD;

  return (
    <>
      <Box className={classes.actionsContainer}>
        <UniversalButton
          onClick={onRemoveSelected}
          variant="secondary"
          size="large"
          disabled={selectedDatasets.length === 0}
        >
          REMOVE SELECTED
        </UniversalButton>
        <Box>
          <UniversalButton
            onClick={onDownloadSelected}
            variant="primary"
            size="large"
            disabled={selectedDatasets.length === 0 || isOverDownloadLimit}
            title={
              isOverDownloadLimit
                ? `Your selection (${totalSelectedRows.toLocaleString()} rows) exceeds the ${DOWNLOAD_LIMITS.MAX_ROW_THRESHOLD.toLocaleString()} row download limit`
                : undefined
            }
          >
            {isOverDownloadLimit ? 'SELECTION TOO LARGE' : 'DOWNLOAD SELECTED'}
          </UniversalButton>
          {selectedDatasets.length > 0 && (
            <Typography
              className={`${classes.statusText} ${
                isOverDownloadLimit
                  ? classes.statusTextError
                  : classes.statusTextNormal
              }`}
            >
              {isOverDownloadLimit ? (
                <>
                  {totalSelectedRows.toLocaleString()} /{' '}
                  {DOWNLOAD_LIMITS.MAX_ROW_THRESHOLD.toLocaleString()} rows (
                  {overByRows.toLocaleString()} over limit)
                </>
              ) : (
                <>
                  {totalSelectedRows.toLocaleString()} /{' '}
                  {DOWNLOAD_LIMITS.MAX_ROW_THRESHOLD.toLocaleString()} rows
                </>
              )}
            </Typography>
          )}
        </Box>
        <Box className={classes.spacer} />
        <UniversalButton onClick={onCancel} variant="default" size="large">
          CANCEL
        </UniversalButton>
        <UniversalButton
          onClick={onSave}
          variant="primary"
          size="large"
          disabled={!canSave || isSaving}
        >
          {isSaving ? (
            <CircularProgress
              size={14}
              style={{ color: 'rgba(105, 255, 242, 0.2)' }}
            />
          ) : (
            'SAVE CHANGES'
          )}
        </UniversalButton>
      </Box>
    </>
  );
};

export default CollectionContentActions;
