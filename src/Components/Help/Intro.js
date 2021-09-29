import * as React from "react";
import { connect } from "react-redux";
import { LOCAL_STORAGE_KEY_INTRO_STATE } from "../../constants.js";
import { toggleIntro, helpActionTypes } from "../../Redux/actions/help.js";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import "../../Stylesheets/intro-custom.css";
import { persistenceService } from '../../Services/persist';
import { localStorageIntroState } from '../Help/initialState';

persistenceService.add({
  actionType: helpActionTypes.TOGGLE_INTRO,
  key: LOCAL_STORAGE_KEY_INTRO_STATE,
  payloadToValue: (currentState, payload) => {
    let oldState;
    // if no state is set
    if (!currentState) {
      oldState = localStorageIntroState;
    } else {
      // if there is state from local storage,
      // we need to parse it, because it is stored as a string
      try {
        oldState = JSON.parse(currentState);
      } catch (e) {
        console.log(`failed to parse intro state from local storage`);
        // if we fail to parse, assume default
        oldState = localStorageIntroState;
      }
    }
    let newState = Object.assign({}, oldState, {
      [payload]: !oldState[payload],
    });
    return newState
  },
  // TODO
  localToDispatch: () => { },
});

let mapStateToProps = (state) => ({
  intros: state.intros,
});

let mapDispatchToProps = {
  toggleIntro: toggleIntro,
};

const Intro = ({ pageName, config, intros, toggleIntro }) => {
  // TODO: wire up the intro state to controls in nav bar
  let introEnabled = intros[pageName];

  let onIntroExit = () => {
    toggleIntro(pageName);
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
