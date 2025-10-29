import React from "react";

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  align?: "left" | "right" | "center";
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  mobileCard?: (row: T) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

function TableSkeleton<T>({ columns, rows = 5 }: { columns: TableColumn<T>[]; rows?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {columns.map((col, idx) => (
            <td
              key={idx}
              className={`px-6 py-4 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}`}
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function Table<T>({
  columns,
  data,
  rowKey,
  mobileCard,
  loading = false,
  emptyMessage = "No data available",
}: TableProps<T>) {
  if (!loading && data.length === 0) {
    return (
      <div className="bg-white rounded border border-gray-300 p-8">
        <div className="text-center text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-gray-300 overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-800 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"} ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          {loading ? (
            <TableSkeleton<T> columns={columns} />
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`px-6 py-4 align-top text-gray-800 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"} ${col.className || ""}`}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      <div className="lg:hidden divide-y divide-gray-200">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6 animate-pulse">
                {columns.map((col, idx) => (
                  <div key={idx} className="mb-2">
                    <span className="font-medium text-gray-800">{col.header}:</span>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mt-1" />
                  </div>
                ))}
              </div>
            ))
          : data.map((row) =>
              mobileCard ? (
                <div key={rowKey(row)} className="p-6">
                  {mobileCard(row)}
                </div>
              ) : (
                <div key={rowKey(row)} className="p-6">
                  {columns.map((col) => (
                    <div key={String(col.key)} className="mb-2">
                      <span className="font-medium text-gray-800">{col.header}:</span>
                      <div className="text-gray-800">
                        {col.render
                          ? col.render(row[col.key], row)
                          : (row[col.key] as React.ReactNode)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
      </div>
    </div>
  );
}

export default Table;