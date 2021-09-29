import short from 'short-uuid';

const translator = short();
export const generateShortId = () => {
  return translator.new();
};
