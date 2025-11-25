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
  groupHeaderMy: {
    gridColumn: '1 / -1', // Span all columns
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: theme.spacing(1, 2),
    backgroundColor: '#ffe0b2 !important',
    color: '#e65100',
    fontWeight: 500,
    fontSize: '0.875rem',
    pointerEvents: 'none',
    cursor: 'default',
  },
  groupHeaderOther: {
    gridColumn: '1 / -1', // Span all columns
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: theme.spacing(1, 2),
    backgroundColor: '#bbdefb !important',
    color: '#1565c0',
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
            }}
          >
            Total Datasets
          </div>
          <div
            className={classes.headerCell}
            style={{
              justifyContent: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 3,
              paddingRight: '16px', // Extra padding for scrollbar space
            }}
          >
            Visibility
          </div>
        </>
      );
    }

    // Render group header
    if (option.isGroupHeader) {
      const isMyCollections = option.label === 'My Collections';
      return (
        <div
          className={
            isMyCollections ? classes.groupHeaderMy : classes.groupHeaderOther
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
          style={{ justifyContent: 'flex-end' }}
        >
          {option.datasetCount}
        </div>
        <div
          className={classes.dataCell}
          style={{ justifyContent: 'center', paddingRight: '16px' }}
        >
          <CollectionStatusBadge isPublic={option.isPublic} />
        </div>
      </>
    );
  };

  // Build prepend options array with column header
  const prependOptions = React.useMemo(() => {
    return [{ isHeader: true, id: 'header' }];
  }, []);

  // Process function to insert group headers between my collections and other public collections
  const processItems = React.useCallback((items) => {
    const processedItems = [];

    // Separate my collections (owned by current user)
    // Sort by visibility (private first, then public) and then alphabetically within each group
    const myCollections = items
      .filter((item) => item.isOwner)
      .sort((a, b) => {
        // First sort by visibility: private (false) before public (true)
        if (a.isPublic !== b.isPublic) {
          return a.isPublic ? 1 : -1;
        }
        // Then sort alphabetically by name
        return a.name.localeCompare(b.name);
      });

    const otherPublicCollections = items
      .filter((item) => !item.isOwner)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Add my collections section with header
    if (myCollections.length > 0) {
      processedItems.push({
        isGroupHeader: true,
        label: 'My Collections',
        id: 'my-collections-header',
      });
      processedItems.push(...myCollections);
    }

    // Add other public collections section with header
    if (otherPublicCollections.length > 0) {
      processedItems.push({
        isGroupHeader: true,
        label: 'Other Public Collections',
        id: 'other-public-header',
      });
      processedItems.push(...otherPublicCollections);
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
        listboxGridColumns="minmax(150px, 1.5fr) minmax(200px, 2fr) minmax(80px, 0.5fr) minmax(100px, 0.75fr)"
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
