// Implements a Hint wrapper, which is connected to global state,
// and hides/shows based on whether hints are enabled/disabled

import React, { useState } from 'react';
import { ClickAwayListener } from '@material-ui/core';
import { Beacon } from './Beacon';
import { HintTooltip } from './HintTip';
import { mergeOverridesAndVariants, useHintStyles } from './hintStyle';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { pathNameToPageName } from '../../Utility/routing.js';

/* Hint
 *  - children: JSX element(s) that the hint is anchored to
 *  - content: JSX element to render in the hint
 *  - styleOverride: {
 *      wrapper: mui style declaration
 *      beacon: mui style declaration
 *      hint:  mui style declaration
 *    }
 *  - position: {
 *      beacon: mui variant, e.g. 'left-start'
 *      hint: ""
 *    }
 *
 * For MUI Tooltip reference https://v4.mui.com/components/tooltips/
 * TODO: note use of ClickAwayListener
 */
function Hint({ children, content, styleOverride, position, size }) {
  // get router location
  const location = useLocation();
  const pageName = pathNameToPageName(location.pathname);

  // normalize style overrides
  const overrides = mergeOverridesAndVariants(
    styleOverride,
    position,
    size,
    pageName,
  );
  // generate class names
  const classes = useHintStyles(overrides);

  // to render as component, variable needs to be capitalized
  const TooltipContent = content;

  // manage hint content visibility
  const [hintIsVisible, setHintVisibility] = useState(false);
  const toggleHint = () => {
    setHintVisibility(!hintIsVisible);
  };

  // are hints enabled?
  const hintsAreEnabled = useSelector(({ hints }) => hints[pageName]);

  // if a hint is open and the user disables all hints,
  // any open hints should close
  const openHint = hintIsVisible && hintsAreEnabled;

  return (
    <ClickAwayListener onClickAway={() => setHintVisibility(false)}>
      <div className={classes.wrapper}>
        <Beacon
          enabled={hintsAreEnabled}
          onClick={toggleHint}
          styles={classes.beacon}
        >
          <HintTooltip
            open={openHint}
            content={TooltipContent}
            styles={classes}
          />
        </Beacon>
        <div>{children}</div>
      </div>
    </ClickAwayListener>
  );
}

export default Hint;
