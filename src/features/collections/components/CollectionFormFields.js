import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from '@material-ui/core';
import {
  PublicVisibilityWarning,
  PrivateVisibilityWarning,
} from '../createModal';
import { useCollectionFormStyles } from './collectionFormStyles';

/**
 * CollectionFormFields
 *
 * Reusable form component containing name, description, and visibility fields with validation display.
 * Used by both CreateCollectionModal and EditCollectionModal.
 *
 * @param {string} name - Current name value
 * @param {string} description - Current description value
 * @param {boolean} isPublic - Current visibility state
 * @param {function} onNameChange - Handler for name changes (event) => void
 * @param {function} onDescriptionChange - Handler for description changes (event) => void
 * @param {function} onVisibilityChange - Handler for visibility changes (event) => void
 * @param {function} onSetIsPublic - Handler for setting visibility directly (boolean) => void
 * @param {string} nameValidationState - 'initial' | 'checking' | 'available' | 'unavailable' | 'warning'
 * @param {string} nameErrorMessage - Error message for name field
 * @param {string} descriptionError - Error message for description field
 * @param {boolean} isNameOverLimit - Name exceeds 200 characters
 * @param {boolean} isDescriptionOverLimit - Description exceeds 500 characters
 * @param {string} className - Additional CSS class
 * @param {boolean} isEdit - If true, uses compact visibility variant (single line, no borders)
 */
