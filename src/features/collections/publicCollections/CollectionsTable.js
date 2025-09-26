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
  Button,
} from '@material-ui/core';
import { format, parseISO } from 'date-fns';
import colors from '../../../enums/colors';

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
    '&:hover': {
      backgroundColor: 'rgba(16, 43, 60, 1)',
      cursor: 'pointer',
    },
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
  previewButton: {
    color: '#9e9e9e',
    border: '1px solid #9e9e9e',
    '&:hover': {
      border: '1px solid #9e9e9e',
      backgroundColor: 'rgba(158, 158, 158, 0.1)',
    },
    borderRadius: '20px',
    boxSizing: 'border-box',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1,
    textTransform: 'none',
    minWidth: 'auto',
    width: 'fit-content',
    height: '28px',
    marginRight: '8px',
  },
  copyButton: {
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
    '&:hover': {
      border: `1px solid ${colors.primary}`,
      backgroundColor: colors.greenHover,
    },
    borderRadius: '20px',
    boxSizing: 'border-box',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1,
    textTransform: 'none',
    minWidth: 'auto',
    width: 'fit-content',
    height: '28px',
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

  const getDynamicCharacterLimit = () => {
    // Base calculation: 250px min width allows ~100 chars across 2 lines
    // 400px max width allows ~160 chars across 2 lines
    // Using viewport width as a proxy for column width responsiveness
    const viewportWidth = window.innerWidth;

    if (viewportWidth < 768) {
      return 100; // Mobile/small screens - minimum
    } else if (viewportWidth < 1200) {
      return 130; // Medium screens
    } else {
      return 160; // Large screens - can show more
    }
  };

  const truncateDescription = (description) => {
    if (!description) return description;

    const maxLength = getDynamicCharacterLimit();

    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength) + '...';
  };

  const handleRowClick = (collection) => {
    // TODO: Navigate to collection detail page when implemented
    console.log('Navigate to collection:', collection.id);
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
                <TableRow
                  key={collection.id}
                  className={classes.tableRow}
                  onClick={() => handleRowClick(collection)}
                >
                  <TableCell className={classes.nameCell}>
                    <Box>
                      <Typography
                        variant="body2"
                        style={{ color: '#ffffff', fontWeight: 500 }}
                        noWrap
                        title={collection.name}
                      >
                        {collection.name}
                      </Typography>
                      {collection.description && (
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
                          title={collection.description}
                        >
                          {truncateDescription(collection.description)}
                        </Typography>
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
                          title={collection.ownerAffiliation}
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
                    <Box display="flex">
                      <Button
                        variant="outlined"
                        size="medium"
                        className={classes.previewButton}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outlined"
                        size="medium"
                        className={classes.copyButton}
                      >
                        Copy
                      </Button>
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
