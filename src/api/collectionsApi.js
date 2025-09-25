import { apiUrl, fetchOptions } from './config';

const collectionsAPI = {};

/**
 * List collections based on user authentication state
 *
 * @description Anonymous users see only public collections.
 * Authenticated users see public collections plus their own private collections.
 *
 * @param {Object} [params] - Query parameters
 * @param {number} [params.limit=20] - Maximum number of collections to return (1-100)
 * @param {number} [params.offset=0] - Number of collections to skip for pagination (≥ 0)
 * @param {boolean} [params.includeDatasets=false] - Include dataset details in response
 *
 * @returns {Promise<Response>} Response containing array of Collection objects
 *
 * @example
 * // Basic request
 * const response = await collectionsAPI.getCollections();
 *
 * @example
 * // With pagination
 * const response = await collectionsAPI.getCollections({
 *   limit: 10,
 *   offset: 20
 * });
 *
 * @example
 * // Include datasets in response
 * const response = await collectionsAPI.getCollections({
 *   includeDatasets: true,
 *   limit: 5
 * });
 *
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
 * @property {CollectionDataset[]} [datasets] - Array of dataset objects (only if includeDatasets=true)
 *
 * @typedef {Object} CollectionDataset
 * @property {number} datasetId - Dataset identifier
 * @property {string} datasetShortName - Dataset short name identifier
 * @property {string} datasetLongName - Human-readable dataset name
 * @property {string} datasetVersion - Dataset version
 * @property {boolean} isValid - Whether dataset still exists in catalog
 * @property {string} addedDate - ISO 8601 UTC timestamp when added to collection
 * @property {number|null} displayOrder - Display order within collection
 *
 * @throws {Object} 400 - Invalid query parameters
 * @throws {Object} 500 - Internal server error
 *
 * @example
 * // Success Response (200):
 * [
 *   {
 *     "id": 123,
 *     "name": "Arctic Ocean Temperature Profiles",
 *     "description": "Temperature profile datasets from Arctic Ocean expeditions 2020-2023",
 *     "isPublic": true,
 *     "createdDate": "2023-05-15T10:30:00.000Z",
 *     "modifiedDate": "2023-08-22T14:45:00.000Z",
 *     "ownerName": "Dr. Jane Smith",
 *     "ownerAffiliation": "Woods Hole Oceanographic Institution",
 *     "datasetCount": 15,
 *     "isOwner": false,
 *     "datasets": [
 *       {
 *         "datasetId": 456,
 *         "datasetShortName": "GRADIENTS_5_TN412_Temperature_Profiles",
 *         "datasetLongName": "GRADIENTS-5 TN412 Temperature Profiles",
 *         "datasetVersion": "1.0",
 *         "isValid": true,
 *         "addedDate": "2023-06-01T09:15:00.000Z",
 *         "displayOrder": 1
 *       }
 *     ]
 *   }
 * ]
 *
 * @example
 * // Error Response (400):
 * {
 *   "error": "validation_error",
 *   "message": "limit must be between 1 and 100"
 * }
 *
 * @example
 * // Error Response (500):
 * {
 *   "error": "internal_error",
 *   "message": "Database connection failed"
 * }
 */
collectionsAPI.getCollections = async (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit);
  }
  if (params.offset !== undefined) {
    searchParams.append('offset', params.offset);
  }
  if (params.includeDatasets !== undefined) {
    searchParams.append('includeDatasets', params.includeDatasets);
  }

  const queryString = searchParams.toString();
  const endpoint = `${apiUrl}/api/collections${queryString ? `?${queryString}` : ''}`;

  return await fetch(endpoint, fetchOptions);
};

/**
 * Retrieve detailed information about a specific collection including dataset list
 *
 * @description Public collections are accessible to all users.
 * Private collections are accessible only to the owner.
 *
 * @param {number} id - Collection ID (must be positive integer)
 * @param {Object} [params] - Query parameters
 * @param {boolean} [params.includeDatasets=true] - Include dataset details in response
 *
 * @returns {Promise<Response>} Response containing CollectionDetail object
 *
 * @example
 * // Get collection with datasets (default)
 * const response = await collectionsAPI.getCollectionById(123);
 *
 * @example
 * // Get collection without datasets
 * const response = await collectionsAPI.getCollectionById(123, {
 *   includeDatasets: false
 * });
 *
 * @typedef {Object} CollectionDetail - Extends Collection with additional fields
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
 * @property {number} [totalDownloads] - Total download count (owner only, ≥ 0)
 * @property {CollectionDataset[]} [datasets] - Always included unless explicitly disabled
 *
 * @throws {Object} 400 - Invalid query parameters
 * @throws {string} 404 - Collection not found or access denied ("Collection does not exist")
 * @throws {string} 500 - Internal server error
 *
 * @example
 * // Success Response (200):
 * {
 *   "id": 123,
 *   "name": "Arctic Ocean Temperature Profiles",
 *   "description": "Temperature profile datasets from Arctic Ocean expeditions 2020-2023",
 *   "isPublic": true,
 *   "createdDate": "2023-05-15T10:30:00.000Z",
 *   "modifiedDate": "2023-08-22T14:45:00.000Z",
 *   "ownerName": "Dr. Jane Smith",
 *   "ownerAffiliation": "Woods Hole Oceanographic Institution",
 *   "datasetCount": 15,
 *   "isOwner": false,
 *   "totalDownloads": 342,
 *   "datasets": [
 *     {
 *       "datasetId": 456,
 *       "datasetShortName": "GRADIENTS_5_TN412_Temperature_Profiles",
 *       "datasetLongName": "GRADIENTS-5 TN412 Temperature Profiles",
 *       "datasetVersion": "1.0",
 *       "isValid": true,
 *       "addedDate": "2023-06-01T09:15:00.000Z",
 *       "displayOrder": 1
 *     }
 *   ]
 * }
 *
 * @example
 * // Error Response (400):
 * {
 *   "error": "validation_error",
 *   "message": "includeDatasets must be \"true\" or \"false\""
 * }
 *
 * @example
 * // Error Response (404):
 * "Collection does not exist"
 *
 * @example
 * // Error Response (500):
 * "Internal server error"
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

export default collectionsAPI;
