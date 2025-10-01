# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application

- `npm start` - Start development server (without Sentry)
- `npm run start:sentry` - Start development server with Sentry enabled
- `npm test` - Legacy test command (not used - see Testing section below)
- `npm run build` - Build for production (generates buildInfo.json and moves index.html to app.html)
- `npm run lint` - Run ESLint on src directory

### Build Requirements

- Node.js 12.18.1
- The build process generates a `buildInfo.json` file that is used by the logging module

## Architecture Overview

### Technology Stack

- **React 16.13.1** with both class and functional components
- **Redux** for state management with redux-saga for side effects
- **Zustand 4.5.7** for modern feature-specific state management
- **Material-UI v4** for styling and components
- **AG Grid Enterprise** for data tables (licensed)
- **Plotly.js** for data visualization charts
- **React Router** for navigation
- **Sentry** for error tracking (configurable)

### Project Structure

- `src/Components/` - Main React components organized by feature
  - `Catalog/` - Data catalog, search, and dataset pages
  - `Visualization/` - Chart creation and visualization tools
  - `DataSubmission/` - Data submission workflow and validation
  - `User/` - Authentication and user management
  - `Navigation/` - Site navigation and help system
  - `Home/` - Landing page components
- `src/Redux/` - State management (actions, reducers, sagas)
- `src/api/` - API service layer and request handlers
- `src/Utility/` - Shared utility functions
- `docs/` - Additional documentation files

### Key Features

- **Data Catalog**: Scientific dataset search and discovery
- **Visualization**: Interactive chart creation with multiple chart types
- **Data Submission**: Workflow for submitting scientific datasets with validation
- **Multi-Dataset Download**: Bulk dataset downloads with selection-driven row count optimization
- **Collections**: Personal and public dataset collection management with card/table views
- **User Management**: Authentication with Google OAuth integration
- **Admin Panel**: News management and dataset administration

### State Management Architecture

- **Zustand + React Hooks**: Core state management tool for all new features
- **Redux**: Legacy global state - ONLY for existing features/implementations, not for new development
- **Redux-saga**: Legacy async operations - only used with existing Redux features
- Uses reduceReducers and NOT combineReducers. Thus, reducers take in entire state, not state slices.
- Initial state lives inside `src/Redux/Reducers/index.js`
- **New Feature Pattern**: All new features must use Zustand + React Hooks, Redux is legacy-only

### API Configuration

- API endpoint determined by NODE_ENV:
  - development: localhost:8080
  - production: window.location.hostname
- Configuration in `api/config.js`

### Special Considerations

- AG Grid requires enterprise license (already configured)
- Sentry can be enabled/disabled via environment variables
- Uses lazy loading for route components to optimize bundle size
- Custom build process that renames index.html to app.html
- Material-UI theming system with custom theme configuration

## Testing

**This project uses manual testing only. Do not create or suggest unit tests, integration tests, or automated tests of any kind.** All features and functionality are validated through manual testing in the browser.

## Shared Utilities

### Universal Sorting Subsystem

Location: `src/shared/sorting/`

A reusable, type-aware sorting solution providing consistent sorting behavior across the application.

**When to Use:**

- Any feature requiring sortable data (tables, cards, lists)
- Client-side sorting with multiple field options
- Type-specific comparisons (strings, numbers, dates, percentages)
- Nested field path access

**Key Exports:**

- `useSorting(config)` - Main hook for sort state and comparator generation
- `SortDropdown` - Material-UI dropdown for field selection
- `SortableHeader` - Table header component with sort indicators
- `getNestedValue(obj, path)` - Helper for accessing nested object properties

**Supported Types:**

- String (case-insensitive, locale-aware)
- Number (numeric comparison)
- Date (ISO strings or Date objects)
- Percent (percentage strings like "95%")
- Custom (provide your own comparator)

**Quick Example:**

```javascript
import { useSorting, SortDropdown, SortableHeader } from 'shared/sorting';

const sortConfig = {
  fields: {
    name: { type: 'string', label: 'Name', path: 'Dataset_Name' },
    date: { type: 'date', label: 'Date', path: 'Time_Series_Start' },
  },
  defaultField: 'name',
  defaultDirection: 'asc',
};

function MyComponent({ data }) {
  const { activeSort, comparator, setSort, toggleDirection } = useSorting(sortConfig);
  const sortedData = [...data].sort(comparator);

  return (
    <div>
      <SortDropdown fields={sortConfig.fields} activeField={activeSort.field} onFieldChange={setSort} />
      {/* render sortedData */}
    </div>
  );
}
```

**Documentation:** See `src/shared/sorting/README.md` for complete API reference, configuration schema, common patterns, and integration examples.

## Recent Features & Patterns

### Collections Management (2025-09)

- **Dual View Pattern**: Card layout for personal collections, table layout for public collections
- **Client-Side Processing**: Real-time search/filtering, statistics calculation, no optimistic updates
- **Authentication Integration**: Login requirement for My Collections (uses legacy Redux for existing login dialog only), public access for Public Collections
- **Domain-Based Organization**: Feature structure follows directory v2 with myCollections/, publicCollections/ domains
- **Zustand State Management**: All feature logic uses Zustand + React Hooks (core state management), Redux only for existing login dialog integration

### Multi-Dataset Download Optimization (2025-09)

- **Selection-Driven Row Counts**: Only calculates row counts for selected datasets
- **Request Debouncing**: 150ms delay for selection batching, 300ms for filter changes
- **Request Cancellation**: AbortController pattern for filter change interruptions
- **Zustand State Pattern**: Feature-isolated stores with `useMultiDatasetDownloadStore` and `useRowCountStore`
- **Performance Threshold**: 2M row limit with smart threshold display for unselected datasets

### Performance Patterns

- **Debouncing**: Use throttle-debounce library, prefer selection-aware debouncing
- **Request Management**: Implement cancellation for filter changes, batch selections within timeframes
- **Memory Management**: Clean up stale data, limit cache sizes, proper event listener cleanup
- **State Isolation**: Use Zustand for new features to avoid Redux complexity
