import { local } from "../../Services/persist.js";
import * as React from "react";
import { connect } from "react-redux";
import { LOCAL_STORAGE_KEY_INTRO_STATE } from "../../constants.js";
import { disableIntro } from "../../Redux/actions/help.js";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import "../../Stylesheets/intro-custom.css";

let mapStateToProps = (state) => ({
  intros: state.intros,
});

let mapDispatchToProps = {
  disableIntro: disableIntro,
};

let disableIntroInLocalStorage = (pageName) => {
  let currentState = local.getObj(LOCAL_STORAGE_KEY_INTRO_STATE) || {};
  let newState = { ...currentState, [pageName]: false };
  return local.setObj(LOCAL_STORAGE_KEY_INTRO_STATE, newState);
};

const Intro = ({ pageName, config, intros, disableIntro }) => {
  let introEnabled = intros[pageName];

  let onIntroExit = () => {
    disableIntroInLocalStorage(pageName);
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
