/**
 * Catalog Database API
 *
 * Handles downloading, decompressing, and caching the SQLite database.
 * Uses IndexedDB for persistent caching with version-based invalidation.
 *
 * SQLite Database Schema:
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

import pako from 'pako';
import { apiUrl, fetchOptions } from '../../../api/config';

const DB_NAME = 'CatalogSearchDB';
const DB_VERSION = 1;
const STORE_NAME = 'databases';
const DB_KEY = 'catalog-db';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// =============================================================================
// HTTP Download
// =============================================================================

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
async function downloadCatalogDb() {
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
    datasetCount: parseInt(
      response.headers.get('X-Catalog-Dataset-Count') || '0',
      10,
    ),
    generatedAt:
      response.headers.get('X-Catalog-Generated-At') ||
      new Date().toISOString(),
  };

  return { blob, version };
}

// =============================================================================
// IndexedDB Cache Management
// =============================================================================

/**
 * Open IndexedDB connection
 * @returns {Promise<IDBDatabase>}
 */
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Get cached database from IndexedDB
 * @returns {Promise<{blob: ArrayBuffer, version: object, timestamp: number} | null>}
 */
async function getCachedDatabase() {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(DB_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result;
        db.close();

        // Check if cache is still valid
        if (data && Date.now() - data.timestamp < CACHE_TTL_MS) {
          const age = (Date.now() - data.timestamp) / 1000 / 60; // minutes
          console.log(`[Cache] HIT - Age: ${age.toFixed(1)} minutes`, {
            checksum: data.version?.checksum,
            datasetCount: data.version?.datasetCount,
          });
          resolve(data);
        } else {
          if (data) {
            console.log('[Cache] EXPIRED', {
              age:
                ((Date.now() - data.timestamp) / 1000 / 60).toFixed(1) +
                ' minutes',
            });
          } else {
            console.log('[Cache] MISS');
          }
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.error('[Cache] Error:', error);
    return null;
  }
}

/**
 * Store database in IndexedDB
 * @param {ArrayBuffer} blob - Database blob
 * @param {object} version - Version metadata from server response
 * @returns {Promise<void>}
 */
async function storeDatabase(blob, version) {
  try {
    const sizeInMB = (blob.byteLength / 1024 / 1024).toFixed(1);
    console.log(`[Cache] Storing ${sizeInMB} MB`, {
      checksum: version.checksum,
      datasetCount: version.datasetCount,
      schemaVersion: version.schemaVersion,
    });
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const data = {
        blob,
        version,
        timestamp: Date.now(),
      };
      const request = store.put(data, DB_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db.close();
        console.log('[Cache] Stored successfully');
        resolve();
      };
    });
  } catch (error) {
    console.error('[Cache] Store error:', error);
    // Non-fatal error, continue without caching
  }
}

// =============================================================================
// Decompression
// =============================================================================

/**
 * Check if data is gzipped by inspecting magic bytes
 * @param {Uint8Array} data
 * @returns {boolean}
 */
function isGzipped(data) {
  // Gzip files start with magic bytes 0x1f 0x8b
  return data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b;
}

/**
 * Check if data looks like SQLite by inspecting header
 * @param {Uint8Array} data
 * @returns {boolean}
 */
function isSQLite(data) {
  // SQLite files start with "SQLite format 3\0"
  const sqliteHeader = [
    0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61,
    0x74, 0x20, 0x33, 0x00,
  ];
  if (data.length < sqliteHeader.length) return false;

  for (let i = 0; i < sqliteHeader.length; i++) {
    if (data[i] !== sqliteHeader[i]) return false;
  }
  return true;
}

/**
 * Decompress gzipped blob
 * @param {Blob} gzippedBlob - Potentially gzipped data
 * @returns {Promise<ArrayBuffer>}
 */
async function decompressBlob(gzippedBlob) {
  const arrayBuffer = await gzippedBlob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  try {
    // Check if already decompressed (browser auto-decompression)
    if (isSQLite(uint8Array)) {
      return arrayBuffer;
    }

    // Check if actually gzipped
    if (!isGzipped(uint8Array)) {
      throw new Error('Data is neither gzipped nor SQLite format');
    }

    const decompressed = pako.ungzip(uint8Array);

    // Verify decompressed data is SQLite
    if (!isSQLite(decompressed)) {
      throw new Error('Decompressed data is not valid SQLite database');
    }

    return decompressed.buffer;
  } catch (error) {
    throw new Error(`Failed to decompress database: ${error.message}`);
  }
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Download database from server
 * @returns {Promise<{blob: ArrayBuffer, version: object}>}
 */
async function downloadDatabase() {
  const { blob: gzippedBlob, version } = await downloadCatalogDb();

  const blob = await decompressBlob(gzippedBlob);

  console.log('[Download] Received catalog database', {
    checksum: version.checksum,
    datasetCount: version.datasetCount,
    schemaVersion: version.schemaVersion,
    generatedAt: version.generatedAt,
  });

  return { blob, version };
}

/**
 * Load database (from cache or download)
 * @returns {Promise<ArrayBuffer>}
 */
export async function loadDatabase() {
  // Try to load from cache first
  const cached = await getCachedDatabase();
  if (cached) {
    return cached.blob;
  }

  // Cache miss or expired, download fresh copy
  const { blob, version } = await downloadDatabase();

  // Store in cache for next time
  await storeDatabase(blob, version);

  return blob;
}

/**
 * Get the version information of the currently cached database
 * @returns {Promise<object | null>} Version metadata or null if not cached
 */
export async function getDatabaseVersion() {
  const cached = await getCachedDatabase();
  return cached ? cached.version : null;
}

/**
 * Clear cached database (for testing/debugging)
 * @returns {Promise<void>}
 */
export async function clearCache() {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(DB_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db.close();
        resolve();
      };
    });
  } catch (error) {
    // Silently handle error
  }
}

const catalogDbApi = {
  loadDatabase,
  getDatabaseVersion,
  clearCache,
};

export default catalogDbApi;
