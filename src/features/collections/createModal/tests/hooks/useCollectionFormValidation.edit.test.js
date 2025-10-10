/**
 * Tests for useCollectionFormValidation hook with collectionId parameter (edit context)
 *
 * Test Coverage:
 * - Name uniqueness validation excludes current collection when collectionId provided
 * - Validation behavior in edit context vs create context
 * - API integration with collectionId parameter
 * - All existing validation logic still works (length checks, debouncing)
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useCollectionFormValidation } from '../useCollectionFormValidation';

// Mock the API module
const mockVerifyCollectionName = jest.fn();

describe('useCollectionFormValidation - Edit Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('collectionId parameter behavior', () => {
    it('should pass collectionId to verifyCollectionName when provided', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Collection Name',
          '',
          mockVerifyCollectionName,
          100, // Short debounce for testing
          123, // collectionId
        ),
      );

      // Fast-forward past debounce delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Wait for async state update
      await waitForNextUpdate();

      expect(mockVerifyCollectionName).toHaveBeenCalledWith(
        'Valid Collection Name',
        123,
      );
      expect(result.current.nameValidationState).toBe('available');
    });

    it('should not pass collectionId when not provided (create context)', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Collection Name',
          '',
          mockVerifyCollectionName,
          100,
          // collectionId not provided
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(mockVerifyCollectionName).toHaveBeenCalledWith(
        'Valid Collection Name',
        undefined,
      );
    });

    it('should handle null collectionId (create context)', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Collection Name',
          '',
          mockVerifyCollectionName,
          100,
          null, // explicitly null
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(mockVerifyCollectionName).toHaveBeenCalledWith(
        'Valid Collection Name',
        null,
      );
    });

    it('should allow keeping the same name when editing (isAvailable=true with collectionId)', async () => {
      // Simulate editing a collection with the same name
      // Backend should return isAvailable=true because it excludes the current collection
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'My Existing Collection Name',
          'Description',
          mockVerifyCollectionName,
          100,
          456, // Editing collection ID 456
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(result.current.nameValidationState).toBe('available');
      expect(result.current.nameErrorMessage).toBe('');
      expect(result.current.isValid).toBe(true);
    });

    it('should reject duplicate name from another collection (isAvailable=false with collectionId)', async () => {
      // User tries to rename collection to a name used by another collection
      mockVerifyCollectionName.mockResolvedValue(false);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Another Users Collection',
          'Description',
          mockVerifyCollectionName,
          100,
          456, // Editing collection ID 456
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(result.current.nameValidationState).toBe('unavailable');
      expect(result.current.nameErrorMessage).toBe(
        'A collection with this name already exists',
      );
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('validation behavior with collectionId', () => {
    it('should still enforce minimum length validation before API call', () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result } = renderHook(() =>
        useCollectionFormValidation(
          'Abc', // Too short (< 5 chars)
          '',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      // Should not call API for invalid length
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockVerifyCollectionName).not.toHaveBeenCalled();
      expect(result.current.nameValidationState).toBe('warning');
      expect(result.current.nameErrorMessage).toBe(
        'Collection name must be at least 5 characters',
      );
    });

    it('should still enforce maximum length validation before API call', () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const longName = 'A'.repeat(201); // Too long (> 200 chars)

      const { result } = renderHook(() =>
        useCollectionFormValidation(
          longName,
          '',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      // Should not call API for invalid length
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockVerifyCollectionName).not.toHaveBeenCalled();
      expect(result.current.nameValidationState).toBe('unavailable');
      expect(result.current.nameErrorMessage).toBe(
        'Collection name cannot exceed 200 characters',
      );
    });

    it('should trim name before sending to API with collectionId', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          '  Valid Name With Spaces  ',
          '',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(mockVerifyCollectionName).toHaveBeenCalledWith(
        'Valid Name With Spaces', // Trimmed
        123,
      );
    });

    it('should debounce API calls with collectionId', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result, rerender, waitForNextUpdate } = renderHook(
        ({ name }) =>
          useCollectionFormValidation(
            name,
            '',
            mockVerifyCollectionName,
            300,
            123,
          ),
        { initialProps: { name: 'First Name' } },
      );

      // Change name multiple times rapidly
      act(() => {
        rerender({ name: 'Second Name' });
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      act(() => {
        rerender({ name: 'Third Name' });
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      act(() => {
        rerender({ name: 'Final Name' });
      });

      // Should not have called API yet
      expect(mockVerifyCollectionName).not.toHaveBeenCalled();

      // Fast-forward past final debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should only call API once with final name
      await waitForNextUpdate();

      expect(mockVerifyCollectionName).toHaveBeenCalledTimes(1);
      expect(mockVerifyCollectionName).toHaveBeenCalledWith('Final Name', 123);
    });

    it('should show checking state while waiting for API response with collectionId', async () => {
      // Mock API to delay response
      mockVerifyCollectionName.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(true), 1000);
          }),
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Name',
          '',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should be in checking state immediately after debounce
      expect(result.current.nameValidationState).toBe('checking');
      expect(result.current.nameErrorMessage).toBe('');

      // Advance time to resolve API call
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitForNextUpdate();

      expect(result.current.nameValidationState).toBe('available');
    });

    it('should handle API errors with collectionId', async () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockVerifyCollectionName.mockRejectedValue(new Error('Network error'));

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Name',
          '',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(result.current.nameValidationState).toBe('unavailable');
      expect(result.current.nameErrorMessage).toBe(
        'Failed to verify collection name',
      );
      expect(result.current.isValid).toBe(false);

      consoleError.mockRestore();
    });
  });

  describe('description validation with collectionId', () => {
    it('should validate description independently of collectionId', () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const longDescription = 'A'.repeat(501); // Too long

      const { result } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Name',
          longDescription,
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      expect(result.current.descriptionError).toBe(
        'Description cannot exceed 500 characters',
      );
    });

    it('should allow valid description with collectionId', () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Name',
          'Valid description text',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      expect(result.current.descriptionError).toBe('');
    });

    it('should mark form as invalid when description exceeds limit even with available name', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const longDescription = 'A'.repeat(501);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Name',
          longDescription,
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(result.current.nameValidationState).toBe('available');
      expect(result.current.descriptionError).toBe(
        'Description cannot exceed 500 characters',
      );
      expect(result.current.isValid).toBe(false); // Invalid due to description
    });
  });

  describe('resetValidation with collectionId', () => {
    it('should reset all validation state when called', async () => {
      mockVerifyCollectionName.mockResolvedValue(false);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Duplicate Name',
          '',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(result.current.nameValidationState).toBe('unavailable');
      expect(result.current.nameErrorMessage).toBeTruthy();

      // Reset validation
      act(() => {
        result.current.resetValidation();
      });

      expect(result.current.nameValidationState).toBe('initial');
      expect(result.current.nameErrorMessage).toBe('');
      expect(result.current.descriptionError).toBe('');
    });
  });

  describe('isValid computed property with collectionId', () => {
    it('should be true when name is available and description is valid', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Name',
          'Valid description',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(result.current.isValid).toBe(true);
    });

    it('should be false when name is unavailable even if description is valid', async () => {
      mockVerifyCollectionName.mockResolvedValue(false);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Duplicate Name',
          'Valid description',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(result.current.isValid).toBe(false);
    });

    it('should be false when name is in checking state', () => {
      mockVerifyCollectionName.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      const { result } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Name',
          '',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Checking state immediately after debounce
      expect(result.current.nameValidationState).toBe('checking');
      expect(result.current.isValid).toBe(false);
    });

    it('should be false when name is in warning state', () => {
      const { result } = renderHook(() =>
        useCollectionFormValidation(
          'Abc', // Too short
          '',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      expect(result.current.nameValidationState).toBe('warning');
      expect(result.current.isValid).toBe(false);
    });

    it('should be false when name is empty', () => {
      const { result } = renderHook(() =>
        useCollectionFormValidation('', '', mockVerifyCollectionName, 100, 123),
      );

      expect(result.current.nameValidationState).toBe('initial');
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('edge cases with collectionId', () => {
    it('should handle empty name with collectionId', () => {
      const { result } = renderHook(() =>
        useCollectionFormValidation('', '', mockVerifyCollectionName, 100, 123),
      );

      expect(result.current.nameValidationState).toBe('initial');
      expect(result.current.nameErrorMessage).toBe('');
      expect(mockVerifyCollectionName).not.toHaveBeenCalled();
    });

    it('should handle name exactly at minimum length (5 chars) with collectionId', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Abcde', // Exactly 5 chars
          '',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(mockVerifyCollectionName).toHaveBeenCalledWith('Abcde', 123);
      expect(result.current.nameValidationState).toBe('available');
    });

    it('should handle name exactly at maximum length (200 chars) with collectionId', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const maxName = 'A'.repeat(200); // Exactly 200 chars

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          maxName,
          '',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(mockVerifyCollectionName).toHaveBeenCalledWith(maxName, 123);
      expect(result.current.nameValidationState).toBe('available');
    });

    it('should handle description exactly at maximum length (500 chars)', () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const maxDescription = 'A'.repeat(500); // Exactly 500 chars

      const { result } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Name',
          maxDescription,
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      expect(result.current.descriptionError).toBe('');
    });

    it('should handle collectionId as 0 (valid ID)', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result, waitForNextUpdate } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Name',
          '',
          mockVerifyCollectionName,
          100,
          0, // ID 0 should be treated as valid
        ),
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitForNextUpdate();

      expect(mockVerifyCollectionName).toHaveBeenCalledWith('Valid Name', 0);
    });

    it('should handle rapid name changes with collectionId', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { result, rerender, waitForNextUpdate } = renderHook(
        ({ name }) =>
          useCollectionFormValidation(
            name,
            '',
            mockVerifyCollectionName,
            100,
            123,
          ),
        { initialProps: { name: 'Initial Name' } },
      );

      // Rapidly update name
      for (let i = 0; i < 10; i++) {
        act(() => {
          rerender({ name: `Updated Name ${i}` });
        });
        act(() => {
          jest.advanceTimersByTime(50); // Less than debounce time
        });
      }

      // Fast-forward to complete debounce
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should only call API once with final name
      await waitForNextUpdate();

      expect(mockVerifyCollectionName).toHaveBeenCalledTimes(1);
      expect(mockVerifyCollectionName).toHaveBeenCalledWith(
        'Updated Name 9',
        123,
      );
    });
  });

  describe('cleanup with collectionId', () => {
    it('should cancel pending debounced call on unmount', () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { unmount } = renderHook(() =>
        useCollectionFormValidation(
          'Valid Name',
          '',
          mockVerifyCollectionName,
          100,
          123,
        ),
      );

      // Unmount before debounce completes
      unmount();

      // Fast-forward past debounce time
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should not have called API because it was cancelled
      expect(mockVerifyCollectionName).not.toHaveBeenCalled();
    });

    it('should cancel previous debounced call when debounceMs changes', async () => {
      mockVerifyCollectionName.mockResolvedValue(true);

      const { rerender, waitForNextUpdate } = renderHook(
        ({ debounceMs }) =>
          useCollectionFormValidation(
            'Valid Name',
            '',
            mockVerifyCollectionName,
            debounceMs,
            123,
          ),
        { initialProps: { debounceMs: 100 } },
      );

      // Change debounce time before first call completes
      act(() => {
        jest.advanceTimersByTime(50);
      });

      act(() => {
        rerender({ debounceMs: 200 });
      });

      // Complete original debounce time
      act(() => {
        jest.advanceTimersByTime(50);
      });

      // Original call should be cancelled, should not have been called yet
      expect(mockVerifyCollectionName).not.toHaveBeenCalled();

      // Complete new debounce time
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Now it should be called with new debounce setting
      await waitForNextUpdate();

      expect(mockVerifyCollectionName).toHaveBeenCalledTimes(1);
    });
  });
});
