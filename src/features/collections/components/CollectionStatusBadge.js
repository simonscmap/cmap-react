import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const baseChipStyles = {
  fontSize: '0.62rem',
  height: 20,
  fontWeight: 400,
  borderRadius: '6px',
  textTransform: 'uppercase',
};

const useStyles = makeStyles(() => ({
  publicChip: {
    ...baseChipStyles,
    backgroundColor: '#c8e6c9',
    color: '#2e7d32',
    minWidth: 56,
  },
  privateChip: {
    ...baseChipStyles,
    backgroundColor: '#ffcdd2',
    color: '#c62828',
    minWidth: 56,
  },
  followingChip: {
    ...baseChipStyles,
    backgroundColor: '#bbdefb',
    color: '#1565c0',
  },
  newChip: {
    ...baseChipStyles,
    backgroundColor: '#ffe0b2',
    color: '#e65100',
    minWidth: 56,
  },
}));

/**
 * CollectionStatusBadge Component
 *
 * Displays badges indicating collection status (public/private/following) and whether it's newly created.
 * Consistent styling across the collections feature.
 *
 * @param {Object} props
 * @param {boolean} props.isPublic - Whether the collection is public
 * @param {boolean} props.isFollowing - Whether this is a followed collection (shows "Following {ownerName}")
 * @param {string} props.ownerName - Owner name to display when isFollowing is true
 * @param {boolean} props.isNew - Whether the collection was just created (shows NEW chip)
 * @param {string} props.size - Size of the chip (default: 'small')
 */
const CollectionStatusBadge = ({ isPublic, isFollowing = false, ownerName = '', isNew = false, size = 'small' }) => {
  const classes = useStyles();

  const getChipClass = () => {
    if (isFollowing) {
      return classes.followingChip;
    }
    return isPublic ? classes.publicChip : classes.privateChip;
  };

  const getChipLabel = () => {
    if (isFollowing) {
      return ownerName ? (
        <>Following <span style={{ fontWeight: 600 }}>{ownerName}</span></>
      ) : 'Following';
    }
    return isPublic ? 'PUBLIC' : 'PRIVATE';
  };

  return (
    <>
      <Chip
        label={getChipLabel()}
        size={size}
        className={getChipClass()}
      />
      {isNew && <Chip label="NEW" size={size} className={classes.newChip} />}
    </>
  );
};

CollectionStatusBadge.propTypes = {
  isPublic: PropTypes.bool,
  isFollowing: PropTypes.bool,
  ownerName: PropTypes.string,
  isNew: PropTypes.bool,
  size: PropTypes.string,
};

CollectionStatusBadge.defaultProps = {
  isPublic: false,
  isFollowing: false,
  ownerName: '',
  isNew: false,
  size: 'small',
};

export default CollectionStatusBadge;
