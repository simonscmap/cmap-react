import React from 'react';
import {
  TableCell,
  Checkbox,
  Typography,
  Box,
  Chip,
} from '@material-ui/core';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import { dateToUTCDateString } from '../../../shared/filtering/utils/dateHelpers';
import { DatasetNameLink } from '../../../shared/components';
import temporalResolutions from '../../../enums/temporalResolutions';
import { RowCountCell } from '../../rowCount';
import colors from '../../../enums/colors';

let bodyCellStyle = {
  padding: '12px 8px',
  border: 0,
  color: '#ffffff',
  lineHeight: 1.4,
  verticalAlign: 'middle',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

let datasetNameCellStyle = {
  padding: '12px 8px',
  border: 0,
  color: '#ffffff',
  lineHeight: 1.4,
  verticalAlign: 'middle',
  minWidth: 150,
  whiteSpace: 'normal',
  wordBreak: 'break-word',
};

function formatLatLon(value) {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  return Number(value).toFixed(1);
}

function formatDepth(value) {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  return Math.round(Number(value)).toLocaleString();
}

function formatTime(value, datasetMetadata, isStartDate) {
  if (value === null || value === undefined) {
    let isMonthlyClimatology =
      (datasetMetadata && datasetMetadata.Temporal_Resolution) ===
        temporalResolutions.monthlyClimatology ||
      ((datasetMetadata && datasetMetadata.Time_Min) === null &&
        (datasetMetadata && datasetMetadata.Time_Max) === null);

    if (isMonthlyClimatology) {
      return isStartDate ? 'Monthly' : 'Climatology';
    }
    return 'N/A';
  }
  return dateToUTCDateString(value) || 'N/A';
}

let MultiDatasetDownloadRow = React.memo(function MultiDatasetDownloadRow(props) {
  let { datasetMetadata, currentConstraints, handleProgramClick } = props;
  let datasetName = datasetMetadata.Dataset_Name;

  let isSelected = useMultiDatasetDownloadStore(function (state) {
    return state.selectedDatasets.has(datasetName);
  });

  let toggleDatasetSelection = useMultiDatasetDownloadStore(function (state) {
    return state.toggleDatasetSelection;
  });

  let handleToggle = function (event) {
    event.stopPropagation();
    toggleDatasetSelection(datasetName);
  };

  let programs = datasetMetadata.Programs;
  let filteredPrograms = programs
    ? programs.filter(function (program) { return program !== 'NA'; })
    : null;

  return (
    <React.Fragment>
      <TableCell style={bodyCellStyle}>
        <Checkbox
          checked={isSelected}
          onChange={handleToggle}
          color="primary"
          size="small"
        />
      </TableCell>
      <TableCell style={datasetNameCellStyle}>
        <DatasetNameLink
          datasetShortName={datasetName}
          typographyProps={{ variant: 'body2' }}
        />
      </TableCell>
      <TableCell align="right" style={{ ...bodyCellStyle, paddingRight: '16px' }}>
        <RowCountCell
          shortName={datasetName}
          currentConstraints={currentConstraints}
        />
      </TableCell>
      <TableCell style={bodyCellStyle}>
        <Typography variant="body2" noWrap>
          {formatTime(datasetMetadata.Time_Min, datasetMetadata, true)}
        </Typography>
      </TableCell>
      <TableCell style={bodyCellStyle}>
        <Typography variant="body2" noWrap>
          {formatTime(datasetMetadata.Time_Max, datasetMetadata, false)}
        </Typography>
      </TableCell>
      <TableCell align="right" style={bodyCellStyle}>
        <Typography variant="body2" noWrap>
          {formatLatLon(datasetMetadata.Lat_Min)}
        </Typography>
      </TableCell>
      <TableCell align="right" style={bodyCellStyle}>
        <Typography variant="body2" noWrap>
          {formatLatLon(datasetMetadata.Lat_Max)}
        </Typography>
      </TableCell>
      <TableCell align="right" style={bodyCellStyle}>
        <Typography variant="body2" noWrap>
          {formatLatLon(datasetMetadata.Lon_Min)}
        </Typography>
      </TableCell>
      <TableCell align="right" style={bodyCellStyle}>
        <Typography variant="body2" noWrap>
          {formatLatLon(datasetMetadata.Lon_Max)}
        </Typography>
      </TableCell>
      <TableCell align="right" style={bodyCellStyle}>
        <Typography variant="body2" noWrap>
          {formatDepth(datasetMetadata.Depth_Min)}
        </Typography>
      </TableCell>
      <TableCell align="right" style={bodyCellStyle}>
        <Typography variant="body2" noWrap>
          {formatDepth(datasetMetadata.Depth_Max)}
        </Typography>
      </TableCell>
      <TableCell style={bodyCellStyle}>
        <Box display="flex" flexWrap="wrap" style={{ gap: '3px' }}>
          {filteredPrograms && filteredPrograms.length > 0
            ? filteredPrograms.map(function (program, index) {
                return (
                  <Chip
                    key={index}
                    label={program}
                    size="small"
                    clickable
                    onClick={handleProgramClick(program)}
                    style={{
                      backgroundColor: colors.lightGreen,
                      color: '#000000',
                      fontSize: '0.75rem',
                      height: '20px',
                      cursor: 'pointer',
                    }}
                  />
                );
              })
            : null}
        </Box>
      </TableCell>
    </React.Fragment>
  );
});

export default MultiDatasetDownloadRow;
