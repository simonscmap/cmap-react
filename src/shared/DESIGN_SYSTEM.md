# CMAP Design System

This document describes the CMAP design system extracted from the codebase and enhanced with solid design principles.

## Overview

The design system is defined in `designTokens.js` and provides a comprehensive set of design tokens that capture the unique visual fingerprint of the CMAP application while adding structure for layouts, proportions, and consistent patterns.

## Philosophy

1. **Extracted Fingerprint**: Colors, typography, and spacing values were systematically extracted from both legacy and modern code
2. **Material-UI Independence**: All tokens are independent of Material-UI and can be used to gradually replace it
3. **Strong Defaults**: Added comprehensive layout systems, proportions, and spacing scales that were missing
4. **Semantic Organization**: Tokens are organized by purpose (colors, typography, spacing, layout, etc.)

## Usage

### Importing Tokens

```javascript
// Import the entire design system
import designTokens from 'shared/designTokens';

// Or import specific tokens
import { colors, typography, spacing } from 'shared/designTokens';
```

### Using Color Tokens

```javascript
import { colors } from 'shared/designTokens';

const styles = {
  backgroundColor: colors.primary.main,        // #9dd162
  color: colors.text.primary,                  // #ffffff
  borderColor: colors.border.primary,          // #9dd162
  hover: {
    backgroundColor: colors.green.hover,       // rgba(97, 149, 38, 0.4)
  },
};
```

