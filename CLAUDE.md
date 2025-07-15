# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application

- `npm start` - Start development server (without Sentry)
- `npm run start:sentry` - Start development server with Sentry enabled
- `npm test` - Run all tests
- `npm run test <file>` - Run specific test file (e.g., `npm run test src/Tests/Utility/objectUtils.test.js`)
- `npm run build` - Build for production (generates buildInfo.json and moves index.html to app.html)
- `npm run lint` - Run ESLint on src directory

### Build Requirements

- Node.js 12.18.1
- The build process generates a `buildInfo.json` file that is used by the logging module

## Architecture Overview

### Technology Stack

- **React 16.13.1** with both class and functional components
- **Redux** for state management with redux-saga for side effects
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
- **User Management**: Authentication with Google OAuth integration
- **Admin Panel**: News management and dataset administration

### Redux Architecture

- Uses both connect() HOC and hooks (useSelector/useDispatch) patterns
- Redux-saga for handling async operations and API calls
- Persistence middleware for maintaining state across sessions
- Organized into feature-based modules (catalog, visualization, user, etc.)
- Uses reduceReducers and NOT combineReducers. Thus, reducers take in entire state, not state slices.

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
