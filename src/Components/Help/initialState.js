// This module reads from local storage and provides
// initial state for intros and hints to the store
import { localStorageApi as local } from "../../Services/persist";
import {
  LOCAL_STORAGE_KEY_INTRO_STATE,
  LOCAL_STORAGE_KEY_HINTS_STATE,
  CATALOG_PAGE,
  VISUALIZATION_PAGE,
} from "../../constants.js";

// Intros
let introsDefault = {
  [CATALOG_PAGE]: false,
  [VISUALIZATION_PAGE]: false,
};

let introsLocal = local.get(LOCAL_STORAGE_KEY_INTRO_STATE);

if (introsLocal) {
  try {
    introsLocal = JSON.parse(introsLocal);
  } catch (e) {
    console.log(`failed to parse local storage for intro state`, introsLocal);
  }
}

// disable until feature is turned on
// export const localStorageIntroState = introsLocal || introsDefault;
export const localStorageIntroState = false;

// Hints
let hintsDefault = {
  [CATALOG_PAGE]: true,
  [VISUALIZATION_PAGE]: true,
};

let hintsLocal = local.get(LOCAL_STORAGE_KEY_HINTS_STATE);

if (hintsLocal) {
  try {
    hintsLocal = JSON.parse(hintsLocal);
  } catch (e) {
    console.log(`failed to parse local storage for hints state`, hintsLocal);
  }
}

// disable until feature is turned on
// export const localStorageHintState = hintsLocal || hintsDefault;
export const localStorageHintState = false;
