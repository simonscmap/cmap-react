import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import UniversalButton from '../../../../shared/components/UniversalButton';
import SelectAllDropdown from '../../../multiDatasetDownload/components/SelectAllDropdown';
import DatasetTableRow from './DatasetTableRow';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tableContainer: {
    maxHeight: 400,
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    borderRadius: '6px',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflowY: 'scroll',
    overflowX: 'scroll',
    position: 'relative',
    zIndex: 1,
    marginBottom: theme.spacing(2),
    '& .MuiTableCell-head': {
      backgroundColor: 'rgba(30, 67, 113, 1)',
      color: '#8bc34a',
      fontWeight: 500,
      fontSize: '0.875rem',
      position: 'sticky',
      top: 0,
      zIndex: 2,
      padding: '8px 5px',
      border: 0,
      '&:first-child': {
        padding: '8px 5px 8px 16px',
      },
    },
  },
  table: {
    width: '100%',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  tableCell: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.85rem',
    padding: '12px 8px',
    border: 0,
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    lineHeight: 1.4,
    '&:first-child': {
      paddingLeft: '16px',
    },
    '&:last-child': {
      paddingRight: '16px',
    },
  },
  checkboxCell: {
    width: '50px',
  },
  datasetNameCell: {
    minWidth: '200px',
  },
  dateRangeCell: {
    width: '140px',
    lineHeight: 1.3,
  },
  rowsCell: {
    width: '80px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  actionsCell: {
    width: '100px',
    textAlign: 'right',
  },
  bulkActionsContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-start',
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  bulkActionButton: {
    minWidth: 'auto',
  },
}));

/**
 * CollectionContentsTable
 *
 * Right panel component displaying dataset table.
 * Renders Material-UI Table with SelectAllDropdown and DatasetTableRow components.
 *
 * @param {Array} datasets - Array of dataset objects
 * @param {Array} datasetsToRemove - Array of dataset short names marked for removal
 * @param {Array} selectedDatasets - Array of selected dataset short names
 * @param {function} onMarkForRemoval - Handler for marking single dataset for removal
 * @param {function} onCancelRemoval - Handler for cancelling dataset removal
 * @param {function} onToggleSelection - Handler for toggling dataset selection
 * @param {function} onSelectAll - Handler for select all action
 * @param {function} onClearAll - Handler for clear all action
 * @param {boolean} areAllSelected - Whether all selectable datasets are selected
 * @param {boolean} areIndeterminate - Whether some (but not all) datasets are selected
 */
const CollectionContentsTable = ({
  datasets,
  datasetsToRemove,
  selectedDatasets,
  onMarkForRemoval,
  onCancelRemoval,
  onToggleSelection,
  onSelectAll,
  onClearAll,
  areAllSelected,
  areIndeterminate,
}) => {
  const classes = useStyles();

  if (!datasets || datasets.length === 0) {
    return (
      <Box className={classes.container}>
        <Paper className={classes.emptyState}>
          <Typography variant="h6" gutterBottom>
            No Datasets
          </Typography>
          <Typography variant="body2">
            This collection does not contain any datasets yet.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.headerContainer}>
        <Typography variant="h6" className={classes.sectionTitle}>
          Collection Contents
        </Typography>
        <UniversalButton
          variant="secondary"
          size="medium"
          className={classes.bulkActionButton}
          disabled
        >
          + Add Datasets
        </UniversalButton>
      </Box>

      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell className={classes.checkboxCell}>
                <SelectAllDropdown
                  areAllSelected={areAllSelected}
                  areIndeterminate={areIndeterminate}
                  onSelectAll={onSelectAll}
                  onClearAll={onClearAll}
                  disabled={datasets.length === 0}
                />
              </TableCell>
              <TableCell>Dataset Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell align="right">Rows</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datasets.map((dataset) => {
              const datasetShortName = dataset.datasetShortName;
              const isMarkedForRemoval =
                datasetsToRemove.includes(datasetShortName);
              const isSelected = selectedDatasets.includes(datasetShortName);

              return (
                <DatasetTableRow
                  key={datasetShortName}
                  dataset={dataset}
                  isMarkedForRemoval={isMarkedForRemoval}
                  isSelected={isSelected}
                  onToggleSelection={onToggleSelection}
                  onMarkForRemoval={onMarkForRemoval}
                  onCancelRemoval={onCancelRemoval}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

CollectionContentsTable.propTypes = {
  datasets: PropTypes.arrayOf(
    PropTypes.shape({
      datasetShortName: PropTypes.string.isRequired,
    }),
  ).isRequired,
  datasetsToRemove: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedDatasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  onMarkForRemoval: PropTypes.func.isRequired,
  onCancelRemoval: PropTypes.func.isRequired,
  onToggleSelection: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  areAllSelected: PropTypes.bool.isRequired,
  areIndeterminate: PropTypes.bool.isRequired,
};

export default CollectionContentsTable;
