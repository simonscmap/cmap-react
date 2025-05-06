import S from '../../../Utility/sanctuary';
import $ from 'sanctuary-def';
import dispatchCustomWindowEvent from '../../../Utility/Events/dispatchCustomWindowEvent';

export const getColIdFromCellClickEvent = (e) => {
  // 'event', 'originalTarget', 'attributes', 'col-id', 'value'
  let maybeColId = S.gets(S.is($.String))(['column', 'colId'])(e);

  let colId = S.fromMaybe('unknown')(maybeColId);

  return colId;
};

export const getVariableUMFromCellClickEvent = (e) => {
  let vum =
    e && e.node && e.node.data && e.node.data.Unstructured_Variable_Metadata;
  return vum;
};

export const getVariableUMFromParams = (params) => {
  let vum =
    params &&
    params.node &&
    params.node.data &&
    params.node.data.Unstructured_Variable_Metadata;
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
  comment: getCommentFromCellClickEvent(e),
  unstructuredMetadata: getVariableUMFromCellClickEvent(e),
  longName: getLongNameFromCellClickEvent(e),
});

const dispatchCustomEvent = (eventName) => (payload) => {
  dispatchCustomWindowEvent(eventName, payload);
};

export const dispatchVariableFocusEvent = (payload) => {
  dispatchCustomEvent('setFocusEvent')(payload);
};

export const dispatchCustomVariablesTableModel = (payload) => {
  dispatchCustomEvent('variablesTableModel')(payload);
};

export const dispatchClearFocusEvent = (payload) => {
  dispatchCustomEvent('clearFocusEvent')(payload);
};

export const processVUM = (data) => {
  if (typeof data !== 'string') {
    console.warn('expected type string for variable unstructured metadata');
    return null;
  }

  let parsedData;

  try {
    parsedData = JSON.parse(`${data}`);
  } catch (e) {
    console.error('error parsing unstructured metadata', data);
  }

  if (parsedData) {
    return parsedData;
  }

  return null;
};

export const zip = (a, b) => {
  if (!a || !b) {
    console.error('malformed', a, b);
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
  const httpRegx =
    /\b(https?:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;()]*[\-A-Za-z0-9+&@#\/%=~_|]|ftp:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;()]*[\-A-Za-z0-9+&@#\/%=~_|])/;

  let result = httpRegx.test(str);
  return result;
};
