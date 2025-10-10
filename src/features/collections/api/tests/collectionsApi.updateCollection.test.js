/**
 * API Integration Tests for PATCH /api/collections/:collectionId
 *
 * Test Coverage:
 * - Successful collection updates
 * - Request payload validation
 * - HTTP status code error handling (400, 401, 403, 404, 409, 500)
 * - Request body construction
 * - Response parsing
 * - Edge cases (empty datasets, empty descriptions, trimming, etc.)
 *
 * This test suite follows the TDD pattern and must be written BEFORE
 * the updateCollection implementation exists.
 */

import collectionsAPI from '../collectionsApi';
import { apiUrl } from '../../../../api/config';

// Mock fetch globally
global.fetch = jest.fn();

describe('collectionsAPI.updateCollection', () => {
  const mockCollectionId = 123;
  const mockUpdateData = {
    collectionName: 'BATS In-Situ Temperature Profiles',
    description: 'Collection of temperature profile datasets from BATS station',
    private: true,
    datasets: ['bats_temp_001', 'bats_temp_002'],
  };

  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('successful updates', () => {
    it('should call PATCH endpoint with correct URL and collection ID', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.updateCollection(mockCollectionId, mockUpdateData);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/collections/${mockCollectionId}`,
        expect.any(Object),
      );
    });

    it('should use PATCH method', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.updateCollection(mockCollectionId, mockUpdateData);

      const fetchOptions = global.fetch.mock.calls[0][1];
      expect(fetchOptions.method).toBe('PATCH');
    });

    it('should include authentication headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.updateCollection(mockCollectionId, mockUpdateData);

      const fetchOptions = global.fetch.mock.calls[0][1];
      expect(fetchOptions.headers).toBeDefined();
      expect(fetchOptions.credentials).toBe('include');
    });

    it('should include Content-Type: application/json header', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.updateCollection(mockCollectionId, mockUpdateData);

      const fetchOptions = global.fetch.mock.calls[0][1];
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');
    });

    it('should stringify request body correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.updateCollection(mockCollectionId, mockUpdateData);

      const fetchOptions = global.fetch.mock.calls[0][1];
      expect(fetchOptions.body).toBe(JSON.stringify(mockUpdateData));
    });

    it('should return Response object on success', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response).toBe(mockResponse);
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should handle response body with collectionId', async () => {
      const mockResponseBody = { collectionId: mockCollectionId };
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockResponseBody,
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );
      const data = await response.json();

      expect(data).toEqual(mockResponseBody);
      expect(data.collectionId).toBe(mockCollectionId);
    });

    it('should send all required fields in request body', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const requiredFields = {
        collectionName: 'Test Collection',
        description: 'Test Description',
        private: false,
        datasets: ['dataset1', 'dataset2'],
      };

      await collectionsAPI.updateCollection(mockCollectionId, requiredFields);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData).toHaveProperty('collectionName');
      expect(sentData).toHaveProperty('description');
      expect(sentData).toHaveProperty('private');
      expect(sentData).toHaveProperty('datasets');
    });

    it('should handle empty datasets array', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const dataWithEmptyDatasets = {
        ...mockUpdateData,
        datasets: [],
      };

      await collectionsAPI.updateCollection(
        mockCollectionId,
        dataWithEmptyDatasets,
      );

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.datasets).toEqual([]);
    });

    it('should handle empty description string', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const dataWithEmptyDescription = {
        ...mockUpdateData,
        description: '',
      };

      await collectionsAPI.updateCollection(
        mockCollectionId,
        dataWithEmptyDescription,
      );

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.description).toBe('');
    });

    it('should handle private: true (private collection)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const privateData = {
        ...mockUpdateData,
        private: true,
      };

      await collectionsAPI.updateCollection(mockCollectionId, privateData);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.private).toBe(true);
    });

    it('should handle private: false (public collection)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const publicData = {
        ...mockUpdateData,
        private: false,
      };

      await collectionsAPI.updateCollection(mockCollectionId, publicData);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.private).toBe(false);
    });

    it('should handle multiple datasets in array', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const multipleDatasets = {
        ...mockUpdateData,
        datasets: ['dataset1', 'dataset2', 'dataset3', 'dataset4', 'dataset5'],
      };

      await collectionsAPI.updateCollection(mockCollectionId, multipleDatasets);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.datasets).toHaveLength(5);
      expect(sentData.datasets).toEqual([
        'dataset1',
        'dataset2',
        'dataset3',
        'dataset4',
        'dataset5',
      ]);
    });

    it('should preserve dataset order in request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const orderedDatasets = {
        ...mockUpdateData,
        datasets: ['zebra_dataset', 'alpha_dataset', 'beta_dataset'],
      };

      await collectionsAPI.updateCollection(mockCollectionId, orderedDatasets);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.datasets).toEqual([
        'zebra_dataset',
        'alpha_dataset',
        'beta_dataset',
      ]);
    });

    it('should handle collection name at minimum length (5 chars)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const minLengthName = {
        ...mockUpdateData,
        collectionName: '12345', // Exactly 5 characters
      };

      await collectionsAPI.updateCollection(mockCollectionId, minLengthName);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.collectionName).toBe('12345');
    });

    it('should handle collection name at maximum length (200 chars)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const maxLengthName = 'A'.repeat(200); // Exactly 200 characters
      const maxLength = {
        ...mockUpdateData,
        collectionName: maxLengthName,
      };

      await collectionsAPI.updateCollection(mockCollectionId, maxLength);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.collectionName).toHaveLength(200);
    });

    it('should handle description at maximum length (500 chars)', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const maxLengthDesc = 'B'.repeat(500); // Exactly 500 characters
      const maxLength = {
        ...mockUpdateData,
        description: maxLengthDesc,
      };

      await collectionsAPI.updateCollection(mockCollectionId, maxLength);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.description).toHaveLength(500);
    });
  });

  describe('error handling - 400 Bad Request', () => {
    it('should return response with status 400 for validation errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Collection name must be at least 5 characters',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should handle error for name too short', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Collection name must be at least 5 characters',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );
      const errorData = await response.json();

      expect(errorData.error).toBe(
        'Collection name must be at least 5 characters',
      );
    });

    it('should handle error for name too long', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Collection name cannot exceed 200 characters',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );
      const errorData = await response.json();

      expect(errorData.error).toBe(
        'Collection name cannot exceed 200 characters',
      );
    });

    it('should handle error for description too long', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Description cannot exceed 500 characters',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );
      const errorData = await response.json();

      expect(errorData.error).toBe('Description cannot exceed 500 characters');
    });

    it('should handle error for missing required fields', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Missing required field: collectionName',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );
      const errorData = await response.json();

      expect(response.status).toBe(400);
      expect(errorData.error).toContain('Missing required field');
    });

    it('should handle error for invalid collection ID format', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Invalid collection ID format',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        'invalid-id',
        mockUpdateData,
      );

      expect(response.status).toBe(400);
    });

    it('should handle error for invalid datasets array', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Datasets must be an array of strings',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.status).toBe(400);
    });

    it('should handle error for invalid private field type', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Private field must be a boolean',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.status).toBe(400);
    });
  });

  describe('error handling - 401 Unauthorized', () => {
    it('should return response with status 401 when user not authenticated', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          error: 'Authentication required',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should handle authentication error with error message', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          error: 'You must be logged in to update collections',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );
      const errorData = await response.json();

      expect(errorData.error).toContain('logged in');
    });

    it('should handle expired authentication token', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          error: 'Authentication token expired',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.status).toBe(401);
    });
  });

  describe('error handling - 403 Forbidden', () => {
    it('should return response with status 403 when user does not own collection', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({
          error: 'You do not have permission to edit this collection',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
    });

    it('should handle forbidden error with descriptive message', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({
          error: 'You do not own this collection',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );
      const errorData = await response.json();

      expect(errorData.error).toContain('do not own');
    });

    it('should handle insufficient permissions error', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({
          error: 'Insufficient permissions to modify collection',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.status).toBe(403);
    });
  });

  describe('error handling - 404 Not Found', () => {
    it('should return response with status 404 when collection not found', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          error: 'Collection not found',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        999999,
        mockUpdateData,
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should handle not found error with error message', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          error: 'Collection with ID 999999 not found',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        999999,
        mockUpdateData,
      );
      const errorData = await response.json();

      expect(errorData.error).toContain('not found');
    });

    it('should handle collection deleted or no longer available', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          error: 'The requested collection is no longer available',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.status).toBe(404);
    });
  });

  describe('error handling - 409 Conflict', () => {
    it('should return response with status 409 for duplicate name', async () => {
      const mockResponse = {
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: async () => ({
          error: 'A collection with this name already exists',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(409);
    });

    it('should handle duplicate name error with descriptive message', async () => {
      const mockResponse = {
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: async () => ({
          error: 'A collection with this name already exists',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );
      const errorData = await response.json();

      expect(errorData.error).toContain('already exists');
    });

    it('should handle conflict with user-scoped duplicate name', async () => {
      const mockResponse = {
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: async () => ({
          error:
            'You already have a collection with this name. Please choose a different name.',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );
      const errorData = await response.json();

      expect(response.status).toBe(409);
      expect(errorData.error).toContain('already have a collection');
    });
  });

  describe('error handling - 500 Internal Server Error', () => {
    it('should return response with status 500 for server errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: 'Internal server error',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });

    it('should handle server error with error message', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: 'An unexpected error occurred on the server',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );
      const errorData = await response.json();

      expect(errorData.error).toBeDefined();
    });

    it('should handle database connection errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: 'Database connection failed',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.status).toBe(500);
    });
  });

  describe('edge cases and network errors', () => {
    it('should handle network failures', async () => {
      global.fetch.mockRejectedValue(new Error('Network request failed'));

      await expect(
        collectionsAPI.updateCollection(mockCollectionId, mockUpdateData),
      ).rejects.toThrow('Network request failed');
    });

    it('should handle timeout errors', async () => {
      global.fetch.mockRejectedValue(new Error('Request timeout'));

      await expect(
        collectionsAPI.updateCollection(mockCollectionId, mockUpdateData),
      ).rejects.toThrow('Request timeout');
    });

    it('should handle DNS resolution errors', async () => {
      global.fetch.mockRejectedValue(new Error('DNS resolution failed'));

      await expect(
        collectionsAPI.updateCollection(mockCollectionId, mockUpdateData),
      ).rejects.toThrow('DNS resolution failed');
    });

    it('should handle CORS errors', async () => {
      global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(
        collectionsAPI.updateCollection(mockCollectionId, mockUpdateData),
      ).rejects.toThrow('Failed to fetch');
    });

    it('should handle malformed JSON responses gracefully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Unexpected token in JSON');
        },
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      // Response should be returned even if JSON parsing fails
      expect(response).toBe(mockResponse);
    });

    it('should handle null collection ID', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Collection ID is required',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        null,
        mockUpdateData,
      );

      // API should be called with null, backend validates
      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/collections/null`,
        expect.any(Object),
      );
    });

    it('should handle undefined collection ID', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Collection ID is required',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        undefined,
        mockUpdateData,
      );

      // API should be called with undefined, backend validates
      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/collections/undefined`,
        expect.any(Object),
      );
    });

    it('should handle negative collection ID', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Collection ID must be a positive integer',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        -123,
        mockUpdateData,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/collections/-123`,
        expect.any(Object),
      );
    });

    it('should handle zero collection ID', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'Collection ID must be a positive integer',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(0, mockUpdateData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/collections/0`,
        expect.any(Object),
      );
    });

    it('should handle very large collection ID', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          error: 'Collection not found',
        }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const largeId = 999999999999;
      const response = await collectionsAPI.updateCollection(
        largeId,
        mockUpdateData,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/collections/${largeId}`,
        expect.any(Object),
      );
    });

    it('should handle special characters in collection name', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const specialCharsData = {
        ...mockUpdateData,
        collectionName: 'Test & Collection <Special> "Chars"',
      };

      await collectionsAPI.updateCollection(mockCollectionId, specialCharsData);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.collectionName).toBe(
        'Test & Collection <Special> "Chars"',
      );
    });

    it('should handle unicode characters in collection name', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const unicodeData = {
        ...mockUpdateData,
        collectionName: 'Collection with 中文字符 and émojis 🌊',
      };

      await collectionsAPI.updateCollection(mockCollectionId, unicodeData);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.collectionName).toContain('中文字符');
      expect(sentData.collectionName).toContain('🌊');
    });

    it('should handle newlines in description', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const multilineData = {
        ...mockUpdateData,
        description: 'Line 1\nLine 2\nLine 3',
      };

      await collectionsAPI.updateCollection(mockCollectionId, multilineData);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.description).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle dataset names with special characters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const specialDatasetData = {
        ...mockUpdateData,
        datasets: ['dataset-with-dashes', 'dataset_with_underscores'],
      };

      await collectionsAPI.updateCollection(
        mockCollectionId,
        specialDatasetData,
      );

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      expect(sentData.datasets).toEqual([
        'dataset-with-dashes',
        'dataset_with_underscores',
      ]);
    });

    it('should handle duplicate dataset names in array', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const duplicateData = {
        ...mockUpdateData,
        datasets: ['dataset1', 'dataset2', 'dataset1'], // Duplicate
      };

      await collectionsAPI.updateCollection(mockCollectionId, duplicateData);

      const fetchOptions = global.fetch.mock.calls[0][1];
      const sentData = JSON.parse(fetchOptions.body);

      // API sends data as-is, backend handles deduplication if needed
      expect(sentData.datasets).toEqual(['dataset1', 'dataset2', 'dataset1']);
    });
  });

  describe('response structure validation', () => {
    it('should return raw Response object without auto-parsing', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      // Should return raw Response, not parsed data
      expect(response).toBe(mockResponse);
      expect(typeof response.json).toBe('function');
    });

    it('should allow caller to parse response body', async () => {
      const mockResponseData = { collectionId: mockCollectionId };
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockResponseData,
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );
      const data = await response.json();

      expect(data).toEqual(mockResponseData);
    });

    it('should expose response status and statusText', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    });

    it('should expose response headers', async () => {
      const mockHeaders = {
        'Content-Type': 'application/json',
        'X-Request-Id': 'test-123',
      };
      const mockResponse = {
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: async () => ({ collectionId: mockCollectionId }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.headers).toBe(mockHeaders);
    });

    it('should handle responses without JSON body', async () => {
      const mockResponse = {
        ok: true,
        status: 204, // No Content
        json: async () => {
          throw new Error('Unexpected end of JSON input');
        },
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.updateCollection(
        mockCollectionId,
        mockUpdateData,
      );

      expect(response.status).toBe(204);
      // Caller should handle empty body case
    });
  });
});
