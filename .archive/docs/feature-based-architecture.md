# Feature-Based Architecture Guide

This document outlines the feature-based architecture pattern used in this codebase, starting with the dropbox dataset download feature.

## Directory Structure

```
src/
├── features/
│   └── [featureName]/
│       ├── components/
│       │   ├── [ComponentName]/
│       │   │   ├── index.js
│       │   │   └── styles.js
│       │   └── index.js
│       ├── hooks/
│       │   ├── [hookName].js
│       │   └── index.js
│       ├── services/
│       │   ├── [serviceName].js
│       │   └── index.js
│       ├── state/
│       │   ├── actions.js
│       │   ├── actionTypes.js
│       │   ├── reducer.js
│       │   ├── sagas.js
│       │   ├── selectors.js
│       │   └── index.js
│       ├── utils/
│       │   ├── [utilityName].js
│       │   └── index.js
│       ├── constants/
│       │   ├── defaults.js
│       │   └── index.js
│       └── index.js
├── shared/
│   └── components/
│       ├── [SharedComponentName]/
│       │   ├── index.js
│       │   └── styles.js
│       └── index.js
└── Components/ (legacy - existing components)
```

## Key Principles

### 1. Feature Isolation

- Each feature is self-contained within its own directory
- All feature-related code (components, hooks, services, state) is co-located
- Features export a clean public API through their main `index.js`

### 2. Shared Components

- Components that are reused across features go in `src/shared/components/`
- Shared components should be generic and not feature-specific
- Examples: `FileTable`, `PaginationControls`

### 3. Redux Integration

- Use `reduceReducers` instead of `combineReducers` to maintain current state structure
- Feature reducers take the entire state object, not state slices
- Import feature reducer in main reducer file: `src/Redux/Reducers/index.js`

### 4. Service Layer

- API calls are isolated in the `services/` directory
- Services should be easily mockable for testing
- Import feature services in main API file: `src/api/api.js`

### 5. Saga Integration

- Feature sagas are exported from `state/sagas.js`
- Import and register saga watchers in main saga file: `src/Redux/Sagas/index.js`

## Migration Process

### 1. Create Feature Structure

```bash
mkdir -p src/features/[featureName]/{components,hooks,services,state,utils,constants}
```

### 2. Migrate Files

- Move API calls to `services/`
- Move Redux actions, reducers, sagas to `state/`
- Move components to `components/`
- Move hooks to `hooks/`
- Move utilities to `utils/`
- Move constants to `constants/`

### 3. Update Imports

- Update main reducer to import from feature
- Update main saga to import from feature
- Update main API to import from feature
- Update consuming components to import from feature

### 4. Identify Shared Components

- Look for components that could be reused across features
- Move generic components to `src/shared/components/`
- Update imports to use shared components

## File Templates

### Feature Index (`src/features/[featureName]/index.js`)

```javascript
// Main feature export - everything external components need
export { default as FeatureComponent } from './components/FeatureComponent';
export * from './hooks';
export * from './utils';
export * from './constants';
export { default as featureReducer } from './state/reducer';
export * from './state/actions';
export * from './state/selectors';
```

### state Index (`src/features/[featureName]/state/index.js`)

```javascript
export { default as featureReducer } from './reducer';
export * from './actions';
export * from './actionTypes';
export * from './selectors';
export * from './sagas';
```

### Component Index (`src/features/[featureName]/components/index.js`)

```javascript
export { default as ComponentName } from './ComponentName';
```

### Hooks Index (`src/features/[featureName]/hooks/index.js`)

```javascript
export { useFeatureHook } from './useFeatureHook';
```

## Best Practices

### Naming Conventions

- Use camelCase for files and directories
- Use PascalCase for component names
- Use descriptive names that indicate purpose
- Prefix feature exports to avoid naming conflicts

### Component Organization

- One component per file with its own directory if it has subcomponents
- Co-locate styles with components using `styles.js`
- Use index.js files for clean imports

### Redux Organization

- Keep all Redux logic in the `state/` directory
- Use selectors for computed state
- Keep action types in separate file for clarity
- Use sagas for side effects

### Dependencies

- Features should minimize external dependencies
- Shared utilities should be placed in `src/shared/`
- Avoid circular dependencies between features

## Integration Points

### Main Reducer Integration

```javascript
// src/Redux/Reducers/index.js
import featureReducer from '../../features/[featureName]/state/reducer';

const reducedReducer = reduceReducers(
  initialState,
  // ... other reducers
  featureReducer,
);
```

### Saga Integration

```javascript
// src/Redux/Sagas/index.js
import { watchFeatureAction } from '../../features/[featureName]/state/sagas';

export default function* rootSaga() {
  yield all([
    // ... other sagas
    watchFeatureAction(),
  ]);
}
```

### API Integration

```javascript
// src/api/api.js
import featureApi from '../features/[featureName]/services/api';

const api = {
  // ... other apis
  feature: featureApi,
};
```

## Example: Dataset Download Dropbox Feature

The first implementation of this pattern can be found in:

- `src/features/datasetDownloadDropbox/`
- `src/shared/components/FileTable/`
- `src/shared/components/PaginationControls/`

This feature demonstrates:

- Complete feature isolation
- Shared component extraction
- Redux integration with reduceReducers
- Service layer abstraction
- Clean import/export structure

## Future Considerations

1. **Testing Strategy**: Co-locate tests with components or create `__tests__` directories
2. **TypeScript**: Add type definitions in `types/` directory
3. **Lazy Loading**: Implement code splitting for large features
4. **Feature Flags**: Add configuration for feature toggles
5. **Documentation**: Generate API documentation from feature exports

## Migration Checklist

For each feature migration:

- [ ] Create feature directory structure
- [ ] Migrate API layer
- [ ] Migrate Redux layer (actions, reducer, sagas, actionTypes)
- [ ] Migrate components and hooks
- [ ] Migrate utilities and constants
- [ ] Update main reducer integration
- [ ] Update saga integration
- [ ] Update API integration
- [ ] Update imports throughout codebase
- [ ] Identify and move shared components
- [ ] Test feature functionality
- [ ] Update documentation
