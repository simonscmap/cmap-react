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


  // tour configurations can optionally pass an onBeforeChange function
  // which is executed in this wrapper, and passed the nextStepIndex;
  // the onBeforeChange function can return a single action, which will be dispatched
  // before the next step fires;
  // this can be used to manipulate the UI in between steps

  let makeBeforeChangeCallback = (context) => (nextStepIndex) => {
    if (config.onBeforeChange) {
      // enclose context
      let action = config.onBeforeChange(context)(nextStepIndex);
      if (action) {
        dispatch(action());
      }
    }
    // return nothing;
    // returning false will stop the intro from advancing to the next step
  };
  let beforeChangeContext = { steps };
  let beforeChange = makeBeforeChangeCallback(beforeChangeContext);

  // when either the wait flag or the enabled flag changes,
  // update the steps, then enable the intro
  useEffect(() => {
    if (!wait && introEnabled) {
      // this timout is no-good, very-bad way of letting ui components reset themselves
      // in response to the introEnabled flag, prior to calling the filterSteps function
      // here; otherwise the filter steps will filter out ui components that are not fully
      // in the viewport. We still want the filter, but we want it to run after we've reset
      // the ui as much as possible.
      setTimeout(() => {
        setSteps(filterSteps(config.steps));
        setReady(true);
      }, 50);
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
        onBeforeChange={beforeChange}
      />
    )
  );
};

export default Intro;
