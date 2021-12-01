export const helpActionTypes = {
  TOGGLE_INTRO: 'TOGGLE_INTRO',
  TOGGLE_HINTS: 'TOGGLE_HINTS',
};

export const toggleIntro = (pageName, value) => ({
  type: helpActionTypes.TOGGLE_INTRO,
  payload: { pageName, value },
});

export const toggleHints = (pageName) => ({
  type: helpActionTypes.TOGGLE_HINTS,
  payload: pageName,
});
