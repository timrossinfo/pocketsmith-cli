import { describe, it, expect } from 'vitest';
import { formatOutput } from '../formatter.js';

describe('formatOutput', () => {
  describe('JSON mode', () => {
    it('outputs pretty-printed JSON for arrays', () => {
      const data = [{ id: 1, name: 'Test' }];
      const result = formatOutput(data, { json: true });
      expect(result).toBe(JSON.stringify(data, null, 2));
    });

    it('outputs pretty-printed JSON for objects', () => {
      const data = { id: 1, name: 'Test' };
      const result = formatOutput(data, { json: true });
      expect(result).toBe(JSON.stringify(data, null, 2));
    });
  });

  describe('table mode', () => {
    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'balance', header: 'Balance', align: 'right' as const },
    ];

    it('formats array data as a table', () => {
      const data = [
        { id: 1, name: 'Checking', balance: 1500 },
        { id: 2, name: 'Savings', balance: 5000 },
      ];
      const result = formatOutput(data, { json: false, columns });
      const lines = result.split('\n');

      expect(lines[0]).toContain('ID');
      expect(lines[0]).toContain('Name');
      expect(lines[0]).toContain('Balance');
      expect(lines.length).toBe(4); // header + separator + 2 rows
    });

    it('shows "No results found." for empty arrays', () => {
      const result = formatOutput([], { json: false, columns });
      expect(result).toBe('No results found.');
    });

    it('supports nested keys', () => {
      const nestedColumns = [
        { key: 'id', header: 'ID' },
        { key: 'category.title', header: 'Category' },
      ];
      const data = [{ id: 1, category: { title: 'Food' } }];
      const result = formatOutput(data, { json: false, columns: nestedColumns });
      expect(result).toContain('Food');
    });

    it('handles null and undefined values', () => {
      const data = [{ id: 1, name: null, balance: undefined }];
      const result = formatOutput(data, { json: false, columns });
      const lines = result.split('\n');
      expect(lines.length).toBe(3); // header + separator + 1 row
    });

    it('truncates long values to column width', () => {
      const narrowColumns = [
        { key: 'name', header: 'Name', width: 10 },
      ];
      const data = [{ name: 'A very long account name that should be truncated' }];
      const result = formatOutput(data, { json: false, columns: narrowColumns });
      const dataLine = result.split('\n')[2];
      expect(dataLine.trim().length).toBeLessThanOrEqual(10);
    });

    it('right-aligns columns when specified', () => {
      const data = [{ id: 1, name: 'Test', balance: 42 }];
      const result = formatOutput(data, { json: false, columns });
      const dataLine = result.split('\n')[2];
      // Balance value should be right-aligned (padded on left)
      expect(dataLine).toContain('42');
    });
  });

  describe('detail mode', () => {
    it('formats a single object as key-value pairs', () => {
      const data = { id: 1, name: 'Test Account', currency: 'NZD' };
      const result = formatOutput(data, { json: false });
      expect(result).toContain('id');
      expect(result).toContain('1');
      expect(result).toContain('name');
      expect(result).toContain('Test Account');
      expect(result).toContain('currency');
      expect(result).toContain('NZD');
    });

    it('excludes null, undefined, and object values', () => {
      const data = { id: 1, name: null, nested: { foo: 'bar' }, visible: 'yes' };
      const result = formatOutput(data, { json: false });
      expect(result).toContain('id');
      expect(result).toContain('visible');
      expect(result).not.toContain('name');
      expect(result).not.toContain('nested');
    });

    it('formats boolean values as yes/no', () => {
      const data = { active: true, archived: false };
      const result = formatOutput(data, { json: false });
      expect(result).toContain('yes');
      expect(result).toContain('no');
    });
  });
});
