export const helpActionTypes = {
  TOGGLE_INTRO: 'TOGGLE_INTRO',
  TOGGLE_HINTS: 'TOGGLE_HINTS',
};

export const toggleIntro = (pageName) => ({
  type: helpActionTypes.TOGGLE_INTRO,
  payload: pageName
});

export const toggleHints = (pageName) => ({
  type: helpActionTypes.TOGGLE_HINTS,
  payload: pageName
});