const CollectionFormFields = ({
  name,
  description,
  isPublic,
  onNameChange,
  onDescriptionChange,
  onVisibilityChange,
  onSetIsPublic,
  nameValidationState,
  nameErrorMessage,
  descriptionError,
  isNameOverLimit,
  isDescriptionOverLimit,
  className,
  isEdit,
  followsCount = 0,
}) => {
  const classes = useCollectionFormStyles();
  const [showPublicWarning, setShowPublicWarning] = useState(false);
  const [showPrivateWarning, setShowPrivateWarning] = useState(false);
  const [wasPublic, setWasPublic] = useState(isPublic);

  const handleVisibilityChangeAttempt = (event) => {
    const newIsPublic = event.target.value === 'public';

    // If changing from private to public, show warning
    if (!isPublic && newIsPublic) {
      setWasPublic(isPublic);
      setShowPublicWarning(true);
    // If changing from public to private and has followers, show warning
    } else if (isPublic && !newIsPublic && followsCount > 0) {
      setShowPrivateWarning(true);
    } else {
      // No warning needed, allow directly
      onVisibilityChange(event);
    }
  };

  const handleKeepPrivate = () => {
    setShowPublicWarning(false);
    // No need to call onSetIsPublic(false) since it's already false
  };

  const handleMakePublic = () => {
    setShowPublicWarning(false);
    onSetIsPublic(true);
  };

  const handleKeepPublic = () => {
    setShowPrivateWarning(false);
  };

  const handleMakePrivate = () => {
    setShowPrivateWarning(false);
    onSetIsPublic(false);
  };

  return (
    <>
      <div className={className}>
        <TextField
          fullWidth
          required
          label="Collection Name"
          value={name}
          onChange={onNameChange}
          placeholder="Enter a descriptive collection name..."
          className={classes.formField}
          variant="outlined"
          size="small"
          multiline
          InputLabelProps={{
            shrink: true,
            className: classes.fieldLabel,
          }}
          helperText={
            <span className={classes.helperTextContainer}>
              <span>
                {isNameOverLimit ? (
                  <span className={classes.helperTextUnavailable}>
                    Collection name cannot exceed 200 characters
                  </span>
                ) : nameValidationState === 'checking' ? (
                  <span className={classes.helperTextChecking}>
                    Checking availability...
                  </span>
                ) : nameValidationState === 'available' ? (
                  <span className={classes.helperTextAvailable}>
                    Name is available
                  </span>
                ) : nameValidationState === 'unchanged' ? (
                  <span className={classes.helperTextUnchanged}>
                    Current collection name
                  </span>
                ) : nameValidationState === 'warning' ? (
                  <span className={classes.helperTextWarning}>
                    {nameErrorMessage}
                  </span>
                ) : nameValidationState === 'unavailable' ? (
                  <span className={classes.helperTextUnavailable}>
                    {nameErrorMessage}
                  </span>
                ) : null}
              </span>
              <span
                className={
                  isNameOverLimit
                    ? classes.characterCountOverLimit
                    : classes.characterCount
                }
              >
                {name.trim().length}/200 characters
              </span>
            </span>
          }
        />

        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={onDescriptionChange}
          placeholder="Describe your collection's purpose, scope, or contents..."
          className={`${classes.formField} ${classes.descriptionField}`}
          variant="outlined"
          size="small"
          multiline
          minRows={8}
          InputLabelProps={{
            shrink: true,
            className: classes.fieldLabel,
          }}
          helperText={
            <span className={classes.helperTextContainer}>
              <span>
                {isDescriptionOverLimit && (
                  <span className={classes.helperTextUnavailable}>
                    Description cannot exceed 500 characters
                  </span>
                )}
              </span>
              <span
                className={
                  isDescriptionOverLimit
                    ? classes.characterCountOverLimit
                    : classes.characterCount
                }
              >
                {description.length}/500 characters
              </span>
            </span>
          }
        />

        <FormControl component="fieldset" className={classes.visibilitySection}>
          <FormLabel component="legend" className={classes.visibilityLabel}>
            Visibility
          </FormLabel>
          <RadioGroup
            value={isPublic ? 'public' : 'private'}
            onChange={handleVisibilityChangeAttempt}
            className={isEdit ? classes.compactRadioGroup : ''}
          >
            <FormControlLabel
              value="private"
              control={<Radio color="primary" />}
              label={
                isEdit ? (
                  '🔒 Private (only you can see)'
                ) : (
                  <span>
                    <span style={{ display: 'block' }}>🔒 Private</span>
                    <Typography
                      component="span"
                      className={classes.radioDescription}
                    >
                      Only you can see and access this collection
                    </Typography>
                  </span>
                )
              }
              className={
                isEdit
                  ? classes.compactRadioLabel
                  : `${classes.radioLabel} ${!isPublic ? classes.radioLabelSelected : ''}`
              }
            />
            <FormControlLabel
              value="public"
              control={<Radio color="primary" />}
              label={
                isEdit ? (
                  '🌐 Public (visible to all users)'
                ) : (
                  <span>
                    <span style={{ display: 'block' }}>🌐 Public</span>
                    <Typography
                      component="span"
                      className={classes.radioDescription}
                    >
                      Visible to all CMAP users and discoverable in the public
                      collection browser
                    </Typography>
                  </span>
                )
              }
              className={
                isEdit
                  ? classes.compactRadioLabel
                  : `${classes.radioLabel} ${isPublic ? classes.radioLabelSelected : ''}`
              }
            />
          </RadioGroup>
        </FormControl>
      </div>

      <PublicVisibilityWarning
        open={showPublicWarning}
        onKeepPrivate={handleKeepPrivate}
        onMakePublic={handleMakePublic}
      />

      <PrivateVisibilityWarning
        open={showPrivateWarning}
        onKeepPublic={handleKeepPublic}
        onMakePrivate={handleMakePrivate}
        followsCount={followsCount}
      />
    </>
  );
};

CollectionFormFields.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isPublic: PropTypes.bool.isRequired,
  onNameChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onVisibilityChange: PropTypes.func.isRequired,
  onSetIsPublic: PropTypes.func.isRequired,
  nameValidationState: PropTypes.oneOf([
    'initial',
    'checking',
    'available',
    'unavailable',
    'warning',
    'unchanged',
  ]).isRequired,
  nameErrorMessage: PropTypes.string,
  descriptionError: PropTypes.string,
  isNameOverLimit: PropTypes.bool.isRequired,
  isDescriptionOverLimit: PropTypes.bool.isRequired,
  className: PropTypes.string,
  isEdit: PropTypes.bool,
  followsCount: PropTypes.number,
};

CollectionFormFields.defaultProps = {
  nameErrorMessage: '',
  descriptionError: '',
  className: '',
  isEdit: false,
  followsCount: 0,
};

export default CollectionFormFields;
