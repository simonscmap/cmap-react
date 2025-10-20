import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchInput from '../../../../shared/UniversalSearch/components/SearchInput';
import CollectionStatusBadge from '../../components/CollectionStatusBadge';
import zIndex from '../../../../enums/zIndex';

const useStyles = makeStyles((theme) => ({
  container: {
    marginBottom: 0,
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: theme.spacing(2),
  },
  collectionName: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.875rem',
  },
  metadataContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    flexShrink: 0,
  },
  datasetCountContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    minWidth: '90px',
  },
  datasetCountNumber: {
    fontWeight: 500,
    minWidth: '24px',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
  datasetCountLabel: {
    fontWeight: 400,
    minWidth: '55px',
  },
}));

/**
 * CollectionSearchSection Component
 *
 * Responsibilities:
 * - Render UniversalSearch with collection data
 * - Display autocomplete results with badges (Public/Private)
 * - Handle collection selection
 * - Format results with three sections: name | dataset count | badge
 *
 * @param {Object} props
 * @param {Array} props.collections - All available collections
 * @param {number|null} props.selectedCollectionId - Currently selected collection ID
 * @param {Function} props.onSelectCollection - Callback when collection is selected (collectionId, summary)
 */
const CollectionSearchSection = ({
  collections,
  selectedCollectionId,
  onSelectCollection,
}) => {
  const classes = useStyles();

  // Handle collection selection from autocomplete
  const handleSelect = (collection) => {
    if (collection && collection.id) {
      // Compute summary for banner
      const summary = {
        id: collection.id,
        name: collection.name,
        datasetCount: collection.datasetCount,
        isPublic: collection.isPublic,
      };
      onSelectCollection(collection.id, summary);
    }
  };

  // Custom option label renderer
  const getOptionLabel = (option) => {
    if (typeof option === 'string') {
      return option;
    }
    return option.name;
  };

  // Custom render option to include badge
  const renderOption = (option) => {
    const datasetLabel = option.datasetCount === 1 ? 'dataset' : 'datasets';

    return (
      <Box className={classes.optionLabel}>
        <span className={classes.collectionName}>{option.name}</span>
        <Box className={classes.metadataContainer}>
          <Box className={classes.datasetCountContainer}>
            <span className={classes.datasetCountNumber}>
              {option.datasetCount}
            </span>
            <span className={classes.datasetCountLabel}>{datasetLabel}</span>
          </Box>
          <CollectionStatusBadge isPublic={option.isPublic} />
        </Box>
      </Box>
    );
  };

  return (
    <Box className={classes.container}>
      <SearchInput
        placeholder="Search collections by name..."
        size="small"
        fullWidth
        showResultCount={false}
        showEngineToggle={false}
        enableAutocomplete={true}
        onSelect={handleSelect}
        getOptionLabel={getOptionLabel}
        renderOption={renderOption}
        popperZIndex={zIndex.MODAL_LAYER_2_POPPER}
        loadAllOnFocus={true}
        disablePortal={true}
      />
    </Box>
  );
};

CollectionSearchSection.propTypes = {
  collections: PropTypes.array.isRequired,
  selectedCollectionId: PropTypes.number,
  onSelectCollection: PropTypes.func.isRequired,
};

CollectionSearchSection.defaultProps = {
  selectedCollectionId: null,
};

export default CollectionSearchSection;
