import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  publicChip: {
    backgroundColor: '#c8e6c9',
    color: '#2e7d32',
    fontSize: '0.62rem',
    height: 20,
    fontWeight: 400,
    borderRadius: '6px',
    minWidth: 56,
  },
  privateChip: {
    backgroundColor: '#ffcdd2',
    color: '#c62828',
    fontSize: '0.62rem',
    height: 20,
    fontWeight: 400,
    borderRadius: '6px',
    minWidth: 56,
  },
  newChip: {
    backgroundColor: '#bbdefb',
    color: '#1565c0',
    fontSize: '0.62rem',
    height: 20,
    fontWeight: 400,
    borderRadius: '6px',
    minWidth: 56,
  },
}));

/**
 * CollectionStatusBadge Component
 *
 * Displays badges indicating collection status (public/private) and whether it's newly created.
 * Consistent styling across the collections feature.
 *
 * @param {Object} props
 * @param {boolean} props.isPublic - Whether the collection is public
 * @param {boolean} props.isNew - Whether the collection was just created (shows NEW chip)
 * @param {string} props.size - Size of the chip (default: 'small')
 */
const CollectionStatusBadge = ({ isPublic, isNew = false, size = 'small' }) => {
  const classes = useStyles();

  return (
    <>
      <Chip
        label={isPublic ? 'PUBLIC' : 'PRIVATE'}
        size={size}
        className={isPublic ? classes.publicChip : classes.privateChip}
      />
      {isNew && <Chip label="NEW" size={size} className={classes.newChip} />}
    </>
  );
};

CollectionStatusBadge.propTypes = {
  isPublic: PropTypes.bool.isRequired,
  isNew: PropTypes.bool,
  size: PropTypes.string,
};

CollectionStatusBadge.defaultProps = {
  isNew: false,
  size: 'small',
};

export default CollectionStatusBadge;
