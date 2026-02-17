import { useEffect, useMemo } from 'react';

const useFieldValidation = ({
  fields,
  fieldErrors,
  fieldInteraction,
  errorRevealed,
  revealError,
  clearErrorRevealed,
  section,
  startField,
  endField,
  localValues,
  parseValue,
}) => {
  useEffect(() => {
    fields.forEach((field) => {
      let err = fieldErrors[field];
      let interaction = fieldInteraction[field];
      let revealed = errorRevealed[field];

      if (err && err.message) {
        let shouldReveal = !err.blurOnly || interaction === null || interaction === true;
        if (shouldReveal && !revealed) {
          revealError(section, field);
        }
      } else if (revealed) {
        clearErrorRevealed(section, field);
      }
    });
  }, [fields, fieldErrors, fieldInteraction, errorRevealed, revealError, clearErrorRevealed, section]);

  let fieldHasDisplayedError = (field) => {
    let err = fieldErrors[field];
    let revealed = errorRevealed[field];
    return err && err.message && (!err.blurOnly || revealed);
  };

  let displayErrors = useMemo(() => {
    let errors = [];
    fields.forEach((field) => {
      if (fieldHasDisplayedError(field)) {
        errors.push(fieldErrors[field].message);
      }
    });
    return errors;
  }, [fields, fieldErrors, errorRevealed]);

  let isRangeInverted = false;
  if (startField && endField && localValues && parseValue) {
    let startVal = parseValue(localValues[startField]);
    let endVal = parseValue(localValues[endField]);
    isRangeInverted = !isNaN(startVal) && !isNaN(endVal) && startVal > endVal;
  }

  let rangeInversionDisplayed = startField && fieldHasDisplayedError(startField) && isRangeInverted;

  let getFieldHasError = (field) => {
    if (field === startField || field === endField) {
      return fieldHasDisplayedError(field) || rangeInversionDisplayed;
    }
    return fieldHasDisplayedError(field);
  };

  return {
    displayErrors,
    fieldHasDisplayedError,
    getFieldHasError,
    isRangeInverted,
    rangeInversionDisplayed,
  };
};

export default useFieldValidation;
