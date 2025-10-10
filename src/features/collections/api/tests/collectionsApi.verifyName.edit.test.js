/**
 * API Integration Tests for GET /api/collections/verify-name with collectionId parameter
 *
 * Test Coverage:
 * - Name verification in create context (no collectionId)
 * - Name verification in edit context (with collectionId)
 * - Request URL construction (name query parameter, optional collectionId)
 * - Response parsing (isAvailable true/false)
 * - HTTP status code error handling (401, 500)
 * - Edge cases (empty names, same name as current collection, special characters)
 */

import collectionsAPI from '../collectionsApi';
import { apiUrl } from '../../../../api/config';

// Mock fetch globally
global.fetch = jest.fn();

describe('collectionsAPI.verifyCollectionName', () => {
  const mockCollectionName = 'BATS In-Situ Temperature Profiles';
  const mockCollectionId = 123;

  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('successful name verification - create context (no collectionId)', () => {
    it('should call GET endpoint with correct URL and name query parameter', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ name: mockCollectionName, isAvailable: true }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.verifyCollectionName(mockCollectionName);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${apiUrl}/api/collections/verify-name?name=${encodeURIComponent(mockCollectionName)}`,
        expect.any(Object),
      );
    });

    it('should include authentication credentials', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ name: mockCollectionName, isAvailable: true }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.verifyCollectionName(mockCollectionName);

      const fetchOptions = global.fetch.mock.calls[0][1];
      expect(fetchOptions.credentials).toBe('include');
    });

    it('should NOT include collectionId in query string when not provided', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ name: mockCollectionName, isAvailable: true }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.verifyCollectionName(mockCollectionName);

      const url = global.fetch.mock.calls[0][0];
      expect(url).not.toContain('collectionId');
    });

    it('should return Response object on success', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ name: mockCollectionName, isAvailable: true }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response =
        await collectionsAPI.verifyCollectionName(mockCollectionName);

      expect(response).toBe(mockResponse);
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should handle response with isAvailable: true (name available)', async () => {
      const mockResponseBody = {
        name: mockCollectionName,
        isAvailable: true,
      };
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockResponseBody,
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response =
        await collectionsAPI.verifyCollectionName(mockCollectionName);
      const data = await response.json();

      expect(data).toEqual(mockResponseBody);
      expect(data.name).toBe(mockCollectionName);
      expect(data.isAvailable).toBe(true);
    });

    it('should handle response with isAvailable: false (name unavailable)', async () => {
      const mockResponseBody = {
        name: mockCollectionName,
        isAvailable: false,
      };
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockResponseBody,
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response =
        await collectionsAPI.verifyCollectionName(mockCollectionName);
      const data = await response.json();

      expect(data).toEqual(mockResponseBody);
      expect(data.name).toBe(mockCollectionName);
      expect(data.isAvailable).toBe(false);
    });
  });

  describe('successful name verification - edit context (with collectionId)', () => {
    it('should include collectionId in query string when provided', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ name: mockCollectionName, isAvailable: true }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.verifyCollectionName(
        mockCollectionName,
        mockCollectionId,
      );

      const url = global.fetch.mock.calls[0][0];
      expect(url).toContain('collectionId=123');
    });

    it('should include both name and collectionId in query string for edit context', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ name: mockCollectionName, isAvailable: true }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.verifyCollectionName(
        mockCollectionName,
        mockCollectionId,
      );

      const url = global.fetch.mock.calls[0][0];
      expect(url).toContain(`name=${encodeURIComponent(mockCollectionName)}`);
      expect(url).toContain('collectionId=123');
    });

    it('should return isAvailable: true when editing collection with same name (excluded from check)', async () => {
      const mockResponseBody = {
        name: mockCollectionName,
        isAvailable: true,
      };
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => mockResponseBody,
      };
      global.fetch.mockResolvedValue(mockResponse);

      const response = await collectionsAPI.verifyCollectionName(
        mockCollectionName,
        mockCollectionId,
      );
      const data = await response.json();

      expect(data.isAvailable).toBe(true);
    });

    it('should NOT include collectionId when explicitly passed as null', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ name: mockCollectionName, isAvailable: true }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.verifyCollectionName(mockCollectionName, null);

      const url = global.fetch.mock.calls[0][0];
      expect(url).not.toContain('collectionId');
    });

    it('should NOT include collectionId when explicitly passed as undefined', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ name: mockCollectionName, isAvailable: true }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.verifyCollectionName(mockCollectionName, undefined);

      const url = global.fetch.mock.calls[0][0];
      expect(url).not.toContain('collectionId');
    });
  });

  describe('collection name variations', () => {
    it('should properly encode names with special characters in URL', async () => {
      const specialName = 'Test & Collection <Special> "Chars"';
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ name: specialName, isAvailable: true }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.verifyCollectionName(specialName);

      const url = global.fetch.mock.calls[0][0];
      expect(url).toContain(encodeURIComponent(specialName));
    });

    it('should handle names with spaces', async () => {
      const spaceName = 'Test Collection Name';
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ name: spaceName, isAvailable: true }),
      };
      global.fetch.mockResolvedValue(mockResponse);

      await collectionsAPI.verifyCollectionName(spaceName);

      const url = global.fetch.mock.calls[0][0];
      expect(url).toContain('Test%20Collection%20Name');
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

      const response =
        await collectionsAPI.verifyCollectionName(mockCollectionName);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
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

      const response =
        await collectionsAPI.verifyCollectionName(mockCollectionName);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('edge cases and network errors', () => {
    it('should handle network failures', async () => {
      global.fetch.mockRejectedValue(new Error('Network request failed'));

      await expect(
        collectionsAPI.verifyCollectionName(mockCollectionName),
      ).rejects.toThrow('Network request failed');
    });
  });
});
