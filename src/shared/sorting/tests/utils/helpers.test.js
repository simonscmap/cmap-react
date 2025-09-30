import { getNestedValue } from '../../utils/helpers';

describe('getNestedValue', () => {
  describe('simple property access', () => {
    it('should retrieve a top-level property', () => {
      const obj = { name: 'Alice', age: 30 };
      expect(getNestedValue(obj, 'name')).toBe('Alice');
      expect(getNestedValue(obj, 'age')).toBe(30);
    });

    it('should return undefined for non-existent top-level property', () => {
      const obj = { name: 'Alice' };
      expect(getNestedValue(obj, 'email')).toBeUndefined();
    });
  });

  describe('nested path (dot notation)', () => {
    it('should retrieve a nested property', () => {
      const obj = {
        user: {
          name: 'Alice',
          address: {
            city: 'NYC',
          },
        },
      };
      expect(getNestedValue(obj, 'user.name')).toBe('Alice');
      expect(getNestedValue(obj, 'user.address.city')).toBe('NYC');
    });

    it('should handle objects with numeric values', () => {
      const obj = {
        stats: {
          score: 95,
          rank: 1,
        },
      };
      expect(getNestedValue(obj, 'stats.score')).toBe(95);
      expect(getNestedValue(obj, 'stats.rank')).toBe(1);
    });

    it('should handle objects with boolean values', () => {
      const obj = {
        flags: {
          enabled: true,
          visible: false,
        },
      };
      expect(getNestedValue(obj, 'flags.enabled')).toBe(true);
      expect(getNestedValue(obj, 'flags.visible')).toBe(false);
    });

    it('should handle objects with null values', () => {
      const obj = {
        data: {
          value: null,
        },
      };
      expect(getNestedValue(obj, 'data.value')).toBeNull();
    });
  });

  describe('missing intermediate properties (returns undefined)', () => {
    it('should return undefined when intermediate property is missing', () => {
      const obj = {
        user: {
          name: 'Alice',
        },
      };
      expect(getNestedValue(obj, 'user.address.city')).toBeUndefined();
    });

    it('should return undefined when first-level property is missing', () => {
      const obj = {
        user: {
          name: 'Alice',
        },
      };
      expect(getNestedValue(obj, 'profile.email')).toBeUndefined();
    });

    it('should return undefined when intermediate property is not an object', () => {
      const obj = {
        user: {
          name: 'Alice',
        },
      };
      expect(getNestedValue(obj, 'user.name.first')).toBeUndefined();
    });

    it('should return undefined when intermediate property is a primitive', () => {
      const obj = {
        count: 42,
      };
      expect(getNestedValue(obj, 'count.value')).toBeUndefined();
    });
  });

  describe('null/undefined objects', () => {
    it('should return undefined for null object', () => {
      expect(getNestedValue(null, 'user.name')).toBeUndefined();
    });

    it('should return undefined for undefined object', () => {
      expect(getNestedValue(undefined, 'user.name')).toBeUndefined();
    });

    it('should return undefined for null object with simple path', () => {
      expect(getNestedValue(null, 'name')).toBeUndefined();
    });

    it('should return undefined for undefined object with simple path', () => {
      expect(getNestedValue(undefined, 'name')).toBeUndefined();
    });
  });

  describe('empty path', () => {
    it('should return the object itself for empty string path', () => {
      const obj = { name: 'Alice', age: 30 };
      expect(getNestedValue(obj, '')).toBe(obj);
    });

    it('should return the object itself for null path', () => {
      const obj = { name: 'Alice', age: 30 };
      expect(getNestedValue(obj, null)).toBe(obj);
    });

    it('should return the object itself for undefined path', () => {
      const obj = { name: 'Alice', age: 30 };
      expect(getNestedValue(obj, undefined)).toBe(obj);
    });

    it('should return null when object is null and path is empty', () => {
      expect(getNestedValue(null, '')).toBeUndefined();
    });

    it('should return undefined when object is undefined and path is empty', () => {
      expect(getNestedValue(undefined, '')).toBeUndefined();
    });
  });

  describe('deeply nested paths (3+ levels)', () => {
    it('should retrieve values from 3-level nested paths', () => {
      const obj = {
        company: {
          department: {
            team: {
              lead: 'Bob',
            },
          },
        },
      };
      expect(getNestedValue(obj, 'company.department.team.lead')).toBe('Bob');
    });

    it('should retrieve values from 4-level nested paths', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep',
              },
            },
          },
        },
      };
      expect(getNestedValue(obj, 'level1.level2.level3.level4.value')).toBe(
        'deep',
      );
    });

    it('should retrieve values from 5-level nested paths', () => {
      const obj = {
        a: {
          b: {
            c: {
              d: {
                e: {
                  f: 'very deep',
                },
              },
            },
          },
        },
      };
      expect(getNestedValue(obj, 'a.b.c.d.e.f')).toBe('very deep');
    });

    it('should return undefined when missing property in 3+ level path', () => {
      const obj = {
        company: {
          department: {
            team: {
              lead: 'Bob',
            },
          },
        },
      };
      expect(
        getNestedValue(obj, 'company.department.team.members.count'),
      ).toBeUndefined();
    });

    it('should handle arrays in nested paths', () => {
      const obj = {
        data: {
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
        },
      };
      expect(getNestedValue(obj, 'data.items')).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]);
    });

    it('should retrieve array element by index in path', () => {
      const obj = {
        data: {
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
        },
      };
      expect(getNestedValue(obj, 'data.items.0.name')).toBe('Item 1');
      expect(getNestedValue(obj, 'data.items.1.id')).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle objects with properties named with special characters', () => {
      const obj = {
        'user-name': 'Alice',
        email_address: 'alice@example.com',
      };
      expect(getNestedValue(obj, 'user-name')).toBe('Alice');
      expect(getNestedValue(obj, 'email_address')).toBe('alice@example.com');
    });

    it('should handle objects with numeric string keys', () => {
      const obj = {
        0: 'zero',
        1: 'one',
      };
      expect(getNestedValue(obj, '0')).toBe('zero');
      expect(getNestedValue(obj, '1')).toBe('one');
    });

    it('should return 0 when value is 0', () => {
      const obj = {
        count: 0,
      };
      expect(getNestedValue(obj, 'count')).toBe(0);
    });

    it('should return empty string when value is empty string', () => {
      const obj = {
        name: '',
      };
      expect(getNestedValue(obj, 'name')).toBe('');
    });

    it('should return false when value is false', () => {
      const obj = {
        flag: false,
      };
      expect(getNestedValue(obj, 'flag')).toBe(false);
    });
  });
});
