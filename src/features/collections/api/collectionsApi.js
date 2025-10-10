import { apiUrl, fetchOptions, postOptions } from '../../../api/config';

/**
 * @typedef {Object} CollectionDataset
 * @property {number} datasetId - Dataset identifier
 * @property {string} datasetShortName - Dataset short name identifier
 * @property {string} datasetLongName - Human-readable dataset name
 * @property {string} datasetVersion - Dataset version
 * @property {boolean} isValid - Whether dataset still exists in catalog
 * @property {string} addedDate - ISO 8601 UTC timestamp when added to collection
 * @property {number|null} displayOrder - Display order within collection
 */

/**
 * @typedef {Object} Collection
 * @property {number} id - Unique collection identifier
 * @property {string} name - Collection name (max 255 chars)
 * @property {string|null} description - Collection description (max 2000 chars)
 * @property {boolean} isPublic - Whether collection is publicly visible
 * @property {string} createdDate - ISO 8601 UTC timestamp
 * @property {string} modifiedDate - ISO 8601 UTC timestamp
 * @property {string} ownerName - Full name of collection owner
 * @property {string} ownerAffiliation - Owner's institutional affiliation
 * @property {number} datasetCount - Number of datasets in collection (≥ 0)
 * @property {boolean} isOwner - Whether current user owns this collection
 * @property {number} views - Number of times collection has been viewed (≥ 0)
 * @property {number} downloads - Number of times collection has been downloaded (≥ 0)
 * @property {number} copies - Number of times collection has been copied (≥ 0)
 * @property {CollectionDataset[]} [datasets] - Array of dataset objects (only if includeDatasets=true)
 */

/**
 * @typedef {Collection} CollectionDetail - Extends Collection with additional fields
 * @property {CollectionDataset[]} [datasets] - Always included unless explicitly disabled
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
 * @param {number} id - Collection ID (positive integer)
 * @param {Object} [params] - Query parameters
 * @param {boolean} [params.includeDatasets=true] - Include dataset details
 * @returns {Promise<Response>} CollectionDetail object
 * @throws {Error} 400: Invalid parameters, 404: Not found/access denied, 500: Server error
 */
collectionsAPI.getCollectionById = async (id, params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.includeDatasets !== undefined) {
    searchParams.append('includeDatasets', params.includeDatasets);
  }

  const queryString = searchParams.toString();
  const endpoint = `${apiUrl}/api/collections/${id}${queryString ? `?${queryString}` : ''}`;

  return await fetch(endpoint, fetchOptions);
};

/**
 * Retrieve detailed information about a specific collection (alias for getCollectionById)
 * @param {number} id - Collection ID (positive integer)
 * @param {Object} [params] - Query parameters
 * @param {boolean} [params.includeDatasets=true] - Include dataset details
 * @returns {Promise<Response>} CollectionDetail object
 * @throws {Error} 400: Invalid parameters, 404: Not found/access denied, 500: Server error
 */
collectionsAPI.getCollection = collectionsAPI.getCollectionById;

/**
 * Create a new collection with optional datasets
 * @param {Object} data - Collection creation data
 * @param {string} data.collectionName - Collection name (required, 1-200 characters)
 * @param {string} [data.description] - Collection description (optional, 0-500 characters)
 * @param {boolean} [data.private=true] - Whether collection is private (default true)
 * @param {string[]} [data.datasets] - Array of dataset short names to add to collection
 * @returns {Promise<Response>} Response body: { collectionId: number, invalidDatasetCount: number }
 * @throws {Error} 401: Unauthorized, 500: Server error
 * @description Creates a new collection. Invalid dataset names are skipped, not rejected.
 * The invalidDatasetCount indicates how many dataset names didn't exist.
 */
collectionsAPI.createCollection = async (data) => {
  const endpoint = `${apiUrl}/api/collections`;

  return await fetch(endpoint, {
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

  return await fetch(endpoint, {
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
 * @returns {Promise<Response>} Response body: { collectionId: number }
 * @throws {Error} 400: Validation errors, 401: Unauthorized, 403: Not collection owner, 404: Collection not found, 409: Name conflict, 500: Server error
 * @description Updates all fields of an existing collection. Only the collection owner can update.
 * Name uniqueness is scoped per user.
 */
collectionsAPI.updateCollection = async (id, data) => {
  const endpoint = `${apiUrl}/api/collections/${id}`;

  return await fetch(endpoint, {
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

  return await fetch(endpoint, fetchOptions);
};

/**
 * Copy an existing collection to create a new collection owned by the authenticated user
 * @param {number} id - Collection ID to copy (positive integer)
 * @returns {Promise<Response>} Response body: { collectionId: number, name: string }
 * @throws {Error} 401: Unauthorized, 404: Collection not found or not accessible, 500: Server error
 * @description Creates a copy of the specified collection, including all datasets.
 * The new collection will be owned by the authenticated user.
 * The copied collection name will have " copy" appended if needed to avoid conflicts.
 */
collectionsAPI.copyCollection = async (id) => {
  const endpoint = `${apiUrl}/api/collections/${id}/copy`;

  return await fetch(endpoint, {
    ...postOptions,
    method: 'POST',
  });
};

/**
 * Get preview metadata for multiple datasets
 * @param {string[]} datasetShortNames - Array of dataset short names
 * @param {number} [collectionId] - Optional collection ID to track view statistics
 * @returns {Promise<Response>} Response body: Array of dataset preview objects with rowCount property
 * @throws {Error} 401: Unauthorized, 500: Server error
 * @description Returns metadata for multiple datasets including temporal range, row counts,
 * sensors, makes, regions, and status flags. Non-existent datasets are silently ignored.
 * If collectionId is provided, increments the collection's Views count by 1.
 */
collectionsAPI.getCollectionPreview = async (
  datasetShortNames,
  collectionId,
) => {
  const searchParams = new URLSearchParams();

  // Add each dataset as a separate parameter
  datasetShortNames.forEach((name) => {
    searchParams.append('datasets', name);
  });

  // Add collectionId if provided for views tracking
  if (collectionId !== undefined && collectionId !== null) {
    searchParams.append('collectionId', collectionId);
  }

  const endpoint = `${apiUrl}/api/collections/preview?${searchParams.toString()}`;

  return await fetch(endpoint, fetchOptions);
};

export default collectionsAPI;
