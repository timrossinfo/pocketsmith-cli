interface Column {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'right';
}

interface FormatOptions {
  json: boolean;
  columns?: Column[];
}

function truncate(str: string, width: number): string {
  if (str.length <= width) return str;
  return str.slice(0, width - 1) + '…';
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  return String(value);
}

function getNestedValue(obj: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function formatTable(data: Record<string, unknown>[], columns: Column[]): string {
  if (data.length === 0) return 'No results found.';

  const colWidths = columns.map((col) => {
    const maxDataWidth = data.reduce((max, row) => {
      const val = formatCell(getNestedValue(row, col.key));
      return Math.max(max, val.length);
    }, col.header.length);
    return col.width ? Math.min(col.width, Math.max(maxDataWidth, col.header.length)) : maxDataWidth;
  });

  const header = columns
    .map((col, i) => col.header.padEnd(colWidths[i]))
    .join('  ');

  const separator = colWidths.map((w) => '─'.repeat(w)).join('──');

  const rows = data.map((row) =>
    columns
      .map((col, i) => {
        const val = formatCell(getNestedValue(row, col.key));
        const display = truncate(val, colWidths[i]);
        return col.align === 'right'
          ? display.padStart(colWidths[i])
          : display.padEnd(colWidths[i]);
      })
      .join('  '),
  );

  return [header, separator, ...rows].join('\n');
}

export function formatOutput(data: unknown, options: FormatOptions): string {
  if (options.json) {
    return JSON.stringify(data, null, 2);
  }

  if (Array.isArray(data) && options.columns) {
    return formatTable(data as Record<string, unknown>[], options.columns);
  }

  if (typeof data === 'object' && data !== null) {
    return formatDetail(data as Record<string, unknown>);
  }

  return String(data);
}

function formatDetail(data: Record<string, unknown>): string {
  const entries = Object.entries(data).filter(
    ([, v]) => v !== null && v !== undefined && typeof v !== 'object',
  );

  const maxKeyLen = entries.reduce((max, [k]) => Math.max(max, k.length), 0);

  return entries
    .map(([key, value]) => `${key.padEnd(maxKeyLen)}  ${formatCell(value)}`)
    .join('\n');
}
