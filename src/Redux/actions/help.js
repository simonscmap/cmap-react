export const helpActionTypes = {
  DISABLE_INTRO: 'DISABLE_INTRO',
  TOGGLE_HINTS: 'TOGGLE_HINTS',
};

export const disableIntro = (pageName) => ({
  type: helpActionTypes.DISABLE_INTRO,
  payload: pageName
});

export const toggleHints = (pageName) => ({
  type: helpActionTypes.TOGGLE_HINTS,
  payload: pageName
});
