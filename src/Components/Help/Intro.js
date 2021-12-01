import React, { useState, useEffect } from 'react';
import { toggleIntro } from '../../Redux/actions/help.js';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { pathNameToPageName } from '../../Utility/routing.js';

// todo: move this to a utility module
const isInViewport = (el) => {
  if (!el) {
    return false;
  }

  let rect = el.getBoundingClientRect();

  if (!rect) {
    return false;
  }

  let top = rect.top >= 0;
  let left = rect.left >= 0;
  let bottom =
    rect.bottom <=
    (window.innerHeight || document.documentElement.clientHeight);
  let right =
    rect.right <= (window.innerWidth || document.documentElement.clientWidth);

  return top && left && bottom && right;
};

const elementIsReady = (step) => {
  let qs = step.element;
  let el = document.querySelector(qs);
  let isReady = isInViewport(el);
  return isReady;
};

const filterSteps = (steps) => steps.filter(elementIsReady);

// This component wraps the react implementation of intro-js steps
// See https://github.com/HiDeoo/intro.js-react

// TODO automatically load the correct config for the current page
// do not depend on injecting props

const StepsWrapper = ({ enabled, steps, initialStep, onIntroExit }) => {
  // store a reference to the mounted Steps instance
  // you can use this to call introJs methods, such as "refresh"
  // let [ref, setRef] = useState(undefined);

  return (
    enabled && (
      <Steps
        enabled={enabled}
        steps={steps}
        initialStep={initialStep}
        onExit={onIntroExit}
        // ref={(steps) => setRef(steps)}
      />
    )
  );
};

const Intro = ({ config, wait }) => {
  let { pathname } = useLocation();
  let pageName = pathNameToPageName(pathname);

  let introEnabled = useSelector(({ intros }) => intros[pageName]);
  let dispatch = useDispatch();

  console.log('selector:introEnabled', introEnabled);

  let onIntroExit = () => {
    // onExit will fire when the component is unmounted,
    // wich includes route changes; we can prevent the toggle action
    // from unintentionally re-enabling the tour here.
    // While intent would be clearer if we rewired the redux action
    // to take a parameter (on|off), it is also good to prevent
    // an unneccessary action, which would not explain itself to
    // someone viewing the action stream
    if (introEnabled) {
      dispatch(toggleIntro(pageName, false));
    }
  };

  // making the ready flag and the steps stateful ensures
  // that the child component will re-render with the new
  // params (which was not happening otherwise)
  let [ready, setReady] = useState(false);
  let [steps, setSteps] = useState(config.steps);

  // when either the wait flag or the enabled flag changes,
  // update the steps, then enable the intro
  useEffect(() => {
    if (!wait && introEnabled) {
      setSteps(filterSteps(config.steps));
      setReady(true);
    }
  }, [wait, introEnabled]);

  const props = {
    onIntroExit,
    initialStep: config.initialStep,
  };

  const isEnabled = ready && introEnabled;

  return <StepsWrapper {...props} steps={steps} enabled={isEnabled} />;
};

export default Intro;
