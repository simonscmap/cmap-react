import { apiUrl, fetchOptions, postOptions } from '../../../api/config';
import fetchWithAuth from '../../../api/fetchWithAuth';

/**
 * Collections API Client
 *
 * Endpoint Authentication Summary:
 * - GET /api/collections - Optional auth (anonymous users see only public collections)
 * - GET /api/collections/:id - REQUIRED auth (401 if not authenticated)
 * - POST /api/collections - REQUIRED auth
 * - PATCH /api/collections/:id - REQUIRED auth
 * - DELETE /api/collections/:id - REQUIRED auth
 * - POST /api/collections/:id/copy - REQUIRED auth
 * - GET /api/collections/verify-name - REQUIRED auth
 * - GET /api/collections/preview - NO auth required (public endpoint)
 *
 * Response Format Notes:
 * - List endpoint (GET /collections): Returns Collection objects, downloads/copies only if isOwner=true
 * - Detail endpoint (GET /collections/:id): Returns CollectionDetail with different dataset format
 * - Mutation endpoints (POST, PATCH, POST /copy): Return complete collection with all stats
 */

/**
 * @typedef {Object} CollectionDataset
 * @property {string} datasetShortName - Dataset short name identifier
 * @property {string|null} datasetLongName - Human-readable dataset name (null if invalid)
 * @property {boolean} isInvalid - Whether dataset is orphaned/removed from catalog (true = invalid, false = valid)
 * @description This typedef represents datasets returned from create, update, copy, and list (with includeDatasets=true) endpoints.
 * Note: The detail endpoint (GET /api/collections/:id) returns slightly different fields:
 * it includes datasetName (deprecated) and isValid instead of isInvalid (isValid = !isInvalid).
 */

/**
 * @typedef {Object} Collection
 * @property {number} id - Unique collection identifier
 * @property {string} name - Collection name (max 200 chars)
 * @property {string|null} description - Collection description (max 500 chars)
 * @property {boolean} isPublic - Whether collection is publicly visible
 * @property {string} createdDate - ISO 8601 UTC timestamp
 * @property {string} modifiedDate - ISO 8601 UTC timestamp
 * @property {string} ownerName - Full name of collection owner
 * @property {string} ownerAffiliation - Owner's institutional affiliation
 * @property {number} datasetCount - Number of datasets in collection (≥ 0)
 * @property {boolean} isOwner - Whether current user owns this collection
 * @property {number} views - Number of times collection has been viewed (≥ 0) - Always included in list endpoint
 * @property {number} [downloads] - Number of times collection has been downloaded (≥ 0) - Only included if isOwner=true
 * @property {number} [copies] - Number of times collection has been copied (≥ 0) - Only included if isOwner=true
 * @property {CollectionDataset[]} [datasets] - Array of dataset objects (only if includeDatasets=true)
 */

/**
 * @typedef {Object} CollectionDetail - Detailed collection response (from detail endpoint)
 * @property {number} id - Unique collection identifier
 * @property {string} name - Collection name (max 200 chars)
 * @property {string|null} description - Collection description (max 500 chars)
 * @property {boolean} isPublic - Whether collection is publicly visible
 * @property {string} createdDate - ISO 8601 UTC timestamp
 * @property {string} modifiedDate - ISO 8601 UTC timestamp
 * @property {string} ownerName - Full name of collection owner
 * @property {string} ownerAffiliation - Owner's institutional affiliation
 * @property {number} datasetCount - Number of datasets in collection (≥ 0)
 * @property {boolean} isOwner - Whether current user owns this collection
 * @property {number} [downloads] - Number of downloads (only included if isOwner=true)
 * @property {number} [copies] - Number of copies (only included if isOwner=true)
 * @property {Object[]} datasets - Array of dataset objects (always included unless includeDatasets=false)
 * @property {string} datasets[].datasetShortName - Dataset short name
 * @property {string|null} datasets[].datasetLongName - Dataset long name
 * @property {string|null} datasets[].datasetName - Dataset name (deprecated, use datasetShortName)
 * @property {boolean} datasets[].isValid - Whether dataset exists in catalog (true=valid, false=invalid/removed)
 * @description NOTE: Detail endpoint does NOT include views count
 */

const collectionsAPI = {};

/**
 * List collections based on user authentication state
 * @param {Object} [params] - Query parameters
 * @param {number} [params.limit=20] - Max collections (1-100) - NOT IMPLEMENTED YET
 * @param {number} [params.offset=0] - Pagination offset (≥ 0) - NOT IMPLEMENTED YET
 * @param {boolean} [params.includeDatasets=false] - Include dataset details
 * @returns {Promise<Response>} Array of Collection objects
 * @throws {Error} 400: Invalid parameters, 500: Server error
 */
