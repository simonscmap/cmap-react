import isIsoDate from '../../../Utility/Time/isISO';

describe('correctly identifies valid iso date', () => {
  test('test valid date', () => {
    let isValid = isIsoDate ((new Date()).toISOString());
    expect(isValid).toEqual(true);

    let isValid2 = isIsoDate ('2023-05-20T12:00:00.000Z');
    expect(isValid2).toEqual(true);
  });

  //
  test('test invalid date', () => {
    let isValid = isIsoDate ('nope');
    expect(isValid).toEqual(false);
  });
  test('test invalid date', () => {
    // missing seconds
    let isValid = isIsoDate ('2023-05-20T00:00.000Z');
    expect(isValid).toEqual(false);

    // mismatched Z and missing terms
    let isValid2 = isIsoDate ('2023-05-02TZ:00.000Z');
    expect(isValid2).toEqual(false);

    // mismatched T and Z and missing terms
    let isValid3 = isIsoDate ('T00Z:00.000Z');
    expect(isValid3).toEqual(false);
  });
});
