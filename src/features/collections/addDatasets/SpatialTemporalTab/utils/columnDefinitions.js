import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { SortableHeader } from '../../../../../shared/sorting';
import {
  DatasetNameLink,
  ROW_STATES,
  InfoTooltip,
} from '../../../../../shared/components';
import DataTypeFilterDropdown from '../components/DataTypeFilterDropdown';
import {
  renderDatasetUtilization,
  renderSpatialCoverage,
  renderTemporalCoverage,
  renderDepthCoverage,
  renderTemporalUtilization,
  renderDepthUtilization,
  renderDateOverlap,
  renderSpatialOverlap,
  renderDepthOverlap,
} from './columnRenderers';

export function createColumnDefinitions(deps) {
  const {
    classes,
    getStatusIcon,
    currentCollectionDatasetIds,
    sortMode,
    sortDirection,
    onSortChange,
    selectedDataTypes,
    setSelectedDataTypes,
    resultsCount,
  } = deps;

  return {
    status: {
      header: 'Status',
      cellClass: classes.statusCell,
      align: 'center',
      render: (dataset) => {
        const isAlreadyPresent = currentCollectionDatasetIds.has(
          dataset.shortName,
        );
        return getStatusIcon(
          isAlreadyPresent ? ROW_STATES.ALREADY_PRESENT : ROW_STATES.NORMAL,
        );
      },
    },

    name: {
      header: 'Dataset Name',
      cellClass: classes.datasetNameCell,
      render: (dataset) => (
        <Box>
          <DatasetNameLink
            datasetShortName={dataset.shortName}
            typographyProps={{
              variant: 'body2',
              noWrap: true,
            }}
          />
          {dataset.longName && (
            <Typography className={classes.datasetDescription}>
              {dataset.longName}
            </Typography>
          )}
        </Box>
      ),
    },

    type: {
      header: (
        <Box display="flex" alignItems="center">
          Type
          <DataTypeFilterDropdown
            selectedTypes={selectedDataTypes}
            onSelectionChange={setSelectedDataTypes}
            disabled={resultsCount === 0}
          />
        </Box>
      ),
      cellClass: classes.typeCell,
      render: (dataset) => dataset.type || 'N/A',
    },

    datasetUtilization: {
      header: (
        <SortableHeader
          field="datasetUtilization"
          label={
            <Box
              component="span"
              display="inline-flex"
              alignItems="flex-start"
              gap={0.375}
            >
              <span>Dataset Coverage</span>
              <InfoTooltip
                title="How much of this dataset's extent is within the ROI? 100% means the entire dataset extent falls within your ROI."
                fontSize="small"
              />
            </Box>
          }
          isActive={sortMode === 'utilization'}
          direction={sortMode === 'utilization' ? sortDirection : 'desc'}
          uiPattern="headers-only"
          onClick={onSortChange}
          className={classes.clickableHeader}
          disabled={resultsCount === 0}
        />
      ),
      cellClass: classes.utilizationCell,
      align: 'right',
      render: renderDatasetUtilization,
    },

    spatialCoverage: {
      header: (
        <SortableHeader
          field="spatialCoverage"
          label={
            <Box
              component="span"
              display="inline-flex"
              alignItems="flex-start"
              gap={0.375}
            >
              <span>ROI Coverage</span>
              <InfoTooltip
                title="How much of the ROI does this dataset's extent cover? 100% means the dataset extent covers your entire ROI."
                fontSize="small"
              />
            </Box>
          }
          isActive={sortMode === 'spatial'}
          direction={sortMode === 'spatial' ? sortDirection : 'desc'}
          uiPattern="headers-only"
          onClick={onSortChange}
          className={classes.clickableHeader}
          disabled={resultsCount === 0}
        />
      ),
      cellClass: classes.coverageCell,
      align: 'right',
      render: renderSpatialCoverage,
    },

    temporalCoverage: {
      header: (
        <SortableHeader
          field="temporalCoverage"
          label="Temporal Coverage"
          isActive={sortMode === 'temporal'}
          direction={sortMode === 'temporal' ? sortDirection : 'desc'}
          uiPattern="headers-only"
          onClick={onSortChange}
          className={classes.clickableHeader}
          disabled={resultsCount === 0}
        />
      ),
      cellClass: classes.coverageCell,
      align: 'right',
      render: renderTemporalCoverage,
    },

    depthCoverage: {
      header: (
        <SortableHeader
          field="depthCoverage"
          label="Depth Coverage"
          isActive={sortMode === 'depth'}
          direction={sortMode === 'depth' ? sortDirection : 'desc'}
          uiPattern="headers-only"
          onClick={onSortChange}
          className={classes.clickableHeader}
          disabled={resultsCount === 0}
        />
      ),
      cellClass: classes.coverageCell,
      align: 'right',
      render: renderDepthCoverage,
    },

    temporalUtilization: {
      header: (
        <Box
          component="span"
          display="inline-flex"
          alignItems="flex-start"
          gap={0.375}
        >
          <span>Temporal Util</span>
          <InfoTooltip
            title="Percentage of dataset's temporal extent within your search range"
            fontSize="small"
          />
        </Box>
      ),
      cellClass: classes.coverageCell,
      align: 'right',
      render: renderTemporalUtilization,
    },

    depthUtilization: {
      header: (
        <Box
          component="span"
          display="inline-flex"
          alignItems="flex-start"
          gap={0.375}
        >
          <span>Depth Util</span>
          <InfoTooltip
            title="Percentage of dataset's depth extent within your search range"
            fontSize="small"
          />
        </Box>
      ),
      cellClass: classes.coverageCell,
      align: 'right',
      render: renderDepthUtilization,
    },

    dateOverlap: {
      header: 'Date Overlap',
      cellClass: classes.overlapCell,
      render: renderDateOverlap,
    },

    spatialOverlap: {
      header: (
        <Box
          component="span"
          display="inline-flex"
          alignItems="flex-start"
          gap={0.375}
        >
          <span>Spatial Overlap</span>
          <InfoTooltip
            title="The geographic bounds of the overlapping region between this dataset and your ROI."
            fontSize="small"
          />
        </Box>
      ),
      cellClass: classes.overlapCell,
      render: renderSpatialOverlap,
    },

    depthOverlap: {
      header: 'Depth Overlap',
      cellClass: classes.overlapCell,
      render: renderDepthOverlap,
    },
  };
}
