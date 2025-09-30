import {
  stringComparator,
  numberComparator,
  percentComparator,
  dateComparator,
  customComparator,
  createComparator,
} from '../../utils/comparators';

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

// T008: Number Comparator Tests
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
      expect(numberComparator('abc', 'def')).toBe(0);
      expect(numberComparator('abc', 10)).toBeGreaterThan(0);
      expect(numberComparator(10, 'abc')).toBeLessThan(0);
    });
  });

  describe('null and undefined handling', () => {
    it('should handle null values (sort to end)', () => {
      expect(numberComparator(null, null)).toBe(0);
      expect(numberComparator(null, 5)).toBeGreaterThan(0);
      expect(numberComparator(5, null)).toBeLessThan(0);
    });

    it('should handle undefined values (sort to end)', () => {
      expect(numberComparator(undefined, undefined)).toBe(0);
      expect(numberComparator(undefined, 5)).toBeGreaterThan(0);
      expect(numberComparator(5, undefined)).toBeLessThan(0);
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
      expect(arr[0]).toBe('1');
      expect(arr[1]).toBe('2');
      expect(arr[2]).toBe(0);
      expect(arr[3]).toBe(5);
      expect(arr[4]).toBe(10);
      expect(['abc', null, undefined]).toContain(arr[5]);
      expect([null, undefined]).toContain(arr[6]);
      expect([null, undefined]).toContain(arr[7]);
    });
  });
});

// T009: Percent Comparator Tests
describe('percentComparator', () => {
  describe('parsing and comparing percentages', () => {
    it('should parse and compare "95%" vs "87%"', () => {
      expect(percentComparator('95%', '87%')).toBeGreaterThan(0);
      expect(percentComparator('87%', '95%')).toBeLessThan(0);
      expect(percentComparator('95%', '95%')).toBe(0);
    });
  });

  describe('whole number percentages', () => {
    it('should handle whole number percentages', () => {
      expect(percentComparator('100%', '50%')).toBeGreaterThan(0);
      expect(percentComparator('0%', '100%')).toBeLessThan(0);
      expect(percentComparator('50%', '50%')).toBe(0);
    });

    it('should sort an array of whole number percentages', () => {
      const arr = ['75%', '25%', '100%', '0%', '50%'];
      arr.sort(percentComparator);
      expect(arr).toEqual(['0%', '25%', '50%', '75%', '100%']);
    });
  });

  describe('decimal percentages', () => {
    it('should handle "95.5%" correctly', () => {
      expect(percentComparator('95.5%', '95.3%')).toBeGreaterThan(0);
      expect(percentComparator('95.3%', '95.5%')).toBeLessThan(0);
      expect(percentComparator('95.5%', '95.5%')).toBe(0);
    });

    it('should sort an array of decimal percentages', () => {
      const arr = ['95.5%', '87.2%', '95.3%', '87.8%'];
      arr.sort(percentComparator);
      expect(arr).toEqual(['87.2%', '87.8%', '95.3%', '95.5%']);
    });
  });

  describe('edge cases 0% and 100%', () => {
    it('should handle 0% and 100% edge cases', () => {
      expect(percentComparator('0%', '100%')).toBeLessThan(0);
      expect(percentComparator('100%', '0%')).toBeGreaterThan(0);
      expect(percentComparator('0%', '0%')).toBe(0);
      expect(percentComparator('100%', '100%')).toBe(0);
    });

    it('should sort 0% at the beginning and 100% at the end', () => {
      const arr = ['50%', '100%', '25%', '0%', '75%'];
      arr.sort(percentComparator);
      expect(arr[0]).toBe('0%');
      expect(arr[arr.length - 1]).toBe('100%');
    });
  });

  describe('percentages without % symbol', () => {
    it('should handle numbers without % symbol', () => {
      expect(percentComparator('95', '87')).toBeGreaterThan(0);
      expect(percentComparator('87', '95')).toBeLessThan(0);
      expect(percentComparator('95', '95')).toBe(0);
    });

    it('should handle mixed format (with and without %)', () => {
      expect(percentComparator('95%', '87')).toBeGreaterThan(0);
      expect(percentComparator('87', '95%')).toBeLessThan(0);
    });
  });

  describe('null and undefined handling', () => {
    it('should handle null values (sort to end)', () => {
      expect(percentComparator(null, null)).toBe(0);
      expect(percentComparator(null, '50%')).toBeGreaterThan(0);
      expect(percentComparator('50%', null)).toBeLessThan(0);
    });

    it('should handle undefined values (sort to end)', () => {
      expect(percentComparator(undefined, undefined)).toBe(0);
      expect(percentComparator(undefined, '50%')).toBeGreaterThan(0);
      expect(percentComparator('50%', undefined)).toBeLessThan(0);
    });

    it('should treat null and undefined as equal', () => {
      expect(percentComparator(null, undefined)).toBe(0);
      expect(percentComparator(undefined, null)).toBe(0);
    });
  });

  describe('invalid percentage strings', () => {
    it('should handle invalid strings (parse to 0)', () => {
      expect(percentComparator('invalid', 'invalid')).toBe(0);
      expect(percentComparator('invalid', '50%')).toBeLessThan(0);
      expect(percentComparator('50%', 'invalid')).toBeGreaterThan(0);
    });
  });
});

