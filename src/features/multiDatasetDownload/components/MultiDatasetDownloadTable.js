import React, { useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
} from '@material-ui/core';
import { styled } from '@material-ui/core/styles';

import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import useRowCountStore from '../stores/useRowCountStore';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 400,
  backgroundColor: 'rgba(16, 43, 60, 0.6)',
  borderRadius: '6px',
  boxShadow:
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
  overflow: 'auto',
  position: 'relative',
  zIndex: 1,
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: 'rgba(30, 67, 113, 1)',
  position: 'sticky',
  top: 0,
  zIndex: 2,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '8px 5px',
  border: 0,
  color: '#8bc34a',
  fontSize: '0.875rem',
  fontWeight: 500,
  backgroundColor: 'rgba(30, 67, 113, 1)',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(16, 43, 60, 1)',
  },
  border: 0,
}));

const StyledBodyTableCell = styled(TableCell)(({ theme }) => ({
  padding: '5px',
  border: 0,
  color: theme.palette.common.white,
  lineHeight: '35px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const MultiDatasetDownloadTable = () => {
  const { datasetsMetadata, isDatasetSelected, toggleDatasetSelection } =
    useMultiDatasetDownloadStore();
  const {
    getEffectiveRowCount,
    isRowCountLoading,
    getRowCountError,
    initializeWithDatasets,
  } = useRowCountStore();

  const handleToggle = (datasetName) => (event) => {
    event.stopPropagation();
    toggleDatasetSelection(datasetName);
  };

  const getValueOrNA = (value) => {
    return value !== null && value !== undefined ? value : 'N/A';
  };

  const renderRowCount = (datasetName) => {
    const effectiveCount = getEffectiveRowCount(datasetName);
    const isLoading = isRowCountLoading(datasetName);
    const error = getRowCountError(datasetName);

    if (isLoading) {
      return <CircularProgress size={16} color="primary" />;
    }
    if (error) {
      return (
        <Typography variant="body2" color="error">
          Error
        </Typography>
      );
    }
    return (
      <Typography variant="body2" noWrap>
        {effectiveCount !== null && effectiveCount !== undefined
          ? effectiveCount.toLocaleString()
          : 'N/A'}
      </Typography>
    );
  };

  useEffect(() => {
    if (datasetsMetadata?.length > 0) {
      const rowCountData = {};
      datasetsMetadata.forEach((dataset) => {
        if (dataset.Row_Count) {
          rowCountData[dataset.Dataset_Name] = dataset.Row_Count;
        }
      });
      initializeWithDatasets(rowCountData);
    }
  }, []);

  if (!datasetsMetadata || datasetsMetadata.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1" color="textSecondary">
          No datasets available
        </Typography>
      </Box>
    );
  }

  return (
    <StyledTableContainer component={Paper}>
      <Table stickyHeader size="small" aria-label="dataset selection table">
        <StyledTableHead>
          <TableRow>
            <StyledTableCell width={50} />
            <StyledTableCell>Dataset Name</StyledTableCell>
            <StyledTableCell width={80}>Lat Min</StyledTableCell>
            <StyledTableCell width={80}>Lat Max</StyledTableCell>
            <StyledTableCell width={80}>Lon Min</StyledTableCell>
            <StyledTableCell width={80}>Lon Max</StyledTableCell>
            <StyledTableCell width={80}>Time Min</StyledTableCell>
            <StyledTableCell width={80}>Time Max</StyledTableCell>
            <StyledTableCell width={80}>Depth Min</StyledTableCell>
            <StyledTableCell width={80}>Depth Max</StyledTableCell>
            <StyledTableCell width={120}>Row Count</StyledTableCell>
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {datasetsMetadata.map((datasetMetadata) => {
            const isSelected = isDatasetSelected(datasetMetadata.Dataset_Name);
            return (
              <StyledTableRow
                key={datasetMetadata.Dataset_Name}
                selected={isSelected}
                hover
              >
                <StyledBodyTableCell>
                  <Checkbox
                    checked={isSelected}
                    onChange={handleToggle(datasetMetadata.Dataset_Name)}
                    color="primary"
                    size="small"
                  />
                </StyledBodyTableCell>
                <StyledBodyTableCell>
                  <Typography variant="body2" noWrap>
                    {datasetMetadata.Dataset_Name || ''}
                  </Typography>
                </StyledBodyTableCell>
                <StyledBodyTableCell>
                  <Typography variant="body2" noWrap>
                    {getValueOrNA(datasetMetadata.Lat_Min)}
                  </Typography>
                </StyledBodyTableCell>
                <StyledBodyTableCell>
                  <Typography variant="body2" noWrap>
                    {getValueOrNA(datasetMetadata.Lat_Max)}
                  </Typography>
                </StyledBodyTableCell>
                <StyledBodyTableCell>
                  <Typography variant="body2" noWrap>
                    {getValueOrNA(datasetMetadata.Lon_Min)}
                  </Typography>
                </StyledBodyTableCell>
                <StyledBodyTableCell>
                  <Typography variant="body2" noWrap>
                    {getValueOrNA(datasetMetadata.Lon_Max)}
                  </Typography>
                </StyledBodyTableCell>
                <StyledBodyTableCell>
                  <Typography variant="body2" noWrap>
                    {getValueOrNA(datasetMetadata.Time_Min)}
                  </Typography>
                </StyledBodyTableCell>
                <StyledBodyTableCell>
                  <Typography variant="body2" noWrap>
                    {getValueOrNA(datasetMetadata.Time_Max)}
                  </Typography>
                </StyledBodyTableCell>
                <StyledBodyTableCell>
                  <Typography variant="body2" noWrap>
                    {getValueOrNA(datasetMetadata.Depth_Min)}
                  </Typography>
                </StyledBodyTableCell>
                <StyledBodyTableCell>
                  <Typography variant="body2" noWrap>
                    {getValueOrNA(datasetMetadata.Depth_Max)}
                  </Typography>
                </StyledBodyTableCell>
                <StyledBodyTableCell>
                  {renderRowCount(datasetMetadata.Dataset_Name)}
                </StyledBodyTableCell>
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default MultiDatasetDownloadTable;
