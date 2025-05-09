/**
 * Formats text values by replacing underscores with spaces and capitalizing each word
 * Example: "home_nursing" becomes "Home Nursing"
 */
export function formatFieldValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  
  // Convert to string first
  const stringValue = value.toString();
  
  // Replace underscores with spaces and capitalize each word
  return stringValue.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}