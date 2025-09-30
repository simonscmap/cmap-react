import { createSortStore } from '../../state/useSortStore';

describe('createSortStore', () => {
  describe('initial state (no default)', () => {
    it('should initialize with null activeField when no default is provided', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
        ],
      };

      const store = createSortStore(config);
      const state = store.getState();

      expect(state.activeField).toBeNull();
      expect(state.direction).toBe('asc');
    });

    it('should initialize with asc direction when no default is provided', () => {
      const config = {
        fields: [{ key: 'email', label: 'Email', type: 'string' }],
      };

      const store = createSortStore(config);
      const state = store.getState();

      expect(state.direction).toBe('asc');
    });
  });

  describe('initial state (with default)', () => {
    it('should initialize with default field and direction', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'date', label: 'Date', type: 'date' },
        ],
        defaultSort: {
          field: 'name',
          direction: 'asc',
        },
      };

      const store = createSortStore(config);
      const state = store.getState();

      expect(state.activeField).toBe('name');
      expect(state.direction).toBe('asc');
    });

    it('should initialize with default field and desc direction', () => {
      const config = {
        fields: [
          { key: 'score', label: 'Score', type: 'number' },
          { key: 'rank', label: 'Rank', type: 'number' },
        ],
        defaultSort: {
          field: 'score',
          direction: 'desc',
        },
      };

      const store = createSortStore(config);
      const state = store.getState();

      expect(state.activeField).toBe('score');
      expect(state.direction).toBe('desc');
    });

    it('should default to asc direction when direction not specified in defaultSort', () => {
      const config = {
        fields: [{ key: 'title', label: 'Title', type: 'string' }],
        defaultSort: {
          field: 'title',
        },
      };

      const store = createSortStore(config);
      const state = store.getState();

      expect(state.activeField).toBe('title');
      expect(state.direction).toBe('asc');
    });
  });

  describe('setSort action (sets field, resets to asc)', () => {
    it('should set active field and reset direction to asc', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
        ],
      };

      const store = createSortStore(config);
      const { setSort } = store.getState();

      setSort('name');
      let state = store.getState();

      expect(state.activeField).toBe('name');
      expect(state.direction).toBe('asc');
    });

    it('should reset direction to asc when changing fields', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
        ],
      };

      const store = createSortStore(config);
      const { setSort, toggleDirection } = store.getState();

      // Set first field and toggle to desc
      setSort('name');
      toggleDirection();
      let state = store.getState();
      expect(state.direction).toBe('desc');

      // Change to different field - should reset to asc
      setSort('age');
      state = store.getState();
      expect(state.activeField).toBe('age');
      expect(state.direction).toBe('asc');
    });

    it('should reset direction to asc even when re-selecting the same field', () => {
      const config = {
        fields: [{ key: 'title', label: 'Title', type: 'string' }],
      };

      const store = createSortStore(config);
      const { setSort, toggleDirection } = store.getState();

      // Set field and toggle to desc
      setSort('title');
      toggleDirection();
      let state = store.getState();
      expect(state.direction).toBe('desc');

      // Re-select same field - should reset to asc
      setSort('title');
      state = store.getState();
      expect(state.direction).toBe('asc');
    });
  });

  describe('toggleDirection action (asc <-> desc)', () => {
    it('should toggle from asc to desc', () => {
      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
      };

      const store = createSortStore(config);
      const { setSort, toggleDirection } = store.getState();

      setSort('name');
      let state = store.getState();
      expect(state.direction).toBe('asc');

      toggleDirection();
      state = store.getState();
      expect(state.direction).toBe('desc');
    });

    it('should toggle from desc to asc', () => {
      const config = {
        fields: [{ key: 'score', label: 'Score', type: 'number' }],
      };

      const store = createSortStore(config);
      const { setSort, toggleDirection } = store.getState();

      setSort('score');
      toggleDirection();
      let state = store.getState();
      expect(state.direction).toBe('desc');

      toggleDirection();
      state = store.getState();
      expect(state.direction).toBe('asc');
    });

    it('should toggle multiple times correctly', () => {
      const config = {
        fields: [{ key: 'rank', label: 'Rank', type: 'number' }],
      };

      const store = createSortStore(config);
      const { setSort, toggleDirection } = store.getState();

      setSort('rank');
      expect(store.getState().direction).toBe('asc');

      toggleDirection();
      expect(store.getState().direction).toBe('desc');

      toggleDirection();
      expect(store.getState().direction).toBe('asc');

      toggleDirection();
      expect(store.getState().direction).toBe('desc');
    });

    it('should not toggle when activeField is null', () => {
      const config = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
      };

      const store = createSortStore(config);
      const { toggleDirection } = store.getState();

      let state = store.getState();
      expect(state.activeField).toBeNull();
      expect(state.direction).toBe('asc');

      // Try to toggle when no field is active
      toggleDirection();
      state = store.getState();

      // Direction should remain unchanged
      expect(state.direction).toBe('asc');
    });
  });

  describe('resetToDefault action', () => {
    it('should reset to null state when no default is configured', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
        ],
      };

      const store = createSortStore(config);
      const { setSort, toggleDirection, resetToDefault } = store.getState();

      // Set a field and toggle direction
      setSort('name');
      toggleDirection();
      let state = store.getState();
      expect(state.activeField).toBe('name');
      expect(state.direction).toBe('desc');

      // Reset to default
      resetToDefault();
      state = store.getState();
      expect(state.activeField).toBeNull();
      expect(state.direction).toBe('asc');
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
      };

      const store = createSortStore(config);
      const { setSort, toggleDirection, resetToDefault } = store.getState();

      // Change to different field and direction
      setSort('date');
      toggleDirection();
      let state = store.getState();
      expect(state.activeField).toBe('date');
      expect(state.direction).toBe('desc');

      // Reset to default
      resetToDefault();
      state = store.getState();
      expect(state.activeField).toBe('name');
      expect(state.direction).toBe('asc');
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
      };

      const store = createSortStore(config);
      const { setSort, resetToDefault } = store.getState();

      // Change to different field
      setSort('rank');
      let state = store.getState();
      expect(state.activeField).toBe('rank');
      expect(state.direction).toBe('asc');

      // Reset to default (should be desc)
      resetToDefault();
      state = store.getState();
      expect(state.activeField).toBe('score');
      expect(state.direction).toBe('desc');
    });

    it('should be callable multiple times', () => {
      const config = {
        fields: [{ key: 'title', label: 'Title', type: 'string' }],
        defaultSort: {
          field: 'title',
          direction: 'asc',
        },
      };

      const store = createSortStore(config);
      const { setSort, resetToDefault } = store.getState();

      // Reset when already at default
      resetToDefault();
      let state = store.getState();
      expect(state.activeField).toBe('title');
      expect(state.direction).toBe('asc');

      // Change and reset again
      setSort('title');
      resetToDefault();
      state = store.getState();
      expect(state.activeField).toBe('title');
      expect(state.direction).toBe('asc');
    });
  });

  describe('invalid field key throws error', () => {
    it('should throw error when setting invalid field key', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
        ],
      };

      const store = createSortStore(config);
      const { setSort } = store.getState();

      expect(() => {
        setSort('invalidField');
      }).toThrow(/Field 'invalidField' not found in sort configuration/);
    });

    it('should include available fields in error message', () => {
      const config = {
        fields: [
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'email', label: 'Email', type: 'string' },
          { key: 'age', label: 'Age', type: 'number' },
        ],
      };

      const store = createSortStore(config);
      const { setSort } = store.getState();

      expect(() => {
        setSort('badKey');
      }).toThrow(/Available fields: name, email, age/);
    });

    it('should throw error for empty string field key', () => {
      const config = {
        fields: [{ key: 'title', label: 'Title', type: 'string' }],
      };

      const store = createSortStore(config);
      const { setSort } = store.getState();

      expect(() => {
        setSort('');
      }).toThrow(/not found in sort configuration/);
    });

    it('should throw error for null field key', () => {
      const config = {
        fields: [{ key: 'title', label: 'Title', type: 'string' }],
      };

      const store = createSortStore(config);
      const { setSort } = store.getState();

      expect(() => {
        setSort(null);
      }).toThrow(/not found in sort configuration/);
    });

    it('should throw error for undefined field key', () => {
      const config = {
        fields: [{ key: 'title', label: 'Title', type: 'string' }],
      };

      const store = createSortStore(config);
      const { setSort } = store.getState();

      expect(() => {
        setSort(undefined);
      }).toThrow(/not found in sort configuration/);
    });
  });

  describe('configuration validation', () => {
    it('should throw error for missing configuration', () => {
      expect(() => {
        createSortStore();
      }).toThrow(/Sort configuration is required/);
    });

    it('should throw error for null configuration', () => {
      expect(() => {
        createSortStore(null);
      }).toThrow(/Sort configuration is required/);
    });

    it('should throw error for missing fields array', () => {
      expect(() => {
        createSortStore({});
      }).toThrow(/must have a "fields" array property/);
    });

    it('should throw error for empty fields array', () => {
      expect(() => {
        createSortStore({ fields: [] });
      }).toThrow(/must have at least one field/);
    });

    it('should throw error for non-array fields', () => {
      expect(() => {
        createSortStore({ fields: 'not an array' });
      }).toThrow(/must have a "fields" array property/);
    });

    it('should throw error for duplicate field keys', () => {
      expect(() => {
        createSortStore({
          fields: [
            { key: 'name', label: 'Name', type: 'string' },
            { key: 'name', label: 'Full Name', type: 'string' },
          ],
        });
      }).toThrow(/Duplicate keys found: name/);
    });

    it('should throw error for field without key', () => {
      expect(() => {
        createSortStore({
          fields: [{ label: 'Name', type: 'string' }],
        });
      }).toThrow(/must have a non-empty string "key" property/);
    });

    it('should throw error for field without label', () => {
      expect(() => {
        createSortStore({
          fields: [{ key: 'name', type: 'string' }],
        });
      }).toThrow(/must have a non-empty string "label" property/);
    });

    it('should throw error for field without type', () => {
      expect(() => {
        createSortStore({
          fields: [{ key: 'name', label: 'Name' }],
        });
      }).toThrow(/must have a "type" property/);
    });

    it('should throw error for custom type without compare function', () => {
      expect(() => {
        createSortStore({
          fields: [{ key: 'custom', label: 'Custom', type: 'custom' }],
        });
      }).toThrow(/has type 'custom' but no compare function provided/);
    });

    it('should throw error for invalid default field', () => {
      expect(() => {
        createSortStore({
          fields: [{ key: 'name', label: 'Name', type: 'string' }],
          defaultSort: {
            field: 'nonexistent',
            direction: 'asc',
          },
        });
      }).toThrow(/Default sort field 'nonexistent' not found/);
    });

    it('should throw error for invalid default direction', () => {
      expect(() => {
        createSortStore({
          fields: [{ key: 'name', label: 'Name', type: 'string' }],
          defaultSort: {
            field: 'name',
            direction: 'invalid',
          },
        });
      }).toThrow(/must be 'asc' or 'desc'/);
    });
  });

  describe('store isolation', () => {
    it('should create independent store instances', () => {
      const config1 = {
        fields: [{ key: 'name', label: 'Name', type: 'string' }],
      };

      const config2 = {
        fields: [{ key: 'age', label: 'Age', type: 'number' }],
      };

      const store1 = createSortStore(config1);
      const store2 = createSortStore(config2);

      // Modify store1
      store1.getState().setSort('name');

      // store2 should remain unaffected
      const state1 = store1.getState();
      const state2 = store2.getState();

      expect(state1.activeField).toBe('name');
      expect(state2.activeField).toBeNull();
    });

    it('should maintain separate state across multiple stores', () => {
      const config = {
        fields: [
          { key: 'title', label: 'Title', type: 'string' },
          { key: 'date', label: 'Date', type: 'date' },
        ],
      };

      const storeA = createSortStore(config);
      const storeB = createSortStore(config);

      // Set different fields in each store
      storeA.getState().setSort('title');
      storeB.getState().setSort('date');

      // Toggle direction in storeA only
      storeA.getState().toggleDirection();

      const stateA = storeA.getState();
      const stateB = storeB.getState();

      expect(stateA.activeField).toBe('title');
      expect(stateA.direction).toBe('desc');
      expect(stateB.activeField).toBe('date');
      expect(stateB.direction).toBe('asc');
    });
  });
});
