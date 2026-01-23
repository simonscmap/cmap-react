import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationDialog from '../../../shared/components/ConfirmationDialog';

const PrivateVisibilityWarning = ({ open, onKeepPublic, onMakePrivate, followsCount }) => {
  const followerText = followsCount === 1 ? 'follower' : 'followers';

  return (
    <ConfirmationDialog
      open={open}
      onClose={onKeepPublic}
      title="Make Collection Private?"
      message={`This collection has ${followsCount} ${followerText} who will lose access when you make it private. They will no longer be able to view or interact with this collection.`}
      actions={[
        {
          label: 'Keep Public',
          onClick: onKeepPublic,
          variant: 'secondary',
        },
        {
          label: 'Make Private',
          onClick: onMakePrivate,
          variant: 'primary',
          autoFocus: true,
        },
      ]}
      ariaLabelId="private-visibility-warning-title"
      ariaDescriptionId="private-visibility-warning-description"
    />
  );
};

PrivateVisibilityWarning.propTypes = {
  open: PropTypes.bool.isRequired,
  onKeepPublic: PropTypes.func.isRequired,
  onMakePrivate: PropTypes.func.isRequired,
  followsCount: PropTypes.number.isRequired,
};

export default PrivateVisibilityWarning;
