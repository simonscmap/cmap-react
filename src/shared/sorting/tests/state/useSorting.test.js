import { renderHook, act } from '@testing-library/react-hooks';
import { useSorting } from '../../state/useSorting';

describe('useSorting', () => {
  describe('hook initialization with valid config', () => {
    it('should initialize successfully with minimal valid config', () => {
      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.current.activeSort).toBeDefined();
      expect(result.current.comparator).toBeDefined();
      expect(result.current.setSort).toBeDefined();
      expect(result.current.toggleDirection).toBeDefined();
      expect(result.current.resetToDefault).toBeDefined();
      expect(result.current.config).toBeDefined();
    });

    it('should initialize with multiple fields', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
          { key: 'date', label: 'Date', type: 'date' },
        ],
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.current.config.fields).toHaveLength(3);
      expect(result.current.activeSort.field).toBeNull();
      expect(result.current.activeSort.direction).toBe('asc');
    });

    it('should initialize with default sort configuration', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'score', label: 'Score', type: 'number' },
        ],
        defaultSort: {
          field: 'score',
          direction: 'desc',
        },
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.current.activeSort.field).toBe('score');
      expect(result.current.activeSort.direction).toBe('desc');
      expect(result.current.activeSort.fieldConfig).toEqual({
        key: 'score',
        label: 'Score',
        type: 'number',
      });
    });

    it('should initialize with nested field paths', () => {
      const config = {
        fields: [
          {
            key: 'user.name',
            label: 'User Name',
            type: 'string',
            path: 'user.name',
          },
          { key: 'stats.score', label: 'Score', type: 'number' },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.current.config.fields[0].key).toBe('user.name');
      expect(result.current.config.fields[1].key).toBe('stats.score');
    });

    it('should initialize with custom comparator', () => {
      const customCompare = (a, b) => {
        return a.priority - b.priority;
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
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.current.config.fields[0].type).toBe('custom');
      expect(result.current.config.fields[0].compare).toBe(customCompare);
    });
  });

  describe('hook initialization with invalid config (errors)', () => {
    it('should throw error when config is missing', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useSorting());

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(/Sort configuration is required/);

      consoleSpy.mockRestore();
    });

    it('should throw error when config is null', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useSorting(null));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(/Sort configuration is required/);

      consoleSpy.mockRestore();
    });

    it('should throw error when fields array is missing', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        /must have a "fields" array property/,
      );

      consoleSpy.mockRestore();
    });

    it('should throw error when fields array is empty', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(/must have at least one field/);

      consoleSpy.mockRestore();
    });

    it('should throw error when field keys are not unique', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [
          { key: 'name', label: 'First Name', type: 'string' },
          { key: 'name', label: 'Last Name', type: 'string' },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(/Duplicate keys found: name/);

      consoleSpy.mockRestore();
    });

    it('should throw error when field is missing key property', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [{ label: 'Name', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        /must have a non-empty string "key" property/,
      );

      consoleSpy.mockRestore();
    });

    it('should throw error when field is missing label property', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [{ key: 'name', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        /must have a non-empty string "label" property/,
      );

      consoleSpy.mockRestore();
    });

    it('should throw error when field is missing type property', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [{ key: 'name', label: 'Name' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(/must have a "type" property/);

      consoleSpy.mockRestore();
    });

    it('should throw error when custom type is missing compare function', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [{ key: 'custom', label: 'Custom', type: 'custom' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        /has type 'custom' but no compare function provided/,
      );

      consoleSpy.mockRestore();
    });

    it('should throw error when default field does not exist', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        defaultSort: {
          field: 'nonexistent',
          direction: 'asc',
        },
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        /Default sort field 'nonexistent' not found/,
      );

      consoleSpy.mockRestore();
    });

    it('should throw error when default direction is invalid', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        defaultSort: {
          field: 'name',
          direction: 'invalid',
        },
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(/must be 'asc' or 'desc'/);

      consoleSpy.mockRestore();
    });

    it('should throw error when uiPattern is missing', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(/must have a "uiPattern" property/);

      consoleSpy.mockRestore();
    });

    it('should throw error when uiPattern is invalid', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        uiPattern: 'invalid-pattern',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        /uiPattern must be one of: dropdown-headers, headers-only/,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('setSort updates activeSort', () => {
    it('should update activeSort when setSort is called', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.current.activeSort.field).toBeNull();

      act(() => {
        result.current.setSort('name');
      });

      expect(result.current.activeSort.field).toBe('name');
      expect(result.current.activeSort.direction).toBe('asc');
      expect(result.current.activeSort.fieldConfig).toEqual({
        key: 'name',
        label: 'Name',
        type: 'string',
      });
    });

    it('should reset direction to asc when changing fields', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      act(() => {
        result.current.setSort('name');
      });

      act(() => {
        result.current.toggleDirection();
      });

      expect(result.current.activeSort.direction).toBe('desc');

      act(() => {
        result.current.setSort('age');
      });

      expect(result.current.activeSort.field).toBe('age');
      expect(result.current.activeSort.direction).toBe('asc');
    });

    it('should update fieldConfig when field changes', () => {
      const config = {
        fields: [
          { key: 'title', label: 'Title', type: 'string' },
          { key: 'count', label: 'Count', type: 'number' },
        ],
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      act(() => {
        result.current.setSort('title');
      });

      expect(result.current.activeSort.fieldConfig).toEqual({
        key: 'title',
        label: 'Title',
        type: 'string',
      });

      act(() => {
        result.current.setSort('count');
      });

      expect(result.current.activeSort.fieldConfig).toEqual({
        key: 'count',
        label: 'Count',
        type: 'number',
      });
    });
  });

  describe('toggleDirection updates direction', () => {
    it('should toggle from asc to desc', () => {
      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      act(() => {
        result.current.setSort('name');
      });

      expect(result.current.activeSort.direction).toBe('asc');

      act(() => {
        result.current.toggleDirection();
      });

      expect(result.current.activeSort.direction).toBe('desc');
    });

    it('should toggle from desc to asc', () => {
      const config = {
        fields: [{ key: 'score', label: 'Score', type: 'number' }],
        defaultSort: {
          field: 'score',
          direction: 'desc',
        },
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.current.activeSort.direction).toBe('desc');

      act(() => {
        result.current.toggleDirection();
      });

      expect(result.current.activeSort.direction).toBe('asc');
    });

    it('should toggle multiple times correctly', () => {
      const config = {
        fields: [{ key: 'rank', label: 'Rank', type: 'number' }],
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      act(() => {
        result.current.setSort('rank');
      });

      expect(result.current.activeSort.direction).toBe('asc');

      act(() => {
        result.current.toggleDirection();
      });
      expect(result.current.activeSort.direction).toBe('desc');

      act(() => {
        result.current.toggleDirection();
      });
      expect(result.current.activeSort.direction).toBe('asc');

      act(() => {
        result.current.toggleDirection();
      });
      expect(result.current.activeSort.direction).toBe('desc');
    });
  });

  describe('resetToDefault restores default', () => {
    it('should reset to null when no default is configured', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      act(() => {
        result.current.setSort('name');
      });

      act(() => {
        result.current.toggleDirection();
      });

      expect(result.current.activeSort.field).toBe('name');
      expect(result.current.activeSort.direction).toBe('desc');

      act(() => {
        result.current.resetToDefault();
      });

      expect(result.current.activeSort.field).toBeNull();
      expect(result.current.activeSort.direction).toBe('asc');
      expect(result.current.activeSort.fieldConfig).toBeNull();
    });

    it('should reset to configured default field and direction', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'date', label: 'Date', type: 'date' },
        ],
        defaultSort: {
          field: 'name',
          direction: 'asc',
        },
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      act(() => {
        result.current.setSort('date');
      });

      act(() => {
        result.current.toggleDirection();
      });

      expect(result.current.activeSort.field).toBe('date');
      expect(result.current.activeSort.direction).toBe('desc');

      act(() => {
        result.current.resetToDefault();
      });

      expect(result.current.activeSort.field).toBe('name');
      expect(result.current.activeSort.direction).toBe('asc');
    });

    it('should reset to desc default when configured', () => {
      const config = {
        fields: [
          { key: 'score', label: 'Score', type: 'number' },
          { key: 'rank', label: 'Rank', type: 'number' },
        ],
        defaultSort: {
          field: 'score',
          direction: 'desc',
        },
        uiPattern: 'headers-only',
      };

      const { result } = renderHook(() => useSorting(config));

      act(() => {
        result.current.setSort('rank');
      });

      expect(result.current.activeSort.field).toBe('rank');
      expect(result.current.activeSort.direction).toBe('asc');

      act(() => {
        result.current.resetToDefault();
      });

      expect(result.current.activeSort.field).toBe('score');
      expect(result.current.activeSort.direction).toBe('desc');
    });
  });

  describe('comparator function sorts array correctly', () => {
    it('should sort strings in ascending order', () => {
      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];

      act(() => {
        result.current.setSort('name');
      });

      const sorted = [...data].sort(result.current.comparator);

      expect(sorted[0].name).toBe('Alice');
      expect(sorted[1].name).toBe('Bob');
      expect(sorted[2].name).toBe('Charlie');
    });

    it('should sort strings in descending order', () => {
      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [{ name: 'Alice' }, { name: 'Charlie' }, { name: 'Bob' }];

      act(() => {
        result.current.setSort('name');
        result.current.toggleDirection();
      });

      const sorted = [...data].sort(result.current.comparator);

      expect(sorted[0].name).toBe('Charlie');
      expect(sorted[1].name).toBe('Bob');
      expect(sorted[2].name).toBe('Alice');
    });

    it('should sort numbers in ascending order', () => {
      const config = {
        fields: [{ key: 'age', label: 'Age', type: 'number' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [{ age: 30 }, { age: 25 }, { age: 35 }];

      act(() => {
        result.current.setSort('age');
      });

      const sorted = [...data].sort(result.current.comparator);

      expect(sorted[0].age).toBe(25);
      expect(sorted[1].age).toBe(30);
      expect(sorted[2].age).toBe(35);
    });

    it('should sort numbers in descending order', () => {
      const config = {
        fields: [{ key: 'score', label: 'Score', type: 'number' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [{ score: 85 }, { score: 95 }, { score: 75 }];

      act(() => {
        result.current.setSort('score');
        result.current.toggleDirection();
      });

      const sorted = [...data].sort(result.current.comparator);

      expect(sorted[0].score).toBe(95);
      expect(sorted[1].score).toBe(85);
      expect(sorted[2].score).toBe(75);
    });

    it('should sort dates in ascending order', () => {
      const config = {
        fields: [{ key: 'date', label: 'Date', type: 'date' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [
        { date: '2024-03-15' },
        { date: '2024-01-10' },
        { date: '2024-02-20' },
      ];

      act(() => {
        result.current.setSort('date');
      });

      const sorted = [...data].sort(result.current.comparator);

      expect(sorted[0].date).toBe('2024-01-10');
      expect(sorted[1].date).toBe('2024-02-20');
      expect(sorted[2].date).toBe('2024-03-15');
    });

    it('should sort percentages correctly', () => {
      const config = {
        fields: [{ key: 'completion', label: 'Completion', type: 'percent' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [
        { completion: '95%' },
        { completion: '85%' },
        { completion: '90%' },
      ];

      act(() => {
        result.current.setSort('completion');
      });

      const sorted = [...data].sort(result.current.comparator);

      expect(sorted[0].completion).toBe('85%');
      expect(sorted[1].completion).toBe('90%');
      expect(sorted[2].completion).toBe('95%');
    });

    it('should sort nested field paths correctly', () => {
      const config = {
        fields: [
          {
            key: 'user.name',
            label: 'User Name',
            type: 'string',
            path: 'user.name',
          },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [
        { user: { name: 'Charlie' } },
        { user: { name: 'Alice' } },
        { user: { name: 'Bob' } },
      ];

      act(() => {
        result.current.setSort('user.name');
      });

      const sorted = [...data].sort(result.current.comparator);

      expect(sorted[0].user.name).toBe('Alice');
      expect(sorted[1].user.name).toBe('Bob');
      expect(sorted[2].user.name).toBe('Charlie');
    });

    it('should return no-op comparator when no field is active', () => {
      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];

      // No field set, should maintain original order
      const sorted = [...data].sort(result.current.comparator);

      expect(sorted[0].name).toBe('Charlie');
      expect(sorted[1].name).toBe('Alice');
      expect(sorted[2].name).toBe('Bob');
    });
  });

  describe('config validation (empty fields, duplicate keys, missing default field)', () => {
    it('should throw error for empty fields array', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(/must have at least one field/);

      consoleSpy.mockRestore();
    });

    it('should throw error for duplicate field keys', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [
          { key: 'name', label: 'First Name', type: 'string' },
          { key: 'email', label: 'Email', type: 'string' },
          { key: 'name', label: 'Last Name', type: 'string' },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(/Duplicate keys found: name/);

      consoleSpy.mockRestore();
    });

    it('should throw error when multiple duplicate keys exist', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [
          { key: 'name', label: 'Name 1', type: 'string' },
          { key: 'name', label: 'Name 2', type: 'string' },
          { key: 'age', label: 'Age 1', type: 'number' },
          { key: 'age', label: 'Age 2', type: 'number' },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(/Duplicate keys found/);

      consoleSpy.mockRestore();
    });

    it('should throw error for missing default field', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
        ],
        defaultSort: {
          field: 'nonexistent',
          direction: 'asc',
        },
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        /Default sort field 'nonexistent' not found/,
      );

      consoleSpy.mockRestore();
    });

    it('should include available fields in missing default field error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
          { key: 'email', label: 'Email', type: 'string' },
        ],
        defaultSort: {
          field: 'badField',
          direction: 'asc',
        },
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      expect(result.error).toBeDefined();
      expect(result.error.message).toMatch(
        /Available fields: name, age, email/,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('custom comparator integration', () => {
    it('should use custom comparator function', () => {
      const customCompare = (a, b) => {
        // Custom logic: sort by priority (high to low) then by name
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
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

      const data = [
        { name: 'Task C', priority: 1 },
        { name: 'Task A', priority: 3 },
        { name: 'Task B', priority: 2 },
        { name: 'Task D', priority: 3 },
      ];

      act(() => {
        result.current.setSort('priority');
      });

      const sorted = [...data].sort(result.current.comparator);

      // Should be sorted by priority (3, 3, 2, 1), then by name within same priority
      expect(sorted[0].name).toBe('Task A');
      expect(sorted[0].priority).toBe(3);
      expect(sorted[1].name).toBe('Task D');
      expect(sorted[1].priority).toBe(3);
      expect(sorted[2].name).toBe('Task B');
      expect(sorted[2].priority).toBe(2);
      expect(sorted[3].name).toBe('Task C');
      expect(sorted[3].priority).toBe(1);
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
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [
        { customValue: 10 },
        { customValue: 5 },
        { customValue: 15 },
      ];

      act(() => {
        result.current.setSort('custom');
        result.current.toggleDirection();
      });

      const sorted = [...data].sort(result.current.comparator);

      // Desc should reverse the order
      expect(sorted[0].customValue).toBe(15);
      expect(sorted[1].customValue).toBe(10);
      expect(sorted[2].customValue).toBe(5);
    });
  });

  describe('config memoization', () => {
    it('should memoize config to avoid unnecessary re-renders', () => {
      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result, rerender } = renderHook(() => useSorting(config));

      const initialConfig = result.current.config;

      // Rerender with same config object
      rerender();

      // Config reference should remain the same
      expect(result.current.config).toBe(initialConfig);
    });

    it('should create new config when config object changes', () => {
      const config1 = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result, rerender } = renderHook(({ cfg }) => useSorting(cfg), {
        initialProps: { cfg: config1 },
      });

      const initialConfig = result.current.config;

      const config2 = {
        fields: [{ key: 'age', label: 'Age', type: 'number' }],
        uiPattern: 'headers-only',
      };

      // Rerender with different config
      rerender({ cfg: config2 });

      // Config should be new
      expect(result.current.config).not.toBe(initialConfig);
      expect(result.current.config.fields[0].key).toBe('age');
    });
  });

  describe('edge cases and stability', () => {
    it('should handle switching between multiple fields', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
          { key: 'date', label: 'Date', type: 'date' },
        ],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      act(() => {
        result.current.setSort('name');
      });
      expect(result.current.activeSort.field).toBe('name');

      act(() => {
        result.current.setSort('age');
      });
      expect(result.current.activeSort.field).toBe('age');

      act(() => {
        result.current.setSort('date');
      });
      expect(result.current.activeSort.field).toBe('date');

      act(() => {
        result.current.setSort('name');
      });
      expect(result.current.activeSort.field).toBe('name');
    });

    it('should handle null/undefined values in data', () => {
      const config = {
        fields: [{ key: 'value', label: 'Value', type: 'number' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [
        { value: 10 },
        { value: null },
        { value: 5 },
        { value: undefined },
        { value: 15 },
      ];

      act(() => {
        result.current.setSort('value');
      });

      const sorted = [...data].sort(result.current.comparator);

      // Numbers should be sorted, nulls/undefined at the end
      expect(sorted[0].value).toBe(5);
      expect(sorted[1].value).toBe(10);
      expect(sorted[2].value).toBe(15);
      expect([null, undefined]).toContain(sorted[3].value);
      expect([null, undefined]).toContain(sorted[4].value);
    });

    it('should maintain stable sort for equal values', () => {
      const config = {
        fields: [{ key: 'category', label: 'Category', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [
        { id: 1, category: 'A' },
        { id: 2, category: 'B' },
        { id: 3, category: 'A' },
        { id: 4, category: 'B' },
        { id: 5, category: 'A' },
      ];

      act(() => {
        result.current.setSort('category');
      });

      const sorted = [...data].sort(result.current.comparator);

      // Items with same category should maintain original relative order
      const categoryA = sorted.filter((item) => item.category === 'A');
      expect(categoryA[0].id).toBe(1);
      expect(categoryA[1].id).toBe(3);
      expect(categoryA[2].id).toBe(5);
    });

    it('should handle empty data array', () => {
      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [];

      act(() => {
        result.current.setSort('name');
      });

      const sorted = [...data].sort(result.current.comparator);

      expect(sorted).toEqual([]);
    });

    it('should handle single item data array', () => {
      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
        uiPattern: 'dropdown-headers',
      };

      const { result } = renderHook(() => useSorting(config));

      const data = [{ name: 'Alice' }];

      act(() => {
        result.current.setSort('name');
      });

      const sorted = [...data].sort(result.current.comparator);

      expect(sorted).toEqual([{ name: 'Alice' }]);
    });
  });
});
