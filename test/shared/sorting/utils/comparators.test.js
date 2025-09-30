import {
  stringComparator,
  numberComparator,
  percentComparator,
  dateComparator,
  customComparator,
} from '../../../../src/shared/sorting/utils/comparators';

// T007: String Comparator Tests
describe('stringComparator', () => {
  describe('ascending order', () => {
    it('should sort strings in ascending alphabetical order', () => {
      expect(stringComparator('apple', 'banana')).toBeLessThan(0);
      expect(stringComparator('banana', 'apple')).toBeGreaterThan(0);
      expect(stringComparator('apple', 'apple')).toBe(0);
    });
  });

  describe('descending order', () => {
    it('should sort strings in descending order when result is negated', () => {
      expect(-stringComparator('apple', 'banana')).toBeGreaterThan(0);
      expect(-stringComparator('banana', 'apple')).toBeLessThan(0);
    });
  });

  describe('case-insensitive comparison', () => {
    it('should treat uppercase and lowercase as equal', () => {
      expect(stringComparator('Apple', 'apple')).toBe(0);
      expect(stringComparator('BANANA', 'banana')).toBe(0);
      expect(stringComparator('MiXeD', 'mixed')).toBe(0);
    });

    it('should sort case-insensitively', () => {
      expect(stringComparator('Apple', 'Banana')).toBeLessThan(0);
      expect(stringComparator('BANANA', 'APPLE')).toBeGreaterThan(0);
    });
  });

  describe('locale-aware comparison', () => {
    it('should handle numeric strings naturally', () => {
      expect(stringComparator('item2', 'item10')).toBeLessThan(0);
      expect(stringComparator('item10', 'item2')).toBeGreaterThan(0);
      expect(stringComparator('file1', 'file10')).toBeLessThan(0);
    });

    it('should sort strings with numbers correctly', () => {
      const arr = ['item10', 'item2', 'item1', 'item20'];
      arr.sort(stringComparator);
      expect(arr).toEqual(['item1', 'item2', 'item10', 'item20']);
    });
  });

  describe('empty strings', () => {
    it('should handle empty strings', () => {
      expect(stringComparator('', '')).toBe(0);
      expect(stringComparator('', 'apple')).toBeLessThan(0);
      expect(stringComparator('apple', '')).toBeGreaterThan(0);
    });
  });

  describe('special characters', () => {
    it('should sort special characters', () => {
      expect(stringComparator('!', '@')).toBeLessThan(0);
      expect(stringComparator('@', '!')).toBeGreaterThan(0);
      expect(stringComparator('hello!', 'hello@')).toBeLessThan(0);
    });

    it('should handle strings with spaces', () => {
      expect(stringComparator('hello world', 'hello')).toBeGreaterThan(0);
      expect(stringComparator('a b', 'ab')).toBeLessThan(0);
    });
  });

  describe('null and undefined handling', () => {
    it('should handle null values (sort to end)', () => {
      expect(stringComparator(null, null)).toBe(0);
      expect(stringComparator(null, 'apple')).toBeGreaterThan(0);
      expect(stringComparator('apple', null)).toBeLessThan(0);
    });

    it('should handle undefined values (sort to end)', () => {
      expect(stringComparator(undefined, undefined)).toBe(0);
      expect(stringComparator(undefined, 'apple')).toBeGreaterThan(0);
      expect(stringComparator('apple', undefined)).toBeLessThan(0);
    });

    it('should treat null and undefined as equal', () => {
      expect(stringComparator(null, undefined)).toBe(0);
      expect(stringComparator(undefined, null)).toBe(0);
    });
  });
});

