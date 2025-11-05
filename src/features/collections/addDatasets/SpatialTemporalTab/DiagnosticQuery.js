/**
 * DiagnosticQuery - Temporary component to identify datasets excluded by includePartialOverlaps
 *
 * This component runs two identical searches with different includePartialOverlaps settings
 * to identify which datasets have spatial bounds extending beyond Earth's physical limits.
 */

import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { searchCatalog, createSearchQuery } from '../../../catalogSearch/api';
import initLogger from '../../../../Services/log-service';

const logger = initLogger('DiagnosticQuery');

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    border: '2px solid #ffc107',
    borderRadius: '4px',
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: 'bold',
    color: '#ffc107',
    marginBottom: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(1),
  },
  results: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
    maxHeight: '400px',
    overflow: 'auto',
  },
}));

const DiagnosticQuery = () => {
  const classes = useStyles();
  const [isRunning, setIsRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setDiagnosticResults(null);

    try {
      logger.debug('Starting diagnostic comparison');

      // Query 1: With partial overlaps (includePartialOverlaps: true)
      const query1 = createSearchQuery()
        .withSpatialBounds(
          {
            latMin: -90,
            latMax: 90,
            lonMin: -180,
            lonMax: 180,
          },
          true, // includePartialOverlaps
        )
        .build();

      logger.debug('Running query 1 (includePartialOverlaps: true)', query1);
      const results1 = await searchCatalog(query1);
      logger.debug(`Query 1 returned ${results1.length} datasets`);

      // Query 2: Without partial overlaps (includePartialOverlaps: false)
      const query2 = createSearchQuery()
        .withSpatialBounds(
          {
            latMin: -90,
            latMax: 90,
            lonMin: -180,
            lonMax: 180,
          },
          false, // includePartialOverlaps
        )
        .build();

      logger.debug('Running query 2 (includePartialOverlaps: false)', query2);
      const results2 = await searchCatalog(query2);
      logger.debug(`Query 2 returned ${results2.length} datasets`);

      // Debug: Check the structure of the first few results
      logger.debug(
        '=== FIRST 5 RESULTS FROM QUERY 1 (with partial overlaps) ===',
      );
      results1.slice(0, 5).forEach((result, idx) => {
        logger.debug(`Result ${idx + 1}:`, result);
      });

      logger.debug(
        '=== FIRST 5 RESULTS FROM QUERY 2 (without partial overlaps) ===',
      );
      results2.slice(0, 5).forEach((result, idx) => {
        logger.debug(`Result ${idx + 1}:`, result);
      });

      // Find the difference - try multiple field name possibilities
      const getDatasetId = (d) =>
        d.Short_Name || d.shortName || d.Dataset_Name || d.id;

      const shortNames1 = new Set(results1.map(getDatasetId));
      const shortNames2 = new Set(results2.map(getDatasetId));

      logger.debug('Set 1 size:', shortNames1.size);
      logger.debug('Set 2 size:', shortNames2.size);

      const missingDatasets = results1.filter(
        (d) => !shortNames2.has(getDatasetId(d)),
      );

      logger.debug(`Found ${missingDatasets.length} missing datasets`);

      // Log first few names from each set for debugging
      logger.debug('First 5 from set 1:', Array.from(shortNames1).slice(0, 5));
      logger.debug('First 5 from set 2:', Array.from(shortNames2).slice(0, 5));

      // Debug: Log all 5 ARGO datasets in detail
      logger.debug('=== DETAILED ARGO DATASET INSPECTION ===');
      const argoDatasets = results1.filter((d) => {
        const id = getDatasetId(d);
        return id && id.startsWith('ARGO_BGC');
      });
      logger.debug(
        `Found ${argoDatasets.length} ARGO_BGC datasets in results1`,
      );
      argoDatasets.forEach((dataset) => {
        logger.debug(`\n${getDatasetId(dataset)} - RAW OBJECT:`, dataset);
        logger.debug('  All keys:', Object.keys(dataset));
        logger.debug('  Spatial field attempts:', {
          latMin: dataset.latMin,
          Lat_Min: dataset.Lat_Min,
          'spatial.latMin': dataset.spatial?.latMin,
        });
      });

      // Debug: Compare with a working dataset
      logger.debug('=== COMPARISON WITH WORKING DATASET ===');
      const nonArgoDataset = results1.find((d) => {
        const id = getDatasetId(d);
        return id && !id.startsWith('ARGO_BGC');
      });
      if (nonArgoDataset) {
        logger.debug('Non-ARGO dataset for comparison:', nonArgoDataset);
        logger.debug('  All keys:', Object.keys(nonArgoDataset));
      }

      // Format results for display
      const output = {
        summary: {
          withPartialOverlaps: results1.length,
          withoutPartialOverlaps: results2.length,
          difference: missingDatasets.length,
        },
        missingDatasets: missingDatasets.map((d) => ({
          shortName: getDatasetId(d),
          longName: d.Long_Name || d.longName || d.Dataset_Long_Name || 'N/A',
          spatialBounds: {
            latMin: d.Lat_Min ?? d.latMin ?? null,
            latMax: d.Lat_Max ?? d.latMax ?? null,
            lonMin: d.Lon_Min ?? d.lonMin ?? null,
            lonMax: d.Lon_Max ?? d.lonMax ?? null,
          },
          temporalBounds: {
            timeStart: d.Time_Min ?? d.timeMin ?? null,
            timeEnd: d.Time_Max ?? d.timeMax ?? null,
          },
          invalidBounds: {
            latMaxTooHigh: (d.Lat_Max ?? d.latMax) > 90,
            latMinTooLow: (d.Lat_Min ?? d.latMin) < -90,
            lonMaxTooHigh: (d.Lon_Max ?? d.lonMax) > 180,
            lonMinTooLow: (d.Lon_Min ?? d.lonMin) < -180,
            hasNullLat:
              (d.Lat_Min ?? d.latMin) === null ||
              (d.Lat_Max ?? d.latMax) === null,
            hasNullLon:
              (d.Lon_Min ?? d.lonMin) === null ||
              (d.Lon_Max ?? d.lonMax) === null,
          },
        })),
      };

      logger.debug('Diagnostic results:', output);
      setDiagnosticResults(output);

      // Also log to console for easy copying
      console.log('=== DIAGNOSTIC RESULTS ===');
      console.log('Summary:', output.summary);
      console.log('\nMissing Datasets:');
      output.missingDatasets.forEach((dataset, idx) => {
        console.log(`\n${idx + 1}. ${dataset.shortName}`);
        console.log(`   Long Name: ${dataset.longName}`);
        console.log(`   Spatial Bounds:`, dataset.spatialBounds);
        console.log(`   Temporal Bounds:`, dataset.temporalBounds);
        console.log(`   Invalid Bounds:`, dataset.invalidBounds);

        // Log only spatial/temporal/depth and coverage fields for comparison
        const rawDataset = missingDatasets[idx];
        console.log(`   BOUNDS & COVERAGE:`, {
          spatial: rawDataset.spatial,
          temporal: rawDataset.temporal,
          depth: rawDataset.depth,
          spatial_coverage: rawDataset.spatial_coverage,
          temporal_coverage: rawDataset.temporal_coverage,
          depth_coverage: rawDataset.depth_coverage,
          roi_area: rawDataset.roi_area,
          dataset_area: rawDataset.dataset_area,
          intersection_area: rawDataset.intersection_area,
          dataset_utilization: rawDataset.dataset_utilization,
        });
      });
      console.log('=== END DIAGNOSTIC RESULTS ===');
    } catch (error) {
      logger.error('Diagnostic failed:', error);
      setDiagnosticResults({
        error: error.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Box className={classes.container}>
      <Typography className={classes.title}>
        🔍 DIAGNOSTIC MODE - Identify Invalid Spatial Bounds
      </Typography>
      <Typography variant="body2">
        This will run two searches with global bounds (lat: [-90, 90], lon:
        [-180, 180]) to identify datasets excluded by full containment mode.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={runDiagnostic}
        disabled={isRunning}
        className={classes.button}
      >
        {isRunning ? (
          <>
            <CircularProgress size={20} style={{ marginRight: 8 }} />
            Running Diagnostic...
          </>
        ) : (
          'Run Diagnostic Query'
        )}
      </Button>

      {diagnosticResults && (
        <Box className={classes.results}>
          {diagnosticResults.error ? (
            <Typography color="error">
              Error: {diagnosticResults.error}
            </Typography>
          ) : (
            <>
              <Typography>
                <strong>SUMMARY:</strong>
              </Typography>
              <Typography>
                • With partial overlaps:{' '}
                {diagnosticResults.summary.withPartialOverlaps} datasets
              </Typography>
              <Typography>
                • Without partial overlaps:{' '}
                {diagnosticResults.summary.withoutPartialOverlaps} datasets
              </Typography>
              <Typography>
                •{' '}
                <strong>
                  DIFFERENCE: {diagnosticResults.summary.difference} datasets
                </strong>
              </Typography>

              <Typography style={{ marginTop: 16 }}>
                <strong>MISSING DATASETS:</strong>
              </Typography>
              {diagnosticResults.missingDatasets.map((dataset, idx) => (
                <Box key={dataset.shortName} style={{ marginTop: 16 }}>
                  <Typography>
                    <strong>
                      {idx + 1}. {dataset.shortName}
                    </strong>
                  </Typography>
                  <Typography style={{ fontSize: 11, marginLeft: 16 }}>
                    Long Name: {dataset.longName}
                  </Typography>
                  <Typography style={{ fontSize: 11, marginLeft: 16 }}>
                    Lat: [{dataset.spatialBounds.latMin},{' '}
                    {dataset.spatialBounds.latMax}]
                    {dataset.invalidBounds.latMaxTooHigh && ' ⚠️ latMax > 90'}
                    {dataset.invalidBounds.latMinTooLow && ' ⚠️ latMin < -90'}
                    {dataset.invalidBounds.hasNullLat && ' ⚠️ NULL lat'}
                  </Typography>
                  <Typography style={{ fontSize: 11, marginLeft: 16 }}>
                    Lon: [{dataset.spatialBounds.lonMin},{' '}
                    {dataset.spatialBounds.lonMax}]
                    {dataset.invalidBounds.lonMaxTooHigh && ' ⚠️ lonMax > 180'}
                    {dataset.invalidBounds.lonMinTooLow && ' ⚠️ lonMin < -180'}
                    {dataset.invalidBounds.hasNullLon && ' ⚠️ NULL lon'}
                  </Typography>
                  <Typography style={{ fontSize: 11, marginLeft: 16 }}>
                    Time: {dataset.temporalBounds.timeStart || 'NULL'} to{' '}
                    {dataset.temporalBounds.timeEnd || 'NULL'}
                  </Typography>
                </Box>
              ))}

              <Typography style={{ marginTop: 16, color: '#ffc107' }}>
                ✓ Full results also logged to console (F12)
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DiagnosticQuery;
