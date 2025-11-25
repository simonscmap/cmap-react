import React from 'react';
import { formatCoveragePercent } from './percentageFormatter';

export function renderDatasetUtilization(dataset) {
  if (typeof dataset.datasetUtilization === 'number') {
    const percent = dataset.datasetUtilization * 100;
    const rounded = parseFloat(percent.toFixed(1));
    if (rounded === 0 && dataset.datasetUtilization > 0) {
      return '< 0.05%';
    }
    return `${rounded.toFixed(1)}%`;
  }
  return 'N/A';
}

export function renderSpatialCoverage(dataset) {
  return typeof dataset.overlap.spatial.coveragePercent === 'number'
    ? `${Math.round(dataset.overlap.spatial.coveragePercent * 100)}%`
    : dataset.overlap.spatial.coveragePercent;
}

export function renderTemporalCoverage(dataset) {
  if (dataset.overlap.temporal) {
    return typeof dataset.overlap.temporal.coveragePercent === 'number'
      ? `${Math.round(dataset.overlap.temporal.coveragePercent * 100)}%`
      : dataset.overlap.temporal.coveragePercent;
  }
  return 'N/A';
}

export function renderDepthCoverage(dataset) {
  if (dataset.overlap.depth) {
    return typeof dataset.overlap.depth.coveragePercent === 'number'
      ? `${Math.round(dataset.overlap.depth.coveragePercent * 100)}%`
      : dataset.overlap.depth.coveragePercent;
  }
  return 'N/A';
}

export function renderTemporalUtilization(dataset) {
  if (
    dataset.overlap.temporal &&
    dataset.overlap.temporal.utilization !== undefined
  ) {
    return `${Math.round(dataset.overlap.temporal.utilization * 100)}%`;
  }
  return 'N/A';
}

export function renderDepthUtilization(dataset) {
  if (dataset.overlap.depth && dataset.overlap.depth.utilization !== null) {
    return `${Math.round(dataset.overlap.depth.utilization * 100)}%`;
  }
  return 'N/A';
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
