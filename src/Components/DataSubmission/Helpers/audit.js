// an audit report is an object with a top level key for each worksheet
// "data", "dataset_meta_data" and "vars_meta_data"

// each sheet is an array of rows with an item at the index of the row with errors

// each row is an object with a key for each column with an error

export const flattenErrors = (auditSheet) => {
  const result = auditSheet.reduce((accRows, currRow, rowIndex) => {
    if (currRow) {
      const keys = Object.keys(currRow);
      if (keys.length > 0) {
        const rowErrors = keys.reduce((errors, currColKey) => {
          return errors.concat({
            row: rowIndex,
            col: currColKey,
          });
        }, []);
        return accRows.concat(...rowErrors);
      }
    }
    return accRows;
  }, []);
  return result;
};
