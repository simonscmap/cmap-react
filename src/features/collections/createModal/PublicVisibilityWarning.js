import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationDialog from '../../../shared/components/ConfirmationDialog';

const PublicVisibilityWarning = ({ open, onKeepPrivate, onMakePublic }) => {
  return (
    <ConfirmationDialog
      open={open}
      onClose={onKeepPrivate}
      title="Public Collection Notice"
      message="This collection will be public and visible to all CMAP users. Other users will be able to discover and view this collection in the public collection browser."
      actions={[
        {
          label: 'OK',
          onClick: onMakePublic,
          variant: 'primary',
          autoFocus: true,
        },
      ]}
      ariaLabelId="public-visibility-warning-title"
      ariaDescriptionId="public-visibility-warning-description"
    />
  );
};

PublicVisibilityWarning.propTypes = {
  open: PropTypes.bool.isRequired,
  onKeepPrivate: PropTypes.func.isRequired,
  onMakePublic: PropTypes.func.isRequired,
};

export default PublicVisibilityWarning;
