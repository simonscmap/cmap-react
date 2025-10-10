import React from 'react';
import PropTypes from 'prop-types';
import {
  TableRow,
  TableCell,
  Checkbox,
  Typography,
  Chip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import UniversalButton from '../../../../shared/components/UniversalButton';
import DatasetNameLink from '../../../../shared/components/DatasetNameLink';

const useStyles = makeStyles((theme) => ({
  normalRow: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  markedForRemovalRow: {
    opacity: 0.5,
    backgroundColor: theme.palette.action.disabledBackground,
    '& .MuiTableCell-root': {
      textDecoration: 'line-through',
    },
  },
  unavailableRow: {
    opacity: 0.7,
  },
  tableCell: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.85rem',
    padding: '12px 8px',
    border: 0,
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    lineHeight: 1.4,
  },
  checkboxCell: {
    width: '50px',
  },
  datasetCell: {
    minWidth: '200px',
  },
  typeCell: {
    width: '120px',
  },
  dateCell: {
    width: '140px',
    lineHeight: 1.3,
  },
  rowCountCell: {
    width: '80px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  actionsCell: {
    width: '100px',
    textAlign: 'right',
  },
  unavailableBadge: {
    marginLeft: theme.spacing(1),
    height: '20px',
    fontSize: '0.7rem',
  },
  datasetNameContainer: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
  },
  removeButton: {
    minWidth: 'auto',
    padding: theme.spacing(0.5, 1.5),
  },
  cancelButton: {
    minWidth: 'auto',
    padding: theme.spacing(0.5, 1.5),
  },
}));

/**
 * DatasetTableRow
 *
 * Individual dataset row component for the collection contents table.
 * Displays dataset information with selection checkbox, dataset link, metadata,
 * and removal/cancellation actions. Handles visual states for marked-for-removal
 * and unavailable datasets.
 *
 * @param {object} dataset - Dataset object with all metadata
 * @param {boolean} isMarkedForRemoval - Whether dataset is marked for deletion
 * @param {boolean} isSelected - Whether dataset is currently selected via checkbox
 * @param {function} onToggleSelection - Handler for checkbox toggle
 * @param {function} onMarkForRemoval - Handler for Remove button click
 * @param {function} onCancelRemoval - Handler for Cancel Deletion button click
 */
const DatasetTableRow = ({
  dataset,
  isMarkedForRemoval,
  isSelected,
  onToggleSelection,
  onMarkForRemoval,
  onCancelRemoval,
}) => {
  const classes = useStyles();

  if (!dataset) {
    return null;
  }

  const isUnavailable = dataset.isValid === false;
  const isCheckboxDisabled = isMarkedForRemoval || isUnavailable;

  const handleCheckboxChange = () => {
    onToggleSelection(dataset.datasetShortName);
  };

  const handleRemove = () => {
    onMarkForRemoval(dataset.datasetShortName);
  };

  const handleCancelRemoval = () => {
    onCancelRemoval(dataset.datasetShortName);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return 'N/A';
    }
  };

  const formatRowCount = (count) => {
    if (!count && count !== 0) return 'N/A';
    return count.toLocaleString();
  };

  const getDateRange = () => {
    const start = dataset.timeSeriesStart || dataset.Time_Series_Start;
    const end = dataset.timeSeriesEnd || dataset.Time_Series_End;

    const startFormatted = formatDate(start);
    const endFormatted = formatDate(end);

    return { start: startFormatted, end: endFormatted };
  };

  const getRowClass = () => {
    if (isMarkedForRemoval) return classes.markedForRemovalRow;
    if (isUnavailable) return classes.unavailableRow;
    return classes.normalRow;
  };

  const dateRange = getDateRange();

  return (
    <TableRow className={getRowClass()}>
      <TableCell className={`${classes.tableCell} ${classes.checkboxCell}`}>
        <Checkbox
          checked={isSelected}
          onChange={handleCheckboxChange}
          disabled={isCheckboxDisabled}
          color="primary"
          size="small"
        />
      </TableCell>

      <TableCell className={`${classes.tableCell} ${classes.datasetCell}`}>
        <div className={classes.datasetNameContainer}>
          <DatasetNameLink
            datasetShortName={dataset.datasetShortName}
            displayText={dataset.datasetLongName || dataset.datasetShortName}
            typographyProps={{ variant: 'body2', noWrap: true }}
          />
          {isUnavailable && (
            <Chip
              label="No longer available"
              size="small"
              color="secondary"
              className={classes.unavailableBadge}
            />
          )}
        </div>
      </TableCell>

      <TableCell className={`${classes.tableCell} ${classes.typeCell}`}>
        {dataset.datasetMake || 'N/A'}
      </TableCell>

      <TableCell className={`${classes.tableCell} ${classes.dateCell}`}>
        {dateRange.start} to
        <br />
        {dateRange.end}
      </TableCell>

      <TableCell
        className={`${classes.tableCell} ${classes.rowCountCell}`}
        align="right"
      >
        {formatRowCount(dataset.rowCount)}
      </TableCell>

      <TableCell
        className={`${classes.tableCell} ${classes.actionsCell}`}
        align="right"
      >
        {isMarkedForRemoval ? (
          <UniversalButton
            onClick={handleCancelRemoval}
            variant="secondary"
            size="small"
            className={classes.cancelButton}
          >
            Cancel
          </UniversalButton>
        ) : (
          <UniversalButton
            onClick={handleRemove}
            variant="secondary"
            size="small"
            className={classes.removeButton}
          >
            Remove
          </UniversalButton>
        )}
      </TableCell>
    </TableRow>
  );
};

DatasetTableRow.propTypes = {
  dataset: PropTypes.shape({
    datasetShortName: PropTypes.string.isRequired,
    datasetLongName: PropTypes.string,
    datasetVersion: PropTypes.string,
    timeSeriesStart: PropTypes.string,
    timeSeriesEnd: PropTypes.string,
    Time_Series_Start: PropTypes.string,
    Time_Series_End: PropTypes.string,
    rowCount: PropTypes.number,
    isValid: PropTypes.bool,
  }).isRequired,
  isMarkedForRemoval: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggleSelection: PropTypes.func.isRequired,
  onMarkForRemoval: PropTypes.func.isRequired,
  onCancelRemoval: PropTypes.func.isRequired,
};

export default DatasetTableRow;
