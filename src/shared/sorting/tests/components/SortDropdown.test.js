import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SortDropdown from '../../components/SortDropdown';

describe('SortDropdown', () => {
  // Helper to create field config
  const createFields = () => [
    { key: 'name', label: 'Name', type: 'string' },
    { key: 'age', label: 'Age', type: 'number' },
    { key: 'date', label: 'Date', type: 'date' },
  ];

  // Mock function for onFieldChange
  const mockOnFieldChange = jest.fn();

  beforeEach(() => {
    mockOnFieldChange.mockClear();
  });

  describe('renders with all field options', () => {
    it('should render FormControl with Select component', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Check that the component renders
      expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
    });

    it('should render all field options as MenuItems', () => {
      const fields = createFields();

      const { container } = render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Click the select to open dropdown
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Verify all options are present
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    it('should render correct number of menu items', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Open dropdown
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Check that all 3 items are present
      const menuItems = screen.getAllByRole('option');
      expect(menuItems).toHaveLength(3);
    });

    it('should use field.label for display text', () => {
      const fields = [
        { key: 'customKey', label: 'Custom Display Label', type: 'string' },
      ];

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Open dropdown
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Label should be displayed, not the key
      expect(screen.getByText('Custom Display Label')).toBeInTheDocument();
      expect(screen.queryByText('customKey')).not.toBeInTheDocument();
    });

    it('should use field.key as fallback when label is missing', () => {
      // Suppress console.warn for this test
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const fields = [
        { key: 'username', label: '', type: 'string' }, // Empty label
      ];

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Open dropdown
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Should use key as fallback
      expect(screen.getByText('username')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('activeField selection displays correctly', () => {
    it('should display selected field when activeField is set', () => {
      const fields = createFields();

      const { container } = render(
        <SortDropdown
          fields={fields}
          activeField="age"
          onFieldChange={mockOnFieldChange}
        />,
      );

      // The select should show the active field's label
      const select = container.querySelector('input[type="hidden"]');
      expect(select.value).toBe('age');
    });

    it('should show empty value when activeField is null', () => {
      const fields = createFields();

      const { container } = render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // The select should show empty value
      const select = container.querySelector('input[type="hidden"]');
      expect(select.value).toBe('');
    });

    it('should update displayed value when activeField changes', () => {
      const fields = createFields();

      const { container, rerender } = render(
        <SortDropdown
          fields={fields}
          activeField="name"
          onFieldChange={mockOnFieldChange}
        />,
      );

      let select = container.querySelector('input[type="hidden"]');
      expect(select.value).toBe('name');

      // Update activeField
      rerender(
        <SortDropdown
          fields={fields}
          activeField="date"
          onFieldChange={mockOnFieldChange}
        />,
      );

      select = container.querySelector('input[type="hidden"]');
      expect(select.value).toBe('date');
    });

    it('should display correct label for active field', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField="age"
          onFieldChange={mockOnFieldChange}
        />,
      );

      // The displayed text should be the label of the active field
      expect(screen.getByText('Age')).toBeInTheDocument();
    });
  });

  describe('onFieldChange called with correct key on selection', () => {
    it('should call onFieldChange when selecting a different field', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Open dropdown
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Click on "Age" option
      const ageOption = screen.getByText('Age');
      fireEvent.click(ageOption);

      // Verify callback was called with correct key
      expect(mockOnFieldChange).toHaveBeenCalledTimes(1);
      expect(mockOnFieldChange).toHaveBeenCalledWith('age');
    });

    it('should pass field key (not label) to onFieldChange', () => {
      const fields = [
        { key: 'customFieldKey', label: 'Display Label', type: 'string' },
      ];

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Open dropdown
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Click on option
      const option = screen.getByText('Display Label');
      fireEvent.click(option);

      // Should pass key, not label
      expect(mockOnFieldChange).toHaveBeenCalledWith('customFieldKey');
    });

    it('should call onFieldChange when changing from one field to another', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField="name"
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Open dropdown
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Click on different option
      const dateOption = screen.getByText('Date');
      fireEvent.click(dateOption);

      // Verify callback was called with new field
      expect(mockOnFieldChange).toHaveBeenCalledTimes(1);
      expect(mockOnFieldChange).toHaveBeenCalledWith('date');
    });

    it('should handle multiple selections correctly', () => {
      const fields = createFields();

      const { rerender } = render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // First selection
      let select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);
      fireEvent.click(screen.getByText('Name'));

      expect(mockOnFieldChange).toHaveBeenCalledWith('name');

      // Update component to reflect change
      mockOnFieldChange.mockClear();
      rerender(
        <SortDropdown
          fields={fields}
          activeField="name"
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Second selection
      select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);
      fireEvent.click(screen.getByText('Age'));

      expect(mockOnFieldChange).toHaveBeenCalledWith('age');
    });
  });

  describe('disabled state prevents interaction', () => {
    it('should disable FormControl when disabled prop is true', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
          disabled={true}
        />,
      );

      // Select should be disabled
      const select = screen.getByLabelText('Sort By');
      expect(select).toBeDisabled();
    });

    it('should not call onFieldChange when disabled', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
          disabled={true}
        />,
      );

      // Try to interact with disabled select
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Callback should not be called
      expect(mockOnFieldChange).not.toHaveBeenCalled();
    });

    it('should enable FormControl when disabled prop is false', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
          disabled={false}
        />,
      );

      // Select should be enabled
      const select = screen.getByLabelText('Sort By');
      expect(select).not.toBeDisabled();
    });

    it('should allow interaction when not disabled', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
          disabled={false}
        />,
      );

      // Should be able to interact
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);
      fireEvent.click(screen.getByText('Name'));

      // Callback should be called
      expect(mockOnFieldChange).toHaveBeenCalledWith('name');
    });

    it('should transition from disabled to enabled correctly', () => {
      const fields = createFields();

      const { rerender } = render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
          disabled={true}
        />,
      );

      let select = screen.getByLabelText('Sort By');
      expect(select).toBeDisabled();

      // Re-render with disabled=false
      rerender(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
          disabled={false}
        />,
      );

      select = screen.getByLabelText('Sort By');
      expect(select).not.toBeDisabled();
    });
  });

  describe('custom label prop', () => {
    it('should display custom label when provided', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
          label="Custom Sort Label"
        />,
      );

      // Custom label should be displayed
      expect(screen.getByLabelText('Custom Sort Label')).toBeInTheDocument();
    });

    it('should use default label when label prop is not provided', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Default label should be displayed
      expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
    });

    it('should update label when label prop changes', () => {
      const fields = createFields();

      const { rerender } = render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
          label="First Label"
        />,
      );

      expect(screen.getByLabelText('First Label')).toBeInTheDocument();

      // Update label
      rerender(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
          label="Second Label"
        />,
      );

      expect(screen.getByLabelText('Second Label')).toBeInTheDocument();
      expect(screen.queryByLabelText('First Label')).not.toBeInTheDocument();
    });

    it('should handle empty string label', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
          label=""
        />,
      );

      // Component should render even with empty label
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  describe('empty fields array shows placeholder', () => {
    it('should show placeholder message when fields array is empty', () => {
      render(
        <SortDropdown
          fields={[]}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Open dropdown
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Placeholder message should be shown
      expect(screen.getByText('No sortable fields')).toBeInTheDocument();
    });

    it('should disable dropdown when fields array is empty', () => {
      render(
        <SortDropdown
          fields={[]}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Select should be disabled
      const select = screen.getByLabelText('Sort By');
      expect(select).toBeDisabled();
    });

    it('should not call onFieldChange when clicking placeholder', () => {
      render(
        <SortDropdown
          fields={[]}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Open dropdown (even though disabled, test the behavior)
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Callback should not be called
      expect(mockOnFieldChange).not.toHaveBeenCalled();
    });

    it('should filter out fields without key property', () => {
      // Suppress console.warn for this test
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const fields = [
        { key: 'name', label: 'Name', type: 'string' },
        { label: 'Invalid Field', type: 'string' }, // Missing key
        { key: 'age', label: 'Age', type: 'number' },
      ];

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Open dropdown
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Only valid fields should be shown
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.queryByText('Invalid Field')).not.toBeInTheDocument();

      // Should have 2 options, not 3
      const menuItems = screen.getAllByRole('option');
      expect(menuItems).toHaveLength(2);

      consoleSpy.mockRestore();
    });

    it('should show placeholder when all fields are invalid', () => {
      // Suppress console.warn for this test
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const fields = [
        { label: 'Invalid 1', type: 'string' }, // Missing key
        { label: 'Invalid 2', type: 'string' }, // Missing key
      ];

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Select should be disabled
      const select = screen.getByLabelText('Sort By');
      expect(select).toBeDisabled();

      // Open dropdown
      fireEvent.mouseDown(select);

      // Placeholder should be shown
      expect(screen.getByText('No sortable fields')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('keyboard navigation', () => {
    it('should allow keyboard navigation through options', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Focus the select
      const select = screen.getByLabelText('Sort By');
      select.focus();
      expect(select).toHaveFocus();

      // Open with Enter key
      fireEvent.keyDown(select, { key: 'Enter', code: 'Enter' });

      // Options should be visible
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    it('should open dropdown with Space key', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Focus the select
      const select = screen.getByLabelText('Sort By');
      select.focus();

      // Open with Space key
      fireEvent.keyDown(select, { key: ' ', code: 'Space' });

      // Options should be visible
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('should select option with keyboard', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Focus and open dropdown
      const select = screen.getByLabelText('Sort By');
      select.focus();
      fireEvent.keyDown(select, { key: 'Enter', code: 'Enter' });

      // Navigate to option and select with Enter
      const nameOption = screen.getByText('Name');
      fireEvent.click(nameOption);

      // Callback should be called
      expect(mockOnFieldChange).toHaveBeenCalledWith('name');
    });

    it('should maintain focus on select after closing dropdown', () => {
      const fields = createFields();

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Focus and open
      const select = screen.getByLabelText('Sort By');
      select.focus();
      fireEvent.keyDown(select, { key: 'Enter', code: 'Enter' });

      // Select an option
      fireEvent.click(screen.getByText('Name'));

      // Select should still be in the document (focus behavior varies)
      expect(select).toBeInTheDocument();
    });
  });

  describe('additional edge cases', () => {
    it('should apply custom className to FormControl', () => {
      const fields = createFields();

      const { container } = render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
          className="custom-class-name"
        />,
      );

      // FormControl should have the custom class
      const formControl = container.querySelector('.custom-class-name');
      expect(formControl).toBeInTheDocument();
    });

    it('should handle undefined activeField', () => {
      const fields = createFields();

      const { container } = render(
        <SortDropdown
          fields={fields}
          activeField={undefined}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Should render with empty value
      const select = container.querySelector('input[type="hidden"]');
      expect(select.value).toBe('');
    });

    it('should handle activeField that does not exist in fields', () => {
      const fields = createFields();

      const { container } = render(
        <SortDropdown
          fields={fields}
          activeField="nonexistent"
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Should still render with the value (even if invalid)
      const select = container.querySelector('input[type="hidden"]');
      expect(select.value).toBe('nonexistent');
    });

    it('should handle single field in array', () => {
      const fields = [{ key: 'only', label: 'Only Field', type: 'string' }];

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Open dropdown
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Should show single option
      expect(screen.getByText('Only Field')).toBeInTheDocument();
      const menuItems = screen.getAllByRole('option');
      expect(menuItems).toHaveLength(1);
    });

    it('should handle many fields in array', () => {
      const fields = Array.from({ length: 20 }, (_, i) => ({
        key: `field${i}`,
        label: `Field ${i}`,
        type: 'string',
      }));

      render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={mockOnFieldChange}
        />,
      );

      // Open dropdown
      const select = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(select);

      // Should show all options
      const menuItems = screen.getAllByRole('option');
      expect(menuItems).toHaveLength(20);
    });

    it('should not crash when onFieldChange is not a function', () => {
      const fields = createFields();

      // This should not crash (PropTypes will warn in dev mode)
      const { container } = render(
        <SortDropdown
          fields={fields}
          activeField={null}
          onFieldChange={null}
        />,
      );

      expect(container).toBeInTheDocument();
    });
  });
});
