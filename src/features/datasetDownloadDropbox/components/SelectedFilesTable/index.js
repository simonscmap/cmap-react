import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { selectedFilesTableStyles } from './styles';
import { formatBytes } from '../../utils/fileUtils';

const useStyles = makeStyles(selectedFilesTableStyles);

const SelectedFilesTable = ({
  selectedFiles,
  onRemoveFile,
}) => {
  const classes = useStyles();

  return (
    <Box>
      <Typography variant="h6" className={classes.tableTitle}>
        Selected Files ({selectedFiles.length} files)
      </Typography>
      
      <TableContainer
        component={Paper}
        className={classes.container}
      >
        <Table stickyHeader className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Filename</TableCell>
              <TableCell>Size</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedFiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className={classes.emptyStateCell}>
                  <Typography variant="body2" className={classes.emptyStateText}>
                    No files selected yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              selectedFiles.map((file, index) => (
                <TableRow
                  key={`selected-${file.path}-${index}`}
                  className={classes.row}
                >
                  <TableCell className={classes.filenameCell}>
                    {file.name}
                  </TableCell>
                  <TableCell>
                    {file.sizeFormatted || formatBytes(file.size)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Remove file from selection">
                      <IconButton
                        size="small"
                        onClick={() => onRemoveFile(file)}
                        className={classes.removeButton}
                        aria-label={`Remove ${file.name} from selection`}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SelectedFilesTable;