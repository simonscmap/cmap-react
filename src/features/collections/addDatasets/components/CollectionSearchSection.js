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
  // Header cell styling - matches CollectionDatasetsTable header
  headerCell: {
    padding: '8px 8px',
    backgroundColor: 'rgba(30, 67, 113, 1)',
    color: '#8bc34a',
    fontWeight: 500,
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    border: 0,
  },
  // Data cell styling - matches CollectionDatasetsTable cells
  dataCell: {
    padding: '12px 8px',
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.85rem',
    border: 0,
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    lineHeight: 1.4,
  },
  groupHeaderPrivate: {
    gridColumn: '1 / -1', // Span all columns
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: theme.spacing(1, 2),
    backgroundColor: '#ffcdd2 !important',
    color: '#c62828',
    fontWeight: 500,
    fontSize: '0.875rem',
    pointerEvents: 'none',
    cursor: 'default',
  },
  groupHeaderPublic: {
    gridColumn: '1 / -1', // Span all columns
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: theme.spacing(1, 2),
    backgroundColor: '#c8e6c9 !important',
    color: '#2e7d32',
    fontWeight: 500,
    fontSize: '0.875rem',
    pointerEvents: 'none',
    cursor: 'default',
  },
  collectionName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  description: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  datasetCount: {
    fontVariantNumeric: 'tabular-nums',
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
    // Skip selection for header/group header items
    if (
      !collection ||
      !collection.id ||
      collection.isHeader ||
      collection.isGroupHeader
    ) {
      return;
    }

    // Compute summary for banner
    const summary = {
      id: collection.id,
      name: collection.name,
      datasetCount: collection.datasetCount,
      isPublic: collection.isPublic,
    };
    onSelectCollection(collection.id, summary);
  };

  // Custom option label renderer
  const getOptionLabel = (option) => {
    if (typeof option === 'string') {
      return option;
    }
    // Return empty string for header/group items to avoid displaying in text input
    if (option.isHeader || option.isGroupHeader) {
      return '';
    }
    return option.name;
  };

  // Disable selection for headers and group headers
  const getOptionDisabled = (option) => {
    return option.isHeader === true || option.isGroupHeader === true;
  };

  // Custom render option to include all columns
  const renderOption = (option) => {
    // Render column header
    if (option.isHeader) {
      return (
        <>
          <div
            className={classes.headerCell}
            style={{ position: 'sticky', top: 0, zIndex: 3 }}
          >
            Collection Name
          </div>
          <div
            className={classes.headerCell}
            style={{ position: 'sticky', top: 0, zIndex: 3 }}
          >
            Description
          </div>
          <div
            className={classes.headerCell}
            style={{
              justifyContent: 'flex-end',
              position: 'sticky',
              top: 0,
              zIndex: 3,
              paddingRight: '16px', // Extra padding for scrollbar space
            }}
          >
            Total Datasets
          </div>
        </>
      );
    }

    // Render group header
    if (option.isGroupHeader) {
      const isPrivate = option.label === 'Private Collections';
      return (
        <div
          className={
            isPrivate ? classes.groupHeaderPrivate : classes.groupHeaderPublic
          }
        >
          <span>{option.label}</span>
        </div>
      );
    }

    // Render normal collection row
    return (
      <>
        <div className={`${classes.dataCell} ${classes.collectionName}`}>
          {option.name}
        </div>
        <div className={`${classes.dataCell} ${classes.description}`}>
          {option.description || 'No description'}
        </div>
        <div
          className={`${classes.dataCell} ${classes.datasetCount}`}
          style={{ justifyContent: 'flex-end', paddingRight: '16px' }}
        >
          {option.datasetCount}
        </div>
      </>
    );
  };

  // Build prepend options array with column header
  const prependOptions = React.useMemo(() => {
    return [{ isHeader: true, id: 'header' }];
  }, []);

  // Process function to insert group headers between private and public collections
  const processItems = React.useCallback((items) => {
    const processedItems = [];

    // Separate, sort, and add private collections
    const privateItems = items
      .filter((item) => !item.isPublic)
      .sort((a, b) => a.name.localeCompare(b.name));

    const publicItems = items
      .filter((item) => item.isPublic)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Add private section with header
    if (privateItems.length > 0) {
      processedItems.push({
        isGroupHeader: true,
        label: 'Private Collections',
        id: 'private-header',
      });
      processedItems.push(...privateItems);
    }

    // Add public section with header
    if (publicItems.length > 0) {
      processedItems.push({
        isGroupHeader: true,
        label: 'Public Collections',
        id: 'public-header',
      });
      processedItems.push(...publicItems);
    }

    return processedItems;
  }, []);

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
        getOptionDisabled={getOptionDisabled}
        renderOption={renderOption}
        popperZIndex={zIndex.MODAL_LAYER_2_POPPER}
        loadAllOnFocus={true}
        disablePortal={true}
        prependOptions={prependOptions}
        processItems={processItems}
        listboxGridColumns="minmax(150px, 1.5fr) minmax(200px, 2.5fr) minmax(100px, 0.5fr)"
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
