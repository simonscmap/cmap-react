import * as React from 'react';
import { toggleIntro } from '../../Redux/actions/help.js';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { pathNameToPageName } from '../../Utility/routing.js';

// This component wraps the react implementation of intro-js steps
// See https://github.com/HiDeoo/intro.js-react

// TODO automatically load the correct config for the current page
// do not depend on injecting props
const Intro = ({ config }) => {
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
      dispatch(toggleIntro(pageName));
    }
  };

  let [ref, setRef] = React.useState(undefined);

  // trigger a mouse click on the help menu to open it
  // this ends up not working with intro-js, the menu closes as the step renders
  /* const clickHelp = () => {
   *   let el = document.querySelector('button#nav-help-toggle-button');
   *   console.log(el);
   *   el.dispatchEvent(
   *     new MouseEvent('click', {
   *       view: window,
   *       bubbles: true,
   *       cancelable: true,
   *       buttons: 1,
   *     }),
   *   );
   *   ref.updateStepElement(8);
   * };
   */
  return (
    <Steps
      enabled={introEnabled}
      steps={config.steps}
      initialStep={config.initialStep}
      onExit={onIntroExit}
      ref={(steps) => setRef(steps)}
      onBeforeChange={(stepIndex) => {
        if (stepIndex >= config.steps.length) {
          return;
        }
        if (ref) {
          ref.updateStepElement(stepIndex);
        }
      }}
    />
  );
};

export default Intro;
