// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function jsonToCSV(items: any[]): string {
  if (!items.length) return '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const replacer = (key: string, value: any) => (value === null || value === undefined ? '' : value);
  const header = Object.keys(items[0]);
  const csv = [
    header.join(','),
    ...items.map(row =>
      header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
    ),
  ].join('\r\n');
  return csv;
}