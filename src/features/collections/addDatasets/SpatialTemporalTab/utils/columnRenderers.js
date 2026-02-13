import React from 'react';
import { AlignedNumber } from '../../../../../shared/components';
import { formatCoveragePercent } from './percentageFormatter';

const PERCENT_WIDTH = 55;

function renderIntegerPercent(value) {
  if (value == null) {
    return <AlignedNumber width={PERCENT_WIDTH}>N/A</AlignedNumber>;
  }
  let formatted = typeof value === 'number'
    ? `${Math.round(value * 100)}%`
    : value;
  return <AlignedNumber width={PERCENT_WIDTH}>{formatted}</AlignedNumber>;
}

export function renderDatasetUtilization(dataset) {
  let formatted = formatCoveragePercent(dataset.datasetUtilization);
  return <AlignedNumber width={PERCENT_WIDTH}>{formatted}</AlignedNumber>;
}

export function renderSpatialCoverage(dataset) {
  return renderIntegerPercent(dataset.overlap.spatial.coveragePercent);
}

export function renderTemporalCoverage(dataset) {
  let value = dataset.overlap.temporal != null
    ? dataset.overlap.temporal.coveragePercent
    : null;
  return renderIntegerPercent(value);
}

export function renderDepthCoverage(dataset) {
  let value = dataset.overlap.depth != null
    ? dataset.overlap.depth.coveragePercent
    : null;
  return renderIntegerPercent(value);
}

export function renderTemporalUtilization(dataset) {
  let value = dataset.overlap.temporal != null
    ? dataset.overlap.temporal.utilization
    : null;
  return renderIntegerPercent(value);
}

export function renderDepthUtilization(dataset) {
  let value = dataset.overlap.depth != null
    ? dataset.overlap.depth.utilization
    : null;
  return renderIntegerPercent(value);
}

export function renderDateOverlap(dataset) {
  return dataset.overlap.temporal ? dataset.overlap.temporal.range : 'N/A';
}

export function renderSpatialOverlap(dataset) {
  return dataset.overlap.spatial.extent
    .split('\n')
    .map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
}

export function renderDepthOverlap(dataset) {
  return dataset.overlap.depth ? dataset.overlap.depth.range : 'N/A';
}
