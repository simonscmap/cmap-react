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
}));

/**
 * CollectionStatusBadge Component
 *
 * Displays a badge indicating whether a collection is public or private.
 * Consistent styling across the collections feature.
 *
 * @param {Object} props
 * @param {boolean} props.isPublic - Whether the collection is public
 * @param {string} props.size - Size of the chip (default: 'small')
 */
const CollectionStatusBadge = ({ isPublic, size = 'small' }) => {
  const classes = useStyles();

  return (
    <Chip
      label={isPublic ? 'PUBLIC' : 'PRIVATE'}
      size={size}
      className={isPublic ? classes.publicChip : classes.privateChip}
    />
  );
};

CollectionStatusBadge.propTypes = {
  isPublic: PropTypes.bool.isRequired,
  size: PropTypes.string,
};

CollectionStatusBadge.defaultProps = {
  size: 'small',
};

export default CollectionStatusBadge;
