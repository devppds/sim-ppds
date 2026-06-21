import React, { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

export interface Column<T> {
  header: React.ReactNode;
  render: (item: T, index: number) => React.ReactNode;
  hiddenClassName?: string;
}

export interface SortOption<T> {
  label: string;
  value: string;
  sortFn: (a: T, b: T) => number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortOptions?: SortOption<T>[];
  defaultSortValue?: string;
  itemsPerPage?: number;
  onRowClick?: (item: T) => void;
  emptyMessage?: React.ReactNode;
  loading?: boolean;
  rowClassName?: (item: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  sortOptions = [],
  defaultSortValue,
  itemsPerPage = 50,
  onRowClick,
  emptyMessage = "Data tidak ditemukan",
  loading = false,
  rowClassName,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSortValue, setActiveSortValue] = useState<string>(
    defaultSortValue || (sortOptions.length > 0 ? sortOptions[0].value : "")
  );

  // When data length changes significantly (e.g. searching), reset to page 1
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const sortedData = useMemo(() => {
    if (!activeSortValue || sortOptions.length === 0) return data;
    const option = sortOptions.find((o) => o.value === activeSortValue);
    if (!option) return data;

    // Create a shallow copy before sorting
    return [...data].sort(option.sortFn);
  }, [data, activeSortValue, sortOptions]);

  const visibleData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));

  return (
    <div className="flex flex-col gap-4">
      {sortOptions.length > 0 && (
        <div className="flex justify-end">
          <div className="relative inline-block w-48">
            <select
              value={activeSortValue}
              onChange={(e) => setActiveSortValue(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Urutkan: {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-text-sub uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                {columns.map((col, i) => (
                  <th key={i} className={`text-left px-5 py-3 font-bold ${col.hiddenClassName || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-24">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        </div>
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                        Menyiapkan Data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400 font-medium">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                visibleData.map((item, i) => (
                  <tr
                    key={i}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`group transition-all select-none ${
                      onRowClick ? "cursor-pointer hover:bg-slate-50/70" : ""
                    } ${rowClassName ? rowClassName(item) : ""}`}
                  >
                    {columns.map((col, j) => (
                      <td key={j} className={`px-5 py-4 ${col.hiddenClassName || ""}`}>
                        {col.render(item, i)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <p className="text-xs font-bold text-slate-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, sortedData.length)} dari {sortedData.length} data
            </p>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-100"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