collectionsAPI.getCollections = async (params = {}) => {
  const searchParams = new URLSearchParams();

  // TODO: Backend pagination not yet implemented
  // if (params.limit !== undefined) {
  //   searchParams.append('limit', params.limit);
  // }
  // if (params.offset !== undefined) {
  //   searchParams.append('offset', params.offset);
  // }
  if (params.includeDatasets !== undefined) {
    searchParams.append('includeDatasets', params.includeDatasets);
  }

  const queryString = searchParams.toString();
  const endpoint = `${apiUrl}/api/collections${queryString ? `?${queryString}` : ''}`;

  return await fetch(endpoint, fetchOptions);
};

/**
 * Retrieve detailed information about a specific collection
 * @deprecated This endpoint is deprecated and will be removed in a future version.
 * The createCollection endpoint now returns the complete collection object.
 * Use getCollections() to fetch collections or rely on data from createCollection/copyCollection responses.
 * @param {number} id - Collection ID (positive integer)
 * @param {Object} [params] - Query parameters
 * @param {boolean} [params.includeDatasets=true] - Include dataset details
 * @returns {Promise<Response>} CollectionDetail object
 * @throws {Error} 400: Invalid parameters, 401: Unauthorized (authentication required), 404: Collection not found or not accessible, 500: Server error
 * @description REQUIRES AUTHENTICATION. Anonymous users will receive 401.
 * Returns 404 if collection doesn't exist or user doesn't have access (private collection owned by another user).
 */
collectionsAPI.getCollectionById = async (id, params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.includeDatasets !== undefined) {
    searchParams.append('includeDatasets', params.includeDatasets);
  }

  const queryString = searchParams.toString();
  const endpoint = `${apiUrl}/api/collections/${id}${queryString ? `?${queryString}` : ''}`;

  return await fetchWithAuth(endpoint, fetchOptions);
};

/**
 * Retrieve detailed information about a specific collection (alias for getCollectionById)
 * @deprecated This endpoint is deprecated and will be removed in a future version.
 * The createCollection endpoint now returns the complete collection object.
 * Use getCollections() to fetch collections or rely on data from createCollection/copyCollection responses.
 * @param {number} id - Collection ID (positive integer)
 * @param {Object} [params] - Query parameters
 * @param {boolean} [params.includeDatasets=true] - Include dataset details
 * @returns {Promise<Response>} CollectionDetail object
 * @throws {Error} 400: Invalid parameters, 401: Unauthorized (authentication required), 404: Collection not found or not accessible, 500: Server error
 * @description REQUIRES AUTHENTICATION. Anonymous users will receive 401.
 * Returns 404 if collection doesn't exist or user doesn't have access (private collection owned by another user).
 */
collectionsAPI.getCollection = collectionsAPI.getCollectionById;

/**
 * Create a new collection with optional datasets
 * @param {Object} data - Collection creation data
 * @param {string} data.collectionName - Collection name (required, 1-200 characters)
 * @param {string} [data.description] - Collection description (optional, 0-500 characters)
 * @param {boolean} [data.private=true] - Whether collection is private (default true)
 * @param {string[]} [data.datasets] - Array of dataset short names to add to collection
 * @returns {Promise<Response>} Response body: Complete collection object with all metadata
 * @throws {Error} 401: Unauthorized, 500: Server error
 * @description Creates a new collection. Invalid dataset names are skipped, not rejected.
 * The response includes the full collection object with all metadata including:
 * - All standard collection fields (id, name, description, etc.)
 * - downloads, views, and copies counts (will be 0 for new collection)
 * - datasets array with isInvalid flags for any datasets that couldn't be added
 */
