interface AnyObject {
  [key: string]: unknown;
}

export default function toCamelCase(obj: AnyObject | null | undefined): Record<string, unknown> {
  if (!obj) return {};
  return Object.entries(obj).reduce((acc: Record<string, unknown>, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    acc[camelKey] = value;
    return acc;
  }, {});
}
