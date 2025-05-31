// src/lib/utils/__tests__/index.test.ts
import {
  cn,
  generateId,
  deepCopy,
  getRandomItem,
  includesIgnoreCase,
  formatDate,
  absoluteUrl,
} from '../index';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });
  });

  describe('generateId', () => {
    it('should generate an ID with default length', () => {
      const id = generateId();
      expect(id).toHaveLength(10);
      expect(typeof id).toBe('string');
    });

    it('should generate an ID with specified length', () => {
      const length = 15;
      const id = generateId(length);
      expect(id).toHaveLength(length);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('deepCopy', () => {
    it('should create a deep copy of an object', () => {
      const original = {
        name: 'test',
        nested: {
          value: 42,
          array: [1, 2, 3]
        }
      };
      const copy = deepCopy(original);
      
      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
      expect(copy.nested).not.toBe(original.nested);
    });

    it('should handle arrays', () => {
      const original = [1, 2, { nested: 'value' }];
      const copy = deepCopy(original);
      
      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
    });
  });

  describe('getRandomItem', () => {
    it('should return an item from the array', () => {
      const array = ['a', 'b', 'c', 'd'];
      const item = getRandomItem(array);
      expect(array).toContain(item);
    });

    it('should throw error for empty array', () => {
      expect(() => getRandomItem([])).toThrow('配列が空です');
    });

    it('should handle single item array', () => {
      const array = ['single'];
      const item = getRandomItem(array);
      expect(item).toBe('single');
    });
  });

  describe('includesIgnoreCase', () => {
    it('should find text ignoring case', () => {
      expect(includesIgnoreCase('Hello World', 'hello')).toBe(true);
      expect(includesIgnoreCase('Hello World', 'WORLD')).toBe(true);
      expect(includesIgnoreCase('Hello World', 'xyz')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(includesIgnoreCase('', '')).toBe(true);
      expect(includesIgnoreCase('test', '')).toBe(true);
      expect(includesIgnoreCase('', 'test')).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-01');
      const formatted = formatDate(date);
      expect(typeof formatted).toBe('string');
      expect(formatted).toBeTruthy();
    });
  });

  describe('absoluteUrl', () => {
    it('should create absolute URL', () => {
      const path = '/test-path';
      const url = absoluteUrl(path);
      expect(url).toContain(path);
      expect(url).toMatch(/^https?:\/\//);
    });
  });
});
