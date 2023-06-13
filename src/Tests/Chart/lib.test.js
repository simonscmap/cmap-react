import { roundToDecimal } from '../../api/myLib';

describe('roundToDecimal', () => {
  test('conserves sign', () => {
    let r1 = roundToDecimal (2) (-0.8333);
    expect (r1).toEqual (-0.83);
  });
});