// T010: Date Comparator Tests
describe('dateComparator', () => {
  describe('ISO date strings', () => {
    it('should compare ISO date strings', () => {
      expect(dateComparator('2025-01-15', '2025-01-20')).toBeLessThan(0);
      expect(dateComparator('2025-01-20', '2025-01-15')).toBeGreaterThan(0);
      expect(dateComparator('2025-01-15', '2025-01-15')).toBe(0);
    });

    it('should sort an array of ISO date strings', () => {
      const arr = [
        '2025-06-15',
        '2025-01-01',
        '2025-12-31',
        '2024-12-31',
        '2026-01-01',
      ];
      arr.sort(dateComparator);
      expect(arr).toEqual([
        '2024-12-31',
        '2025-01-01',
        '2025-06-15',
        '2025-12-31',
        '2026-01-01',
      ]);
    });
  });

  describe('Date objects', () => {
    it('should compare Date objects', () => {
      const date1 = new Date('2025-01-15');
      const date2 = new Date('2025-01-20');
      const date3 = new Date('2025-01-15');

      expect(dateComparator(date1, date2)).toBeLessThan(0);
      expect(dateComparator(date2, date1)).toBeGreaterThan(0);
      expect(dateComparator(date1, date3)).toBe(0);
    });

    it('should sort an array of Date objects', () => {
      const dates = [
        new Date('2025-06-15'),
        new Date('2025-01-01'),
        new Date('2024-12-31'),
      ];
      dates.sort(dateComparator);
      expect(dates[0].getFullYear()).toBe(2024);
      expect(dates[1].getMonth()).toBe(0);
      expect(dates[2].getMonth()).toBe(5);
    });
  });

  describe('chronological order', () => {
    it('should sort dates in chronological order', () => {
      const dates = [
        '2025-12-31',
        '2025-01-01',
        '2025-06-15',
        '2024-12-31',
        '2026-01-01',
      ];
      const sorted = [...dates].sort(dateComparator);
      expect(sorted).toEqual([
        '2024-12-31',
        '2025-01-01',
        '2025-06-15',
        '2025-12-31',
        '2026-01-01',
      ]);
    });

    it('should handle dates spanning multiple years', () => {
      const dates = ['2023-01-01', '2025-01-01', '2024-01-01', '2022-01-01'];
      dates.sort(dateComparator);
      expect(dates).toEqual([
        '2022-01-01',
        '2023-01-01',
        '2024-01-01',
        '2025-01-01',
      ]);
    });
  });

  describe('same dates (stable sort)', () => {
    it('should handle same dates with time components', () => {
      const date1 = '2025-01-15T10:00:00';
      const date2 = '2025-01-15T10:00:00';
      expect(dateComparator(date1, date2)).toBe(0);
    });

    it('should handle same Date objects', () => {
      const dateObj1 = new Date('2025-01-15');
      const dateObj2 = new Date('2025-01-15');
      expect(dateComparator(dateObj1, dateObj2)).toBe(0);
    });

    it('should maintain order for same dates in array', () => {
      const dates = ['2025-01-15', '2025-01-15', '2025-01-15'];
      const sorted = [...dates].sort(dateComparator);
      expect(sorted).toEqual(dates);
    });
  });

  describe('different date formats', () => {
    it('should handle ISO format and US format', () => {
      const iso = '2025-01-15';
      const us = '01/15/2025';
      expect(dateComparator(iso, us)).toBe(0);
    });

    it('should handle ISO with time components', () => {
      expect(dateComparator('2025-01-15', '2025-01-15T12:00:00')).toBeLessThan(
        0,
      );
      expect(
        dateComparator('2025-01-15T12:00:00', '2025-01-15'),
      ).toBeGreaterThan(0);
    });

    it('should compare different dates in different formats', () => {
      expect(dateComparator('2025-01-15', '01/16/2025')).toBeLessThan(0);
      expect(dateComparator('01/16/2025', '2025-01-15')).toBeGreaterThan(0);
    });

    it('should handle full ISO timestamp format', () => {
      expect(
        dateComparator('2025-01-15T10:00:00', '2025-01-15T15:00:00'),
      ).toBeLessThan(0);
      expect(
        dateComparator('2025-01-15T15:00:00', '2025-01-15T10:00:00'),
      ).toBeGreaterThan(0);
    });
  });

  describe('mixed Date objects and strings', () => {
    it('should handle mixed Date objects and strings', () => {
      const dateObj = new Date('2025-01-15');
      const dateStr = '2025-01-20';
      expect(dateComparator(dateObj, dateStr)).toBeLessThan(0);
      expect(dateComparator(dateStr, dateObj)).toBeGreaterThan(0);
    });

    it('should sort mixed array of Date objects and strings', () => {
      const mixed = [
        new Date('2025-06-15'),
        '2025-01-01',
        new Date('2024-12-31'),
        '2025-12-31',
      ];
      mixed.sort(dateComparator);
      const year1 = new Date(mixed[0]).getFullYear();
      const year2 = new Date(mixed[1]).getFullYear();
      const year3 = new Date(mixed[2]).getFullYear();
      expect(year1).toBe(2024);
      expect(year2).toBe(2025);
      expect(year3).toBe(2025);
    });
  });

  describe('null and undefined handling', () => {
    it('should handle null values (sort to end)', () => {
      expect(dateComparator(null, null)).toBe(0);
      expect(dateComparator(null, '2025-01-15')).toBeGreaterThan(0);
      expect(dateComparator('2025-01-15', null)).toBeLessThan(0);
    });

    it('should handle undefined values (sort to end)', () => {
      expect(dateComparator(undefined, undefined)).toBe(0);
      expect(dateComparator(undefined, '2025-01-15')).toBeGreaterThan(0);
      expect(dateComparator('2025-01-15', undefined)).toBeLessThan(0);
    });

    it('should treat null and undefined as equal', () => {
      expect(dateComparator(null, undefined)).toBe(0);
      expect(dateComparator(undefined, null)).toBe(0);
    });
  });

  describe('invalid date strings', () => {
    it('should handle invalid date strings (sort to end)', () => {
      expect(dateComparator('invalid', 'invalid')).toBe(0);
      expect(dateComparator('invalid', '2025-01-15')).toBeGreaterThan(0);
      expect(dateComparator('2025-01-15', 'invalid')).toBeLessThan(0);
    });

    it('should sort invalid dates with valid dates', () => {
      const arr = ['2025-01-15', 'invalid', '2025-01-20', 'bad-date'];
      arr.sort(dateComparator);
      expect(arr[0]).toBe('2025-01-15');
      expect(arr[1]).toBe('2025-01-20');
      expect(['invalid', 'bad-date']).toContain(arr[2]);
      expect(['invalid', 'bad-date']).toContain(arr[3]);
    });
  });
});

