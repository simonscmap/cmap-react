# Catalog Search API

Unified API layer for the catalog search feature, providing structured query construction, database management, and result transformation.

## Architecture Overview

The catalog search system uses a **dual-backend architecture** to provide fast, client-side search of the CMAP dataset catalog:

1. **HTTP Backend**: Downloads a pre-built SQLite database file from the server
2. **SQLite Backend**: Executes queries in a Web Worker using sqlite-wasm
3. **IndexedDB Cache**: Stores the database locally for offline access and performance

```
┌─────────────────────────────────────────────────────────────────┐
│                    Feature Folder (api/)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │   queries/   │  │  transformers/   │  │   catalogDbApi   │ │
│  │              │  │                  │  │                  │ │
│  │ Query        │  │ Result           │  │ HTTP Download    │ │
│  │ Construction │  │ Transformation   │  │ IndexedDB Cache  │ │
│  └──────┬───────┘  └────────▲─────────┘  └────────┬─────────┘ │
│         │                   │                      │           │
│         │                   │                      │           │
│         │         ┌─────────┴──────────────────────┘           │
│         │         │                                            │
│  ┌──────▼─────────┴───────┐                                   │
│  │  searchDatabaseApi     │                                   │
│  │                        │                                   │
│  │  Worker Lifecycle      │                                   │
│  │  Message Protocol      │                                   │
│  └──────────┬─────────────┘                                   │
│             │                                                  │
└─────────────┼──────────────────────────────────────────────────┘
              │
              │ postMessage / onMessage
              │
┌─────────────▼─────────────────────────────────────────────────┐
│         External Worker (public/sqlite-wasm/)                 │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │      catalogSearchWorker.js                             │ │
│  │                                                         │ │
│  │  - SQLite Initialization                                │ │
│  │  - SQL Generation (security boundary)                   │ │
│  │  - Query Execution                                      │ │
│  │  - Security Validation                                  │ │
│  │  - Limit Enforcement (MAX: 1000)                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

**Worker as External Service**: The Web Worker lives in `public/sqlite-wasm/` (outside the feature folder) because:

- SQLite WASM requires specific file paths and initialization
- Worker needs to be in public directory for proper loading
- Acts as an external service with a clear interface boundary

**All Data Access in `api/`**: Following the collections pattern, all data access logic lives in the `api/` directory:

- HTTP operations (catalogDbApi.js)
- Cache management (catalogDbApi.js)
- Worker communication (searchDatabaseApi.js)
- Query construction (queries/)
- Result transformation (transformers/)

**Security Boundary**: The worker receives structured query objects (not SQL strings), providing:

- Protection against SQL injection
- Limit enforcement to prevent memory exhaustion
- Validation of query structure
- Read-only operations only

## Directory Structure

```
api/
├── index.js                          # Unified facade - single entry point
├── catalogDbApi.js                   # HTTP download + IndexedDB cache
├── searchDatabaseApi.js              # Web Worker lifecycle + communication
├── queries/
│   ├── SearchQueryBuilder.js         # Fluent API for query construction
│   ├── querySchema.js                # Constants, defaults, validation
│   └── index.js                      # Public exports
└── transformers/
    ├── searchResultTransformer.js    # Raw rows → UI format
    └── index.js                      # Public exports
```

### File Responsibilities

**`index.js` (Unified Facade)**

- Single entry point for all catalog search operations
- Re-exports query construction and constants
- Provides high-level convenience functions
- Comprehensive JSDoc documentation

**`catalogDbApi.js` (Database Management)**

- `downloadCatalogDb()` - Fetch SQLite database from server
- `loadDatabase()` - Load from IndexedDB cache or download if needed
- `getDatabaseVersion()` - Get cached database metadata
- `clearCache()` - Clear IndexedDB cache

**`searchDatabaseApi.js` (Worker Interface)**

- Singleton service managing Web Worker lifecycle
- `initialize()` - Start worker and load database
- `search(query)` - Execute search, transform results
- `getRegions()` - Get available regions
- `cleanup()` - Terminate worker

**`queries/SearchQueryBuilder.js` (Query Construction)**

- Fluent API for building structured query objects
- Methods: `withText()`, `withSpatialBounds()`, `withTemporalRange()`, etc.
- Validates and applies defaults
- Prevents direct SQL construction

**`queries/querySchema.js` (Schema & Constants)**

- `SEARCH_MODES` - Search mode constants (LIKE, FTS)
- `DATE_RANGE_PRESETS` - Date range presets (ANY, LAST_YEAR, etc.)
- `DATASET_TYPES` - Dataset type filters
- `DEFAULTS` - Default query values
- `LIMITS` - Security limits (MAX_LIMIT: 1000)
- `validateQuery()` - Query validation function

**`transformers/searchResultTransformer.js` (Result Transformation)**

- `transformSearchResults(rows)` - Transform array of raw rows
- `parseRegions(string)` - Parse comma-separated regions
- Normalizes field names (datasetType → type)
- Structures nested objects (spatial, temporal, depth)
- Adds UI-specific fields (isInvalid: false)

## Usage Examples

### Basic Search

```javascript
import { initializeCatalogSearch, searchCatalog, createSearchQuery } from 'features/catalogSearch/api';

