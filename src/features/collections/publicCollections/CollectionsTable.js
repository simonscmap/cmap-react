import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tooltip,
} from '@material-ui/core';
import { format, parseISO } from 'date-fns';
import colors from '../../../enums/colors';
import CollectionButton from '../components/UniversalButton';

const useStyles = makeStyles(() => ({
  tableContainer: {
    maxHeight: 400,
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    borderRadius: '6px',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflow: 'auto',
    position: 'relative',
    zIndex: 1,
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
    minWidth: 650,
  },
  tableRow: {
    border: 0,
  },
  nameCell: {
    minWidth: 275,
    maxWidth: 400,
    padding: '8px 5px 8px 16px',
    border: 0,
    color: '#ffffff',
    verticalAlign: 'top',
  },
  creatorCell: {
    maxWidth: 150,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: '5px',
    border: 0,
    color: '#ffffff',
    lineHeight: '35px',
  },
  statsCell: {
    textAlign: 'center',
    padding: '5px',
    border: 0,
    color: '#ffffff',
    lineHeight: '35px',
  },
  dateCell: {
    fontSize: '0.875rem',
    color: '#ffffff',
    padding: '5px',
    border: 0,
    lineHeight: '35px',
  },
  emptyRow: {
    height: 200,
  },
  emptyCell: {
    textAlign: 'center',
    color: '#ffffff',
    padding: '5px',
    border: 0,
  },
  tooltip: {
    zIndex: '9901 !important',
  },
}));

const CollectionsTable = ({ collections = [] }) => {
  const classes = useStyles();

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const tableContainerStyle = {
    maxHeight: 400,
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    borderRadius: '6px',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflow: 'auto',
    position: 'relative',
    zIndex: 1,
  };

  return (
    <>
      <TableContainer component={Paper} style={tableContainerStyle}>
        <Table
          stickyHeader
          size="small"
          className={classes.table}
          aria-label="public collections table"
        >
          <TableHead
            style={{
              backgroundColor: 'rgba(30, 67, 113, 1)',
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}
          >
            <TableRow>
              <TableCell
                style={{
                  padding: '8px 5px 8px 16px',
                  border: 0,
                  color: '#8bc34a',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: 'rgba(30, 67, 113, 1)',
                }}
              >
                Collection Name
              </TableCell>
              <TableCell
                style={{
                  padding: '8px 5px',
                  border: 0,
                  color: '#8bc34a',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: 'rgba(30, 67, 113, 1)',
                }}
              >
                Creator
              </TableCell>
              <TableCell
                align="center"
                style={{
                  padding: '8px 5px',
                  border: 0,
                  color: '#8bc34a',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: 'rgba(30, 67, 113, 1)',
                }}
              >
                Datasets
              </TableCell>
              <TableCell
                style={{
                  padding: '8px 5px',
                  border: 0,
                  color: '#8bc34a',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: 'rgba(30, 67, 113, 1)',
                }}
              >
                Created
              </TableCell>
              <TableCell
                align="center"
                style={{
                  padding: '8px 5px',
                  border: 0,
                  color: '#8bc34a',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: 'rgba(30, 67, 113, 1)',
                }}
              >
                Downloads
              </TableCell>
              <TableCell
                style={{
                  padding: '8px 5px',
                  border: 0,
                  color: '#8bc34a',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: 'rgba(30, 67, 113, 1)',
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collections.length === 0 ? (
              <TableRow className={classes.emptyRow}>
                <TableCell colSpan={6} className={classes.emptyCell}>
                  <Typography variant="body1">
                    No collections to display
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => (
                <TableRow key={collection.id} className={classes.tableRow}>
                  <TableCell className={classes.nameCell}>
                    <Box>
                      <Typography
                        variant="body2"
                        style={{ color: '#ffffff', fontWeight: 500 }}
                        noWrap
                      >
                        {collection.name}
                      </Typography>
                      {collection.description && (
                        <Tooltip
                          title={collection.description}
                          classes={{ tooltip: classes.tooltip }}
                          PopperProps={{
                            style: { zIndex: 9901 },
                          }}
                        >
                          <Typography
                            variant="caption"
                            style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              wordWrap: 'break-word',
                              lineHeight: '1.2',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {collection.description}
                          </Typography>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell className={classes.creatorCell}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                    >
                      <Typography
                        variant="body2"
                        noWrap
                        style={{ color: '#ffffff' }}
                      >
                        {collection.ownerName}
                      </Typography>
                      {collection.ownerAffiliation && (
                        <Typography
                          variant="caption"
                          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                          noWrap
                        >
                          {collection.ownerAffiliation}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center" className={classes.statsCell}>
                    <Typography variant="body2" noWrap>
                      {collection.datasetCount || 0}
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.dateCell}>
                    <Typography variant="body2" noWrap>
                      {formatDate(collection.createdDate)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" className={classes.statsCell}>
                    <Typography variant="body2" noWrap>
                      {collection.copyCount || 0}
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.statsCell}>
                    <Box display="flex" gap={1}>
                      <CollectionButton variant="secondary" size="medium">
                        Preview
                      </CollectionButton>
                      <CollectionButton variant="primary" size="medium">
                        Copy
                      </CollectionButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CollectionsTable;
