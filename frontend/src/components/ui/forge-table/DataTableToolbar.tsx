"use client";

import React, { useState, useEffect, useRef } from "react";
import { ColumnDef, DataTableState } from "./types";

interface DataTableToolbarProps<TData> {
  columns: ColumnDef<TData>[];
  state: DataTableState;
  setSearchQuery: (query: string) => void;
  setFilter: (id: string, value: any) => void;
  toggleColumnVisibility: (columnId: string) => void;
  setHorizontalScroll?: (enabled: boolean) => void;
  filterPopoverHeader?: string;
}

export function DataTableToolbar<TData>({
  columns,
  state,
  setSearchQuery,
  setFilter,
  toggleColumnVisibility,
  setHorizontalScroll,
  filterPopoverHeader,
}: DataTableToolbarProps<TData>) {
  // Local state for search input to prevent text lag on intensive cell renders
  const [localSearch, setLocalSearch] = useState(state.searchQuery);

  // centralized tracker for open filters popover
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [openSelectKey, setOpenSelectKey] = useState<string | null>(null);

  // Single ref for toolbar container to close all dropdowns when clicking outside
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Debounce search input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 150);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, setSearchQuery]);

  // Sync back search input if changed externally
  useEffect(() => {
    setLocalSearch(state.searchQuery);
  }, [state.searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setFiltersOpen(false);
        setColumnsOpen(false);
        setOpenSelectKey(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const OPERATORS = [
    { value: "EQUAL", label: "=" },
    { value: "NOT_EQUAL", label: "≠" },
    { value: "GREATER_THAN", label: ">" },
    { value: "LESS_THAN", label: "<" },
    { value: "GREATER_THAN_OR_EQUAL", label: "≥" },
    { value: "LESS_THAN_OR_EQUAL", label: "≤" },
    { value: "BETWEEN", label: "Between" },
    { value: "IS_NULL", label: "Is Null" },
    { value: "IS_NOT_NULL", label: "Is Not Null" },
  ];

  const getFilterState = (activeValue: any) => {
    if (activeValue && typeof activeValue === "object" && "operator" in activeValue) {
      return activeValue as { operator: string; value: any };
    }
    return {
      operator: Array.isArray(activeValue) ? "IN" : activeValue ? "EQUAL" : "EQUAL",
      value: activeValue || null
    };
  };

  const isFilterActive = (col: ColumnDef<TData>) => {
    const filterKey = col.filterKey!;
    const val = state.filters[filterKey];
    if (!val) return false;
    
    if (val && typeof val === "object" && "operator" in val) {
      const op = val.operator;
      const v = val.value;
      if (op === "IS_NULL" || op === "IS_NOT_NULL") return true;
      if (op === "BETWEEN") {
        if (!Array.isArray(v)) return false;
        return v[0] !== null && v[0] !== undefined && v[0] !== "" && v[1] !== null && v[1] !== undefined && v[1] !== "";
      }
      return v !== null && v !== undefined && v !== "";
    }
    
    if (Array.isArray(val)) return val.length > 0;
    return val !== "";
  };

  const getPillLabel = (col: ColumnDef<TData>, activeValue: any) => {
    if (!activeValue) return "";
    if (typeof activeValue === "object" && "operator" in activeValue) {
      const op = activeValue.operator;
      const val = activeValue.value;
      if (op === "IS_NULL") return "Is Empty";
      if (op === "IS_NOT_NULL") return "Is Assigned";
      if (op === "BETWEEN") {
        const minVal = Array.isArray(val) ? val[0] : "";
        const maxVal = Array.isArray(val) ? val[1] : "";
        return `${minVal} - ${maxVal}`;
      }
      const opSymbol = OPERATORS.find(o => o.value === op)?.label || op;
      return `${opSymbol} ${val}`;
    }
    
    if (Array.isArray(activeValue)) {
      return activeValue.map((v) =>
        v === "INSIDE RADAR SITE" ? "Inside Site" :
        v === "OUTSIDE BOUNDS" ? "Outside Bounds" :
        v === "SIGNAL TERMINATED / ABSENT" ? "Absent" :
        v === "CALENDAR OFF-DUTY" ? "Off-Duty" : String(v)
      ).join(", ");
    }
    
    return activeValue === "INSIDE RADAR SITE" ? "Inside Site" :
           activeValue === "OUTSIDE BOUNDS" ? "Outside Bounds" :
           activeValue === "SIGNAL TERMINATED / ABSENT" ? "Absent" :
           activeValue === "CALENDAR OFF-DUTY" ? "Off-Duty" : String(activeValue);
  };

  const filterableColumns = columns.filter((col) => col.filterKey);

  const hasActiveFiltersExcludingSearch = filterableColumns.some(isFilterActive);

  const hasActiveFilters =
    !!state.searchQuery || hasActiveFiltersExcludingSearch;

  const activeFiltersCount = filterableColumns.filter(isFilterActive).length;

  const handleResetFiltersOnly = () => {
    filterableColumns.forEach((col) => {
      setFilter(col.filterKey!, null);
    });
  };

  const handleResetFilters = () => {
    setLocalSearch("");
    setSearchQuery("");
    filterableColumns.forEach((col) => {
      setFilter(col.filterKey!, null);
    });
  };

  // Count visible columns (excluding predefined locked columns: checkbox, actions, name)
  const isLockedColumn = (id: string) => id === "checkbox" || id === "actions" || id === "name";

  const totalTogglableColumns = columns.filter((col) => !isLockedColumn(col.id)).length;
  const visibleTogglableColumnsCount = columns.filter(
    (col) => !isLockedColumn(col.id) && state.columnVisibility[col.id] !== false
  ).length;

  const searchActive = !!localSearch;

  // Helper for dynamic pluralization of filter descriptions
  const getFilterAllLabel = (label: string) => {
    if (label.toLowerCase().endsWith("s")) {
      return `All ${label}`;
    }
    return `All ${label}s`;
  };

  // Render SVG icons according to column identity, using dynamic colors from columnDef
  const renderFilterIcon = (col: ColumnDef<TData>, active: boolean) => {
    const activeColorClass = col.filterColorClass || "text-cyan-500";
    const colorClass = active ? activeColorClass : "text-slate-400";

    switch (col.id) {
      case "dept":
        return (
          <svg
            className={`w-3.5 h-3.5 transition-colors ${colorClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      case "shift":
        return (
          <svg
            className={`w-3.5 h-3.5 transition-colors ${colorClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "compliance":
        return (
          <svg
            className={`w-3.5 h-3.5 transition-colors ${colorClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="7" strokeWidth={2} />
            <circle cx="12" cy="12" r="2.5" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
        );
      case "skills":
        return (
          <svg
            className={`w-3.5 h-3.5 transition-colors ${colorClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.591 0l4.318-4.318a1.125 1.125 0 000-1.591L9.568 3.659A2.25 2.25 0 007.977 3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 6h.008v.008H6V6z"
            />
          </svg>
        );
      case "riskLevel":
        return (
          <svg
            className={`w-3.5 h-3.5 transition-colors ${colorClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        );
      default:
        // funnel filter icon
        return (
          <svg
            className={`w-3.5 h-3.5 transition-colors ${colorClass}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        );
    }
  };

  return (
    <div ref={toolbarRef} className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200/80 shadow-sm space-y-2 relative z-40">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input Bar */}
        <div className="relative flex-1 max-w-md">
          <span className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors ${searchActive ? "text-cyan-500" : "text-slate-400"}`}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search system database (e.g. employee name, precise identifier token)..."
            className={`w-full pl-9 pr-8 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 ${
              searchActive 
                ? "bg-cyan-50/15 border-cyan-400/80 font-medium ring-1 ring-cyan-400/10" 
                : "bg-slate-50 border-slate-200"
            }`}
          />
          {searchActive && (
            <button
              onClick={() => {
                setLocalSearch("");
                setSearchQuery("");
              }}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Action Group (Centralized Popover Filter, Columns, Reset) */}
        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          
          {/* Horizontal Scroll Toggle */}
          {setHorizontalScroll && (
            <button
              onClick={() => setHorizontalScroll(!(state.horizontalScroll ?? true))}
              className={`px-2.5 py-1.5 border rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                (state.horizontalScroll ?? true)
                  ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                  : "bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100/50"
              }`}
              title={(state.horizontalScroll ?? true) ? "Disable Horizontal Scrolling (Wrap Columns)" : "Enable Horizontal Scrolling (Scroll Columns)"}
            >
              {(state.horizontalScroll ?? true) ? (
                <>
                  <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Scrollable</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Wrapped</span>
                </>
              )}
            </button>
          )}

          {/* Centralized Popover Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setFiltersOpen(!filtersOpen);
                setColumnsOpen(false);
                setOpenSelectKey(null);
              }}
              className={`px-2.5 py-1.5 border rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                hasActiveFiltersExcludingSearch
                  ? "bg-cyan-50 border-cyan-300 text-cyan-800"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <svg
                className={`w-3.5 h-3.5 ${hasActiveFiltersExcludingSearch ? "text-cyan-600" : "text-slate-500"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {filtersOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 space-y-3 text-xs text-slate-700 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900">{filterPopoverHeader || "Filter Records"}</span>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleResetFiltersOnly}
                      className="text-[10px] text-cyan-600 hover:text-cyan-800 font-bold transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-0.5">
                  {filterableColumns.map((col) => {
                    const filterKey = col.filterKey!;
                    const activeValue = state.filters[filterKey];
                    const labelText = (col.filterLabel || (typeof col.header === "string" ? col.header : col.id)) as string;
                    const filterOptions = col.filterOptions || [];
                    const filterType = col.filterType || (col.filterOptions ? "select" : "string");
                    const filterState = getFilterState(activeValue);

                    return (
                      <div key={filterKey} className="flex flex-col border-b border-slate-100/50 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {renderFilterIcon(col, isFilterActive(col))}
                          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                            {labelText}
                          </span>
                        </div>

                        {filterType === "number" || filterType === "date" ? (
                          <div className="space-y-1.5">
                            <select
                              value={filterState.operator}
                              onChange={(e) => {
                                const nextOp = e.target.value;
                                let nextVal = filterState.value;
                                if (nextOp === "BETWEEN") {
                                  nextVal = [null, null];
                                } else if (nextOp === "IS_NULL" || nextOp === "IS_NOT_NULL") {
                                  nextVal = null;
                                } else if (Array.isArray(nextVal)) {
                                  nextVal = nextVal[0] || null;
                                }
                                setFilter(filterKey, { operator: nextOp, value: nextVal });
                              }}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                              {OPERATORS.map(op => (
                                <option key={op.value} value={op.value}>{op.label} ({op.value.replace(/_/g, " ")})</option>
                              ))}
                            </select>

                            {filterState.operator !== "IS_NULL" && filterState.operator !== "IS_NOT_NULL" && (
                              <div>
                                {filterState.operator === "BETWEEN" ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type={filterType === "number" ? "number" : "date"}
                                      placeholder="Min"
                                      value={Array.isArray(filterState.value) && filterState.value[0] !== null ? filterState.value[0] : ""}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        const parsed = filterType === "number" ? (v === "" ? null : Number(v)) : (v || null);
                                        const currentMax = Array.isArray(filterState.value) ? filterState.value[1] : null;
                                        setFilter(filterKey, { operator: "BETWEEN", value: [parsed, currentMax] });
                                      }}
                                      className="w-1/2 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    />
                                    <span className="text-[10px] text-slate-400 font-bold">to</span>
                                    <input
                                      type={filterType === "number" ? "number" : "date"}
                                      placeholder="Max"
                                      value={Array.isArray(filterState.value) && filterState.value[1] !== null ? filterState.value[1] : ""}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        const parsed = filterType === "number" ? (v === "" ? null : Number(v)) : (v || null);
                                        const currentMin = Array.isArray(filterState.value) ? filterState.value[0] : null;
                                        setFilter(filterKey, { operator: "BETWEEN", value: [currentMin, parsed] });
                                      }}
                                      className="w-1/2 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    />
                                  </div>
                                ) : (
                                  <input
                                    type={filterType === "number" ? "number" : "date"}
                                    placeholder="Enter value..."
                                    value={filterState.value !== null && !Array.isArray(filterState.value) ? filterState.value : ""}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      const parsed = filterType === "number" ? (v === "" ? null : Number(v)) : (v || null);
                                      setFilter(filterKey, { operator: filterState.operator, value: parsed });
                                    }}
                                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        ) : filterType === "boolean" ? (
                          <select
                            value={activeValue === null ? "all" : activeValue && typeof activeValue === "object" ? (activeValue.operator === "IS_NULL" ? "null" : activeValue.operator === "IS_NOT_NULL" ? "not_null" : String(activeValue.value)) : "all"}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "all") {
                                setFilter(filterKey, null);
                              } else if (val === "true") {
                                setFilter(filterKey, { operator: "EQUAL", value: true });
                              } else if (val === "false") {
                                setFilter(filterKey, { operator: "EQUAL", value: false });
                              } else if (val === "null") {
                                setFilter(filterKey, { operator: "IS_NULL", value: null });
                              } else if (val === "not_null") {
                                setFilter(filterKey, { operator: "IS_NOT_NULL", value: null });
                              }
                            }}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          >
                            <option value="all">All Values</option>
                            <option value="true">Yes / True</option>
                            <option value="false">No / False</option>
                            <option value="null">Unassigned (Is Null)</option>
                            <option value="not_null">Assigned (Is Not Null)</option>
                          </select>
                        ) : col.isMultiSelect ? (
                          <div className="space-y-1 mt-1 max-h-32 overflow-y-auto border border-slate-100 p-1.5 rounded-lg bg-slate-50">
                            {filterOptions.map((opt) => {
                              const currentArr = Array.isArray(activeValue) ? activeValue : activeValue ? [activeValue] : [];
                              const isChecked = currentArr.includes(opt);
                              return (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-slate-100 rounded px-1.5 text-slate-700 select-none">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      let nextValue: any;
                                      if (e.target.checked) {
                                        nextValue = [...currentArr, opt];
                                      } else {
                                        nextValue = currentArr.filter((v) => v !== opt);
                                        if (nextValue.length === 0) nextValue = null;
                                      }
                                      setFilter(filterKey, nextValue);
                                    }}
                                    className="w-3.5 h-3.5 text-cyan-500 rounded border-slate-300 accent-cyan-600 cursor-pointer"
                                  />
                                  <span className="font-semibold text-[11px]">
                                    {opt === "INSIDE RADAR SITE" ? "Inside Site" :
                                     opt === "OUTSIDE BOUNDS" ? "Outside Bounds" :
                                     opt === "SIGNAL TERMINATED / ABSENT" ? "Absent / Risk" :
                                     opt === "CALENDAR OFF-DUTY" ? "Off-Duty" : opt}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="relative w-full">
                            <button
                              type="button"
                              onClick={() => setOpenSelectKey(openSelectKey === filterKey ? null : filterKey)}
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-between transition-all cursor-pointer hover:bg-slate-100/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                            >
                              <span>
                                {activeValue
                                  ? (activeValue === "INSIDE RADAR SITE" ? "Inside Site" :
                                     activeValue === "OUTSIDE BOUNDS" ? "Outside Bounds" :
                                     activeValue === "SIGNAL TERMINATED / ABSENT" ? "Absent / Risk" :
                                     activeValue === "CALENDAR OFF-DUTY" ? "Off-Duty" : activeValue)
                                  : `${getFilterAllLabel(labelText)}`}
                              </span>
                              <svg
                                className={`w-3 h-3 text-slate-400 transition-transform ${openSelectKey === filterKey ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {openSelectKey === filterKey && (
                              <div className="absolute left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-slate-200 p-1 z-50 max-h-40 overflow-y-auto space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFilter(filterKey, null);
                                    setOpenSelectKey(null);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-50 text-[11px] font-semibold transition-colors ${!activeValue ? "text-cyan-600 bg-cyan-50/50" : "text-slate-600"}`}
                                >
                                  {getFilterAllLabel(labelText)}
                                </button>
                                {filterOptions.map((opt) => {
                                  const isSelected = activeValue === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => {
                                        setFilter(filterKey, opt);
                                        setOpenSelectKey(null);
                                      }}
                                      className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-50 text-[11px] font-semibold transition-colors ${isSelected ? "text-cyan-600 bg-cyan-50" : "text-slate-600"}`}
                                    >
                                      {opt === "INSIDE RADAR SITE" ? "Inside Site" :
                                       opt === "OUTSIDE BOUNDS" ? "Outside Bounds" :
                                       opt === "SIGNAL TERMINATED / ABSENT" ? "Absent / Risk" :
                                       opt === "CALENDAR OFF-DUTY" ? "Off-Duty" : opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block"></div>

          {/* Column Customization Toggler */}
          <div className="relative">
            <button
              onClick={() => {
                setColumnsOpen(!columnsOpen);
                setFiltersOpen(false);
                setOpenSelectKey(null);
              }}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5 text-[#06B6D4]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
              Columns{" "}
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                {visibleTogglableColumnsCount}/{totalTogglableColumns}
              </span>
              <svg
                className={`w-2.5 h-2.5 text-slate-400 transition-transform ${columnsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {columnsOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-0.5 text-xs text-slate-700 z-50">
                <span className="block px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Additional Columns
                </span>
                {columns
                  .filter((col) => !isLockedColumn(col.id))
                  .map((col) => {
                    const isVisible = state.columnVisibility[col.id] !== false;
                    const headerText =
                      typeof col.header === "string"
                        ? col.header
                        : col.id.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                    return (
                      <label
                        key={col.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => toggleColumnVisibility(col.id)}
                          className="w-3.5 h-3.5 text-cyan-500 rounded border-slate-300 accent-cyan-600 cursor-pointer"
                        />
                        <span className="font-semibold text-slate-700">{headerText}</span>
                      </label>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Reset Filters Option */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer ml-1"
            >
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Render Active Filter Pills in a secondary row below to prevent cramped layout space */}
      {hasActiveFiltersExcludingSearch && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Active Filters:
          </span>
          {filterableColumns.map((col) => {
            const filterKey = col.filterKey!;
            const activeValue = state.filters[filterKey];
            if (!isFilterActive(col)) return null;

            const bgClass = col.filterBgClass || "bg-cyan-50";
            const borderClass = col.filterBorderClass || "border-cyan-300";
            const textClass = col.filterActiveTextClass || "text-cyan-800 font-bold";
            const labelText =
              col.filterLabel ||
              (typeof col.header === "string"
                ? col.header
                : col.id.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()));

            return (
              <span
                key={filterKey}
                className={`inline-flex items-center gap-1.5 px-2 py-1 border rounded-lg text-xs font-semibold transition-all ${bgClass} ${borderClass} ${textClass}`}
              >
                {renderFilterIcon(col, true)}
                <span>
                  {labelText}: {getPillLabel(col, activeValue)}
                </span>
                <button
                  onClick={() => setFilter(filterKey, null)}
                  className="hover:bg-black/10 rounded-full p-0.5 transition-colors cursor-pointer"
                  title={`Clear ${labelText} Filter`}
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