collectionsAPI.createCollection = async (data) => {
  const endpoint = `${apiUrl}/api/collections`;

  return await fetchWithAuth(endpoint, {
    ...postOptions,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Delete a collection and all associated datasets
 * @param {number} id - Collection ID (positive integer)
 * @returns {Promise<Response>} Empty response on success (204 No Content)
 * @throws {Error} 400: Invalid ID format, 401: Unauthorized, 404: Not found or user doesn't own collection, 500: Server error
 * @description Permanently deletes the collection and all associated dataset relationships.
 * Only the collection owner can delete it. This operation cannot be undone.
 */
collectionsAPI.deleteCollection = async (id) => {
  const endpoint = `${apiUrl}/api/collections/${id}`;

  return await fetchWithAuth(endpoint, {
    ...fetchOptions,
    method: 'DELETE',
  });
};

/**
 * Update an existing collection's metadata and datasets
 * @param {number} id - Collection ID (positive integer)
 * @param {Object} data - Collection update data
 * @param {string} data.collectionName - Collection name (required, 5-200 characters)
 * @param {string} data.description - Collection description (required, 0-500 characters)
 * @param {boolean} data.private - Whether collection is private (required)
 * @param {string[]} data.datasets - Array of dataset short names (required, can be empty)
 * @returns {Promise<Response>} Response body: Complete collection object with all metadata
 * @throws {Error} 400: Validation errors, 401: Unauthorized, 403: Not collection owner, 404: Collection not found, 409: Name conflict, 500: Server error
 * @description Updates all fields of an existing collection. Returns the updated collection
 * with server-validated timestamps, accurate dataset counts, and complete dataset metadata including:
 * - All standard collection fields (id, name, description, etc.)
 * - downloads, views, and copies counts
 * - datasets array with isInvalid flags for any datasets that couldn't be added
 * Only the collection owner can update. Name uniqueness is scoped per user.
 */
collectionsAPI.updateCollection = async (id, data) => {
  const endpoint = `${apiUrl}/api/collections/${id}`;

  return await fetchWithAuth(endpoint, {
    ...postOptions,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

/**
 * Verify if a collection name is available for the authenticated user
 * @param {string} name - Collection name to verify (required)
 * @param {number} [collectionId] - Optional collection ID to exclude from check (for editing)
 * @returns {Promise<Response>} Object with name and isAvailable boolean
 * @throws {Error} 401: Unauthorized, 500: Server error
 * @description Checks if the given name is available for the current user.
 * Returns true if name is available (not used by this user).
 * When collectionId is provided, that collection is excluded from the check,
 * allowing users to keep the same name when editing.
 * Name availability is scoped per user (same name can exist across different users).
 */
collectionsAPI.verifyCollectionName = async (name, collectionId) => {
  const searchParams = new URLSearchParams({ name });
  if (collectionId !== undefined && collectionId !== null) {
    searchParams.append('collectionId', collectionId);
  }

  const endpoint = `${apiUrl}/api/collections/verify-name?${searchParams.toString()}`;

  return await fetchWithAuth(endpoint, fetchOptions);
};

/**
 * Copy an existing collection to create a new collection owned by the authenticated user
 * @param {number} id - Collection ID to copy (positive integer)
 * @returns {Promise<Response>} Response body: Complete collection object with all metadata
 * @throws {Error} 401: Unauthorized, 404: Collection not found or not accessible, 500: Server error
 * @description Creates a copy of the specified collection, including all valid datasets.
 * Invalid datasets (removed from catalog) are NOT copied to the new collection.
 * Returns the complete new collection object owned by the authenticated user including:
 * - All standard collection fields (id, name, description, etc.)
 * - downloads, views, and copies counts (will be 0 for new collection)
 * - datasets array containing only valid datasets from the source collection
 * The copied collection name will have " copy" appended (or " copy 2", " copy 3", etc.) to avoid conflicts.
 * The new collection is always private regardless of source collection visibility.
 * Increments the copies count on the source collection.
 */
collectionsAPI.copyCollection = async (id) => {
  const endpoint = `${apiUrl}/api/collections/${id}/copy`;

  return await fetchWithAuth(endpoint, {
    ...postOptions,
    method: 'POST',
  });
};

/**
 * Get preview metadata for multiple datasets
 * @param {string[]} datasetShortNames - Array of dataset short names
 * @param {number} [collectionId] - Optional collection ID to track view statistics
 * @returns {Promise<Response>} Response body: Array of dataset preview objects with rowCount property
 * @throws {Error} 500: Server error
 * @description Returns metadata for multiple datasets including temporal range, row counts,
 * sensors, makes, regions, and status flags.
 *
 * NOTE: This endpoint does NOT require authentication.
 *
 * BEHAVIOR CHANGE: Returns ALL requested datasets, including invalid ones.
 * - Valid datasets: Full metadata with isInvalid: false
 * - Invalid datasets: Null metadata fields with isInvalid: true
 *
 * If collectionId is provided, increments the collection's Views count by 1 (fire-and-forget).
 *
 * @example
 * // Valid dataset response
 * {
 *   "shortName": "dataset_name",
 *   "description": "Full dataset description",
 *   "timeStart": "2020-01-01",
 *   "timeEnd": "2024-12-31",
 *   "rowCount": 150000,
 *   "sensors": ["CTD"],
 *   "makes": ["SeaBird"],
 *   "regions": ["Pacific"],
 *   "isContinuouslyUpdated": true,
 *   "hasAncillaryData": false,
 *   "isInvalid": false
 * }
 *
 * @example
 * // Invalid dataset response
 * {
 *   "shortName": "removed_dataset",
 *   "description": null,
 *   "timeStart": null,
 *   "timeEnd": null,
 *   "rowCount": null,
 *   "sensors": [],
 *   "makes": [],
 *   "regions": [],
 *   "isContinuouslyUpdated": false,
 *   "hasAncillaryData": false,
 *   "isInvalid": true
 * }
 */
collectionsAPI.getCollectionPreview = async (
  datasetShortNames,
  collectionId,
) => {
  const searchParams = new URLSearchParams();

  // Add each dataset as a separate parameter, filtering out undefined/null values
  datasetShortNames.forEach((name) => {
    if (name !== undefined && name !== null && name !== '') {
      searchParams.append('datasets', name);
    }
  });

  // Add collectionId if provided for views tracking
  if (collectionId !== undefined && collectionId !== null) {
    searchParams.append('collectionId', collectionId);
  }

  const endpoint = `${apiUrl}/api/collections/preview?${searchParams.toString()}`;

  return await fetch(endpoint, fetchOptions);
};

export default collectionsAPI;
