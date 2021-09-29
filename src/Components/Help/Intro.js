import * as React from "react";
import { connect } from "react-redux";
import { LOCAL_STORAGE_KEY_INTRO_STATE } from "../../constants.js";
import { disableIntro, helpActionTypes } from "../../Redux/actions/help.js";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import "../../Stylesheets/intro-custom.css";
import { persistenceService } from '../../Services/persist';

persistenceService.add({
  actionType: helpActionTypes.DISABLE_INTRO,
  key: LOCAL_STORAGE_KEY_INTRO_STATE,
  payloadToValue: (currentState, payload) => {
    let oldState = currentState || {};
    return {
      ...oldState,
      [payload]: false
    }
  },
  // TODO
  localToDispatch: () => { },
});

let mapStateToProps = (state) => ({
  intros: state.intros,
});

let mapDispatchToProps = {
  disableIntro: disableIntro,
};

const Intro = ({ pageName, config, intros, disableIntro }) => {
  // TODO: wire up the intro state to controls in nav bar
  // initial state should be disabled
  // local storage will now help remember is user wants intro turned on
  let introEnabled = intros[pageName];

  let onIntroExit = () => {
    // disableIntroInLocalStorage(pageName);

    // NOTE this should now persist in local via the persistence service
    disableIntro(pageName);
  };

  return (
    <Steps
      enabled={introEnabled}
      steps={config.steps}
      initialStep={config.initialStep}
      onExit={onIntroExit}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Intro);
