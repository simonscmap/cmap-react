# Universal Sorting Subsystem

A reusable, type-aware sorting solution for CMAP React applications.

## Overview

This subsystem provides a consistent approach to sorting data across the application. It supports multiple data types, nested field paths, custom comparators, and integrates seamlessly with both table and card layouts.

## Quick Start

```javascript
import { useSorting, SortDropdown, SortableHeader } from 'shared/sorting';

// Define sort configuration
const sortConfig = {
  fields: {
    name: { type: 'string', label: 'Dataset Name', path: 'Dataset_Name' },
    date: { type: 'date', label: 'Date', path: 'Time_Series_Start' },
    coverage: { type: 'percent', label: 'Coverage', path: 'spatial_coverage' },
  },
  defaultField: 'name',
  defaultDirection: 'asc',
};

function MyComponent({ data }) {
  const { activeSort, comparator, setSort, toggleDirection } = useSorting(sortConfig);

  // Sort data
  const sortedData = [...data].sort(comparator);

  return (
    <div>
      {/* Dropdown for field selection */}
      <SortDropdown fields={sortConfig.fields} activeField={activeSort.field} onFieldChange={setSort} label="Sort By" />

      {/* Sortable table headers */}
      <table>
        <thead>
          <tr>
            {Object.entries(sortConfig.fields).map(([key, field]) => (
              <SortableHeader key={key} field={key} label={field.label} isActive={activeSort.field === key} direction={activeSort.direction} uiPattern="dropdown-headers" onToggle={toggleDirection} />
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr key={row.id}>{/* render row data */}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## API Reference

### `useSorting(config)`

Main hook for managing sort state and logic.

**Parameters:**

- `config` (Object): Sort configuration
  - `fields` (Object): Field definitions (key → { type, label, path })
  - `defaultField` (String): Initial sort field key
  - `defaultDirection` (String): Initial direction ('asc' or 'desc')

**Returns:**

- `activeSort` (Object): Current sort state { field, direction }
- `comparator` (Function): Comparator function for array.sort()
- `setSort` (Function): Set active field (key)
- `toggleDirection` (Function): Toggle asc/desc
- `resetToDefault` (Function): Reset to default configuration
- `config` (Object): Normalized configuration

### `<SortDropdown>`

Dropdown component for field selection.

**Props:**

- `fields` (Object): Field definitions
- `activeField` (String): Currently selected field key
- `onFieldChange` (Function): Callback when field changes
- `label` (String): Label text (optional)
- `disabled` (Boolean): Disable interaction (optional)
- `className` (String): Custom CSS class (optional)

### `<SortableHeader>`

Table header component with sort indicators.

**Props:**

- `field` (String): Field key
- `label` (String): Display label
- `isActive` (Boolean): Is this field currently active?
- `direction` (String): Current direction ('asc' or 'desc')
- `uiPattern` (String): UI pattern ('dropdown-headers' or 'headers-only')
- `onToggle` (Function): Toggle direction callback (Pattern A)
- `onClick` (Function): Header click callback (Pattern B)
- `className` (String): Custom CSS class (optional)

## Configuration Schema

```javascript
{
  fields: {
    [fieldKey]: {
      type: 'string' | 'number' | 'date' | 'percent' | 'custom',
      label: 'Display Label',
      path: 'object.nested.path', // dot notation for nested access
      comparator?: (a, b) => number // custom comparator (optional)
    }
  },
  defaultField: 'fieldKey',
  defaultDirection: 'asc' | 'desc'
}
```

## Supported Types

- **string**: Case-insensitive string comparison with locale support
- **number**: Numeric comparison
- **date**: Date/timestamp comparison (ISO strings or Date objects)
- **percent**: Percentage strings (e.g., "95%")
- **custom**: Provide your own comparator function

## Common Patterns

### Pattern A: Dropdown + Headers

Headers show direction arrows only when active. Clicking arrow toggles direction.

```javascript
<SortableHeader uiPattern="dropdown-headers" onToggle={toggleDirection} />
```

### Pattern B: Headers Only

All headers show arrows (faded when inactive). Clicking header selects field and toggles direction.

```javascript
<SortableHeader uiPattern="headers-only" onClick={setSort} />
```

### Nested Field Paths

Access deeply nested properties using dot notation:

```javascript
{
  fields: {
    coverage: {
      type: 'percent',
      path: 'metadata.spatial.coverage'
    }
  }
}
```

### Custom Comparators

Provide custom sorting logic:

```javascript
{
  fields: {
    priority: {
      type: 'custom',
      label: 'Priority',
      path: 'status',
      comparator: (a, b) => {
        const order = { high: 1, medium: 2, low: 3 };
        return order[a] - order[b];
      }
    }
  }
}
```

### Null Filtering

Null/undefined values are automatically moved to the end of sorted results.

## Performance Tips

- Memoize `sortConfig` to prevent unnecessary re-renders
- Use `useMemo` for sorted data if source data doesn't change frequently
- For large datasets (10k+ rows), consider virtualization or pagination

## Troubleshooting

### Sort not updating

- Ensure you're creating a new array: `[...data].sort(comparator)`
- Check that `data` reference is changing when it should

### Wrong field being sorted

- Verify `path` matches your data structure
- Use browser devtools to inspect `getNestedValue(data[0], path)`

### Direction not toggling

- Ensure `toggleDirection` is called, not `setSort`
- Check that `isActive` prop is correctly set on headers

## Integration Examples

See `specs/004-users-howardwkim-src/quickstart.md` for complete scenarios including:

- AG Grid integration
- Card layout sorting
- Class component usage
- Advanced custom comparators

---

_Part of the CMAP React Universal Sorting Subsystem_
