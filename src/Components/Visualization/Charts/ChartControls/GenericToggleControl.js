// Generic Toggle Control for Chart Control Panel
// A chart module can use this component to create a toggle button
// by supplying setter and state references, the desired icon and tooltip
import React from 'react';
import ControlButtonTemplate from './ControlButtonTemplate';
import { useDispatch } from 'react-redux';
import { setLoadingMessage } from '../../../../Redux/actions/ui';

export const makeGenericToggleControl = (icon) => (tooltip) => (state) => {
  let args = { icon, tooltip, state };
  return (props) => (<GenericToggleControl {...props} {...args}/>);
}

const GenericToggleControl = (props) => {
  let { state, tooltip, icon } = props;
  // the "state" parameter takes the same form as the result of useState hook
  // with the addittion of an optional transform, in case the value is not boolean
  // and an onState, which indicates which of the two non boolean toggles states
  // sholde be considered "on"
  let [ toggleState, setToggleState, transform, onState ] = state;

  let dispatch = useDispatch();

  let handleClick = () => {
    dispatch(setLoadingMessage('Re-rendering'));
    setTimeout(() => {
      window.requestAnimationFrame(() => dispatch(setLoadingMessage('')));
      if (transform) {
        setToggleState(transform(toggleState));
      } else {
        setToggleState(!toggleState);
      }
    }, 50);
  };

  let tooltipProp;
  if (typeof tooltip === 'function') {
    tooltipProp = tooltip(state);
  } else {
    let [ whenOn, whenOff ] = tooltip;
    tooltipProp = toggleState ? whenOn : whenOff;
  }

  let isControlInActiveState = () => {
    if (typeof toggleState === 'boolean') {
      return toggleState;
    } else if (onState) {
      return toggleState === onState
    } else {
      return false;
    }
  }

  let isActive = isControlInActiveState();

  return (
    <ControlButtonTemplate
      tooltipContent={tooltipProp}
      active={isActive}
      onClick={handleClick}
      icon={icon}
    />
  );
};

export default GenericToggleControl;
