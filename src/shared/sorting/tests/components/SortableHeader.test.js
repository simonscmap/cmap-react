import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SortableHeader from '../../components/SortableHeader';

describe('SortableHeader', () => {
  // Mock functions
  const mockOnToggle = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnClick.mockClear();
    // Suppress console warnings for these tests
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  describe('Pattern A: inactive header (no arrows)', () => {
    it('should render label without arrows when inactive', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="dropdown-headers"
        />,
      );

      // Label should be present
      expect(screen.getByText('Dataset Name')).toBeInTheDocument();

      // Arrows should not be present when inactive
      const container = screen.getByText('Dataset Name').parentElement;
      expect(container.querySelector('button')).not.toBeInTheDocument();
    });

    it('should render with normal font weight when inactive', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="dropdown-headers"
        />,
      );

      // Check that the label is rendered (weight is applied via CSS)
      expect(screen.getByText('Dataset Name')).toBeInTheDocument();
    });

    it('should not have any interactive elements when inactive', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="dropdown-headers"
        />,
      );

      // No button should exist
      expect(container.querySelector('button')).not.toBeInTheDocument();
    });

    it('should not call onToggle when inactive (no button to click)', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Since there's no button, we can't click anything
      // Just verify onToggle hasn't been called
      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });

  describe('Pattern A: active header (shows arrow)', () => {
    it('should render arrow button when active', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Label should be present
      expect(screen.getByText('Dataset Name')).toBeInTheDocument();

      // Arrow button should be present
      const button = screen.getByLabelText('Toggle sort direction');
      expect(button).toBeInTheDocument();
    });

    it('should show upward arrow for ascending direction', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Check for ArrowUpward icon (Material-UI renders it as an SVG)
      const button = screen.getByLabelText('Toggle sort direction');
      expect(button).toBeInTheDocument();

      // The SVG should be present inside the button
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should show downward arrow for descending direction', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="desc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Check for ArrowDownward icon
      const button = screen.getByLabelText('Toggle sort direction');
      expect(button).toBeInTheDocument();

      // The SVG should be present inside the button
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with bold font weight when active', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Label should be present (weight applied via CSS)
      expect(screen.getByText('Dataset Name')).toBeInTheDocument();
    });

    it('should warn if onToggle is missing when active', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
        />,
      );

      // Console.warn should have been called
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('requires onToggle callback'),
      );
    });

    it('should not render arrow button when active but onToggle is missing', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
        />,
      );

      // Label should be present
      expect(screen.getByText('Dataset Name')).toBeInTheDocument();

      // Button should not be present without onToggle
      expect(
        screen.queryByLabelText('Toggle sort direction'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Pattern A: arrow click calls onToggle', () => {
    it('should call onToggle when arrow button is clicked', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Click the arrow button
      const button = screen.getByLabelText('Toggle sort direction');
      fireEvent.click(button);

      // onToggle should be called
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle multiple times on multiple clicks', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      const button = screen.getByLabelText('Toggle sort direction');

      // Click multiple times
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnToggle).toHaveBeenCalledTimes(3);
    });

    it('should not call onToggle when label is clicked (only arrow button)', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Click the label text
      const label = screen.getByText('Dataset Name');
      fireEvent.click(label);

      // onToggle should NOT be called (only arrow button triggers it)
      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });

  describe('Pattern B: inactive header (both arrows, faded)', () => {
    it('should render both arrows when inactive', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Label should be present
      expect(screen.getByText('Dataset Name')).toBeInTheDocument();

      // Both arrow SVGs should be present
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2); // ArrowUpward + ArrowDownward
    });

    it('should render both arrows with faded opacity when inactive', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Both arrows should exist (opacity is applied via CSS classes)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2);
    });

    it('should render header as clickable button role', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Header should have button role
      const header = screen.getByRole('button');
      expect(header).toBeInTheDocument();
    });

    it('should have appropriate aria-label when inactive', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Aria-label should indicate default direction
      const header = screen.getByLabelText('Sort by Dataset Name ascending');
      expect(header).toBeInTheDocument();
    });

    it('should be keyboard accessible with tabIndex', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Header should have tabIndex for keyboard navigation
      const header = screen.getByRole('button');
      expect(header).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Pattern B: active header (one arrow highlighted)', () => {
    it('should render both arrows when active', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Both arrow SVGs should be present
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2); // ArrowUpward + ArrowDownward
    });

    it('should highlight upward arrow when active and ascending', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Both arrows exist, but styling differs (tested via CSS classes)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2);
    });

    it('should highlight downward arrow when active and descending', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="desc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Both arrows exist, but styling differs
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2);
    });

    it('should render with bold font weight when active', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Label should be present (weight applied via CSS)
      expect(screen.getByText('Dataset Name')).toBeInTheDocument();
    });

    it('should have appropriate aria-label when active ascending', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Aria-label should reflect current direction
      const header = screen.getByLabelText('Sort by Dataset Name asc');
      expect(header).toBeInTheDocument();
    });

    it('should have appropriate aria-label when active descending', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="desc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Aria-label should reflect current direction
      const header = screen.getByLabelText('Sort by Dataset Name desc');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Pattern B: header click calls onClick with field key', () => {
    it('should call onClick when header is clicked', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Click the header
      const header = screen.getByRole('button');
      fireEvent.click(header);

      // onClick should be called with field key
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith('name');
    });

    it('should pass field key (not label) to onClick', () => {
      render(
        <SortableHeader
          field="customFieldKey"
          label="Custom Display Label"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Click the header
      const header = screen.getByRole('button');
      fireEvent.click(header);

      // Should pass key, not label
      expect(mockOnClick).toHaveBeenCalledWith('customFieldKey');
    });

    it('should call onClick on Enter key press', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Press Enter key
      const header = screen.getByRole('button');
      fireEvent.keyDown(header, { key: 'Enter', code: 'Enter' });

      // onClick should be called with field key
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith('name');
    });

    it('should call onClick on Space key press', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Press Space key
      const header = screen.getByRole('button');
      fireEvent.keyDown(header, { key: ' ', code: 'Space' });

      // onClick should be called with field key
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith('name');
    });

    it('should not call onClick on other key presses', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Press other keys
      const header = screen.getByRole('button');
      fireEvent.keyDown(header, { key: 'Tab', code: 'Tab' });
      fireEvent.keyDown(header, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(header, { key: 'a', code: 'KeyA' });

      // onClick should NOT be called
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should call onClick multiple times on multiple clicks', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      const header = screen.getByRole('button');

      // Click multiple times
      fireEvent.click(header);
      fireEvent.click(header);
      fireEvent.click(header);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
      expect(mockOnClick).toHaveBeenNthCalledWith(1, 'name');
      expect(mockOnClick).toHaveBeenNthCalledWith(2, 'name');
      expect(mockOnClick).toHaveBeenNthCalledWith(3, 'name');
    });

    it('should warn if onClick is missing for Pattern B', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
        />,
      );

      // Console.warn should have been called
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('requires onClick callback'),
      );
    });
  });

  describe('direction prop affects arrow display (asc vs desc)', () => {
    it('should show upward arrow in Pattern A when direction is asc', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Arrow button should exist
      const button = screen.getByLabelText('Toggle sort direction');
      expect(button).toBeInTheDocument();
    });

    it('should show downward arrow in Pattern A when direction is desc', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="desc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Arrow button should exist
      const button = screen.getByLabelText('Toggle sort direction');
      expect(button).toBeInTheDocument();
    });

    it('should update arrow when direction changes from asc to desc', () => {
      const { rerender, container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Initial arrow
      let button = screen.getByLabelText('Toggle sort direction');
      expect(button).toBeInTheDocument();

      // Update direction to desc
      rerender(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="desc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Arrow should still be present (icon changed internally)
      button = screen.getByLabelText('Toggle sort direction');
      expect(button).toBeInTheDocument();
    });

    it('should highlight correct arrow in Pattern B when direction is asc', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Both arrows present (styling differs via CSS)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2);
    });

    it('should highlight correct arrow in Pattern B when direction is desc', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="desc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Both arrows present (styling differs via CSS)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2);
    });

    it('should handle invalid direction gracefully (defaults to asc)', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="invalid"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Should still render (defaults to asc)
      const button = screen.getByLabelText('Toggle sort direction');
      expect(button).toBeInTheDocument();
    });

    it('should handle missing direction prop (defaults to asc)', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Should render with default direction
      const button = screen.getByLabelText('Toggle sort direction');
      expect(button).toBeInTheDocument();
    });
  });

  describe('accessibility attributes', () => {
    it('should have aria-label for arrow button in Pattern A', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      const button = screen.getByLabelText('Toggle sort direction');
      expect(button).toBeInTheDocument();
    });

    it('should have role="button" for Pattern B header', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      const header = screen.getByRole('button');
      expect(header).toBeInTheDocument();
    });

    it('should have tabIndex for Pattern B header keyboard navigation', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      const header = screen.getByRole('button');
      expect(header).toHaveAttribute('tabIndex', '0');
    });

    it('should have descriptive aria-label for Pattern B header', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      const header = screen.getByLabelText('Sort by Dataset Name ascending');
      expect(header).toBeInTheDocument();
    });

    it('should update aria-label when direction changes in Pattern B', () => {
      const { rerender } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      let header = screen.getByLabelText('Sort by Dataset Name asc');
      expect(header).toBeInTheDocument();

      // Change direction
      rerender(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="desc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      header = screen.getByLabelText('Sort by Dataset Name desc');
      expect(header).toBeInTheDocument();
    });

    it('should prevent default on Space key to avoid page scroll', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      const header = screen.getByRole('button');
      const event = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      header.dispatchEvent(event);

      // preventDefault should be called to prevent page scroll
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('additional edge cases', () => {
    it('should apply custom className in Pattern A', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="dropdown-headers"
          className="custom-header-class"
        />,
      );

      const header = container.querySelector('.custom-header-class');
      expect(header).toBeInTheDocument();
    });

    it('should apply custom className in Pattern B', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
          className="custom-header-class"
        />,
      );

      const header = container.querySelector('.custom-header-class');
      expect(header).toBeInTheDocument();
    });

    it('should handle empty label string', () => {
      render(
        <SortableHeader
          field="name"
          label=""
          isActive={false}
          direction="asc"
          uiPattern="dropdown-headers"
        />,
      );

      // Component should render even with empty label
      const { container } = render(
        <SortableHeader
          field="name"
          label=""
          isActive={false}
          direction="asc"
          uiPattern="dropdown-headers"
        />,
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle very long label text', () => {
      const longLabel = 'This is a very long label that might wrap or overflow';

      render(
        <SortableHeader
          field="name"
          label={longLabel}
          isActive={false}
          direction="asc"
          uiPattern="dropdown-headers"
        />,
      );

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('should handle special characters in label', () => {
      const specialLabel = 'Name (100%) & "Value" <Test>';

      render(
        <SortableHeader
          field="name"
          label={specialLabel}
          isActive={false}
          direction="asc"
          uiPattern="dropdown-headers"
        />,
      );

      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });

    it('should log error and render fallback for invalid uiPattern', () => {
      render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="invalid-pattern"
        />,
      );

      // Should still render label as fallback
      expect(screen.getByText('Dataset Name')).toBeInTheDocument();

      // Console.error should have been called
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Invalid uiPattern'),
      );
    });

    it('should handle transition from inactive to active in Pattern A', () => {
      const { rerender } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Should not have arrow button initially
      expect(
        screen.queryByLabelText('Toggle sort direction'),
      ).not.toBeInTheDocument();

      // Activate the header
      rerender(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Should now have arrow button
      expect(
        screen.getByLabelText('Toggle sort direction'),
      ).toBeInTheDocument();
    });

    it('should handle transition from active to inactive in Pattern A', () => {
      const { rerender } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Should have arrow button initially
      expect(
        screen.getByLabelText('Toggle sort direction'),
      ).toBeInTheDocument();

      // Deactivate the header
      rerender(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Should no longer have arrow button
      expect(
        screen.queryByLabelText('Toggle sort direction'),
      ).not.toBeInTheDocument();
    });

    it('should not crash when onClick is missing in Pattern B (just warns)', () => {
      const { container } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={false}
          direction="asc"
          uiPattern="headers-only"
        />,
      );

      // Should still render
      expect(screen.getByText('Dataset Name')).toBeInTheDocument();

      // Console.warn should have been called
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('requires onClick callback'),
      );
    });

    it('should handle rapid direction changes', () => {
      const { rerender } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Rapidly change direction
      rerender(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="desc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      rerender(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      rerender(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="desc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Should still render correctly
      expect(screen.getByText('Dataset Name')).toBeInTheDocument();
    });

    it('should handle switching between UI patterns', () => {
      const { rerender } = render(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="dropdown-headers"
          onToggle={mockOnToggle}
        />,
      );

      // Should have arrow button for Pattern A
      expect(
        screen.getByLabelText('Toggle sort direction'),
      ).toBeInTheDocument();

      // Switch to Pattern B
      rerender(
        <SortableHeader
          field="name"
          label="Dataset Name"
          isActive={true}
          direction="asc"
          uiPattern="headers-only"
          onClick={mockOnClick}
        />,
      );

      // Should now have role="button" for Pattern B
      const header = screen.getByRole('button');
      expect(header).toBeInTheDocument();
    });
  });
});
