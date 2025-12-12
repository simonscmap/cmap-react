import React from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import UniversalButton from '../../../../shared/components/UniversalButton';

const useStyles = makeStyles((theme) => ({
  actionsContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    paddingTop: theme.spacing(2),
  },
  spacer: {
    flex: 1,
  },
}));

/**
 * CollectionContentActions
 *
 * Action buttons for collection content management:
 * - Remove Selected
 * - Cancel
 * - Save Changes
 */
const CollectionContentActions = ({
  selectedDatasets = [],
  canSave,
  isSaving,
  onRemoveSelected,
  onCancel,
  onSave,
}) => {
  const classes = useStyles();

  return (
    <>
      <Box className={classes.actionsContainer}>
        <UniversalButton
          onClick={onRemoveSelected}
          variant="primary"
          size="large"
          disabled={selectedDatasets.length === 0}
        >
          REMOVE SELECTED
        </UniversalButton>
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
