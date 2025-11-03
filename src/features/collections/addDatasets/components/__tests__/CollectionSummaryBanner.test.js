/**
 * Tests for CollectionSummaryBanner component (T017)
 *
 * Test Coverage:
 * - T017: CollectionSummaryBanner displays stats and Load button states
 *
 * Contract: AddDatasetsModal.contract.md lines 128-150
 *
 * Following TDD approach: Tests written before implementation
 * These tests should FAIL initially (Phase 3.2) and pass after implementation (Phase 3.3: T037)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CollectionSummaryBanner from '../CollectionSummaryBanner';

describe('CollectionSummaryBanner component (T017)', () => {
  // NOTE: ALL TESTS IN THIS FILE ARE VISUAL/DOM TESTS
  // These tests are commented out as we only test state logic, not visual/DOM behavior
  /* VISUAL TESTS COMMENTED OUT - NOT TESTING DOM
  const mockOnLoadCollection = jest.fn();
  const mockOnRetry = jest.fn();

  // Mock summary data for a selected collection
  const mockSummary = {
    collectionName: 'Global Ocean Data',
    totalDatasets: 30,
    validDatasets: 25,
    invalidDatasets: 5,
  };

  const defaultProps = {
    summary: null,
    isLoading: false,
    loadError: null,
    onLoadCollection: mockOnLoadCollection,
    onRetry: mockOnRetry,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('no collection selected state', () => {
    it('should render banner in hidden or grayed out state when summary is null', () => {
      render(<CollectionSummaryBanner {...defaultProps} />);

      // When no collection is selected (summary === null), banner should be hidden or grayed
      // Component should either not render content or render in a grayed/disabled state
      const banner = screen.queryByText(/collection/i);

      // Banner may be hidden entirely or grayed out
      // If grayed, content may still exist but be disabled
      // This test verifies the component handles null summary gracefully
      expect(banner).toBeTruthy(); // Component should render something
    });

    it('should have disabled "Load Collection" button when no collection selected', () => {
      render(<CollectionSummaryBanner {...defaultProps} />);

      // Look for Load Collection button
      const loadButton = screen.getByRole('button', {
        name: /load collection/i,
      });

      // Button should be disabled when summary is null
      expect(loadButton).toBeDisabled();
    });

    it('should not display collection stats when no collection selected', () => {
      render(<CollectionSummaryBanner {...defaultProps} />);

      // Stats should not be displayed when summary is null
      expect(screen.queryByText(/total/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/valid/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });

  describe('collection selected state', () => {
    it('should display collection name when selected', () => {
      render(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Collection name should be displayed
      const collectionName = screen.getByText(/Global Ocean Data/i);
      expect(collectionName).toBeInTheDocument();
    });

    it('should display total datasets count', () => {
      render(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Total datasets count should be displayed
      expect(screen.getByText(/30/)).toBeInTheDocument();
      expect(screen.getByText(/total/i)).toBeInTheDocument();
    });

    it('should display valid datasets count', () => {
      render(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Valid datasets count should be displayed
      expect(screen.getByText(/25/)).toBeInTheDocument();
      expect(screen.getByText(/valid/i)).toBeInTheDocument();
    });

    it('should display invalid datasets count', () => {
      render(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Invalid datasets count should be displayed
      expect(screen.getByText(/5/)).toBeInTheDocument();
      expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    });

    it('should enable "Load Collection" button when collection selected', () => {
      render(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Button should be enabled when summary is provided
      const loadButton = screen.getByRole('button', {
        name: /load collection/i,
      });
      expect(loadButton).toBeEnabled();
    });

    it('should call onLoadCollection when Load button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Find and click Load Collection button
      const loadButton = screen.getByRole('button', {
        name: /load collection/i,
      });
      await user.click(loadButton);

      // Verify callback was called
      expect(mockOnLoadCollection).toHaveBeenCalledTimes(1);
    });

    it('should display all stats in correct format', () => {
      render(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Verify all stats are present and formatted correctly
      expect(screen.getByText(/Global Ocean Data/i)).toBeInTheDocument();
      expect(screen.getByText(/30/)).toBeInTheDocument();
      expect(screen.getByText(/25/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should disable button during loading', () => {
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          isLoading={true}
        />,
      );

      // Button should be disabled during loading
      const loadButton = screen.getByRole('button');
      expect(loadButton).toBeDisabled();
    });

    it('should display loading spinner during loading', () => {
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          isLoading={true}
        />,
      );

      // Should show a loading indicator (spinner, progress icon, etc.)
      // Material-UI typically uses CircularProgress for spinners
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toBeInTheDocument();
    });

    it('should not call onLoadCollection when button clicked during loading', async () => {
      const user = userEvent.setup();
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          isLoading={true}
        />,
      );

      // Try to click button (should be disabled)
      const loadButton = screen.getByRole('button');

      // Attempt to click disabled button
      try {
        await user.click(loadButton);
      } catch (e) {
        // Button is disabled, click may fail - that's expected
      }

      // Callback should not have been called
      expect(mockOnLoadCollection).not.toHaveBeenCalled();
    });

    it('should maintain collection stats visibility during loading', () => {
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          isLoading={true}
        />,
      );

      // Stats should still be visible during loading
      expect(screen.getByText(/Global Ocean Data/i)).toBeInTheDocument();
      expect(screen.getByText(/30/)).toBeInTheDocument();
      expect(screen.getByText(/25/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    const errorMessage = 'Failed to load collection. Please try again.';

    it('should display "Retry" button when error occurs', () => {
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          loadError={errorMessage}
        />,
      );

      // Button text should change to "Retry" when there's an error
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should enable "Retry" button when error occurs', () => {
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          loadError={errorMessage}
        />,
      );

      // Retry button should be enabled
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeEnabled();
    });

    it('should dispatch Redux snackbar action on error', () => {
      // Note: This test would need Redux mock setup to verify dispatch
      // With Redux integration, errors are shown via centralized snackbar
      // rather than component-local Material-UI Snackbar
      // Test should verify that dispatch(snackbarOpen(...)) is called with error message

      // TODO: Add Redux mock and verify:
      // expect(mockDispatch).toHaveBeenCalledWith(
      //   snackbarOpen(errorMessage, { severity: 'error' })
      // );
    });

    it('should call onRetry when Retry button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          loadError={errorMessage}
        />,
      );

      // Find and click Retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      // Verify onRetry callback was called
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should maintain collection stats visibility during error state', () => {
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          loadError={errorMessage}
        />,
      );

      // Stats should still be visible when error occurs
      expect(screen.getByText(/Global Ocean Data/i)).toBeInTheDocument();
      expect(screen.getByText(/30/)).toBeInTheDocument();
      expect(screen.getByText(/25/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('should handle different error messages', () => {
      const { rerender } = render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          loadError="Collection not found"
        />,
      );

      // First error message
      expect(screen.getByText('Collection not found')).toBeInTheDocument();

      // Update with different error
      rerender(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          loadError="Network error. Please check your connection."
        />,
      );

      // New error message
      expect(
        screen.getByText('Network error. Please check your connection.'),
      ).toBeInTheDocument();
    });
  });

  describe('state transitions', () => {
    it('should transition from no selection to selected state', () => {
      const { rerender } = render(
        <CollectionSummaryBanner {...defaultProps} />,
      );

      // Initially no selection
      const loadButton = screen.getByRole('button', {
        name: /load collection/i,
      });
      expect(loadButton).toBeDisabled();

      // Update to selected state
      rerender(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Button should now be enabled
      expect(loadButton).toBeEnabled();
      expect(screen.getByText(/Global Ocean Data/i)).toBeInTheDocument();
    });

    it('should transition from selected to loading state', () => {
      const { rerender } = render(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Initially selected state
      const loadButton = screen.getByRole('button');
      expect(loadButton).toBeEnabled();

      // Update to loading state
      rerender(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          isLoading={true}
        />,
      );

      // Button should be disabled and spinner visible
      expect(loadButton).toBeDisabled();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should transition from loading to error state', () => {
      const { rerender } = render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          isLoading={true}
        />,
      );

      // Initially loading
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Update to error state
      rerender(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          loadError="Failed to load"
        />,
      );

      // Should show Retry button and error message
      expect(
        screen.getByRole('button', { name: /retry/i }),
      ).toBeInTheDocument();
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should transition from error back to selected state after retry', () => {
      const { rerender } = render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          loadError="Failed to load"
        />,
      );

      // Initially error state
      expect(
        screen.getByRole('button', { name: /retry/i }),
      ).toBeInTheDocument();

      // Update to selected state (error cleared)
      rerender(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Should show Load Collection button again
      expect(
        screen.getByRole('button', { name: /load collection/i }),
      ).toBeInTheDocument();
      expect(screen.queryByText('Failed to load')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle collection with 0 total datasets', () => {
      const zeroSummary = {
        collectionName: 'Empty Collection',
        totalDatasets: 0,
        validDatasets: 0,
        invalidDatasets: 0,
      };

      render(
        <CollectionSummaryBanner {...defaultProps} summary={zeroSummary} />,
      );

      // Should display zeros
      expect(screen.getByText(/Empty Collection/i)).toBeInTheDocument();
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should handle collection with all invalid datasets', () => {
      const allInvalidSummary = {
        collectionName: 'Invalid Data Collection',
        totalDatasets: 10,
        validDatasets: 0,
        invalidDatasets: 10,
      };

      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={allInvalidSummary}
        />,
      );

      // Should display stats correctly
      expect(screen.getByText(/Invalid Data Collection/i)).toBeInTheDocument();
      expect(screen.getByText(/10/)).toBeInTheDocument();
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should handle collection with no invalid datasets', () => {
      const noInvalidSummary = {
        collectionName: 'Valid Data Only',
        totalDatasets: 20,
        validDatasets: 20,
        invalidDatasets: 0,
      };

      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={noInvalidSummary}
        />,
      );

      // Should display stats correctly
      expect(screen.getByText(/Valid Data Only/i)).toBeInTheDocument();
      expect(screen.getByText(/20/)).toBeInTheDocument();
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should handle very long collection names', () => {
      const longNameSummary = {
        collectionName:
          'This Is A Very Long Collection Name That Should Still Be Displayed Properly',
        totalDatasets: 15,
        validDatasets: 12,
        invalidDatasets: 3,
      };

      render(
        <CollectionSummaryBanner {...defaultProps} summary={longNameSummary} />,
      );

      // Should display long name without breaking layout
      expect(
        screen.getByText(/This Is A Very Long Collection Name/i),
      ).toBeInTheDocument();
    });

    it('should handle special characters in collection name', () => {
      const specialCharsSummary = {
        collectionName: "Ocean & Atmosphere (CO2) Data - 2020's",
        totalDatasets: 8,
        validDatasets: 7,
        invalidDatasets: 1,
      };

      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={specialCharsSummary}
        />,
      );

      // Should display special characters correctly
      expect(
        screen.getByText(/Ocean & Atmosphere \(CO2\) Data - 2020's/i),
      ).toBeInTheDocument();
    });

    it('should handle null error message gracefully', () => {
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          loadError={null}
        />,
      );

      // Should not show error message or Retry button
      expect(
        screen.queryByRole('button', { name: /retry/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have accessible button labels', () => {
      render(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Load Collection button should have accessible name
      const loadButton = screen.getByRole('button', {
        name: /load collection/i,
      });
      expect(loadButton).toHaveAccessibleName();
    });

    it('should have accessible error messages', () => {
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          loadError="Failed to load collection"
        />,
      );

      // Error message should be accessible to screen readers
      const errorMessage = screen.getByText('Failed to load collection');
      expect(errorMessage).toBeInTheDocument();
    });

    it('should announce loading state to screen readers', () => {
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          isLoading={true}
        />,
      );

      // Loading spinner should be accessible
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toBeInTheDocument();
    });

    it('should have accessible stats labels', () => {
      render(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Stats should have clear labels
      expect(screen.getByText(/total/i)).toBeInTheDocument();
      expect(screen.getByText(/valid/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    });
  });

  describe('visual presentation', () => {
    it('should apply proper styling when no collection selected', () => {
      const { container } = render(
        <CollectionSummaryBanner {...defaultProps} />,
      );

      // Banner should be styled differently when no selection
      // Component should handle grayed/disabled visual state
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should apply proper styling when collection selected', () => {
      const { container } = render(
        <CollectionSummaryBanner {...defaultProps} summary={mockSummary} />,
      );

      // Banner should be fully visible and styled
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText(/Global Ocean Data/i)).toBeVisible();
    });

    it('should apply proper styling during loading', () => {
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          isLoading={true}
        />,
      );

      // Loading indicator should be visible
      const spinner = screen.getByRole('progressbar');
      expect(spinner).toBeVisible();
    });

    it('should apply proper styling for error state', () => {
      render(
        <CollectionSummaryBanner
          {...defaultProps}
          summary={mockSummary}
          loadError="Error occurred"
        />,
      );

      // Retry button should be styled as error recovery action
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeVisible();
    });
  });
  */
});
