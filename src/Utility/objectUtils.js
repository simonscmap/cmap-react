// fast check that value is integer
// https://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
function isInt(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
}

export const safePath = (path) => (obj) => {
  if (!Array.isArray(path)) {
    return undefined;
  }
  if (!path.every(item => typeof item === 'string' || isInt (item))) {
    return undefined;
  }
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }

  // reduce down the path, starting with the full object as the accumulator
  // as soon as it cannot read a property it will start returning undefined
  const maybeValueAtPath = path.reduce ((acc, cur) => {
    if (!acc) {
      return acc;
    }
    let result;
    try {
      result = acc[cur];
    } catch (e) {
      console.log (`cannot read property ${cur} from ${acc}`);
    }
    return result;
  }, obj);

  return maybeValueAtPath;
}

export const safePathOr = (defaultValue) => (pred) => (path) => (obj) => {
  const result = safePath (path) (obj);
  if (pred(result)) {
    return result;
  } else {
    return defaultValue;
  }
}

export const pick = (arg) => (obj) => {
  if (!Array.isArray (arg)) {
    return obj;
  }

  let result = {};
  arg.forEach ((key) => {
    let path = Array.isArray (key) ? key : [key];
    result[path.join('.')] = safePath (path) (obj);
  })
  return result;
}
