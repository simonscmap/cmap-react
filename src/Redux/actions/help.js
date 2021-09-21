export const helpActionTypes = {
  DISABLE_INTRO: 'DISABLE_INTRO',
};

export const disableIntro = (pageName) => ({
  type: helpActionTypes.DISABLE_INTRO,
  payload: pageName
});
