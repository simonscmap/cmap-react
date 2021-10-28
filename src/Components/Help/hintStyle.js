import { DEFAULT_HINT_POSITION } from "../../constants";
import { makeStyles } from '@material-ui/core';

// map MUI placement variant to absolute positioning the Beacon
// this function assumes that the Beacon is 1em square

// TODO: the % calculation doesn't work well when attached to an
// anchore which can change size (expand)
const positionToStlye = (variant) => {
  switch (variant) {
    case 'top-start':
      return { left: 'calc(25% - (1em / 2))', top: '-1em' };
    case 'top':
      return { left: 'calc(50% - (1em / 2))', top: '-1em' };
    case 'top-end':
      return { left: 'calc(75% - (1em / 2))', top: '-1em' };

    case 'bottom-start':
      return { left: 'calc(25% - (1em / 2))', bottom: '-1em' };
    case 'bottom':
      return { left: 'calc(50% - (1em / 2))', bottom: '-1em' };
    case 'bottom-end':
      return { left: 'calc(75% - (1em / 2))', bottom: '-1em' };

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

// normalize an override object, applying overrides and position styling
export const mergeOverridesAndPositionVariant = (overrides = {}, position) => {
  return {
    wrapper: position
      ? Object.assign({}, overrides.wrapper)
      : overrides.wrapper,
    beacon: position
      ? // overrides should override the position variant
        Object.assign({}, positionToStlye(position.beacon), overrides.beacon)
      : overrides.beacon,
    hint: overrides.hint,
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
      },
      overrides ? overrides.beacon: {},
    ),
  hint: (overrides) => overrides.tooltip,
});


export const getPlacement = (position = {}) => ({
  hint: position.hint || DEFAULT_HINT_POSITION,
  // beacon placement is automatically incorporated into style,
  // but it can still be referenced here
  beacon: position.beacon
});