// T012: createComparator Factory Tests
describe('createComparator', () => {
  describe('returns correct comparator for each type', () => {
    it('should create a string comparator for type "string"', () => {
      const config = { key: 'name', type: 'string' };
      const comparator = createComparator(config, 'asc');

      const objA = { name: 'Alice' };
      const objB = { name: 'Bob' };

      expect(comparator(objA, objB)).toBeLessThan(0);
      expect(comparator(objB, objA)).toBeGreaterThan(0);
      expect(comparator(objA, objA)).toBe(0);
    });

    it('should create a number comparator for type "number"', () => {
      const config = { key: 'age', type: 'number' };
      const comparator = createComparator(config, 'asc');

      const objA = { age: 25 };
      const objB = { age: 30 };

      expect(comparator(objA, objB)).toBeLessThan(0);
      expect(comparator(objB, objA)).toBeGreaterThan(0);
      expect(comparator(objA, objA)).toBe(0);
    });

    it('should create a percent comparator for type "percent"', () => {
      const config = { key: 'score', type: 'percent' };
      const comparator = createComparator(config, 'asc');

      const objA = { score: '85%' };
      const objB = { score: '95%' };

      expect(comparator(objA, objB)).toBeLessThan(0);
      expect(comparator(objB, objA)).toBeGreaterThan(0);
      expect(comparator(objA, objA)).toBe(0);
    });

    it('should create a date comparator for type "date"', () => {
      const config = { key: 'createdAt', type: 'date' };
      const comparator = createComparator(config, 'asc');

      const objA = { createdAt: '2025-01-15' };
      const objB = { createdAt: '2025-01-20' };

      expect(comparator(objA, objB)).toBeLessThan(0);
      expect(comparator(objB, objA)).toBeGreaterThan(0);
      expect(comparator(objA, objA)).toBe(0);
    });

    it('should create a custom comparator for type "custom"', () => {
      const customFn = (a, b) => a.length - b.length;
      const config = { key: 'name', type: 'custom', comparator: customFn };
      const comparator = createComparator(config, 'asc');

      const objA = { name: 'Alice' };
      const objB = { name: 'Bob' };

      expect(comparator(objA, objB)).toBeGreaterThan(0); // "Alice" has 5 chars, "Bob" has 3
      expect(comparator(objB, objA)).toBeLessThan(0);
    });
  });

  describe('direction reversal (asc vs desc)', () => {
    it('should sort ascending when direction is "asc"', () => {
      const config = { key: 'value', type: 'number' };
      const comparator = createComparator(config, 'asc');

      const data = [{ value: 5 }, { value: 2 }, { value: 8 }, { value: 1 }];
      data.sort(comparator);

      expect(data[0].value).toBe(1);
      expect(data[1].value).toBe(2);
      expect(data[2].value).toBe(5);
      expect(data[3].value).toBe(8);
    });

    it('should sort descending when direction is "desc"', () => {
      const config = { key: 'value', type: 'number' };
      const comparator = createComparator(config, 'desc');

      const data = [{ value: 5 }, { value: 2 }, { value: 8 }, { value: 1 }];
      data.sort(comparator);

      expect(data[0].value).toBe(8);
      expect(data[1].value).toBe(5);
      expect(data[2].value).toBe(2);
      expect(data[3].value).toBe(1);
    });

    it('should reverse order for strings when direction is "desc"', () => {
      const config = { key: 'name', type: 'string' };
      const comparator = createComparator(config, 'desc');

      const data = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }];
      data.sort(comparator);

      expect(data[0].name).toBe('Charlie');
      expect(data[1].name).toBe('Bob');
      expect(data[2].name).toBe('Alice');
    });

    it('should reverse order for dates when direction is "desc"', () => {
      const config = { key: 'date', type: 'date' };
      const comparator = createComparator(config, 'desc');

      const data = [
        { date: '2025-01-15' },
        { date: '2025-01-10' },
        { date: '2025-01-20' },
      ];
      data.sort(comparator);

      expect(data[0].date).toBe('2025-01-20');
      expect(data[1].date).toBe('2025-01-15');
      expect(data[2].date).toBe('2025-01-10');
    });
  });

  describe('nested field paths', () => {
    it('should extract values from nested paths using dot notation', () => {
      const config = { key: 'userName', type: 'string', path: 'user.name' };
      const comparator = createComparator(config, 'asc');

      const objA = { user: { name: 'Alice' } };
      const objB = { user: { name: 'Bob' } };

      expect(comparator(objA, objB)).toBeLessThan(0);
      expect(comparator(objB, objA)).toBeGreaterThan(0);
    });

    it('should handle deeply nested paths (3+ levels)', () => {
      const config = {
        key: 'score',
        type: 'number',
        path: 'user.profile.score',
      };
      const comparator = createComparator(config, 'asc');

      const objA = { user: { profile: { score: 85 } } };
      const objB = { user: { profile: { score: 95 } } };

      expect(comparator(objA, objB)).toBeLessThan(0);
      expect(comparator(objB, objA)).toBeGreaterThan(0);
    });

    it('should default to key as path if path is not provided', () => {
      const config = { key: 'name', type: 'string' };
      const comparator = createComparator(config, 'asc');

      const objA = { name: 'Alice' };
      const objB = { name: 'Bob' };

      expect(comparator(objA, objB)).toBeLessThan(0);
    });

    it('should handle missing intermediate properties', () => {
      const config = { key: 'userName', type: 'string', path: 'user.name' };
      const comparator = createComparator(config, 'asc');

      const objA = { user: { name: 'Alice' } };
      const objB = {}; // Missing user object

      // objB should sort to the end (undefined value)
      expect(comparator(objA, objB)).toBeLessThan(0);
      expect(comparator(objB, objA)).toBeGreaterThan(0);
    });
  });

  describe('custom comparator function', () => {
    it('should use custom comparator function when type is "custom"', () => {
      const customFn = (a, b) => {
        // Sort by string length
        return a.length - b.length;
      };

      const config = { key: 'name', type: 'custom', comparator: customFn };
      const comparator = createComparator(config, 'asc');

      const data = [
        { name: 'Bob' },
        { name: 'Alexander' },
        { name: 'Charlie' },
        { name: 'Al' },
      ];
      data.sort(comparator);

      expect(data[0].name).toBe('Al'); // 2 chars
      expect(data[1].name).toBe('Bob'); // 3 chars
      expect(data[2].name).toBe('Charlie'); // 7 chars
      expect(data[3].name).toBe('Alexander'); // 9 chars
    });

    it('should apply direction to custom comparator', () => {
      const customFn = (a, b) => a.length - b.length;

      const config = { key: 'name', type: 'custom', comparator: customFn };
      const comparator = createComparator(config, 'desc');

      const data = [{ name: 'Bob' }, { name: 'Alexander' }, { name: 'Al' }];
      data.sort(comparator);

      expect(data[0].name).toBe('Alexander'); // Longest first
      expect(data[1].name).toBe('Bob');
      expect(data[2].name).toBe('Al'); // Shortest last
    });

    it('should handle null values in custom comparator', () => {
      const customFn = (a, b) => a - b;

      const config = { key: 'value', type: 'custom', comparator: customFn };
      const comparator = createComparator(config, 'asc');

      const data = [{ value: 5 }, { value: null }, { value: 2 }];
      data.sort(comparator);

      expect(data[0].value).toBe(2);
      expect(data[1].value).toBe(5);
      expect(data[2].value).toBe(null); // Nulls sort to end
    });

    it('should throw error if custom comparator is missing', () => {
      const config = { key: 'name', type: 'custom' }; // Missing comparator

      expect(() => {
        createComparator(config, 'asc');
      }).toThrow(
        'Custom comparator required for field "name" with type "custom"',
      );
    });

    it('should throw error if custom comparator is not a function', () => {
      const config = {
        key: 'name',
        type: 'custom',
        comparator: 'not-a-function',
      };

      expect(() => {
        createComparator(config, 'asc');
      }).toThrow(
        'Custom comparator required for field "name" with type "custom"',
      );
    });
  });

  describe('null value handling', () => {
    it('should sort nulls to the end by default (nullsFirst = false)', () => {
      const config = { key: 'value', type: 'number' };
      const comparator = createComparator(config, 'asc');

      const data = [{ value: 5 }, { value: null }, { value: 2 }, { value: 8 }];
      data.sort(comparator);

      expect(data[0].value).toBe(2);
      expect(data[1].value).toBe(5);
      expect(data[2].value).toBe(8);
      expect(data[3].value).toBe(null);
    });

    it('should sort nulls to the beginning when nullsFirst = true', () => {
      const config = { key: 'value', type: 'number', nullsFirst: true };
      const comparator = createComparator(config, 'asc');

      const data = [{ value: 5 }, { value: null }, { value: 2 }, { value: 8 }];
      data.sort(comparator);

      expect(data[0].value).toBe(null);
      expect(data[1].value).toBe(2);
      expect(data[2].value).toBe(5);
      expect(data[3].value).toBe(8);
    });

    it('should handle undefined values with nullsFirst = false', () => {
      const config = { key: 'value', type: 'number' };
      const comparator = createComparator(config, 'asc');

      const data = [
        { value: 5 },
        { value: undefined },
        { value: 2 },
        { value: 8 },
      ];
      data.sort(comparator);

      expect(data[0].value).toBe(2);
      expect(data[1].value).toBe(5);
      expect(data[2].value).toBe(8);
      expect(data[3].value).toBe(undefined);
    });

    it('should handle undefined values with nullsFirst = true', () => {
      const config = { key: 'value', type: 'number', nullsFirst: true };
      const comparator = createComparator(config, 'asc');

      const data = [
        { value: 5 },
        { value: undefined },
        { value: 2 },
        { value: 8 },
      ];
      data.sort(comparator);

      expect(data[0].value).toBe(undefined);
      expect(data[1].value).toBe(2);
      expect(data[2].value).toBe(5);
      expect(data[3].value).toBe(8);
    });

    it('should respect nullsFirst in descending order', () => {
      const config = { key: 'value', type: 'number', nullsFirst: true };
      const comparator = createComparator(config, 'desc');

      const data = [{ value: 5 }, { value: null }, { value: 2 }, { value: 8 }];
      data.sort(comparator);

      expect(data[0].value).toBe(null);
      expect(data[1].value).toBe(8);
      expect(data[2].value).toBe(5);
      expect(data[3].value).toBe(2);
    });

    it('should handle multiple null values', () => {
      const config = { key: 'value', type: 'number' };
      const comparator = createComparator(config, 'asc');

      const data = [
        { value: 5 },
        { value: null },
        { value: 2 },
        { value: null },
        { value: 8 },
      ];
      data.sort(comparator);

      expect(data[0].value).toBe(2);
      expect(data[1].value).toBe(5);
      expect(data[2].value).toBe(8);
      expect(data[3].value).toBe(null);
      expect(data[4].value).toBe(null);
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown comparator type', () => {
      const config = { key: 'value', type: 'unknown-type' };

      expect(() => {
        createComparator(config, 'asc');
      }).toThrow('Unknown comparator type "unknown-type" for field "value"');
    });
  });

  describe('integration with real-world data', () => {
    it('should sort array of objects by string field', () => {
      const config = { key: 'name', type: 'string' };
      const comparator = createComparator(config, 'asc');

      const data = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      data.sort(comparator);

      expect(data[0].name).toBe('Alice');
      expect(data[1].name).toBe('Bob');
      expect(data[2].name).toBe('Charlie');
    });

    it('should sort array of objects by number field', () => {
      const config = { key: 'age', type: 'number' };
      const comparator = createComparator(config, 'asc');

      const data = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
      ];
      data.sort(comparator);

      expect(data[0].age).toBe(25);
      expect(data[1].age).toBe(30);
      expect(data[2].age).toBe(35);
    });

    it('should sort array with nested paths', () => {
      const config = { key: 'userAge', type: 'number', path: 'user.age' };
      const comparator = createComparator(config, 'asc');

      const data = [
        { id: 1, user: { name: 'Charlie', age: 30 } },
        { id: 2, user: { name: 'Alice', age: 25 } },
        { id: 3, user: { name: 'Bob', age: 35 } },
      ];
      data.sort(comparator);

      expect(data[0].user.age).toBe(25);
      expect(data[1].user.age).toBe(30);
      expect(data[2].user.age).toBe(35);
    });

    it('should handle mixed null and valid values', () => {
      const config = { key: 'score', type: 'number' };
      const comparator = createComparator(config, 'asc');

      const data = [
        { name: 'Charlie', score: 85 },
        { name: 'Alice', score: null },
        { name: 'Bob', score: 95 },
        { name: 'Dave', score: 75 },
      ];
      data.sort(comparator);

      expect(data[0].score).toBe(75);
      expect(data[1].score).toBe(85);
      expect(data[2].score).toBe(95);
      expect(data[3].score).toBe(null);
    });
  });
});
