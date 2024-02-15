// an audit report is an object with a top level key for each worksheet
// "data", "dataset_meta_data" and "vars_meta_data"

// each sheet is an array of rows with an item at the index of the row with errors

// earh row is an object with a key for each column with an error

export const flattenErrors = (auditSheet) => {
  const result = auditSheet.reduce((accRows, currRow, rowIndex) => {
    const keys = Object.keys(currRow);
    if (keys.length) {
      const rowErrors = keys.reduce((errors, currColKey) => {
        return errors.concat ({
          row: rowIndex,
          col: currColKey,
        });
      }, []);
      return accRows.concat (...rowErrors);
    } else {
      return accRows;
    }
  }, []);
  return result;
};
