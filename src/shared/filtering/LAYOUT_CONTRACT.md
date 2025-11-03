# Filtering Subsystem: Layout Contract for AI Agents

## Architecture

```
Layer 1: State Management (useSubsetFiltering hook)
         ↓ Returns organized data
Layer 2: Headless Coordinator (SubsetControls component)
         ↓ Injects props via React.cloneElement
Layer 3: Layout Component (SWAPPABLE)
         ↓ Renders and arranges
Layer 4: Control Components (SWAPPABLE)
         ↓ Use validation hooks
Layer 5: Primitive UI Components (SWAPPABLE)
```

**State logic isolation:** Layers 1-2 contain ALL state management. Layers 3-5 are pure presentation and can be replaced without modifying state logic.

## Contract 1: SubsetControls Input Props

Props required by `src/shared/filtering/core/SubsetControls.js`:

```typescript
interface SubsetControlsProps {
  setInvalidFlag: (isInvalid: boolean) => void;
  children: React.ReactElement;

  filterValues: {
    timeStart: Date | number;
    timeEnd: Date | number;
    latStart: number;
    latEnd: number;
    lonStart: number;
    lonEnd: number;
    depthStart: number;
    depthEnd: number;
  };

  filterSetters: {
    setTimeStart: (value: Date | number) => void;
    setTimeEnd: (value: Date | number) => void;
    setLatStart: (value: number) => void;
    setLatEnd: (value: number) => void;
    setLonStart: (value: number) => void;
    setLonEnd: (value: number) => void;
    setDepthStart: (value: number) => void;
    setDepthEnd: (value: number) => void;
  };

  datasetFilterBounds: {
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
    depthMin: number;
    depthMax: number;
    timeMin: Date;
    timeMax: Date;
  };

  dateHandling: {
    isMonthlyClimatology: boolean;
    handleSetStartDate: (value: Date) => void;
    handleSetEndDate: (value: Date) => void;
    validTimeMin: boolean;
    validTimeMax: boolean;
  };
}
```

## Contract 2: Layout Component Props

Props injected by SubsetControls into layout component (Layer 3):

```typescript
interface LayoutInjectedProps {
  controls: {
    date: {
      data: {
        timeStart: Date | number;
        timeEnd: Date | number;
        isMonthlyClimatology: boolean;
        timeMin: Date;
        timeMax: Date;
      };
      handlers: {
        setTimeStart: (value: Date | number) => void;
        setTimeEnd: (value: Date | number) => void;
        handleSetStartDate: (value: Date) => void;
        handleSetEndDate: (value: Date) => void;
      };
      validation: {
        validTimeMin: boolean;
        validTimeMax: boolean;
      };
      setInvalidFlag: (isInvalid: boolean) => void;
    };

    latitude: {
      data: {
        latStart: number;
        latEnd: number;
        latMin: number;
        latMax: number;
      };
      handlers: {
        setLatStart: (value: number) => void;
        setLatEnd: (value: number) => void;
      };
    };

    longitude: {
      data: {
        lonStart: number;
        lonEnd: number;
        lonMin: number;
        lonMax: number;
      };
      handlers: {
        setLonStart: (value: number) => void;
        setLonEnd: (value: number) => void;
      };
    };

    depth: {
      data: {
        depthStart: number;
        depthEnd: number;
        depthMin: number;
        depthMax: number;
      };
      handlers: {
        setDepthStart: (value: number) => void;
        setDepthEnd: (value: number) => void;
      };
    };
  };
}
```

**Layout must provide its own UI-specific props:**

```typescript
interface LayoutOwnProps {
  optionsState: object; // UI toggle state (e.g., collapse, tabs)
  handleSwitch: (event: React.ChangeEvent) => void;
}
```

## Contract 3: Control Component Props

### DateRangeControl

Location: `src/shared/filtering/components/DateRangeControl.js`

```typescript
interface DateRangeControlProps {
  title: string;
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
  startLabel?: string; // default: 'Start Date'
  endLabel?: string; // default: 'End Date'
}
```

**Internal hook:** `useDateRangeInput` from `src/shared/filtering/hooks/useDateRangeInput.js`

### RangeSubsetControl

Location: `src/shared/filtering/components/RangeSubsetControl.js`

```typescript
interface RangeSubsetControlProps {
  title: string;
  start: number;
  end: number;
  setStart: (value: number) => void;
  setEnd: (value: number) => void;
  min: number;
  max: number;
  step?: number; // default: 0.1
  unit?: string; // default: ''
  startLabel?: string; // default: 'Start'
  endLabel?: string; // default: 'End'
}
```

**Internal hook:** `useRangeInput` from `src/shared/filtering/hooks/useRangeInput.js`

### MonthlyDateSubsetControl

Location: `src/shared/filtering/components/MonthlyDateSubsetControl.js`

```typescript
interface MonthlyDateSubsetControlProps {
  subsetState: {
    timeStart: number; // 1-12
    timeEnd: number; // 1-12
  };
  setTimeStart: (value: number) => void;
  setTimeEnd: (value: number) => void;
}
```

