# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application

- `npm start` - Start development server (without Sentry)
- `npm test` - Legacy test command (not used - see Testing section below)
- `npm run build` - Build for production (generates buildInfo.json and moves index.html to app.html)

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
- `src/shared/` - **Isolated modern features** Reusable utilities and components extracted from features for cross-feature use
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

#### Legacy

- **Data Catalog**: Scientific dataset search and discovery
- **Visualization**: Interactive chart creation with multiple chart types
- **Data Submission**: Workflow for submitting scientific datasets with validation
- **User Management**: Authentication with Google OAuth integration
- **Admin Panel**: News management and dataset administration

#### Modern

- **Collections**: Personal and public dataset collection management with card/table views
- **Multi-Dataset Download**: Bulk dataset downloads with selection-driven row count optimization

### State Management Architecture

- **Zustand + React Hooks**: Core state management tool for all new features
- **Redux**: **Legacy** global state - ONLY for existing features/implementations, not for new development
- **Redux-saga**: **Legacy** async operations - only used with existing Redux features
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
- When creating temporary logs, always prefix the message with "🌊 TEMP 🌊"

## Shared Utilities

## Recent Features & Patterns

For detailed implementation patterns, architectural decisions, and usage examples for recently developed features, see:

**[docs/RECENT-FEATURES.md](docs/RECENT-FEATURES.md)**

This includes documentation for:

- Collections Management (2025-09)
- Multi-Dataset Download Optimization (2025-09)
- Catalog Search (2025-10)

Reference this document when working on similar functionality or extending these features.
