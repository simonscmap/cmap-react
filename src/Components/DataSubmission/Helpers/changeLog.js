export const isValidChangeEventDefinition = (cev) => {
  if (typeof cev !== 'object') {
    return false;
  }
  const props = ['row', 'col', 'sheet'];
  const types = ['number', 'string', 'string'];

  return props.reduce ((acc, curr, idx) => {
    if (!acc) {
      return false;
    }
    if (cev.hasOwnProperty (curr)) {
      if (typeof cev[curr] === types[idx]) {
        return true;
      }
    }
    return false;
  }, true);
}

export const getChangeForCell = (log, cevDef) => {
  if (!isValidChangeEventDefinition (cevDef)) {
    return undefined;
  }

  const { row, col, sheet } = cevDef;

  const relevantChanges = log.filter ((cev) =>
    cev.row === row && cev.col === col && cev.sheet === sheet);

  if (relevantChanges.length === 0) {
    return undefined;
  }

  const firstCev = relevantChanges[0];
  const lastCev = relevantChanges[relevantChanges.length - 1];

  const originalValue = firstCev.old;
  const currentValue = lastCev.val;

  if (originalValue === currentValue) {
    return undefined;
  }

  return {
    original: originalValue,
    current: currentValue,
  };
}
