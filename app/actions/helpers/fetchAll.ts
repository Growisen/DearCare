"use server";
/**
 * Fetches all records from a Supabase query by automatically handling pagination.
 * * @param query - The Supabase query builder instance (must not have .range() applied yet)
 * @param batchSize - Number of records to fetch per request (default: 1000)
 */
export async function fetchAllRecords<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any, 
  batchSize: number = 500
): Promise<T[]> {
  let allRecords: T[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await query.range(from, from + batchSize - 1);

    if (error) throw error;

    if (data && data.length > 0) {
      allRecords = allRecords.concat(data as T[]);
      from += batchSize;
      hasMore = data.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  return allRecords;
}