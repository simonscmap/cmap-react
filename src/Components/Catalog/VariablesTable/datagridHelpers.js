import S from '../../../Utility/sanctuary';
import $ from 'sanctuary-def';
import dispatchCustomWindowEvent from '../../../Utility/Events/dispatchCustomWindowEvent';

export const getColIdFromCellClickEvent = (e) => {
  // 'event', 'originalTarget', 'attributes', 'col-id', 'value'
  let maybeColId = S.gets(S.is($.String))([
    'column', 'colId'
  ])(e);

  let colId = S.fromMaybe('unknown')(maybeColId);

  return colId;
};

export const getVariableUMFromCellClickEvent = (e) => {
  let maybeVum = S.gets(S.is($.String))(['node', 'data', 'Unstructured_Variable_Metadata'])(e);
  let vum = S.fromMaybe('unknown')(maybeVum);
  return vum;
};

export const getVariableUMFromParams = (params) => {
  let maybeVum = S.gets(S.is($.String))(['node', 'data', 'Unstructured_Variable_Metadata'])(params);
  let vum = S.fromMaybe('unknown')(maybeVum);
  return vum;
};

export const getLongNameFromCellClickEvent = (e) => {
  let maybeLongName = S.gets(S.is($.String))(['node', 'data', 'Long_Name'])(e);
  let longName = S.fromMaybe('unknown')(maybeLongName);
  return longName;
};

export const getCommentFromCellClickEvent = (e) => {
  let maybeComment = S.gets(S.is($.String))(['node', 'data', 'Comment'])(e);
  let comment = S.fromMaybe('unknown')(maybeComment);
  return comment;
};

export const makeVariableFocusPayload = (e) => ({
  comment: getCommentFromCellClickEvent (e),
  unstructuredMetadata: getVariableUMFromCellClickEvent (e),
  longName: getLongNameFromCellClickEvent (e)
});

const dispatchCustomEvent = (eventName) => (payload) => {
  dispatchCustomWindowEvent(eventName, payload);
};

export const dispatchVariableFocusEvent = (payload) => {
  dispatchCustomEvent ("setFocusEvent") (payload);
}

export const dispatchCustomVariablesTableModel = (payload) => {
  dispatchCustomEvent ("variablesTableModel") (payload);
};

export const dispatchClearFocusEvent = (payload) => {
  dispatchCustomEvent ("clearFocusEvent") (payload);
};


export const processVUM = (data) => {
  if (typeof data !== 'string') {
    console.warn('expected type string for variable unstructured metadata');
    return null;
  }

  let parsedData;

  try {
    // the unstructured matadata associated with a variable is the comma separated list of JSON objects
    // that SQL returns for a variable row; here we wrap that stringified resoponse in brakcets to coerce
    // it into a JSON-parseable array.
    parsedData = JSON.parse(`[${data}]`);
  } catch (e) {
    // couldn't parse
    console.error('error parsing unstructured metadata', data);
  }

  if (parsedData) {
    return parsedData;
  }

  return null;
};

export const zip = (a, b) => {
  if (!a || !b) {
    console.error ('malformed', a, b);
    return [];
  }
  if (a.length !== b.length) {
    return [];
  }

  let items = [];

  for (let k = 0; k < a.length; k++) {
    items.push([a[k], b[k]]);
  }

  return items;
};

export const isStringURL = (str) => {
  if (typeof str !== 'string') {
    return false;
  }
  const httpRegx = /\b(https?:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;()]*[\-A-Za-z0-9+&@#\/%=~_|]|ftp:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;()]*[\-A-Za-z0-9+&@#\/%=~_|])/;


  let result = httpRegx.test (str);
  return result;
}
