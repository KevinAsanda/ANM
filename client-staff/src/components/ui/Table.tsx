import React from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  emptyMessage = 'No data available.',
  onRowClick
}: TableProps<T>) {
  const isClickable = !!onRowClick;

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-text-muted bg-surface border border-border rounded-xl shadow-sm italic text-sm animate-fade-in">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-border rounded-xl bg-surface shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-background/40 border-b border-border text-[0.7rem] font-semibold text-text-muted uppercase tracking-wider">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-3.5 font-semibold ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-xs">
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`hover:bg-primary/5 transition-colors ${
                isClickable ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-6 py-4 text-text font-medium ${col.className || ''}`}
                >
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
