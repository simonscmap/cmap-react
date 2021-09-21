// This module reads from local storage and provides
// initial state for intros and hints to the store
import { local } from "../../Services/persist.js";
import {
  LOCAL_STORAGE_KEY_INTRO_STATE,
  LOCAL_STORAGE_KEY_HINT_STATE,
  CATALOG_PAGE,
  VISUALIZATION_PAGE,
} from "../../constants.js";

let introsDefault = {
  [CATALOG_PAGE]: true,
  [VISUALIZATION_PAGE]: true,
};

let hintsDefault = {
  [CATALOG_PAGE]: true,
  [VISUALIZATION_PAGE]: true,
};

export const localStorageIntroState =
  local.get(LOCAL_STORAGE_KEY_INTRO_STATE) || introsDefault;
export const localStorageHintState =
  local.get(LOCAL_STORAGE_KEY_HINT_STATE) || hintsDefault;