// Initialize once (downloads DB, starts worker)
await initializeCatalogSearch();

// Build and execute search
const query = createSearchQuery()
  .withText('temperature')
  .withSpatialBounds({
    latMin: 30,
    latMax: 50,
    lonMin: -130,
    lonMax: -110,
  })
  .build();

const results = await searchCatalog(query);
// Returns: Array of dataset objects with transformed fields
```

### Advanced Query Building

```javascript
import { createSearchQuery, DATE_RANGE_PRESETS, SEARCH_MODES } from 'features/catalogSearch/api';
import { DATASET_TYPES } from 'shared/utility/getDatasetType';

const query = createSearchQuery()
  // Text search with phrase matching
  .withText('ocean color chlorophyll', { phraseMatch: true })

  // Spatial bounds (partial overlap mode)
  .withSpatialBounds(
    {
      latMin: 30,
      latMax: 50,
      lonMin: -130,
      lonMax: -110,
    },
    true, // includePartialOverlaps
  )

  // Date range preset (calculated client-side)
  .withDateRangePreset(DATE_RANGE_PRESETS.LAST_YEAR)

  // Or custom temporal range
  .withTemporalRange('2020-01-01', '2023-12-31')

  // Depth range
  .withDepthRange(0, 1000)

  // Region filtering (array)
  .withRegions(['North Pacific', 'Gulf of Alaska'])

  // Dataset type filter
  .withDatasetType(DATASET_TYPES.SATELLITE)

  // Full-text search mode with ranking
  .withSearchMode(SEARCH_MODES.FTS)

  // Pagination
  .withPagination(100, 0)

  // Exclude specific fields from results
  .withExcludedFields(['metadata', 'description'])

  .build();

const results = await searchCatalog(query);
```

### Status Checking

```javascript
import { getCatalogSearchStatus, isClientSideSearchAvailable } from 'features/catalogSearch/api';

// Check detailed status
const status = getCatalogSearchStatus();
if (status.isInitializing) {
  console.log('Loading catalog database...');
} else if (status.error) {
  console.error('Failed to initialize:', status.error);
} else if (status.isInitialized) {
  console.log('Ready to search!');
}

// Simple availability check
if (isClientSideSearchAvailable()) {
  // Use local SQLite search
  const results = await searchCatalog(query);
} else {
  // Fall back to server-side search
  const results = await fetchFromServer(query);
}
```

### Cache Management

```javascript
import { getDatabaseVersion, clearDatabaseCache, initializeCatalogSearch } from 'features/catalogSearch/api';

// Check cached version
const version = await getDatabaseVersion();
if (version) {
  console.log(`Cached DB has ${version.datasetCount} datasets`);
  console.log(`Generated: ${version.generatedAt}`);
  console.log(`Checksum: ${version.checksum}`);
} else {
  console.log('No cached database');
}

// Force cache refresh
await clearDatabaseCache();
await initializeCatalogSearch(); // Downloads fresh copy
```

### Component Integration with Zustand

```javascript
import { create } from 'zustand';
import { initializeCatalogSearch, searchCatalog, createSearchQuery, cleanupCatalogSearch, getCatalogSearchStatus } from '../api';

const useCatalogSearchStore = create((set, get) => ({
  // State
  results: [],
  isSearching: false,
  error: null,

  // Actions
  initialize: async () => {
    try {
      await initializeCatalogSearch();
      const status = getCatalogSearchStatus();
      set({ isInitialized: status.isInitialized });
    } catch (error) {
      set({ error: error.message });
    }
  },

  search: async (text, filters) => {
    set({ isSearching: true, error: null });
    try {
      const query = createSearchQuery().withText(text).withSpatialBounds(filters.spatial).withTemporalRange(filters.timeStart, filters.timeEnd).withPagination(50, 0).build();

      const results = await searchCatalog(query);
      set({ results, isSearching: false });
    } catch (error) {
      set({ error: error.message, isSearching: false });
    }
  },

  cleanup: () => {
    cleanupCatalogSearch();
  },
}));
```

### Region Dropdown

```javascript
import { useEffect, useState } from 'react';
import { getRegions } from 'features/catalogSearch/api';

