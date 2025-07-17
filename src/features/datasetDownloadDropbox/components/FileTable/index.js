import React from 'react';
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { fileTableStyles } from './styles';
import { formatBytes } from '../../utils/fileUtils';

const useStyles = makeStyles(fileTableStyles);

const FileTable = ({
  allFiles,
  selectedFiles,
  areAllSelected,
  areIndeterminate,
  onSelectAll,
  onToggleFile,
  isLoading = false,
}) => {
  const classes = useStyles();

  return (
    <Box position="relative">
      {isLoading && <CircularProgress className={classes.loadingSpinner} />}
      <TableContainer
        component={Paper}
        className={`${classes.container} ${
          isLoading ? classes.loadingOverlay : ''
        }`}
      >
        <Table stickyHeader className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={areIndeterminate}
                  checked={areAllSelected}
                  onChange={onSelectAll}
                  color="primary"
                />
              </TableCell>
              <TableCell>Filename</TableCell>
              <TableCell>Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allFiles.map((file, index) => (
              <TableRow
                key={`file-${index}`}
                className={classes.row}
                hover
                onClick={() => onToggleFile(file)}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedFiles.some((f) => f.path === file.path)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>{file.name}</TableCell>
                <TableCell>
                  {file.sizeFormatted || formatBytes(file.size)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FileTable;
