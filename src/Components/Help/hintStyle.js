import { DEFAULT_HINT_POSITION } from '../../constants';
import { makeStyles } from '@material-ui/core';
import { CATALOG_PAGE, VISUALIZATION_PAGE } from '../../constants.js';

// map MUI placement variant to absolute positioning the Beacon
// this function assumes that the Beacon is 1em square

// TODO: the % calculation doesn't work well when attached to an
// anchore which can change size (expand)
const beaconPositionToStyle = (variant) => {
  switch (variant) {
    case 'top-start':
      return { left: 'calc(25% - (1em / 2))', top: '-1em' };
    case 'top':
      return { left: 'calc(50% - (1em / 2))', top: '-1em' };
    case 'top-end':
      return { right: '-1em', top: '-1em' };

    case 'bottom-start':
      return { left: 'calc(25% - (1em / 2))', bottom: '-1em' };
    case 'bottom':
      return { left: 'calc(50% - (1em / 2))', bottom: '-1em' };
    case 'bottom-end':
      return { right: '-1em', bottom: '-1em' };

    case 'left-start':
      return { left: '-1em', top: 'calc(25% - (1em / 2))' };
    case 'left':
      return { left: '-1em', top: 'calc(50% - (1em / 2))' };
    case 'left-end':
      return { left: '-1em', top: 'calc(75% - (1em / 2))' };

    case 'right-start':
      return { right: '-1em', top: 'calc(25% - (1em / 2))' };
    case 'right':
      return { right: '-1em', top: 'calc(50% - (1em / 2))' };
    case 'right-end':
      return { right: '-1em', top: 'calc(75% - (1em / 2))' };

    default:
      // left
      return { left: '-1em', top: 'calc(50% - (1em / 2))' };
  }
};

const hintPositionToStyle = (variant) => {
  switch (variant) {
    case 'top-start':
      // hint's bottom right corner extends from beacon's top left corner
      return {
        right: '2em',
        bottom: '2em',
      };
    case 'top-end':
      // hint's bottom left corner extends from beacon's top right corner
      return {
        left: '2em',
        bottom: '2em',
      };
    case 'bottom-start':
      // hint's top right corner extends from beacon's bottom left corner
      return {
        right: '2em',
        top: '2em',
      };
    case 'bottom-end':
      // hint's top left corner extends from beacon's bottom right corner
      return {
        left: '2em',
        top: '2em',
      };
    case 'right':
      return {
        left: '2.5em',
        top: '-.5em',
      };
    default:
      return {
        left: '1em',
        top: '1em',
      };
  }
};

const hintPositionToArrowStyle = (variant) => {
  switch (variant) {
    case 'top-start':
      // arrow points up to the right
      return {
        left: '-1.1em',
        bottom: '1.1em',
        transform: 'rotate(135deg)',
      };
    case 'top-end':
      // arrow points down to the left
      return {
        right: '-1.1em',
        bottom: '1.1em',
        transform: 'rotate(-135deg)',
      };
    case 'bottom-start':
      // arrow points up to the right
      return {
        right: '1.1em',
        top: '1.1em',
        transform: 'rotate(45deg)',
      };
    case 'bottom-end':
      // arrow points up to the left
      return {
        left: '1.1em',
        top: '1.1em',
        transform: 'rotate(-45deg)',
      };
    case 'right':
      return {
        left: '1.4em',
        top: '0',
        transform: 'rotate(-90deg)',
      };
    default:
      return {};
  }
};

// take a variant ('medium', 'large') and return width and box-shadow style
// (the shadow looks odd if it is not proporitonate to the size of the layer)
const sizeToStyle = (variant) => {
  switch (variant) {
    case 'large':
      return {
        width: '600px',
        boxShadow: '0 3px 20px 20px rgb(0 0 0 / 0.2)',
      };
    case 'medium':
      return {
        width: '400px',
        boxShadow: '0 3px 10px 10px rgb(0 0 0 / 0.2)',
      };
    default:
      return {
        width: '250px',
        boxShadow: '0 3px 10px 5px rgb(0 0 0 / 0.2)',
      };
  }
};

const pageNameToStyle = (pageName) => {
  const template = {
    wrapper: {},
    beacon: {},
    hint: {},
    arrow: {},
  };
  switch (pageName) {
    case VISUALIZATION_PAGE:
      return Object.assign({}, template, {
        hint: {
          backgroundColor: '#000000',
        },
      });
    case CATALOG_PAGE:
    default:
      return Object.assign({}, template, {
        hint: {
          backgroundColor: '#1F4A63',
        },
      });
  }
};

// normalize an override object, applying overrides and position styling
export const mergeOverridesAndVariants = (
  overrides = {},
  position = {},
  size = '',
  pageName,
) => {
  const { hint: hintPageTheme } = pageNameToStyle(pageName);
  // Note: concerning the order of arguments to these Object.assign calls:
  // the style overrides should always have priority, and therefore be last
  return {
    wrapper: Object.assign({}, overrides.wrapper),
    beacon: Object.assign(
      {},
      beaconPositionToStyle(position.beacon),
      overrides.beacon,
    ),
    hint: Object.assign(
      {},
      hintPositionToStyle(position.hint),
      sizeToStyle(size),
      hintPageTheme,
      overrides.hint,
    ),
    arrow: Object.assign(
      {},
      hintPositionToArrowStyle(position.hint),
      overrides.arrow,
    ),
  };
};

// provide class names
export const useHintStyles = makeStyles({
  wrapper: (overrides) =>
    Object.assign(
      {
        // wrapper needs to be relative
        // in order to support the absolute positioning of the hint icon
        position: 'relative',
      },
      overrides ? overrides.wrapper : {},
    ),
  beacon: (overrides) =>
    Object.assign(
      {
        position: 'absolute',
        border: 'none',
        borderRadius: '1em',
        backgroundColor: '#9dd162',
        lineHeight: '1em',
        width: '1em',
        height: '1em',
        textAlign: 'center',
        fontSize: '1em',
        fontWeight: 500,
        padding: '0.05em',
        cursor: 'pointer',
      },
      overrides ? overrides.beacon : {},
    ),
  hint: (overrides) =>
    Object.assign(
      {
        position: 'absolute',
        color: 'white',
        fontSize: '.8em',
        textAlign: 'left',
        padding: '.5em',
        border: '1px solid #9dd162',
        borderRadius: '5px',
        minWidth: '200px',
        zIndex: 9999,
      },
      overrides ? overrides.hint : {},
    ),
  arrow: (overrides) =>
    Object.assign(
      {
        // variants merged into the overrides provide rotation and positioning
        position: 'absolute',
        display: 'block',
        width: 0,
        height: 0,
        borderLeft: '.5em solid transparent',
        borderRight: '.5em solid transparent',
        borderBottom: '1em solid #9dd162',
      },
      overrides ? overrides.arrow : {},
    ),
});

export const getPlacement = (position = {}) => ({
  hint: position.hint || DEFAULT_HINT_POSITION,
  // beacon placement is automatically incorporated into style,
  // but it can still be referenced here
  beacon: position.beacon,
});