function RegionFilter({ onRegionChange }) {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    async function loadRegions() {
      const regionList = await getRegions();
      setRegions(regionList);
    }
    loadRegions();
  }, []);

  return (
    <select onChange={(e) => onRegionChange(e.target.value)}>
      <option value="">All Regions</option>
      {regions.map((region) => (
        <option key={region} value={region}>
          {region}
        </option>
      ))}
    </select>
  );
}
```

## Design Principles

### 1. All Data Access in `api/`

Following the collections pattern, all data access logic lives in the `api/` directory. This includes:

- HTTP operations
- Cache management
- Worker communication
- Query construction
- Result transformation

**Why?** Single source of truth for data operations, easier to test, clear separation of concerns.

### 2. Worker as External Service

The Web Worker is treated as an external service with a clear interface boundary:

- Worker receives structured query objects (not SQL strings)
- Worker returns raw database rows (no business logic)
- All business logic lives in the feature folder
- Worker enforces security limits and validation

**Why?** Security, testability, maintainability. Business logic in feature folder can be tested without worker complexity.

### 3. Security Boundary

The worker acts as a security boundary:

- **Structured Queries**: Only accepts structured query objects, never raw SQL
- **Validation**: Validates query structure before execution
- **Limit Enforcement**: Enforces MAX_LIMIT (1000) to prevent memory exhaustion
- **Read-Only**: Only SELECT queries, no modifications
- **Parameterization**: Uses parameterized queries for SQL generation

**Why?** Prevents SQL injection, limits DoS potential, enforces safe operations.

### 4. Testability

Query building and result transformation are pure functions that can be tested without the worker:

- `SearchQueryBuilder` - Testable query construction
- `transformSearchResults` - Testable data transformation
- `validateQuery` - Testable validation logic
- Worker communication isolated in `searchDatabaseApi.js`

**Why?** Fast tests, easier debugging, clear contracts between components.

### 5. Fluent API

`SearchQueryBuilder` provides a fluent, chainable API:

- Readable query construction
- Type-safe through JSDoc
- Prevents invalid query states
- Applies sensible defaults

**Why?** Developer experience, discoverability, reduces errors.

### 6. Separation of Concerns

Clear responsibility boundaries:

- **catalogDbApi**: Database file management (HTTP + IndexedDB)
- **searchDatabaseApi**: Worker lifecycle and communication
- **queries/**: Query construction and validation
- **transformers/**: Result normalization
- **index.js**: Unified public interface

**Why?** Each module has a single responsibility, easier to understand and maintain.

## Result Format

Search results are transformed into a consistent UI-facing format:

```javascript
{
  // Core identity
  datasetId: 123,
  shortName: "HOT_LAVA",
  longName: "Hawaii Ocean Time-series LAVA Cruise",
  description: "Temperature and salinity measurements...",

  // Metadata
  type: "In-Situ",  // normalized from datasetType
  regions: ["North Pacific", "Hawaii"],  // parsed array

  // Spatial (nested object)
  spatial: {
    latMin: 20.5,
    latMax: 23.0,
    lonMin: -158.5,
    lonMax: -156.0
  },

  // Temporal (nested object + aliases)
  temporal: {
    timeMin: "2010-01-01",
    timeMax: "2020-12-31"
  },
  timeStart: "2010-01-01",  // alias
  timeEnd: "2020-12-31",    // alias

  // Depth (nested object)
  depth: {
    depthMin: 0,
    depthMax: 5000
  },

  // Stats
  rowCount: 50000,
  rank: 0,  // FTS ranking score (0 for LIKE mode)

  // Additional
  metadata: { pi: "Dr. Smith", institution: "UH" },  // parsed JSON
  isInvalid: false  // reserved for UI state
}
```

## Security Considerations

**Risk Level**: Low (client-side, read-only, public data)

**Protections**:

- Structured query DSL (no arbitrary SQL)
- Worker validates query structure
- Worker enforces MAX_LIMIT (1000)
- Parameterized queries in SQL generation
- Read-only operations only

**Why Low Risk**:

- Client-side blast radius (user can only DoS own browser)
- Public catalog data (no sensitive information)
- Pre-built DB (no backend query load)

## Performance

**First Load**:

- Downloads ~5-10MB SQLite database
- Stores in IndexedDB for offline access
- One-time initialization cost

**Subsequent Loads**:

- Loads from IndexedDB cache (instant)
- Checks for version updates periodically

**Query Performance**:

- Queries execute in Web Worker (non-blocking)
- Sub-100ms for most queries
- Full-text search with ranking for large result sets

**Memory**:

- MAX_LIMIT (1000) prevents unbounded result sets
- Worker isolated from main thread
- Pagination for large result sets

## Error Handling

All API functions throw errors that should be caught by callers:

```javascript
try {
  await initializeCatalogSearch();
} catch (error) {
  // Handle initialization errors
  // - Network failure downloading DB
  // - IndexedDB unavailable
  // - Worker initialization failure
  console.error('Failed to initialize:', error);
}

try {
  const results = await searchCatalog(query);
} catch (error) {
  // Handle search errors
  // - Invalid query structure
  // - Worker not initialized
  // - Query execution failure
  console.error('Search failed:', error);
}
```

## Testing

**Manual Testing Only**: This project uses manual testing (see CLAUDE.md). Test catalog search functionality by:

1. Loading CatalogSearchDevPage
2. Testing text search (keyword and phrase)
3. Testing all filters (spatial, temporal, depth, region, dataset type)
4. Testing date range presets
5. Testing pagination
6. Verifying performance
7. Testing error handling
8. Testing cache functionality

## Related Documentation

- `queries/SearchQueryBuilder.js` - Detailed query builder API
- `queries/querySchema.js` - Schema constants and validation
- `transformers/searchResultTransformer.js` - Result transformation details
- `public/sqlite-wasm/catalogSearchWorker.js` - Worker implementation
- `/CLAUDE.md` - Project-wide patterns and architecture
