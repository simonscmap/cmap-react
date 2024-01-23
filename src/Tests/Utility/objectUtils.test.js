import * as objectUtils from '../../Utility/objectUtils';

describe('object utils', () => {
  test('gets value', () => {
    const r = objectUtils.safePath (['a', 'b']) ({ a: { b: 5 }});
    expect(r).toEqual(5);
  });

  test('returns undefined when there is no value or a bad path', () => {
    const r = objectUtils.safePath (['a', 'b']) ({ a: { c: 5 }});
    expect(r).toEqual(undefined);
  });

  test('returns undefined when invalid args are passed', () => {
    // no path array given
    const r = objectUtils.safePath (null) ({ a: { c: 5 }});
    expect(r).toEqual(undefined);

    // path array with members that are not strings
    const r2 = objectUtils.safePath (['a', 3]) ({ a: { c: 5 }});
    expect(r2).toEqual(undefined);

    // non-object passed
    const r3 = objectUtils.safePath (['a']) (42);
    expect(r3).toEqual(undefined);
  });

});
