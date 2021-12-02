import React, { useState, useEffect } from 'react';
import { toggleIntro } from '../../Redux/actions/help.js';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { pathNameToPageName } from '../../Utility/routing.js';
import { elementIsReady } from '../../Utility/domHelpers';

// TODO automatically load the correct config for the current page
// do not depend on injecting props

const filterSteps = (steps) => steps.filter(elementIsReady);

const Intro = ({ config, wait }) => {
  let { pathname } = useLocation();
  let pageName = pathNameToPageName(pathname);

  let introEnabled = useSelector(({ intros }) => intros[pageName]);
  let dispatch = useDispatch();

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
    } else if (!introEnabled) {
      // resetting this to false is important for ensuring that re-running the intro will
      // get a refreshed array of steps
      setReady(false);
    }
  }, [wait, introEnabled]);

  const isEnabled = ready && introEnabled;

  return (
    isEnabled && (
      <Steps
        enabled={isEnabled}
        steps={steps}
        initialStep={config.initialStep}
        onExit={onIntroExit}
      />
    )
  );
};

export default Intro;
