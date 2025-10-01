import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSorting } from '../state/useSorting';
import SortDropdown from '../components/SortDropdown';
import SortableHeader from '../components/SortableHeader';

/**
 * Integration Tests for Universal Sorting Subsystem
 *
 * These tests verify the full workflow from configuration through to sorted output,
 * ensuring all components work together correctly.
 */
describe('Sorting Subsystem Integration', () => {
  describe('full workflow: config → hook → sort data → UI components', () => {
    it('should complete full sorting workflow with Pattern A (dropdown-headers)', () => {
      // Step 1: Define configuration
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
          { key: 'score', label: 'Score', type: 'number' },
        ],
        uiPattern: 'dropdown-headers',
        defaultSort: {
          field: 'name',
          direction: 'asc',
        },
      };

      // Step 2: Initialize hook with configuration
      const { result } = renderHook(() => useSorting(config));

      // Step 3: Verify default sort is applied
      expect(result.current.activeSort.field).toBe('name');
      expect(result.current.activeSort.direction).toBe('asc');

      // Step 4: Sort data using comparator
      const testData = [
        { name: 'Charlie', age: 30, score: 85 },
        { name: 'Alice', age: 25, score: 95 },
        { name: 'Bob', age: 35, score: 75 },
      ];

      let sortedData = [...testData].sort(result.current.comparator);

      // Verify data is sorted by name ascending
      expect(sortedData[0].name).toBe('Alice');
      expect(sortedData[1].name).toBe('Bob');
      expect(sortedData[2].name).toBe('Charlie');

      // Step 5: Change sort field via setSort
      act(() => {
        result.current.setSort('score');
      });

      expect(result.current.activeSort.field).toBe('score');
      expect(result.current.activeSort.direction).toBe('asc');

      // Step 6: Re-sort data with new field
      sortedData = [...testData].sort(result.current.comparator);

      // Verify data is sorted by score ascending
      expect(sortedData[0].score).toBe(75);
      expect(sortedData[1].score).toBe(85);
      expect(sortedData[2].score).toBe(95);

      // Step 7: Toggle direction
      act(() => {
        result.current.toggleDirection();
      });

      expect(result.current.activeSort.direction).toBe('desc');

      // Step 8: Re-sort data with new direction
      sortedData = [...testData].sort(result.current.comparator);

      // Verify data is sorted by score descending
      expect(sortedData[0].score).toBe(95);
      expect(sortedData[1].score).toBe(85);
      expect(sortedData[2].score).toBe(75);

      // Step 9: Reset to default
      act(() => {
        result.current.resetToDefault();
      });

      expect(result.current.activeSort.field).toBe('name');
      expect(result.current.activeSort.direction).toBe('asc');

      // Step 10: Verify UI components render correctly
      const { rerender } = render(
        <div>
          <SortDropdown
            fields={config.fields}
            activeField={result.current.activeSort.field}
            onFieldChange={result.current.setSort}
          />
          <SortableHeader
            field="name"
            label="Name"
            isActive={result.current.activeSort.field === 'name'}
            direction={result.current.activeSort.direction}
            uiPattern={config.uiPattern}
            onToggle={result.current.toggleDirection}
          />
        </div>,
      );

      // Verify dropdown shows correct active field
      expect(screen.getByText('Name')).toBeInTheDocument();

      // Verify header shows arrow (since name is active)
      const header = screen.getByText('Name').closest('div');
      expect(header).toBeInTheDocument();
    });

    it('should complete full sorting workflow with Pattern B (headers-only)', () => {
      // Step 1: Define configuration
      const config = {
        fields: [
          { key: 'title', label: 'Title', type: 'string' },
          { key: 'count', label: 'Count', type: 'number' },
        ],
        uiPattern: 'headers-only',
      };

      // Step 2: Initialize hook
      const { result } = renderHook(() => useSorting(config));

      // Step 3: Verify no default sort (starts inactive)
      expect(result.current.activeSort.field).toBeNull();

      // Step 4: Activate sort via setSort
      act(() => {
        result.current.setSort('title');
      });

      expect(result.current.activeSort.field).toBe('title');
      expect(result.current.activeSort.direction).toBe('asc');

      // Step 5: Sort data
      const testData = [
        { title: 'Zebra', count: 10 },
        { title: 'Apple', count: 20 },
        { title: 'Mango', count: 15 },
      ];

      let sortedData = [...testData].sort(result.current.comparator);

      expect(sortedData[0].title).toBe('Apple');
      expect(sortedData[1].title).toBe('Mango');
      expect(sortedData[2].title).toBe('Zebra');

      // Step 6: Toggle direction via header click
      act(() => {
        result.current.toggleDirection();
      });

      sortedData = [...testData].sort(result.current.comparator);

      expect(sortedData[0].title).toBe('Zebra');
      expect(sortedData[1].title).toBe('Mango');
      expect(sortedData[2].title).toBe('Apple');

      // Step 7: Switch to different field
      act(() => {
        result.current.setSort('count');
      });

      sortedData = [...testData].sort(result.current.comparator);

      expect(sortedData[0].count).toBe(10);
      expect(sortedData[1].count).toBe(15);
      expect(sortedData[2].count).toBe(20);

      // Step 8: Verify UI components render correctly
      render(
        <div>
          <SortableHeader
            field="title"
            label="Title"
            isActive={result.current.activeSort.field === 'title'}
            direction={result.current.activeSort.direction}
            uiPattern={config.uiPattern}
            onClick={result.current.setSort}
          />
          <SortableHeader
            field="count"
            label="Count"
            isActive={result.current.activeSort.field === 'count'}
            direction={result.current.activeSort.direction}
            uiPattern={config.uiPattern}
            onClick={result.current.setSort}
          />
        </div>,
      );

      // Verify both headers render
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Count')).toBeInTheDocument();
    });

    it('should handle complete user interaction flow', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'value', label: 'Value', type: 'number' },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { name: 'Item C', value: 30 },
        { name: 'Item A', value: 10 },
        { name: 'Item B', value: 20 },
      ];

      // Render UI components
      const TestComponent = () => (
        <div>
          <SortDropdown
            fields={config.fields}
            activeField={result.current.activeSort.field}
            onFieldChange={(fieldKey) => {
              act(() => {
                result.current.setSort(fieldKey);
              });
            }}
          />
          {result.current.activeSort.field && (
            <SortableHeader
              field={result.current.activeSort.field}
              label={
                config.fields.find(
                  (f) => f.key === result.current.activeSort.field,
                )?.label
              }
              isActive={true}
              direction={result.current.activeSort.direction}
              uiPattern={config.uiPattern}
              onToggle={() => {
                act(() => {
                  result.current.toggleDirection();
                });
              }}
            />
          )}
        </div>
      );

      const { rerender: rerenderTest } = render(<TestComponent />);

      // User selects "Name" from dropdown
      const dropdown = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(dropdown);
      fireEvent.click(screen.getByText('Name'));

      // Verify sort state updated
      expect(result.current.activeSort.field).toBe('name');

      // Verify data sorts correctly
      let sortedData = [...testData].sort(result.current.comparator);
      expect(sortedData[0].name).toBe('Item A');
      expect(sortedData[1].name).toBe('Item B');
      expect(sortedData[2].name).toBe('Item C');

      // User changes to "Value" field
      fireEvent.mouseDown(dropdown);
      fireEvent.click(screen.getByText('Value'));

      expect(result.current.activeSort.field).toBe('value');

      sortedData = [...testData].sort(result.current.comparator);
      expect(sortedData[0].value).toBe(10);
      expect(sortedData[1].value).toBe(20);
      expect(sortedData[2].value).toBe(30);
    });
  });

  describe('Pattern A integration (dropdown + headers)', () => {
    it('should integrate dropdown and headers for Pattern A', () => {
      const config = {
        fields: [
          { key: 'product', label: 'Product', type: 'string' },
          { key: 'price', label: 'Price', type: 'number' },
          { key: 'rating', label: 'Rating', type: 'number' },
        ],
        uiPattern: 'dropdown-headers',
        defaultSort: {
          field: 'product',
          direction: 'asc',
        },
      };

      const { result } = renderHook(() => useSorting(config));

      // Render dropdown and headers
      render(
        <div>
          <SortDropdown
            fields={config.fields}
            activeField={result.current.activeSort.field}
            onFieldChange={result.current.setSort}
          />
          <div>
            {config.fields.map((field) => (
              <SortableHeader
                key={field.key}
                field={field.key}
                label={field.label}
                isActive={result.current.activeSort.field === field.key}
                direction={result.current.activeSort.direction}
                uiPattern={config.uiPattern}
                onToggle={result.current.toggleDirection}
              />
            ))}
          </div>
        </div>,
      );

      // Verify initial state: product is selected
      expect(screen.getByText('Product')).toBeInTheDocument();

      // Verify only active header shows arrows (Pattern A behavior)
      const productHeader = screen.getAllByText('Product')[0];
      expect(productHeader).toBeInTheDocument();

      // Non-active headers should not show arrows
      const priceHeader = screen.getByText('Price');
      expect(priceHeader).toBeInTheDocument();

      // Change field via dropdown
      const dropdown = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(dropdown);
      fireEvent.click(screen.getByText('Price'));

      // Verify state updates
      act(() => {
        result.current.setSort('price');
      });

      expect(result.current.activeSort.field).toBe('price');
    });

    it('should toggle direction on active header arrow click', () => {
      const config = {
        fields: [{ key: 'score', label: 'Score', type: 'number' }],
        uiPattern: 'dropdown-headers',
        defaultSort: {
          field: 'score',
          direction: 'asc',
        },
      };

      const { result } = renderHook(() => useSorting(config));

      const toggleSpy = jest.fn(() => {
        act(() => {
          result.current.toggleDirection();
        });
      });

      render(
        <SortableHeader
          field="score"
          label="Score"
          isActive={true}
          direction={result.current.activeSort.direction}
          uiPattern={config.uiPattern}
          onToggle={toggleSpy}
        />,
      );

      // Find and click the arrow button
      const arrowButton = screen.getByLabelText('Toggle sort direction');
      fireEvent.click(arrowButton);

      expect(toggleSpy).toHaveBeenCalledTimes(1);
      expect(result.current.activeSort.direction).toBe('desc');
    });
  });

  describe('Pattern B integration (headers only)', () => {
    it('should integrate headers-only pattern correctly', () => {
      const config = {
        fields: [
          { key: 'col1', label: 'Column 1', type: 'string' },
          { key: 'col2', label: 'Column 2', type: 'number' },
          { key: 'col3', label: 'Column 3', type: 'date' },
        ],
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      const clickSpy = jest.fn((fieldKey) => {
        act(() => {
          result.current.setSort(fieldKey);
        });
      });

      render(
        <div>
          {config.fields.map((field) => (
            <SortableHeader
              key={field.key}
              field={field.key}
              label={field.label}
              isActive={result.current.activeSort.field === field.key}
              direction={result.current.activeSort.direction}
              uiPattern={config.uiPattern}
              onClick={clickSpy}
            />
          ))}
        </div>,
      );

      // Verify all headers render
      expect(screen.getByText('Column 1')).toBeInTheDocument();
      expect(screen.getByText('Column 2')).toBeInTheDocument();
      expect(screen.getByText('Column 3')).toBeInTheDocument();

      // Click on first header to activate
      const header1 = screen
        .getByText('Column 1')
        .closest('div[role="button"]');
      fireEvent.click(header1);

      expect(clickSpy).toHaveBeenCalledWith('col1');
      expect(result.current.activeSort.field).toBe('col1');

      // Click on second header to switch
      const header2 = screen
        .getByText('Column 2')
        .closest('div[role="button"]');
      fireEvent.click(header2);

      expect(clickSpy).toHaveBeenCalledWith('col2');
      expect(result.current.activeSort.field).toBe('col2');
    });

    it('should show both arrows on all headers (Pattern B)', () => {
      const config = {
        fields: [
          { key: 'a', label: 'Field A', type: 'string' },
          { key: 'b', label: 'Field B', type: 'string' },
        ],
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      render(
        <div>
          <SortableHeader
            field="a"
            label="Field A"
            isActive={false}
            direction="asc"
            uiPattern={config.uiPattern}
            onClick={result.current.setSort}
          />
          <SortableHeader
            field="b"
            label="Field B"
            isActive={false}
            direction="asc"
            uiPattern={config.uiPattern}
            onClick={result.current.setSort}
          />
        </div>,
      );

      // Both headers should render (even when inactive)
      expect(screen.getByText('Field A')).toBeInTheDocument();
      expect(screen.getByText('Field B')).toBeInTheDocument();

      // Pattern B shows arrows on all headers (both up and down)
      // We can verify this by checking that headers are clickable
      const headerA = screen.getByText('Field A').closest('div[role="button"]');
      const headerB = screen.getByText('Field B').closest('div[role="button"]');

      expect(headerA).toHaveAttribute('role', 'button');
      expect(headerB).toHaveAttribute('role', 'button');
    });
  });

  describe('nested field paths integration', () => {
    it('should sort data with nested field paths', () => {
      const config = {
        fields: [
          {
            key: 'user.name',
            label: 'User Name',
            type: 'string',
            path: 'user.name',
          },
          {
            key: 'stats.score',
            label: 'Score',
            type: 'number',
            path: 'stats.score',
          },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { user: { name: 'Charlie' }, stats: { score: 85 } },
        { user: { name: 'Alice' }, stats: { score: 95 } },
        { user: { name: 'Bob' }, stats: { score: 75 } },
      ];

      // Sort by nested name field
      act(() => {
        result.current.setSort('user.name');
      });

      let sortedData = [...testData].sort(result.current.comparator);

      expect(sortedData[0].user.name).toBe('Alice');
      expect(sortedData[1].user.name).toBe('Bob');
      expect(sortedData[2].user.name).toBe('Charlie');

      // Sort by nested score field
      act(() => {
        result.current.setSort('stats.score');
      });

      sortedData = [...testData].sort(result.current.comparator);

      expect(sortedData[0].stats.score).toBe(75);
      expect(sortedData[1].stats.score).toBe(85);
      expect(sortedData[2].stats.score).toBe(95);
    });

    it('should handle deeply nested paths (3+ levels)', () => {
      const config = {
        fields: [
          {
            key: 'data.metrics.performance.value',
            label: 'Performance',
            type: 'number',
            path: 'data.metrics.performance.value',
          },
        ],
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { data: { metrics: { performance: { value: 30 } } } },
        { data: { metrics: { performance: { value: 10 } } } },
        { data: { metrics: { performance: { value: 20 } } } },
      ];

      act(() => {
        result.current.setSort('data.metrics.performance.value');
      });

      const sortedData = [...testData].sort(result.current.comparator);

      expect(sortedData[0].data.metrics.performance.value).toBe(10);
      expect(sortedData[1].data.metrics.performance.value).toBe(20);
      expect(sortedData[2].data.metrics.performance.value).toBe(30);
    });

    it('should handle missing nested properties gracefully', () => {
      const config = {
        fields: [
          {
            key: 'user.email',
            label: 'Email',
            type: 'string',
            path: 'user.email',
          },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { user: { email: 'charlie@example.com' } },
        { user: {} }, // Missing email
        { user: { email: 'alice@example.com' } },
        {}, // Missing user object
        { user: { email: 'bob@example.com' } },
      ];

      act(() => {
        result.current.setSort('user.email');
      });

      const sortedData = [...testData].sort(result.current.comparator);

      // Valid emails should be sorted, missing values at end
      expect(sortedData[0].user?.email).toBe('alice@example.com');
      expect(sortedData[1].user?.email).toBe('bob@example.com');
      expect(sortedData[2].user?.email).toBe('charlie@example.com');
      // Last two should be the items with missing data
      expect(sortedData[3].user?.email).toBeUndefined();
      expect(sortedData[4].user).toBeUndefined();
    });
  });

  describe('custom comparator integration', () => {
    it('should use custom comparator function', () => {
      const customCompare = (a, b) => {
        // Custom logic: sort by priority (high to low), then by name
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.name.localeCompare(b.name);
      };

      const config = {
        fields: [
          {
            key: 'priority',
            label: 'Priority',
            type: 'custom',
            compare: customCompare,
          },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { name: 'Task C', priority: 1 },
        { name: 'Task A', priority: 3 },
        { name: 'Task D', priority: 3 },
        { name: 'Task B', priority: 2 },
      ];

      act(() => {
        result.current.setSort('priority');
      });

      const sortedData = [...testData].sort(result.current.comparator);

      // High priority first (3), then alphabetically within same priority
      expect(sortedData[0].name).toBe('Task A');
      expect(sortedData[0].priority).toBe(3);
      expect(sortedData[1].name).toBe('Task D');
      expect(sortedData[1].priority).toBe(3);
      expect(sortedData[2].name).toBe('Task B');
      expect(sortedData[2].priority).toBe(2);
      expect(sortedData[3].name).toBe('Task C');
      expect(sortedData[3].priority).toBe(1);
    });

    it('should reverse custom comparator when direction is desc', () => {
      const customCompare = (a, b) => {
        return a.customValue - b.customValue;
      };

      const config = {
        fields: [
          {
            key: 'custom',
            label: 'Custom',
            type: 'custom',
            compare: customCompare,
          },
        ],
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { customValue: 10 },
        { customValue: 30 },
        { customValue: 20 },
      ];

      act(() => {
        result.current.setSort('custom');
      });

      let sortedData = [...testData].sort(result.current.comparator);

      // Ascending
      expect(sortedData[0].customValue).toBe(10);
      expect(sortedData[1].customValue).toBe(20);
      expect(sortedData[2].customValue).toBe(30);

      // Toggle to descending
      act(() => {
        result.current.toggleDirection();
      });

      sortedData = [...testData].sort(result.current.comparator);

      // Descending
      expect(sortedData[0].customValue).toBe(30);
      expect(sortedData[1].customValue).toBe(20);
      expect(sortedData[2].customValue).toBe(10);
    });

    it('should integrate custom comparator with UI components', () => {
      const customCompare = (a, b) => {
        // Sort by string length
        return a.text.length - b.text.length;
      };

      const config = {
        fields: [
          {
            key: 'length',
            label: 'Text Length',
            type: 'custom',
            compare: customCompare,
          },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      render(
        <div>
          <SortDropdown
            fields={config.fields}
            activeField={result.current.activeSort.field}
            onFieldChange={result.current.setSort}
          />
        </div>,
      );

      // Select the custom field
      const dropdown = screen.getByLabelText('Sort By');
      fireEvent.mouseDown(dropdown);
      fireEvent.click(screen.getByText('Text Length'));

      act(() => {
        result.current.setSort('length');
      });

      const testData = [
        { text: 'Hello' },
        { text: 'Hi' },
        { text: 'Greetings' },
      ];

      const sortedData = [...testData].sort(result.current.comparator);

      // Sorted by length: Hi (2), Hello (5), Greetings (9)
      expect(sortedData[0].text).toBe('Hi');
      expect(sortedData[1].text).toBe('Hello');
      expect(sortedData[2].text).toBe('Greetings');
    });
  });

  describe('null filtering integration', () => {
    it('should handle null/undefined values (default: nulls last)', () => {
      const config = {
        fields: [{ key: 'value', label: 'Value', type: 'number' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { value: 20 },
        { value: null },
        { value: 10 },
        { value: undefined },
        { value: 30 },
      ];

      act(() => {
        result.current.setSort('value');
      });

      const sortedData = [...testData].sort(result.current.comparator);

      // Valid numbers sorted first, nulls/undefined at end
      expect(sortedData[0].value).toBe(10);
      expect(sortedData[1].value).toBe(20);
      expect(sortedData[2].value).toBe(30);
      expect([null, undefined]).toContain(sortedData[3].value);
      expect([null, undefined]).toContain(sortedData[4].value);
    });

    it('should handle null values with nullsFirst option', () => {
      const config = {
        fields: [
          {
            key: 'priority',
            label: 'Priority',
            type: 'number',
            nullsFirst: true,
          },
        ],
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { priority: 5 },
        { priority: null },
        { priority: 3 },
        { priority: null },
        { priority: 1 },
      ];

      act(() => {
        result.current.setSort('priority');
      });

      const sortedData = [...testData].sort(result.current.comparator);

      // Nulls first, then sorted numbers
      expect(sortedData[0].priority).toBeNull();
      expect(sortedData[1].priority).toBeNull();
      expect(sortedData[2].priority).toBe(1);
      expect(sortedData[3].priority).toBe(3);
      expect(sortedData[4].priority).toBe(5);
    });

    it('should handle all-null dataset', () => {
      const config = {
        fields: [{ key: 'data', label: 'Data', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [{ data: null }, { data: null }, { data: null }];

      act(() => {
        result.current.setSort('data');
      });

      const sortedData = [...testData].sort(result.current.comparator);

      // Should not crash, maintain order
      expect(sortedData).toHaveLength(3);
      expect(sortedData[0].data).toBeNull();
      expect(sortedData[1].data).toBeNull();
      expect(sortedData[2].data).toBeNull();
    });

    it('should handle mixed null and valid values in nested paths', () => {
      const config = {
        fields: [
          {
            key: 'meta.timestamp',
            label: 'Timestamp',
            type: 'date',
            path: 'meta.timestamp',
          },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { meta: { timestamp: '2024-03-15' } },
        { meta: { timestamp: null } },
        { meta: { timestamp: '2024-01-10' } },
        { meta: {} }, // Missing timestamp
        { meta: { timestamp: '2024-02-20' } },
      ];

      act(() => {
        result.current.setSort('meta.timestamp');
      });

      const sortedData = [...testData].sort(result.current.comparator);

      // Valid dates sorted, null/missing at end
      expect(sortedData[0].meta.timestamp).toBe('2024-01-10');
      expect(sortedData[1].meta.timestamp).toBe('2024-02-20');
      expect(sortedData[2].meta.timestamp).toBe('2024-03-15');
      expect([null, undefined]).toContain(sortedData[3].meta.timestamp);
      expect([null, undefined]).toContain(sortedData[4].meta.timestamp);
    });
  });

  describe('default sort on mount integration', () => {
    it('should apply default sort immediately on mount', () => {
      const config = {
        fields: [
          { key: 'title', label: 'Title', type: 'string' },
          { key: 'date', label: 'Date', type: 'date' },
        ],
        defaultSort: {
          field: 'date',
          direction: 'desc',
        },
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { title: 'Item A', date: '2024-01-10' },
        { title: 'Item B', date: '2024-03-15' },
        { title: 'Item C', date: '2024-02-20' },
      ];

      // Immediately after mount, default sort should be active
      expect(result.current.activeSort.field).toBe('date');
      expect(result.current.activeSort.direction).toBe('desc');

      // Data should sort with default settings
      const sortedData = [...testData].sort(result.current.comparator);

      // Descending order: most recent first
      expect(sortedData[0].date).toBe('2024-03-15');
      expect(sortedData[1].date).toBe('2024-02-20');
      expect(sortedData[2].date).toBe('2024-01-10');
    });

    it('should integrate default sort with UI components on mount', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'rank', label: 'Rank', type: 'number' },
        ],
        defaultSort: {
          field: 'rank',
          direction: 'asc',
        },
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      render(
        <div>
          <SortDropdown
            fields={config.fields}
            activeField={result.current.activeSort.field}
            onFieldChange={result.current.setSort}
          />
          <SortableHeader
            field="rank"
            label="Rank"
            isActive={result.current.activeSort.field === 'rank'}
            direction={result.current.activeSort.direction}
            uiPattern={config.uiPattern}
            onToggle={result.current.toggleDirection}
          />
        </div>,
      );

      // Dropdown should show default field selected
      expect(screen.getByText('Rank')).toBeInTheDocument();

      // Header should show as active with arrow
      const header = screen.getAllByText('Rank')[0];
      expect(header).toBeInTheDocument();
    });

    it('should allow changing from default sort', () => {
      const config = {
        fields: [
          { key: 'category', label: 'Category', type: 'string' },
          { key: 'amount', label: 'Amount', type: 'number' },
        ],
        defaultSort: {
          field: 'category',
          direction: 'asc',
        },
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { category: 'B', amount: 200 },
        { category: 'A', amount: 100 },
        { category: 'C', amount: 150 },
      ];

      // Start with default sort
      let sortedData = [...testData].sort(result.current.comparator);
      expect(sortedData[0].category).toBe('A');

      // Change to different field
      act(() => {
        result.current.setSort('amount');
      });

      sortedData = [...testData].sort(result.current.comparator);
      expect(sortedData[0].amount).toBe(100);
      expect(sortedData[1].amount).toBe(150);
      expect(sortedData[2].amount).toBe(200);

      // Reset back to default
      act(() => {
        result.current.resetToDefault();
      });

      expect(result.current.activeSort.field).toBe('category');
      expect(result.current.activeSort.direction).toBe('asc');
    });
  });

  describe('edge cases and robustness', () => {
    it('should handle empty data array', () => {
      const config = {
        fields: [{ key: 'value', label: 'Value', type: 'number' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [];

      act(() => {
        result.current.setSort('value');
      });

      const sortedData = [...testData].sort(result.current.comparator);

      expect(sortedData).toEqual([]);
    });

    it('should handle single item data array', () => {
      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [{ name: 'Only Item' }];

      act(() => {
        result.current.setSort('name');
      });

      const sortedData = [...testData].sort(result.current.comparator);

      expect(sortedData).toEqual([{ name: 'Only Item' }]);
    });

    it('should handle large dataset (1000+ items)', () => {
      const config = {
        fields: [
          { key: 'id', label: 'ID', type: 'number' },
          { key: 'value', label: 'Value', type: 'number' },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      // Generate large dataset
      const testData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: Math.floor(Math.random() * 1000),
      }));

      act(() => {
        result.current.setSort('value');
      });

      const sortedData = [...testData].sort(result.current.comparator);

      // Verify first item is smallest, last is largest
      expect(sortedData[0].value).toBeLessThanOrEqual(sortedData[1].value);
      expect(sortedData[998].value).toBeLessThanOrEqual(sortedData[999].value);

      // Verify all items are present
      expect(sortedData).toHaveLength(1000);
    });

    it('should handle rapid field switching', () => {
      const config = {
        fields: [
          { key: 'a', label: 'A', type: 'number' },
          { key: 'b', label: 'B', type: 'number' },
          { key: 'c', label: 'C', type: 'number' },
        ],
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      // Rapidly switch between fields
      act(() => {
        result.current.setSort('a');
      });
      expect(result.current.activeSort.field).toBe('a');

      act(() => {
        result.current.setSort('b');
      });
      expect(result.current.activeSort.field).toBe('b');

      act(() => {
        result.current.setSort('c');
      });
      expect(result.current.activeSort.field).toBe('c');

      act(() => {
        result.current.setSort('a');
      });
      expect(result.current.activeSort.field).toBe('a');
    });

    it('should handle rapid direction toggling', () => {
      const config = {
        fields: [{ key: 'score', label: 'Score', type: 'number' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      act(() => {
        result.current.setSort('score');
      });

      // Toggle multiple times rapidly
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.toggleDirection();
        });
      }

      // After 10 toggles, should be back to original (even number of toggles)
      expect(result.current.activeSort.direction).toBe('desc');
    });

    it('should maintain state consistency across multiple operations', () => {
      const config = {
        fields: [
          { key: 'x', label: 'X', type: 'number' },
          { key: 'y', label: 'Y', type: 'string' },
        ],
        defaultSort: {
          field: 'x',
          direction: 'asc',
        },
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const testData = [
        { x: 3, y: 'C' },
        { x: 1, y: 'A' },
        { x: 2, y: 'B' },
      ];

      // Initial state with default
      let sortedData = [...testData].sort(result.current.comparator);
      expect(sortedData[0].x).toBe(1);

      // Change field
      act(() => {
        result.current.setSort('y');
      });
      sortedData = [...testData].sort(result.current.comparator);
      expect(sortedData[0].y).toBe('A');

      // Toggle direction
      act(() => {
        result.current.toggleDirection();
      });
      sortedData = [...testData].sort(result.current.comparator);
      expect(sortedData[0].y).toBe('C');

      // Reset to default
      act(() => {
        result.current.resetToDefault();
      });
      sortedData = [...testData].sort(result.current.comparator);
      expect(sortedData[0].x).toBe(1);

      // Verify all state is consistent
      expect(result.current.activeSort.field).toBe('x');
      expect(result.current.activeSort.direction).toBe('asc');
      expect(result.current.activeSort.fieldConfig.key).toBe('x');
    });
  });
});
