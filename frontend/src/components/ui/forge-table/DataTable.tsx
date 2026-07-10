"use client";

import React, { useState, useEffect, useRef } from "react";
import { ColumnDef, DataTableState, DataTableSorting, DataTablePagination } from "./types";
import "./table.css";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  processedData: TData[];
  state: DataTableState;
  pageCount: number;
  totalRows: number;
  setSorting: (sorting: DataTableSorting | null) => void;
  setPagination: (pagination: DataTablePagination) => void;
  toggleRowSelection: (rowId: string) => void;
  toggleAllRowSelection: (rowIds: string[], checked: boolean) => void;
  resetSelection: () => void;
  getRowId?: (row: TData, index: number) => string;
  renderRow?: (row: TData, index: number, visibleColumns: ColumnDef<TData>[]) => React.ReactNode;
  bulkActionSlot?: (selectedIds: string[], onDone: () => void) => React.ReactNode;
  actionMenuSlot?: (row: TData, onClose: () => void) => React.ReactNode;
  onRowActionTriggered?: (actionName: string, row: TData) => void;
  onBulkActionTriggered?: (actionName: string, selectedIds: string[]) => void;
  isLoading?: boolean;
  recordLabel?: string;
  selectionLabel?: string;
}

export function DataTable<TData>({
  columns,
  processedData,
  state,
  pageCount,
  totalRows,
  setSorting,
  setPagination,
  toggleRowSelection,
  toggleAllRowSelection,
  resetSelection,
  getRowId = (row: any, idx: number) => row.uid || row.id || String(idx),
  renderRow,
  bulkActionSlot,
  actionMenuSlot,
  onRowActionTriggered,
  onBulkActionTriggered,
  isLoading = false,
  recordLabel,
  selectionLabel,
}: DataTableProps<TData>) {
  const [activeKebabRowId, setActiveKebabRowId] = useState<string | null>(null);
  const kebabContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Virtualization state
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Track scroll position and container clientHeight dynamically
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    setScrollTop(container.scrollTop);
    setContainerHeight(container.clientHeight || 600);

    const resizeObserver = new ResizeObserver(() => {
      setContainerHeight(container.clientHeight || 600);
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  const horizontalScroll = state.horizontalScroll ?? true;
  const rowHeight = 58;
  const buffer = horizontalScroll ? 5 : 15; // Extra buffer rows in wrapped mode to handle variable wrapping heights
  const totalRowsCount = processedData.length;

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const endIndex = Math.min(
    totalRowsCount - 1,
    Math.floor((scrollTop + containerHeight) / rowHeight) + buffer
  );

  const visibleRows = processedData.slice(startIndex, endIndex + 1);
  const paddingTop = startIndex * rowHeight;
  const paddingBottom = Math.max(0, (totalRowsCount - 1 - endIndex) * rowHeight);

  // Translate vertical scroll wheel ticks to horizontal scrolling inside the table canvas
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Intercept page scrolling if horizontalScroll is active and the table wraps horizontally
      if (horizontalScroll && container.scrollWidth > container.clientWidth) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [horizontalScroll]);

  // Close kebab menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        kebabContainerRef.current &&
        !kebabContainerRef.current.contains(event.target as Node)
      ) {
        setActiveKebabRowId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter visible columns
  const visibleColumns = columns.filter(
    (col) => col.id === "checkbox" || col.id === "actions" || state.columnVisibility[col.id] !== false
  );

  // Row selection logic helpers
  const renderedRowIds = processedData.map((row, idx) => getRowId(row, idx));
  const selectedCount = renderedRowIds.filter((id) => state.rowSelection[id] === true).length;
  const allRenderedSelected = renderedRowIds.length > 0 && selectedCount === renderedRowIds.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < renderedRowIds.length;

  const handleMasterToggle = () => {
    if (allRenderedSelected) {
      toggleAllRowSelection(renderedRowIds, false);
    } else {
      toggleAllRowSelection(renderedRowIds, true);
    }
  };

  // Header checkbox checkbox ref mapping for indeterminate status
  const masterCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  // Page calculations
  const startRowIndex = state.pagination.pageIndex * state.pagination.pageSize + 1;
  const endRowIndex = Math.min(
    (state.pagination.pageIndex + 1) * state.pagination.pageSize,
    totalRows
  );

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    if (pageCount <= 5) {
      for (let i = 0; i < pageCount; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    const current = state.pagination.pageIndex;
    pageNumbers.push(0);

    let start = Math.max(1, current - 1);
    let end = Math.min(pageCount - 2, current + 1);

    if (current <= 1) {
      end = 2;
    }
    if (current >= pageCount - 2) {
      start = pageCount - 3;
    }

    if (start > 1) {
      pageNumbers.push("ellipsis-start");
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    if (end < pageCount - 2) {
      pageNumbers.push("ellipsis-end");
    }

    pageNumbers.push(pageCount - 1);
    return pageNumbers;
  };

  const handlePageChange = (index: number) => {
    if (index >= 0 && index < pageCount) {
      setPagination({
        ...state.pagination,
        pageIndex: index,
      });
    }
  };

  // Sorting handlers
  const handleSortToggle = (col: ColumnDef<TData>) => {
    if (!col.sortable) return;
    const isCurrentSort = state.sorting?.id === col.id;
    if (isCurrentSort) {
      if (state.sorting?.desc) {
        // Remove sort
        setSorting(null);
      } else {
        // Toggle to desc
        setSorting({ id: col.id, desc: true });
      }
    } else {
      // Set asc
      setSorting({ id: col.id, desc: false });
    }
  };

  // Default bulk action handles
  const handleDefaultBulkAction = (actionName: string) => {
    const selectedIds = Object.keys(state.rowSelection).filter((id) => state.rowSelection[id]);
    if (onBulkActionTriggered) {
      onBulkActionTriggered(actionName, selectedIds);
    }
    resetSelection();
  };

  return (
    <div className="space-y-4">
      {/* Main Table Grid Container */}
      <div className={`bg-white rounded-xl border border-slate-200/90 shadow-md shadow-slate-200/40 overflow-hidden relative z-10 transition-all ${isLoading ? "pointer-events-none select-none opacity-80" : ""}`}>
        <div 
          ref={scrollContainerRef} 
          className={`scrollbar-hide max-h-[600px] ${
            horizontalScroll 
              ? "overflow-auto" 
              : "overflow-y-auto overflow-x-hidden w-full"
          }`}
        >
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-950 text-[11px] font-bold uppercase tracking-wider select-none">
                {visibleColumns.map((col) => {
                  if (col.id === "checkbox") {
                    return (
                      <th key={col.id} className="py-3 px-4 w-12 text-center bg-slate-950 sticky top-0 z-20">
                        <input
                          type="checkbox"
                          ref={masterCheckboxRef}
                          checked={allRenderedSelected}
                          onChange={handleMasterToggle}
                          className="w-3.5 h-3.5 rounded text-[#06B6D4] border-slate-700 bg-slate-800 focus:ring-cyan-500/30 accent-cyan-500 cursor-pointer"
                        />
                      </th>
                    );
                  }

                  if (col.id === "actions") {
                    return (
                      <th key={col.id} className="py-3 px-5 text-right w-24 bg-slate-900 sticky top-0 z-20">
                        Actions
                      </th>
                    );
                  }

                  const isSorted = state.sorting?.id === col.id ? (state.sorting.desc ? "desc" : "asc") : null;
                  const isFiltered = col.filterKey ? !!state.filters[col.filterKey] : false;

                  return (
                    <th
                      key={col.id}
                      onClick={() => handleSortToggle(col)}
                      className={`py-3 px-5 font-semibold bg-slate-900 sticky top-0 z-20 ${
                        horizontalScroll ? "whitespace-nowrap" : "break-words"
                      } ${col.sortable ? "cursor-pointer hover:bg-slate-800 transition-colors" : ""}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {typeof col.header === "function"
                          ? col.header({
                            column: col,
                            isSorted,
                            toggleSort: () => handleSortToggle(col),
                          })
                          : col.header}

                        {isFiltered && (
                          <span className="inline-flex" title="Active Column Filter">
                            <svg
                              className={`w-3.5 h-3.5 ${col.filterColorClass || "text-cyan-500"}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                              />
                            </svg>
                          </span>
                        )}

                        {col.sortable && (
                          <span className="inline-flex">
                            {isSorted === "asc" && (
                              <svg className="w-3 h-3 text-[#06B6D4]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4l-8 8h16l-8-8z" />
                              </svg>
                            )}
                            {isSorted === "desc" && (
                              <svg className="w-3 h-3 text-[#06B6D4]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 20l8-8H4l8 8z" />
                              </svg>
                            )}
                            {!isSorted && (
                              <svg className="w-3 h-3 text-slate-500 group-hover:text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4l-4 4h8l-4-4zm0 16l4-4H8l4 4z" />
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/70 text-xs">
              {isLoading ? (
                Array.from({ length: state.pagination.pageSize }).map((_, sIdx) => (
                  <tr key={sIdx} className="animate-pulse bg-white">
                    {visibleColumns.map((col) => (
                      <td key={col.id} className="py-4 px-5">
                        <div className="h-4 bg-slate-100/80 rounded-md w-3/4 animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : processedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="py-12 text-center text-slate-400 font-medium bg-white"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg
                        className="w-10 h-10 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>No live records matched active filter metrics.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {paddingTop > 0 && (
                    <tr style={{ height: `${paddingTop}px` }} className="border-0 bg-transparent">
                      <td colSpan={visibleColumns.length} className="p-0 border-0" />
                    </tr>
                  )}
                  {visibleRows.map((row, relativeIdx) => {
                    const idx = startIndex + relativeIdx;
                    const rowId = getRowId(row, idx);
                    const isChecked = state.rowSelection[rowId] === true;

                    if (renderRow) {
                      return <React.Fragment key={rowId}>{renderRow(row, idx, visibleColumns)}</React.Fragment>;
                    }

                    return (
                      <tr
                        key={rowId}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest("button, a, input, select, textarea, [role='button'], .cursor-pointer")) {
                            return;
                          }
                          toggleRowSelection(rowId);
                        }}
                        className={`${isChecked ? "bg-cyan-50/25" : ""} hover:bg-slate-50/80 transition-colors cursor-pointer`}
                      >
                        {visibleColumns.map((col) => {
                          if (col.id === "checkbox") {
                            return (
                              <td
                                key={col.id}
                                className="py-3 px-4 text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleRowSelection(rowId)}
                                  className="w-3.5 h-3.5 rounded text-cyan-500 focus:ring-cyan-500/30 border-slate-300 accent-cyan-600 cursor-pointer"
                                />
                              </td>
                            );
                          }

                          if (col.id === "actions") {
                            return (
                              <td
                                key={col.id}
                                className="py-3 px-5 text-right relative whitespace-nowrap"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-end gap-2">
                                  {/* Macro actions shortcut buttons */}
                                  <button
                                    onClick={() => {
                                      if (onRowActionTriggered) onRowActionTriggered("Quick Shift Override", row);
                                    }}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-cyan-600 transition-colors"
                                    title="Quick Shift Override"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (onRowActionTriggered) onRowActionTriggered("Modify Parameters", row);
                                    }}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-[#EA580C] transition-colors"
                                    title="Modify Workspace Parameters"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </button>

                                  {/* Kebab Dropdown Contextual Action */}
                                  <div className="relative inline-block text-left" ref={activeKebabRowId === rowId ? kebabContainerRef : null}>
                                    <button
                                      onClick={() => setActiveKebabRowId(activeKebabRowId === rowId ? null : rowId)}
                                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 10a2 2 0 11-2 2 2 2 0 012-2zm0-6a2 2 0 11-2 2 2 2 0 012-2zm0 12a2 2 0 11-2 2 2 2 0 012-2z" />
                                      </svg>
                                    </button>

                                    {activeKebabRowId === rowId && (
                                      <div className={`absolute right-0 w-36 bg-slate-900 text-white rounded-lg shadow-xl border border-slate-800 p-1 z-50 text-left font-medium ${idx >= processedData.length - 2
                                          ? "bottom-full mb-1.5"
                                          : "top-full mt-1.5"
                                        }`}>
                                        {actionMenuSlot ? (
                                          actionMenuSlot(row, () => setActiveKebabRowId(null))
                                        ) : (
                                          <>
                                            <button
                                              onClick={() => {
                                                if (onRowActionTriggered) onRowActionTriggered("View Ledger", row);
                                                setActiveKebabRowId(null);
                                              }}
                                              className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-[10px] font-semibold transition-colors"
                                            >
                                              View Ledger
                                            </button>
                                            <button
                                              onClick={() => {
                                                if (onRowActionTriggered) onRowActionTriggered("Force Sync Telemetry", row);
                                                setActiveKebabRowId(null);
                                              }}
                                              className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-[10px] font-semibold transition-colors"
                                            >
                                              Force Sync
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            );
                          }

                          // Cell extraction logic
                          const val = col.accessorKey ? (row as any)[col.accessorKey] : undefined;
                          return (
                            <td key={col.id} className={`py-3.5 px-5 ${horizontalScroll ? "whitespace-nowrap" : "whitespace-normal break-words"}`}>
                              {col.cell ? col.cell({ row, value: val, column: col }) : String(val ?? "")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {paddingBottom > 0 && (
                    <tr style={{ height: `${paddingBottom}px` }} className="border-0 bg-transparent">
                      <td colSpan={visibleColumns.length} className="p-0 border-0" />
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* High-density footer paginator bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-500 select-none z-10 relative">
          <div className="flex items-center gap-4">
            <div>
              Showing <span className="text-slate-900 font-bold">{totalRows > 0 ? startRowIndex : 0}-{endRowIndex}</span> of{" "}
              <span className="text-slate-900 font-bold">{totalRows}</span> {recordLabel || "live workspace ledgers"}
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4 select-none">
              <span className="text-slate-400">Rows per page:</span>
              <select
                value={state.pagination.pageSize}
                onChange={(e) => {
                  setPagination({
                    pageIndex: 0,
                    pageSize: parseInt(e.target.value, 10),
                  });
                }}
                className="bg-white border border-slate-200 rounded-md px-1.5 py-1 text-slate-700 font-bold text-[10px] focus:outline-none cursor-pointer"
              >
                {[10, 25, 50, 100, 250, 500, 1000, 2500].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={state.pagination.pageIndex === 0}
              onClick={() => handlePageChange(0)}
              className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:bg-white disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              disabled={state.pagination.pageIndex === 0}
              onClick={() => handlePageChange(state.pagination.pageIndex - 1)}
              className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:bg-white disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1"></div>

            {/* Render page numbers */}
            {getPageNumbers().map((page, idx) => {
              if (typeof page === "string") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 text-[10px] font-bold select-none">
                    ...
                  </span>
                );
              }

              const isActive = page === state.pagination.pageIndex;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => handlePageChange(page)}
                  className={`p-1.5 rounded-md shadow-sm text-[9px] px-2.5 cursor-pointer font-bold ${isActive ? "bg-slate-900 text-white border border-slate-900" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                >
                  {page + 1}
                </button>
              );
            })}

            <div className="h-4 w-px bg-slate-200 mx-1"></div>

            <button
              disabled={state.pagination.pageIndex >= pageCount - 1}
              onClick={() => handlePageChange(state.pagination.pageIndex + 1)}
              className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:bg-white disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              disabled={state.pagination.pageIndex >= pageCount - 1}
              onClick={() => handlePageChange(pageCount - 1)}
              className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:bg-white disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Checklist Selection Floating Dock */}
      {/* Slides/Fades into view depending on checked profiles */}
      <div
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-950 text-white px-5 py-3 rounded-full shadow-2xl border border-slate-800 flex items-center gap-5 z-50 transition-all-custom ${selectedCount > 0 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95 pointer-events-none"
          }`}
      >
        <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
          <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-[10px] animate-pulse-dot">
            {selectedCount}
          </span>
          <span className="text-[11px] font-medium tracking-wide text-slate-300">
            {selectionLabel || "Profiles Checked"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {bulkActionSlot ? (
            bulkActionSlot(
              Object.keys(state.rowSelection).filter((id) => state.rowSelection[id]),
              resetSelection
            )
          ) : (
            <>
              <button
                onClick={() => handleDefaultBulkAction("Reassign Shift")}
                className="text-[11px] font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Reassign Shift
              </button>
              <button
                onClick={() => handleDefaultBulkAction("Change Team")}
                className="text-[11px] font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Change Team
              </button>
              <button
                onClick={() => handleDefaultBulkAction("Bulk Suspend")}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Bulk Suspend
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
