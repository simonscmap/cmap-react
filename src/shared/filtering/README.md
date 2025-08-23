# SubsetControls Component

A reusable filtering component that provides UI controls for subsetting datasets by time, latitude, longitude, and depth parameters.

## Overview

The `SubsetControls` component renders a collapsible section with toggle switch and range controls for defining data subsets. It's currently used in the dataset download dialog but can be reused in other contexts where data filtering is needed.

## Usage

```jsx
import { SubsetControls } from 'src/shared/filtering';

<SubsetControls
  subsetParams={subsetParams}
  subsetSetters={subsetSetters}
  dataset={dataset}
  handleSwitch={handleSwitch}
  optionsState={optionsState}
  setInvalidFlag={setInvalidFlag}
  maxDays={maxDays}
  classes={classes}
/>;
```

## Props

### Required Props

#### `subsetParams` (Object)

Current subset parameter values:

```js
{
  timeStart: number,    // integer (0-12 for monthly data)
  timeEnd: number,      // integer
  latStart: number,     // latitude start value
  latEnd: number,       // latitude end value
  lonStart: number,     // longitude start value
  lonEnd: number,       // longitude end value
  depthStart: number,   // depth start value
  depthEnd: number      // depth end value
}
```

#### `subsetSetters` (Object)

Setter functions for updating subset parameters:

```js
{
  setTimeStart: function,
  setTimeEnd: function,
  setLatStart: function,
  setLatEnd: function,
  setLonStart: function,
  setLonEnd: function,
  setDepthStart: function,
  setDepthEnd: function
}
```

#### `dataset` (Object)

Dataset metadata containing range limits:

```js
{
  Time_Min: string,           // dataset time minimum
  Time_Max: string,           // dataset time maximum
  Lat_Min: number,            // dataset latitude minimum
  Lat_Max: number,            // dataset latitude maximum
  Lon_Min: number,            // dataset longitude minimum
  Lon_Max: number,            // dataset longitude maximum
  Depth_Min: number,          // dataset depth minimum
  Depth_Max: number,          // dataset depth maximum
  Temporal_Resolution: string // e.g., "monthly", "daily"
}
```

#### `handleSwitch` (Function)

Handler for toggle switch changes:

```js
(event) => {
  // event.target.name will be 'subset'
  // event.target.checked will be boolean
};
```

#### `optionsState` (Object)

State object containing toggle states:

```js
{
  subset: boolean; // whether subset controls are enabled
}
```

#### `setInvalidFlag` (Function)

Function to set validation state:

```js
(isInvalid: boolean) => void
```

#### `maxDays` (Number)

Maximum number of days allowed for date range validation.

#### `classes` (Object)

Material-UI style classes object, particularly requiring:

```js
{
  subsetStep: string; // CSS class for the subset controls container
}
```

## Behavior

### UI Structure

- **Toggle Switch**: "Define Subset" toggle with help text
- **Collapsible Section**: Expands when subset toggle is enabled
- **Four Control Groups**:
  - Date range controls (start/end)
  - Latitude range controls (start/end)
  - Longitude range controls (start/end)
  - Depth range controls (start/end)

### State Management

- Component has **no internal state**
- All state is managed externally via props
- Updates parent state through setter functions
- Validates input and calls `setInvalidFlag` on validation errors

### Validation

- Date controls validate against `maxDays` limit
- All controls validate against dataset min/max ranges
- Invalid states are communicated via `setInvalidFlag`

## Dependencies

### Internal Components

- `DateSubsetControl` - Time range controls
- `LatitudeSubsetControl` - Latitude range controls
- `LongitudeSubsetControl` - Longitude range controls
- `DepthSubsetControl` - Depth range controls
- `ToggleWithHelp` - Toggle switch with help text

### External Libraries

- `@material-ui/core` - UI components (Collapse)
- React - hooks (useState, useRef)

### Utilities

- `log-service` - Logging functionality
- Date helper functions from `./dateHelpers`

## Example Implementation

```jsx
import React, { useState } from 'react';
import { SubsetControls } from 'src/shared/filtering';
import { getInitialRangeValues } from './utils';

const MyComponent = ({ dataset }) => {
  const { maxDays, lat, lon, time, depth } = getInitialRangeValues(dataset);

  // State for subset parameters
  const [latStart, setLatStart] = useState(lat.start);
  const [latEnd, setLatEnd] = useState(lat.end);
  const [lonStart, setLonStart] = useState(lon.start);
  const [lonEnd, setLonEnd] = useState(lon.end);
  const [timeStart, setTimeStart] = useState(time.start);
  const [timeEnd, setTimeEnd] = useState(time.end);
  const [depthStart, setDepthStart] = useState(depth.start);
  const [depthEnd, setDepthEnd] = useState(depth.end);

  // Options state
  const [optionsState, setOptionsState] = useState({ subset: false });
  const [isInvalid, setInvalidFlag] = useState(false);

  const handleSwitch = (event) => {
    setOptionsState({
      ...optionsState,
      [event.target.name]: event.target.checked,
    });
  };

  const subsetParams = {
    timeStart,
    timeEnd,
    latStart,
    latEnd,
    lonStart,
    lonEnd,
    depthStart,
    depthEnd,
  };

  const subsetSetters = {
    setTimeStart,
    setTimeEnd,
    setLatStart,
    setLatEnd,
    setLonStart,
    setLonEnd,
    setDepthStart,
    setDepthEnd,
  };

  return (
    <SubsetControls
      subsetParams={subsetParams}
      subsetSetters={subsetSetters}
      dataset={dataset}
      handleSwitch={handleSwitch}
      optionsState={optionsState}
      setInvalidFlag={setInvalidFlag}
      maxDays={maxDays}
      classes={classes}
    />
  );
};
```

## Refactored Components

### useSubsetControls Hook

For better reusability, the subset management logic has been extracted into a custom hook:

```jsx
import { useSubsetControls } from 'src/shared/filtering';

const MyComponent = ({ dataset }) => {
  const {
    subsetParams,
    subsetSetters,
    maxDays,
    optionsState,
    handleSwitch,
    setInvalidFlag,
    subsetIsDefined,
    resetToDefaults,
  } = useSubsetControls(dataset, {
    includeOptionsState: true,
    initialOptions: { subset: false },
  });

  // Use the values directly or pass to SubsetControls component
};
```

### SubsetControlsWithHook Component

A higher-level component that uses the hook internally:

```jsx
import { SubsetControlsWithHook } from 'src/shared/filtering';

<SubsetControlsWithHook
  dataset={dataset}
  classes={classes}
  onSubsetChange={(data) => {
    // Callback with subset state changes
    console.log('Subset changed:', data.subsetParams);
  }}
/>;
```

## Migration Guide

### From DialogContent.js

**Before:**

```jsx
// 50+ lines of state management in DialogContent
const [latStart, setLatStart] = useState(lat.start);
const [latEnd, setLatEnd] = useState(lat.end);
// ... more state
```

**After Option 1 (Hook):**

```jsx
const { subsetParams, subsetSetters, optionsState, handleSwitch } =
  useSubsetControls(dataset);
```

**After Option 2 (Component):**

```jsx
<SubsetControlsWithHook dataset={dataset} onSubsetChange={handleSubsetChange} />
```

## Notes

- **Original Component**: Stateless, requires all props
- **Hook**: Manages state internally, returns structured data
- **WithHook Component**: Self-contained with callback for parent updates
- Designed for reusability across different contexts
- Integrates with Material-UI theming system
- Includes built-in validation and error handling
- Supports both slider and text input controls for all ranges
