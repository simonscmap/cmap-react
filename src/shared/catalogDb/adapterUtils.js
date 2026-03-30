import { getSearchDatabaseApi } from '../../features/catalogSearch/api';

let parseCommaSeparatedField = function (value) {
  if (!value || typeof value !== 'string') {
    return [];
  }
  return value
    .split(',')
    .map(function (item) { return item.trim(); })
    .filter(Boolean);
};

let filterValidNames = function (names) {
  if (!names || names.length === 0) {
    return [];
  }
  return names.filter(
    function (name) { return name !== undefined && name !== null && name !== ''; },
  );
};

let buildPlaceholders = function (count) {
  let placeholders = [];
  for (let i = 0; i < count; i++) {
    placeholders.push('?');
  }
  return placeholders.join(', ');
};

let executeQuery = async function (sql, bindings) {
  let api = getSearchDatabaseApi();
  return await api.executeSql(sql, bindings);
};

export {
  parseCommaSeparatedField,
  filterValidNames,
  buildPlaceholders,
  executeQuery,
};
