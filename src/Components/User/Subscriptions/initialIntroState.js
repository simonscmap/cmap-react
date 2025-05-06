import { localStorageApi as local } from '../../../Services/persist';

const localStorageValue = local.get('subscribeIntroActive');
const subscribeIntroActive =
  localStorageValue === 'true'
    ? true
    : localStorageValue === 'false'
      ? false
      : true; // if not set, default to true

const state = {
  subscribeIntroActive,
};

export default state;
