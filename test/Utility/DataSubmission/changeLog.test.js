import {
  isValidChangeEventDefinition,
  getChangeForCell,
} from '../../../Components/DataSubmission/Helpers/changeLog';

describe ('isValidChangeEventDefinition', () => {
  test ('correctly tests a valid object', () => {
    const cev1 = { row: 0, col: 'shortName', sheet: 'data'};
    const result1 = isValidChangeEventDefinition (cev1);
    expect (result1).toEqual(true);
  });
  test ('correctly tests an invalid object', () => {
    const cev1 = { row: null, col: 'shortName', sheet: 'data'};
    const result1 = isValidChangeEventDefinition (cev1);
    expect (result1).toEqual(false);
  });
});


describe ('getChangeForCell', () => {
  test ('gets original and current values for cell', () => {
    const base = { row: 1, col: 't', sheet: 'data' };
    const log = [
      {...base, old: 'one', val: 'two' },
      {...base, old: 'two', val: 'three' },
      {...base, old: 'three', val: 'four' },
      {...base, old: 'four', val: 'five' },
    ];
    const cell = { row: 1, col: 't', sheet: 'data'}
    const result = getChangeForCell (log, cell);

    expect (result.original).toEqual ('one');
    expect (result.current).toEqual ('five');
  });


  test ('correctly filters out non-matching events', () => {
    const base = { row: 1, col: 't', sheet: 'data' };
    const log = [
      {...base, old: 'one', val: 'two' },
      {...base, old: 'two', val: 'three' },
      {...base, old: 'three', val: 'four' },
      {...base, old: 'four', val: 'five', sheet: 'blah' }, // different sheet
    ];
    const cell = { row: 1, col: 't', sheet: 'data'}
    const result = getChangeForCell (log, cell);

    expect (result.original).toEqual ('one');
    expect (result.current).toEqual ('four');
  });


  test ('correctly handles single change event', () => {
    const base = { row: 1, col: 't', sheet: 'data' };
    const log = [
      {...base, old: 'one', val: 'two' },
    ];
    const cell = { row: 1, col: 't', sheet: 'data'}
    const result = getChangeForCell (log, cell);

    expect (result.original).toEqual ('one');
    expect (result.current).toEqual ('two');
  });

  test ('correctly handles undone change', () => {
    const base = { row: 1, col: 't', sheet: 'data' };
    const log = [
      {...base, old: 'one', val: 'two' },
      {...base, old: 'two', val: 'one' },
    ];
    const cell = { row: 1, col: 't', sheet: 'data'}
    const result = getChangeForCell (log, cell);

    expect (result).toEqual (undefined);
  });

  test ('correctly handles empty value', () => {
    const base = { row: 1, col: 't', sheet: 'data' };
    const log = [
      {...base, old: '', val: '' },
    ];
    const cell = { row: 1, col: 't', sheet: 'data'}
    const result = getChangeForCell (log, cell);

    // should be no change
    expect (result).toEqual (undefined);
  });
});
