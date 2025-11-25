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

- `src/features/{feature-name}/` - **Isolated modern features** (e.g., collections)
  - Self-contained with own state, API, and components
  - When planning/researching, only reference code within feature folder and `src/shared/`
- `src/shared/` - Reusable utilities and components extracted from features for cross-feature use
- `src/Components/` - **Legacy** React components (do not reference in new features)
  - `Catalog/` - Data catalog, search, and dataset pages
  - `Visualization/` - Chart creation and visualization tools
  - `DataSubmission/` - Data submission workflow and validation
  - `User/` - Authentication and user management
  - `Navigation/` - Site navigation and help system
  - `Home/` - Landing page components
- `src/Redux/` - **Legacy** state management (do not use in new features)
- `src/api/` - **Legacy** API service layer
- `src/Utility/` - **Legacy** shared utility functions
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
- **Responsive Design**: Application is responsive for tablet and desktop viewports. Mobile viewport support is intentionally not implemented.
- **Material-UI Styling**: Never use string matching on generated class names (minified in production) or class ternaries for state-based styling. Use inline `style` prop for conditional styling to avoid CSS-in-JS specificity conflicts.

## Testing

**This project uses manual testing only. Do not create or suggest unit tests, integration tests, or automated tests of any kind.** All features and functionality are validated through manual testing in the browser.

## Logging

**Always use the log service (`src/Services/log-service`) instead of `console.log`.** This provides environment-aware, structured logging with automatic module context and version tracking.

### Key Rules

- **Never use `console.log` directly** - always import and use the log service
- **Always use `log.debug()`** for development debugging and logging
- Include the module/feature name when initializing the logger
- Pass structured data as the second argument for better context

## Shared Utilities

### Dataset Name Link Component

Use `DatasetNameLink` from `src/shared/components` whenever displaying dataset short names to users.

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

### Catalog Search (2025-10)

- **Dual-Backend Architecture**: HTTP download of SQLite database + Web Worker query execution
- **Feature-Folder Pattern**: All data access in `api/`, worker treated as external service
- **Data Sources**:
  - HTTP backend (downloads pre-built SQLite database from server)
  - SQLite backend (queries executed in Web Worker using sqlite-wasm)
  - IndexedDB (caches database locally for offline access and performance)
- **Structure**:
  - `api/catalogDbApi.js` - HTTP download and IndexedDB cache management
  - `api/searchDatabaseApi.js` - Web Worker lifecycle and communication
  - `api/queries/` - Structured query construction (SearchQueryBuilder)
  - `api/transformers/` - Result transformation (raw DB rows → UI format)
  - `api/index.js` - Unified facade with comprehensive JSDoc
  - `public/sqlite-wasm/catalogSearchWorker.js` - SQL execution service (outside feature folder)
- **Key Files**:
  - `SearchQueryBuilder.js` - Fluent API for query construction
  - `querySchema.js` - Constants, defaults, validation (SEARCH_MODES, DATE_RANGE_PRESETS, LIMITS)
  - `searchResultTransformer.js` - Normalizes raw rows into UI-facing format
- **Security**: Worker as security boundary (structured queries only, no raw SQL, MAX_LIMIT enforcement, validation)
- **Usage Example**:

  ```javascript
  import { initializeCatalogSearch, searchCatalog, createSearchQuery } from 'features/catalogSearch/api';

  // Initialize once
  await initializeCatalogSearch();

  // Build and execute search
  const query = createSearchQuery().withText('temperature').withSpatialBounds({ latMin: 30, latMax: 50, lonMin: -130, lonMax: -110 }).withDateRangePreset(DATE_RANGE_PRESETS.LAST_YEAR).build();

  const results = await searchCatalog(query);
  ```

- **Documentation**: See `src/features/catalogSearch/api/README.md` for complete architecture overview

### Stale Row Count Indicators (2025-11)

- **Per-Dataset Staleness Detection**: Tracks constraint state per dataset when row counts are calculated, enabling intelligent staleness indicators that only appear when counts may be inaccurate
- **Dual Staleness Logic**:
  - **Initial (no snapshot)**: Stale if temporal/depth enabled with valid values OR spatial coverage < 100%
  - **Post-Recalculation (snapshot exists)**: Stale if current constraints differ from dataset's snapshot
- **Constraint Snapshot Structure**: Per-dataset snapshots capture `{ spatialBounds, temporalRange, depthRange, temporalEnabled, depthEnabled, includePartialOverlaps, timestamp }` in `datasetConstraintSnapshots` map
- **Refined Recalculation Filtering**: Only recalculates datasets marked as stale (excludes satellite/model types and datasets with accurate counts)
- **Stale Indicator UI Pattern**:
  - Material-UI `WarningIcon` (yellow) displayed next to row count when stale
  - `StaleIndicatorTooltip` component with reason-based message templates
  - Embedded "Recalculate" button (hidden after "Recalculate All" is used)
  - Tooltips support multiple staleness reasons: `spatial_partial`, `temporal_enabled`, `depth_enabled`, `constraints_changed`, `dataset_not_in_results`
- **Constraint Comparison**: Deep equality check via `areConstraintsEqual()` with Date object handling (compares by `.getTime()`), enabled state logic (only compares ranges when enabled in BOTH), and null value support
- **Usage Example**:

  ```javascript
  // In Zustand store - check if dataset is stale
  const { isStale, reason } = get().isDatasetStale(shortName, currentConstraints, datasetUtilization, datasetType);
  // Returns { isStale: true, reason: 'spatial_partial' }

  // In component - render stale indicator
  {
    isStale && (
      <StaleIndicatorTooltip reason={reason} dataset={dataset} onRecalculate={() => handleRecalculate(dataset)} isRecalculating={isRecalculating} hasUsedGlobalRecalculation={hasUsedGlobalRecalculation}>
        <WarningIcon style={{ color: '#fdd835', fontSize: 16 }} />
      </StaleIndicatorTooltip>
    );
  }
  ```

- **Testing**: Manual test scenarios documented in `specs/012-users-howardwkim-src/quickstart.md` covering initial staleness, recalculation triggers, constraint modifications, edge cases, and regression testing

### Performance Patterns

- **Debouncing**: Use throttle-debounce library, prefer selection-aware debouncing
- **Request Management**: Implement cancellation for filter changes, batch selections within timeframes
- **Memory Management**: Clean up stale data, limit cache sizes, proper event listener cleanup
- **State Isolation**: Use Zustand for new features to avoid Redux complexity
