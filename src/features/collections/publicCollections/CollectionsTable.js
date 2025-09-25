import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Typography,
  Box,
  Link,
} from '@material-ui/core';
import { format, parseISO } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    backgroundColor: theme.palette.background.paper,
    '& .MuiTableCell-head': {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText,
      fontWeight: 600,
    },
  },
  table: {
    minWidth: 650,
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
      cursor: 'pointer',
    },
  },
  nameCell: {
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  descriptionCell: {
    maxWidth: 250,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  creatorCell: {
    maxWidth: 150,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusChip: {
    fontSize: '0.75rem',
    height: 20,
  },
  publicChip: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
  warningChip: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  statsCell: {
    textAlign: 'center',
  },
  dateCell: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  emptyRow: {
    height: 200,
  },
  emptyCell: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  pagination: {
    borderTop: `1px solid ${theme.palette.divider}`,
    '& .MuiTablePagination-toolbar': {
      backgroundColor: theme.palette.background.default,
    },
  },
}));

const CollectionsTable = ({
  collections = [],
  pagination,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const classes = useStyles();

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleRowClick = (collection) => {
    // TODO: Navigate to collection detail page when implemented
    console.log('Navigate to collection:', collection.id);
  };

  const handlePageChange = (event, newPage) => {
    onPageChange(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <Paper>
      <TableContainer className={classes.tableContainer}>
        <Table className={classes.table} aria-label="public collections table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Creator</TableCell>
              <TableCell align="center">Datasets</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Previews</TableCell>
              <TableCell align="center">Copies</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Modified</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collections.length === 0 ? (
              <TableRow className={classes.emptyRow}>
                <TableCell colSpan={9} className={classes.emptyCell}>
                  <Typography variant="body1">
                    No collections to display
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => (
                <TableRow
                  key={collection.id}
                  className={classes.tableRow}
                  onClick={() => handleRowClick(collection)}
                >
                  <TableCell className={classes.nameCell}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(collection);
                      }}
                    >
                      {collection.name}
                    </Link>
                  </TableCell>
                  <TableCell className={classes.descriptionCell}>
                    <Typography variant="body2" title={collection.description}>
                      {collection.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.creatorCell}>
                    <Box>
                      <Typography variant="body2" noWrap>
                        {collection.creatorName}
                      </Typography>
                      {collection.creatorAffiliation && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          noWrap
                          title={collection.creatorAffiliation}
                        >
                          {collection.creatorAffiliation}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center" className={classes.statsCell}>
                    {collection.datasetIds?.length || 0}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={0.5}
                    >
                      <Chip
                        label="Public"
                        size="small"
                        className={`${classes.statusChip} ${classes.publicChip}`}
                      />
                      {collection.hasInvalidDatasets && (
                        <Chip
                          label="Warning"
                          size="small"
                          className={`${classes.statusChip} ${classes.warningChip}`}
                          title="Contains non-active datasets"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center" className={classes.statsCell}>
                    {collection.previewCount || 0}
                  </TableCell>
                  <TableCell align="center" className={classes.statsCell}>
                    {collection.copyCount || 0}
                  </TableCell>
                  <TableCell className={classes.dateCell}>
                    {formatDate(collection.createdAt)}
                  </TableCell>
                  <TableCell className={classes.dateCell}>
                    {formatDate(collection.lastModified)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        className={classes.pagination}
        count={pagination.total}
        page={pagination.page}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[25, 50, 100]}
        labelRowsPerPage="Collections per page:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />
    </Paper>
  );
};

export default CollectionsTable;