describe('numberComparator', () => {
  describe('positive numbers', () => {
    it('should sort positive integers in ascending order', () => {
      expect(numberComparator(5, 10)).toBeLessThan(0);
      expect(numberComparator(10, 5)).toBeGreaterThan(0);
      expect(numberComparator(10, 10)).toBe(0);
    });

    it('should handle large positive numbers', () => {
      expect(numberComparator(1000000, 2000000)).toBeLessThan(0);
      expect(numberComparator(2000000, 1000000)).toBeGreaterThan(0);
    });
  });

  describe('negative numbers', () => {
    it('should sort negative integers correctly', () => {
      expect(numberComparator(-5, -10)).toBeGreaterThan(0);
      expect(numberComparator(-10, -5)).toBeLessThan(0);
      expect(numberComparator(-10, -10)).toBe(0);
    });

    it('should sort negative numbers before positive numbers', () => {
      expect(numberComparator(-5, 5)).toBeLessThan(0);
      expect(numberComparator(5, -5)).toBeGreaterThan(0);
    });

    it('should handle mixed positive and negative numbers', () => {
      expect(numberComparator(-100, 50)).toBeLessThan(0);
      expect(numberComparator(50, -100)).toBeGreaterThan(0);
    });
  });

  describe('decimal numbers', () => {
    it('should sort decimal numbers correctly', () => {
      expect(numberComparator(1.5, 2.5)).toBeLessThan(0);
      expect(numberComparator(2.5, 1.5)).toBeGreaterThan(0);
      expect(numberComparator(1.5, 1.5)).toBe(0);
    });

    it('should handle very small decimal differences', () => {
      expect(numberComparator(1.001, 1.002)).toBeLessThan(0);
      expect(numberComparator(1.002, 1.001)).toBeGreaterThan(0);
    });

    it('should sort negative decimals correctly', () => {
      expect(numberComparator(-1.5, -2.5)).toBeGreaterThan(0);
      expect(numberComparator(-2.5, -1.5)).toBeLessThan(0);
    });

    it('should handle decimals with many places', () => {
      expect(numberComparator(3.14159, 3.1416)).toBeLessThan(0);
      expect(numberComparator(3.1416, 3.14159)).toBeGreaterThan(0);
    });
  });

  describe('zero', () => {
    it('should handle zero correctly', () => {
      expect(numberComparator(0, 0)).toBe(0);
      expect(numberComparator(0, 5)).toBeLessThan(0);
      expect(numberComparator(5, 0)).toBeGreaterThan(0);
    });

    it('should treat positive and negative zero as equal', () => {
      expect(numberComparator(0, -0)).toBe(0);
      expect(numberComparator(-0, 0)).toBe(0);
    });

    it('should sort zero between negative and positive numbers', () => {
      expect(numberComparator(-5, 0)).toBeLessThan(0);
      expect(numberComparator(0, -5)).toBeGreaterThan(0);
      expect(numberComparator(0, 5)).toBeLessThan(0);
      expect(numberComparator(5, 0)).toBeGreaterThan(0);
    });
  });

  describe('string numbers (coercion)', () => {
    it('should coerce string numbers to numeric values', () => {
      expect(numberComparator('5', '10')).toBeLessThan(0);
      expect(numberComparator('10', '5')).toBeGreaterThan(0);
      expect(numberComparator('10', '10')).toBe(0);
    });

    it('should handle mixed string and numeric inputs', () => {
      expect(numberComparator('5', 10)).toBeLessThan(0);
      expect(numberComparator(10, '5')).toBeGreaterThan(0);
      expect(numberComparator('10', 10)).toBe(0);
    });

    it('should coerce string decimals correctly', () => {
      expect(numberComparator('1.5', '2.5')).toBeLessThan(0);
      expect(numberComparator('2.5', '1.5')).toBeGreaterThan(0);
    });

    it('should coerce string negative numbers correctly', () => {
      expect(numberComparator('-5', '-10')).toBeGreaterThan(0);
      expect(numberComparator('-10', '-5')).toBeLessThan(0);
    });

    it('should handle string zero', () => {
      expect(numberComparator('0', 0)).toBe(0);
      expect(numberComparator('0', '5')).toBeLessThan(0);
      expect(numberComparator('5', '0')).toBeGreaterThan(0);
    });

    it('should handle strings with whitespace', () => {
      expect(numberComparator('  5  ', '  10  ')).toBeLessThan(0);
      expect(numberComparator('10', '  5  ')).toBeGreaterThan(0);
    });

    it('should handle non-numeric strings (NaN cases)', () => {
      // Non-numeric strings become NaN, which should sort to the end
      expect(numberComparator('abc', 'def')).toBe(0); // Both NaN
      expect(numberComparator('abc', 10)).toBeGreaterThan(0); // NaN sorts after numbers
      expect(numberComparator(10, 'abc')).toBeLessThan(0); // Numbers sort before NaN
    });
  });

  describe('null and undefined handling', () => {
    it('should handle null values (sort to end)', () => {
      expect(numberComparator(null, null)).toBe(0);
      expect(numberComparator(null, 5)).toBeGreaterThan(0); // null sorts after numbers
      expect(numberComparator(5, null)).toBeLessThan(0); // numbers sort before null
    });

    it('should handle undefined values (sort to end)', () => {
      expect(numberComparator(undefined, undefined)).toBe(0);
      expect(numberComparator(undefined, 5)).toBeGreaterThan(0); // undefined sorts after numbers
      expect(numberComparator(5, undefined)).toBeLessThan(0); // numbers sort before undefined
    });

    it('should treat null and undefined as equal', () => {
      expect(numberComparator(null, undefined)).toBe(0);
      expect(numberComparator(undefined, null)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle Infinity', () => {
      expect(numberComparator(Infinity, 1000)).toBeGreaterThan(0);
      expect(numberComparator(1000, Infinity)).toBeLessThan(0);
      expect(numberComparator(Infinity, Infinity)).toBe(0);
    });

    it('should handle -Infinity', () => {
      expect(numberComparator(-Infinity, -1000)).toBeLessThan(0);
      expect(numberComparator(-1000, -Infinity)).toBeGreaterThan(0);
      expect(numberComparator(-Infinity, -Infinity)).toBe(0);
    });

    it('should sort -Infinity before Infinity', () => {
      expect(numberComparator(-Infinity, Infinity)).toBeLessThan(0);
      expect(numberComparator(Infinity, -Infinity)).toBeGreaterThan(0);
    });

    it('should handle very large numbers', () => {
      expect(
        numberComparator(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 1),
      ).toBeGreaterThan(0);
      expect(
        numberComparator(Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER),
      ).toBeLessThan(0);
    });

    it('should handle very small numbers', () => {
      expect(
        numberComparator(Number.MIN_VALUE, Number.MIN_VALUE * 2),
      ).toBeLessThan(0);
      expect(
        numberComparator(Number.MIN_VALUE * 2, Number.MIN_VALUE),
      ).toBeGreaterThan(0);
    });
  });

  describe('sorting arrays', () => {
    it('should correctly sort an array of positive integers', () => {
      const arr = [5, 2, 8, 1, 9];
      arr.sort(numberComparator);
      expect(arr).toEqual([1, 2, 5, 8, 9]);
    });

    it('should correctly sort an array with negative numbers', () => {
      const arr = [5, -2, 8, -1, 0];
      arr.sort(numberComparator);
      expect(arr).toEqual([-2, -1, 0, 5, 8]);
    });

    it('should correctly sort an array with decimals', () => {
      const arr = [1.5, 2.1, 0.5, 1.9, 1.2];
      arr.sort(numberComparator);
      expect(arr).toEqual([0.5, 1.2, 1.5, 1.9, 2.1]);
    });

    it('should correctly sort an array of string numbers', () => {
      const arr = ['5', '2', '10', '1', '20'];
      arr.sort(numberComparator);
      expect(arr).toEqual(['1', '2', '5', '10', '20']);
    });

    it('should correctly sort an array with mixed types', () => {
      const arr = [5, '2', 10, '1', 0, null, 'abc', undefined];
      arr.sort(numberComparator);
      // Numbers first (ascending), then NaN values, then null/undefined
      expect(arr[0]).toBe('1');
      expect(arr[1]).toBe('2');
      expect(arr[2]).toBe(0);
      expect(arr[3]).toBe(5);
      expect(arr[4]).toBe(10);
      // Last three should be 'abc' (NaN), null, and undefined
      expect(['abc', null, undefined]).toContain(arr[5]);
      expect([null, undefined]).toContain(arr[6]);
      expect([null, undefined]).toContain(arr[7]);
    });
  });
});

// T009: Percent Comparator Tests
describe('percentComparator', () => {
  describe('parsing percentage strings', () => {
    it('should correctly compare "95%" vs "87%"', () => {
      const result = percentComparator('95%', '87%');
      expect(result).toBeGreaterThan(0); // 95 > 87
    });

    it('should correctly compare "87%" vs "95%"', () => {
      const result = percentComparator('87%', '95%');
      expect(result).toBeLessThan(0); // 87 < 95
    });

    it('should return 0 for equal percentage strings', () => {
      const result = percentComparator('50%', '50%');
      expect(result).toBe(0);
    });

    it('should parse percentage values correctly', () => {
      expect(percentComparator('100%', '99%')).toBeGreaterThan(0);
      expect(percentComparator('1%', '2%')).toBeLessThan(0);
    });
  });

  describe('whole number percentages', () => {
    it('should handle whole number percentages', () => {
      const result1 = percentComparator('100%', '50%');
      expect(result1).toBeGreaterThan(0); // 100 > 50

      const result2 = percentComparator('25%', '75%');
      expect(result2).toBeLessThan(0); // 25 < 75
    });

    it('should handle single digit percentages', () => {
      const result = percentComparator('5%', '9%');
      expect(result).toBeLessThan(0); // 5 < 9
    });

    it('should handle three digit percentages', () => {
      const result = percentComparator('150%', '200%');
      expect(result).toBeLessThan(0); // 150 < 200
    });

    it('should compare whole number percentages correctly', () => {
      expect(percentComparator('10%', '20%')).toBeLessThan(0);
      expect(percentComparator('90%', '80%')).toBeGreaterThan(0);
      expect(percentComparator('50%', '50%')).toBe(0);
    });
  });

  describe('decimal percentages', () => {
    it('should correctly compare decimal percentages like "95.5%"', () => {
      const result = percentComparator('95.5%', '95%');
      expect(result).toBeGreaterThan(0); // 95.5 > 95
    });

    it('should handle multiple decimal places', () => {
      const result1 = percentComparator('87.25%', '87.5%');
      expect(result1).toBeLessThan(0); // 87.25 < 87.5

      const result2 = percentComparator('99.999%', '99.99%');
      expect(result2).toBeGreaterThan(0); // 99.999 > 99.99
    });

    it('should compare decimal with whole number percentage', () => {
      const result1 = percentComparator('50.1%', '51%');
      expect(result1).toBeLessThan(0); // 50.1 < 51

      const result2 = percentComparator('50.9%', '50%');
      expect(result2).toBeGreaterThan(0); // 50.9 > 50
    });

    it('should handle decimal percentages with trailing zeros', () => {
      const result = percentComparator('50.0%', '50%');
      expect(result).toBe(0); // 50.0 === 50
    });

    it('should handle very precise decimal percentages', () => {
      expect(percentComparator('33.333%', '33.334%')).toBeLessThan(0);
      expect(percentComparator('66.667%', '66.666%')).toBeGreaterThan(0);
    });
  });

  describe('edge cases (0%, 100%)', () => {
    it('should handle 0%', () => {
      const result1 = percentComparator('0%', '50%');
      expect(result1).toBeLessThan(0); // 0 < 50

      const result2 = percentComparator('50%', '0%');
      expect(result2).toBeGreaterThan(0); // 50 > 0

      const result3 = percentComparator('0%', '0%');
      expect(result3).toBe(0); // 0 === 0
    });

    it('should handle 100%', () => {
      const result1 = percentComparator('100%', '50%');
      expect(result1).toBeGreaterThan(0); // 100 > 50

      const result2 = percentComparator('50%', '100%');
      expect(result2).toBeLessThan(0); // 50 < 100

      const result3 = percentComparator('100%', '100%');
      expect(result3).toBe(0); // 100 === 100
    });

    it('should handle 0% as minimum edge case', () => {
      expect(percentComparator('0%', '1%')).toBeLessThan(0);
      expect(percentComparator('0%', '0.1%')).toBeLessThan(0);
    });

    it('should handle 100% as typical maximum', () => {
      expect(percentComparator('100%', '99%')).toBeGreaterThan(0);
      expect(percentComparator('100%', '99.9%')).toBeGreaterThan(0);
    });

    it('should handle percentages over 100%', () => {
      expect(percentComparator('150%', '100%')).toBeGreaterThan(0);
      expect(percentComparator('200%', '150%')).toBeGreaterThan(0);
    });
  });

  describe('additional edge cases', () => {
    it('should handle percentages without % symbol', () => {
      const result1 = percentComparator('95', '87');
      expect(result1).toBeGreaterThan(0); // 95 > 87

      const result2 = percentComparator('50.5', '50');
      expect(result2).toBeGreaterThan(0); // 50.5 > 50
    });

    it('should handle negative percentages', () => {
      const result1 = percentComparator('-10%', '10%');
      expect(result1).toBeLessThan(0); // -10 < 10

      const result2 = percentComparator('-5%', '-10%');
      expect(result2).toBeGreaterThan(0); // -5 > -10
    });

    it('should handle percentages with whitespace', () => {
      const result1 = percentComparator(' 95% ', '87%');
      expect(result1).toBeGreaterThan(0); // 95 > 87

      const result2 = percentComparator('  50%  ', '  50%  ');
      expect(result2).toBe(0);
    });

    it('should handle null values', () => {
      const result1 = percentComparator(null, '50%');
      expect(result1).toBeGreaterThan(0); // null sorts to end

      const result2 = percentComparator('50%', null);
      expect(result2).toBeLessThan(0); // null sorts to end

      const result3 = percentComparator(null, null);
      expect(result3).toBe(0);
    });

    it('should handle undefined values', () => {
      const result1 = percentComparator(undefined, '50%');
      expect(result1).toBeGreaterThan(0); // undefined sorts to end

      const result2 = percentComparator('50%', undefined);
      expect(result2).toBeLessThan(0); // undefined sorts to end

      const result3 = percentComparator(undefined, undefined);
      expect(result3).toBe(0);
    });

    it('should handle invalid percentage strings', () => {
      // Invalid strings should be treated as 0
      const result1 = percentComparator('invalid', '50%');
      expect(result1).toBeLessThan(0); // 0 < 50

      const result2 = percentComparator('50%', 'invalid');
      expect(result2).toBeGreaterThan(0); // 50 > 0

      const result3 = percentComparator('invalid', 'invalid');
      expect(result3).toBe(0); // 0 === 0
    });

    it('should handle numeric values instead of strings', () => {
      const result1 = percentComparator(95, 87);
      expect(result1).toBeGreaterThan(0); // 95 > 87

      const result2 = percentComparator(50.5, 50);
      expect(result2).toBeGreaterThan(0); // 50.5 > 50
    });
  });

  describe('sorting arrays', () => {
    it('should correctly sort an array of percentage strings', () => {
      const data = ['95%', '87%', '50%', '100%', '0%', '75.5%'];
      const sorted = [...data].sort(percentComparator);
      expect(sorted).toEqual(['0%', '50%', '75.5%', '87%', '95%', '100%']);
    });

    it('should correctly sort mixed format percentages', () => {
      const data = ['95.5%', '95%', '100', '50.5%', '0%'];
      const sorted = [...data].sort(percentComparator);
      expect(sorted).toEqual(['0%', '50.5%', '95%', '95.5%', '100']);
    });

    it('should correctly sort with null values', () => {
      const data = ['95%', null, '50%', undefined, '75%'];
      const sorted = [...data].sort(percentComparator);
      // null and undefined should be at the end
      expect(sorted[0]).toBe('50%');
      expect(sorted[1]).toBe('75%');
      expect(sorted[2]).toBe('95%');
      expect(sorted[3]).toBe(null);
      expect(sorted[4]).toBe(undefined);
    });

    it('should handle array with decimal and whole number percentages', () => {
      const data = ['50.5%', '50%', '51%', '49.9%'];
      const sorted = [...data].sort(percentComparator);
      expect(sorted).toEqual(['49.9%', '50%', '50.5%', '51%']);
    });

    it('should handle array with edge cases', () => {
      const data = ['100%', '0%', '50%', '200%', '-10%'];
      const sorted = [...data].sort(percentComparator);
      expect(sorted).toEqual(['-10%', '0%', '50%', '100%', '200%']);
    });
  });
});
