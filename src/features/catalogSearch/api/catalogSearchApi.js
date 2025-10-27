import { apiUrl, fetchOptions } from '../../../api/config';

/**
 * SQLite Database Schema
 *
 * Table: datasets
 * - datasetId INTEGER PRIMARY KEY
 * - shortName TEXT NOT NULL
 * - longName TEXT
 * - description TEXT
 * - variableLongNames TEXT (comma-separated)
 * - variableShortNames TEXT (comma-separated)
 * - distributor TEXT
 * - dataSource TEXT
 * - processLevel TEXT
 * - studyDomain TEXT
 * - keywords TEXT (comma-separated)
 * - latMin REAL
 * - latMax REAL
 * - lonMin REAL
 * - lonMax REAL
 * - timeMin TEXT (ISO8601)
 * - timeMax TEXT (ISO8601)
 * - depthMin REAL
 * - depthMax REAL
 * - sensors TEXT (comma-separated)
 * - make TEXT (comma-separated)
 * - regions TEXT (comma-separated)
 * - datasetType TEXT (calculated: 'Model', 'Satellite', or 'In-Situ')
 * - rowCount REAL (number of rows in the dataset)
 * - metadataJson TEXT (complete dataset metadata as JSON)
 *
 * Indexes:
 * - idx_spatial ON (latMin, latMax, lonMin, lonMax)
 * - idx_temporal ON (timeMin, timeMax)
 * - idx_depth ON (depthMin, depthMax)
 *
 * Virtual Table: datasets_fts (FTS5 full-text search)
 * - Searches: shortName, longName, description, variableLongNames, variableShortNames,
 *   sensors, distributor, dataSource, keywords, processLevel, studyDomain, make, regions, datasetType
 * - Uses porter stemming and unicode61 tokenization
 * - Content references 'datasets' table with content_rowid='datasetId'
 *
 * Table: regions
 * - regionId INTEGER PRIMARY KEY
 * - regionName TEXT NOT NULL
 * - Contains region data for dropdown lists and filtering
 */

const catalogSearchApi = {};

/**
 * Retrieve the full catalog as a gzipped SQLite database
 * @returns {Promise<{blob: Blob, version: object}>} Gzipped SQLite database blob and version metadata
 * @throws {Error} 500: Server error
 * @description Returns the complete dataset catalog as a compressed SQLite database.
 * Cached for 24 hours. See schema documentation above for table structure.
 *
 * Version metadata includes:
 * - checksum: Data content checksum (changes when datasets added/removed/updated)
 * - schemaVersion: Database schema version
 * - datasetCount: Total number of datasets in the catalog
 * - generatedAt: ISO timestamp when the catalog was generated
 */
catalogSearchApi.getFullCatalogDb = async () => {
  const endpoint = `${apiUrl}/api/catalog/full-catalog-db`;

  // Custom fetch options to prevent automatic decompression
  // We want the raw gzipped data so we can manage decompression ourselves
  const options = {
    ...fetchOptions,
    headers: {
      // Explicitly tell the browser NOT to decompress by omitting gzip from Accept-Encoding
      // or by using 'identity' which means no encoding
      'Accept-Encoding': 'identity',
    },
  };

  const response = await fetch(endpoint, options);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch catalog database: ${response.status} ${response.statusText}`,
    );
  }

  const blob = await response.blob();

  // Extract version metadata from response headers
  const version = {
    checksum: response.headers.get('X-Catalog-Checksum') || 'unknown',
    schemaVersion: response.headers.get('X-Catalog-Version') || 'unknown',
    datasetCount: parseInt(response.headers.get('X-Catalog-Dataset-Count') || '0', 10),
    generatedAt: response.headers.get('X-Catalog-Generated-At') || new Date().toISOString(),
  };

  return { blob, version };
};

export default catalogSearchApi;