**Color Categories:**
- `colors.primary` - Primary brand green (#9dd162)
- `colors.secondary` - Teal accent (#22A3B9)
- `colors.green` - Extended green palette
- `colors.blue` - Extended blue palette
- `colors.purple` - Purple palette
- `colors.error` / `success` / `warning` - Semantic colors
- `colors.background` - Background colors and gradients
- `colors.text` - Text colors
- `colors.overlay` - Overlay transparencies
- `colors.border` - Border colors
- `colors.gradient` - Pre-defined gradients
- `colors.status` - Status indicators
- `colors.badge` - Badge colors
- `colors.grid` - AG Grid specific colors

### Using Typography Tokens

```javascript
import { typography, fonts, fontSizes } from 'shared/designTokens';

// Use complete typography variants
const headingStyles = {
  ...typography.h1,
  // Results in:
  // fontFamily: "Montserrat", sans-serif
  // fontSize: 2.25rem (36px)
  // fontWeight: 500
  // lineHeight: 1.2
  // letterSpacing: 0.05em
  // textTransform: uppercase
};

// Or compose your own
const customStyles = {
  fontFamily: fonts.heading,
  fontSize: fontSizes.xl.rem,
  fontWeight: fontWeights.bold,
};
```

**Typography Variants:**
- `typography.h1` through `h6` - Heading styles
- `typography.bodyDefault` / `bodyLarge` / `bodySmall` - Body text
- `typography.subtitleXL` / `subtitleLarge` - Subtitles
- `typography.button*` - Button text styles (small, medium, large, xlarge)
- `typography.label` / `helper` / `caption` - UI element text
- `typography.code` - Code blocks

### Using Spacing Tokens

```javascript
import { spacing, spacingSemantic, getSpacing } from 'shared/designTokens';

const styles = {
  // Direct spacing values
  padding: spacing[2],              // 16px
  margin: spacing[4],               // 32px
  gap: spacing[1],                  // 8px

  // Semantic spacing
  padding: spacingSemantic.paddingMD,     // 16px
  marginTop: spacingSemantic.sectionGap,  // 32px

  // Using the helper function
  padding: getSpacing(2, 4),        // 16px 32px
  margin: getSpacing(1),            // 8px
};
```

**Spacing Scale** (based on 8px units):
- `spacing[0.5]` = 4px
- `spacing[1]` = 8px
- `spacing[2]` = 16px (most common)
- `spacing[3]` = 24px
- `spacing[4]` = 32px
- `spacing[6]` = 48px
- `spacing[8]` = 64px

### Using Layout Tokens

```javascript
import { breakpoints, containers, layout } from 'shared/designTokens';

// Responsive design
const ResponsiveComponent = styled.div`
  width: 100%;

  ${breakpoints.up('md')} {
    max-width: ${containers.md};
  }

  ${breakpoints.up('lg')} {
    max-width: ${containers.lg};
  }
`;

// Modal widths
const modalStyles = {
  width: layout.modalMedium,        // 600px
  maxWidth: layout.modalLarge,      // 900px
};

// Sidebar widths
const sidebarStyles = {
  width: layout.sidebarWide,        // 320px
};
```

**Breakpoint Values:**
- `xs`: 0px
- `sm`: 600px
- `md`: 1020px
- `lg`: 1280px
- `xl`: 1920px

**Breakpoint Utilities:**
- `breakpoints.up('md')` - Min-width media query
- `breakpoints.down('lg')` - Max-width media query
- `breakpoints.between('sm', 'lg')` - Range media query

### Using Shadows and Elevation

```javascript
import { shadows } from 'shared/designTokens';

const styles = {
  boxShadow: shadows.md,                    // Standard elevation
  boxShadow: shadows.navigation,            // Navigation shadow
  boxShadow: shadows.glowCyan,              // Cyan glow effect
};
```

### Using Border Radius

```javascript
import { radii } from 'shared/designTokens';

const styles = {
  borderRadius: radii.base,          // 6px (default)
  borderRadius: radii.card,          // 6px (semantic)
  borderRadius: radii.button,        // 4px
  borderRadius: radii.full,          // Fully rounded
};
```

### Using Z-Index Layers

```javascript
import { zIndex } from 'shared/designTokens';

const styles = {
  zIndex: zIndex.navbar,             // 5000
  zIndex: zIndex.modal,              // 9700
  zIndex: zIndex.tooltip,            // 9000
};
```

**Layer Hierarchy** (lowest to highest):
1. `controlPrimary` - `controlTertiary` (2000-4000)
2. `navbar` (5000)
3. `tooltip` (9000)
4. `slideOutPanel` (9500)
5. `muiDialog` and modal layers (9700-9950)
6. `loadingOverlay` (9999)
7. `snackbar` (10000)

### Using Transitions

```javascript
import { transitions, durations, easings } from 'shared/designTokens';

const styles = {
  transition: transitions.default,        // All properties, 200ms
  transition: transitions.fast,           // Fast transition
  transition: transitions.color,          // Color/background only

  // Custom transitions
  transition: `transform ${durations.moderate} ${easings.easeOut}`,
};
```

## Migration from Material-UI

When gradually replacing Material-UI components:

### Before (Material-UI)
```javascript
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
  },
}));
```

### After (Design Tokens)
```javascript
import { colors, spacing } from 'shared/designTokens';

const styles = {
  container: {
    padding: spacing[2],
    backgroundColor: colors.primary.main,
    color: colors.text.primary,
  },
};
```

### Using with Styled Components
```javascript
import styled from 'styled-components';
import { colors, spacing, typography, breakpoints } from 'shared/designTokens';

const Card = styled.div`
  padding: ${spacing[3]};
  background-color: ${colors.background.paper};
  border-radius: ${radii.card};
  box-shadow: ${shadows.md};

  ${breakpoints.up('md')} {
    padding: ${spacing[4]};
  }
`;

const Heading = styled.h1`
  ${typography.h1}
  color: ${colors.green.lime};
`;
```

### Using with Inline Styles
```javascript
import { colors, spacing } from 'shared/designTokens';

function MyComponent() {
  return (
    <div style={{
      padding: spacing[2],
      backgroundColor: colors.primary.main,
      color: colors.text.primary,
    }}>
      Content
    </div>
  );
}
```

### Using with CSS-in-JS (Emotion/styled-components)
```javascript
import { css } from '@emotion/react';
import { colors, typography, spacing } from 'shared/designTokens';

const buttonStyles = css`
  ${typography.button}
  background-color: ${colors.primary.main};
  padding: ${spacing[1]} ${spacing[2]};
  border-radius: ${radii.button};
  transition: ${transitions.default};

  &:hover {
    background-color: ${colors.green.dark};
  }
`;
```

## Design Principles

### Color Usage

1. **Primary Green (#9dd162)**: Main brand color, primary buttons, accents, active states
2. **Teal (#22A3B9)**: Secondary accent, links, highlights
3. **Bright Cyan (#69FFF2)**: Secondary text, data visualization, home page accents
4. **Dark Backgrounds**: The app uses a dark theme with `#424242` as the main background
5. **White Text**: Primary text is white (`#ffffff`) for contrast on dark backgrounds

### Typography Hierarchy

1. **Headings**: Use Montserrat font, uppercase, with increased letter spacing
2. **Body Text**: Use Lato font, normal case
3. **Sizes**: Range from 11px (small UI) to 36px (main headlines)
4. **Weights**: Normal (400) for body, Medium (500) for buttons/emphasis, Bold (700) for headers

### Spacing Consistency

1. **Base Unit**: 8px
2. **Most Common**: `spacing[2]` (16px) for general spacing
3. **Component Gaps**: `spacing[1]` (8px) for tight spacing, `spacing[2]` for normal
4. **Section Gaps**: `spacing[4]` (32px) for major sections

### Responsive Design

1. **Mobile Not Supported**: The application is designed for tablet (600px+) and desktop viewports only
2. **Breakpoints**: Use `md` (1020px) as the primary breakpoint for layout changes
3. **Typography**: Reduce font sizes at the `lg` breakpoint (1280px) for better fit

## Examples

### Creating a Card Component

```javascript
import { colors, spacing, radii, shadows } from 'shared/designTokens';

const cardStyles = {
  backgroundColor: colors.background.paper,
  padding: spacing[3],
  borderRadius: radii.card,
  boxShadow: shadows.md,
  border: `1px solid ${colors.border.dark}`,
};
```

### Creating a Primary Button

```javascript
import { colors, typography, spacing, radii, transitions } from 'shared/designTokens';

const buttonStyles = {
  ...typography.button,
  backgroundColor: colors.primary.main,
  color: colors.primary.contrastText,
  padding: `${spacing[1]} ${spacing[2]}`,
  borderRadius: radii.button,
  border: 'none',
  cursor: 'pointer',
  transition: transitions.default,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const buttonHoverStyles = {
  backgroundColor: colors.primary.dark,
};
```

### Creating a Page Layout

```javascript
import { spacing, breakpoints, containers } from 'shared/designTokens';

const layoutStyles = {
  maxWidth: containers.lg,
  margin: '0 auto',
  padding: spacing[3],

  [breakpoints.up('md')]: {
    padding: spacing[4],
  },

  [breakpoints.up('lg')]: {
    padding: spacing[6],
  },
};
```

## Utility Functions

### `pxToRem(px, base = 16)`
Convert pixel values to rem units:
```javascript
import { pxToRem } from 'shared/designTokens';

const styles = {
  fontSize: pxToRem(18),  // 1.125rem
  padding: pxToRem(24),   // 1.5rem
};
```

### `getSpacing(...multipliers)`
Get spacing values with the 8px base unit:
```javascript
import { getSpacing } from 'shared/designTokens';

const styles = {
  padding: getSpacing(2),       // 16px
  margin: getSpacing(1, 2),     // 8px 16px
  gap: getSpacing(3),           // 24px
};
```

### `mediaQuery(direction, breakpoint)`
Create media queries:
```javascript
import { mediaQuery } from 'shared/designTokens';

const styles = {
  width: '100%',
  [mediaQuery('up', 'md')]: {
    width: '50%',
  },
};
```

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Use semantic naming** when possible (e.g., `spacingSemantic.sectionGap` instead of `spacing[4]`)
3. **Maintain consistency** across components by referencing the same tokens
4. **Don't modify tokens** in individual components - if you need a new value, add it to the design system
5. **Use utility functions** (`getSpacing`, `pxToRem`) for dynamic values
6. **Reference the z-index system** to avoid layering conflicts
7. **Follow the color semantics** (primary for main actions, secondary for accents, etc.)

## Future Enhancements

Potential additions to the design system:

1. **Component-specific tokens** (button sizes, input heights, etc.)
2. **Animation presets** (slide, fade, scale)
3. **Focus states** (outline styles, focus rings)
4. **Disabled states** (opacity values, color variations)
5. **Form validation states** (success, error, warning colors)
6. **Icon sizing scale**
7. **Avatar sizing scale**
8. **Badge/chip styling presets**

## Questions or Feedback

If you notice inconsistencies or need additional tokens, update the `designTokens.js` file and this documentation to maintain the design system as a single source of truth.
