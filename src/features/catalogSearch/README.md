# Catalog Search Feature

SQLite-based client-side catalog search with Web Worker architecture.

## Current Status: Phase 1 Complete

**Phase 1** delivers text search functionality with database caching and worker-based execution.

### What's Working

- ✅ SQLite database download and decompression
- ✅ IndexedDB caching with 24h TTL
- ✅ Web Worker for query execution
- ✅ Full-text search using FTS5
- ✅ Zustand store for state management
- ✅ Dev page for testing at `/catalog-search-dev`

### What's Coming

- **Phase 2**: Search UI components (SearchInput, ResultsList, FilterPanel)
- **Phase 3**: Spatial/temporal/depth filtering
- **Phase 4**: Integration into AddDatasetsModal

## Architecture

```
catalogSearch/
├── api/
│   ├── catalogDbApi.js              # Database download & IndexedDB caching
│   ├── searchDatabaseApi.js         # Worker lifecycle management
│   ├── queries/                     # Query construction
│   │   ├── SearchQueryBuilder.js
│   │   ├── querySchema.js
│   │   └── index.js
│   └── transformers/                # Result transformation
│       ├── searchResultTransformer.js
│       └── index.js
├── state/
│   └── catalogSearchStore.js        # Zustand store
└── pages/
    └── CatalogSearchDevPage.js      # Temporary test page

public/sqlite-wasm/
└── catalogSearchWorker.js           # Web Worker (must be in public/ with sqlite3.wasm)
```

**Note**: The Web Worker source file lives in `public/sqlite-wasm/` (not `src/`) because it must be co-located with `sqlite3.js` and `sqlite3.wasm` for the SQLite WASM library to function correctly.

## Usage

### Dev Page

Visit `/catalog-search-dev` to test the search functionality:

1. Page loads and initializes database (may take a moment on first load)
2. Enter search terms (e.g., "temperature", "salinity", "phytoplankton")
3. Press Enter or click Search
4. Results appear with BM25 relevance ranking

### Using in Code

```javascript
import useCatalogSearchStore from 'features/catalogSearch/state/catalogSearchStore';

function MyComponent() {
  const {
    isInitialized,
    results,
    search,
    setSearchText,
    initialize,
  } = useCatalogSearchStore();

  useEffect(() => {
    initialize();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    search();
  };

  return (
    // Your component JSX
  );
}
```

## Data Contracts

### SearchQuery

```typescript
{
  text: string;
  spatial?: { latMin, latMax, lonMin, lonMax };
  temporal?: { timeMin, timeMax };
  depth?: { depthMin, depthMax };
  limit?: number;         // default 50
  offset?: number;        // default 0
  searchMode?: string;    // 'like' (default) or 'fts'
  phraseMatch?: boolean;  // false (default) - keyword splitting with AND logic (matches backend)
  excludeFields?: array;  // ['description'] by default (matches backend)
}
```

### SearchResult

```typescript
{
  datasetId: number;
  shortName: string;
  longName: string;
  description: string;
  rank: number; // BM25 score
  metadata: object;
  spatial: {
    (latMin, latMax, lonMin, lonMax);
  }
  temporal: {
    (timeMin, timeMax);
  }
  depth: {
    (depthMin, depthMax);
  }
}
```

## Database Schema

The SQLite database includes:

- `datasets` table with full dataset metadata
- `datasets_fts` virtual table for full-text search (FTS5)
- Indexes on spatial, temporal, and depth bounds
- BM25 ranking with porter stemming

See `api/catalogDbApi.js` for complete schema documentation.

## Debugging

### Clear Database Cache

```javascript
import { clearCache } from 'features/catalogSearch/api/catalogDbApi';
clearCache();
```

### Reset Search Service

```javascript
import { resetSearchDatabaseApi } from 'features/catalogSearch/api/searchDatabaseApi';
resetSearchDatabaseApi();
```

### Check Worker Status

```javascript
import { getSearchDatabaseApi } from 'features/catalogSearch/api/searchDatabaseApi';
const api = getSearchDatabaseApi();
console.log(api.getStatus());
```

## Performance

- Database size: ~5MB gzipped
- Download time: 1-3 seconds (first load only)
- Search latency: <100ms for text queries
- Cache duration: 24 hours (IndexedDB)

## Search Behavior

### Default: LIKE-Keyword-AND Mode

The frontend uses LIKE-based keyword splitting with AND logic by default to achieve 100% parity
with the backend API. This means:

- **Keyword Splitting with AND Logic**: Multi-word queries are split into keywords, each must match
  - Example: `"sat sst"` is split into `['sat', 'sst']`
  - Finds datasets where BOTH "sat" AND "sst" appear (in any field, in any order)
  - Backend URL: `?keywords=sat&keywords=sst`

- **Field Coverage**: Searches 9 fields (excludes description to match backend):
  - Variable Long Names, Variable Short Names, Dataset Long Name
  - Sensors, Keywords, Distributor, Data Source, Process Level, Study Domain

- **Ordering**: Results sorted by shortName ascending (alphabetical)
  - Note: Backend uses Dataset_ID DESC, frontend deliberately differs for better UX

### Alternative Modes (Available but not default)

#### Phrase Matching Mode

To search for exact phrases instead of keyword splitting:

```javascript
const { setSearchOptions } = useCatalogSearchStore();
setSearchOptions({ phraseMatch: true });
```

**Note**: Phrase matching does NOT match backend behavior (84.4% accuracy vs 100% for keyword AND).

#### FTS Mode

FTS mode is kept for potential future enhancements but is not used by default:

```javascript
const { setSearchOptions } = useCatalogSearchStore();
setSearchOptions({ searchMode: 'fts' });
```

**Note**: FTS mode does NOT match backend behavior and should only be used for experimental features.

## Next Steps

See `/notes/1021-2103-sqlite-catalog-search-frontend-plan.md` for:

- Phase 2: UI components
- Phase 3: Filter support
- Phase 4: AddDatasetsModal integration
