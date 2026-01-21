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
  followingChip: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    fontSize: '0.62rem',
    height: 20,
    fontWeight: 400,
    borderRadius: '6px',
    minWidth: 80,
    maxWidth: 140,
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
 * @param {boolean} props.isFollowing - Whether the user is following this collection
 * @param {string} props.ownerName - Name of the collection owner (for following chip)
 * @param {string} props.size - Size of the chip (default: 'small')
 */
const CollectionStatusBadge = ({ isPublic, isNew = false, isFollowing = false, ownerName = '', size = 'small' }) => {
  const classes = useStyles();

  return (
    <>
      <Chip
        label={isPublic ? 'PUBLIC' : 'PRIVATE'}
        size={size}
        className={isPublic ? classes.publicChip : classes.privateChip}
      />
      {isNew && <Chip label="NEW" size={size} className={classes.newChip} />}
      {isFollowing && (
        <Chip
          label={`Following ${ownerName}`.trim()}
          size={size}
          className={classes.followingChip}
        />
      )}
    </>
  );
};

CollectionStatusBadge.propTypes = {
  isPublic: PropTypes.bool.isRequired,
  isNew: PropTypes.bool,
  isFollowing: PropTypes.bool,
  ownerName: PropTypes.string,
  size: PropTypes.string,
};

CollectionStatusBadge.defaultProps = {
  isNew: false,
  isFollowing: false,
  ownerName: '',
  size: 'small',
};

export default CollectionStatusBadge;