**No internal hooks.** Uses Material-UI components only.

## Contract 4: Reusable Hooks

### useRangeInput

Location: `src/shared/filtering/hooks/useRangeInput.js`

```typescript
interface UseRangeInputParams {
  start: number;
  end: number;
  setStart: (value: number) => void;
  setEnd: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

interface UseRangeInputReturn {
  localStartValue: string;
  localEndValue: string;
  handleSetStart: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSetEnd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlurStart: () => void;
  handleBlurEnd: () => void;
  startMessage: string;
  endMessage: string;
  handleSlider: (event: any, value: [number, number]) => void;
  handleSliderCommit: (event: any, value: [number, number]) => void;
  sliderStart: number;
  sliderEnd: number;
}
```

**Provides:** Two-phase updates (local state → commit on blur), validation with auto-hide messages, slider preview during drag.

### useDateRangeInput

Location: `src/shared/filtering/hooks/useDateRangeInput.js`

```typescript
interface UseDateRangeInputParams {
  start: Date;
  end: Date;
  setStart: (value: Date) => void;
  setEnd: (value: Date) => void;
  min: Date;
  max: Date;
}

interface UseDateRangeInputReturn {
  handleDateStartBlur: () => void;
  handleDateEndBlur: () => void;
  startDateMessage: string;
  endDateMessage: string;
}
```

**Provides:** Date validation with auto-hide messages, range order validation.

## Swap Patterns

### Pattern A: Replace Entire Layout

**Keep:** SubsetControls, all control components, all hooks
**Replace:** Layout arrangement and structure
**Reference:** `src/shared/filtering/components/DefaultSubsetControlsLayout.js`

Usage:

```javascript
<SubsetControls {...standardProps}>
  <CustomLayout optionsState={...} handleSwitch={...} />
</SubsetControls>
```

### Pattern B: Replace Control Components

**Keep:** SubsetControls, layout structure, hooks
**Replace:** Individual control components (date, lat, lon, depth)
**Reference:** Control components in `src/shared/filtering/components/`

Usage: Import and use hooks (`useRangeInput`, `useDateRangeInput`) in custom components with different UI widgets.

### Pattern C: Replace Primitive UI

**Keep:** SubsetControls, layout, control components, hooks
**Replace:** RangeSlider, RangeTextInput, DateRangeSlider, DateRangeInput
**Reference:** Primitive components in `src/shared/filtering/components/`

Usage: Change imports in control components to use different slider/input libraries.

## Critical Rules

**Invariants that MUST be preserved:**

1. **No direct state store access in UI layers** - All data flows through props from SubsetControls
2. **Control components must conditionally render** - Check `controls.date.data.isMonthlyClimatology` to choose MonthlyDateSubsetControl vs DateRangeControl
3. **Validation hooks must be used** - Do not implement validation logic directly in custom components
4. **Two-phase updates must be preserved** - useRangeInput pattern: local state during typing, commit on blur
5. **Prop mapping must be exact** - Controls expect specific prop names (e.g., `start`/`end` not `value`)
6. **Date handling duality** - Date controls use Date objects, monthly controls use numbers 1-12
7. **setInvalidFlag must be called** - Date control validation results must propagate via setInvalidFlag callback

## Data Flow

```
Consumer Component
  ↓ provides
  useSubsetFiltering hook return values
  ↓ passes to
SubsetControls (organizes into controls object)
  ↓ clones children with
  controls prop (organized by dimension)
  ↓ received by
Layout Component (maps to control components)
  ↓ passes to
Control Components (DateRangeControl, RangeSubsetControl, etc.)
  ↓ use
Validation Hooks (useRangeInput, useDateRangeInput)
  ↓ render
Primitive UI (RangeSlider, RangeTextInput, etc.)
```

**State updates flow reverse:** Primitive UI → Control component → Layout → SubsetControls props → useSubsetFiltering → Store

## Tight Coupling Points

**Areas requiring careful attention when swapping:**

1. **Monthly climatology conditional** - Layout must check `isMonthlyClimatology` and render correct component
2. **Prop name matching** - Control components expect exact prop names (typos cause runtime errors)
3. **Unit configuration** - Layout provides step/unit config (e.g., `step={0.1}`, `unit="°"`)
4. **Validation propagation** - Date control must call `setInvalidFlag` from props
5. **Handler vs setter distinction** - Date has both `setTimeStart` and `handleSetStartDate` (different purposes)

## Validation Logic Location

**Do not reimplement in custom components:**

- **Range validation** - In `useRangeInput` (min/max clamping, order validation)
- **Date validation** - In `useDateRangeInput` (min/max bounds, range order)
- **Message auto-hide** - In hooks (3-second timeout)
- **Slider preview** - In `useRangeInput` (separate state during drag)

**Reuse hooks** when creating custom components to maintain consistent validation behavior.
