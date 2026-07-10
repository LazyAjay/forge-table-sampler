import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ColumnDef,
  DataTableState,
  DataTableSorting,
  DataTablePagination,
  DataTableHookProps,
  DataTableHookReturn,
} from "./types";

export function useDataTableState<TData>({
  data,
  columns,
  totalCount,
  isServerSide = false,
  getRowId = (row: any, idx: number) => row.uid || row.id || String(idx),
  initialState,
  onStateChange,
}: DataTableHookProps<TData>): DataTableHookReturn<TData> {
  const [sorting, setSortingState] = useState<DataTableSorting | null>(
    initialState?.sorting ?? null
  );
  const [pagination, setPaginationState] = useState<DataTablePagination>(
    initialState?.pagination ?? { pageIndex: 0, pageSize: 10 }
  );
  const [columnVisibility, setColumnVisibilityState] = useState<Record<string, boolean>>(() => {
    const initialVisibility: Record<string, boolean> = {};
    columns.forEach((col) => {
      initialVisibility[col.id] = true;
    });
    if (initialState?.columnVisibility) {
      Object.assign(initialVisibility, initialState.columnVisibility);
    }
    return initialVisibility;
  });
  const [rowSelection, setRowSelectionState] = useState<Record<string, boolean>>(
    initialState?.rowSelection ?? {}
  );
  const [searchQuery, setSearchQueryState] = useState<string>(
    initialState?.searchQuery ?? ""
  );
  const [filters, setFiltersState] = useState<Record<string, any>>(
    initialState?.filters ?? {}
  );
  const [horizontalScroll, setHorizontalScrollState] = useState<boolean>(
    initialState?.horizontalScroll ?? true
  );
  
  const activeState = useMemo<DataTableState>(() => ({
    sorting,
    pagination,
    columnVisibility,
    rowSelection,
    searchQuery,
    filters,
    horizontalScroll,
  }), [sorting, pagination, columnVisibility, rowSelection, searchQuery, filters, horizontalScroll]);

  useEffect(() => {
    if (onStateChange) {
      onStateChange(activeState);
    }
  }, [activeState, onStateChange]);

  const setSorting = useCallback((newSorting: DataTableSorting | null) => {
    setSortingState(newSorting);
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const setPagination = useCallback((newPagination: DataTablePagination) => {
    setPaginationState(newPagination);
  }, []);

  const setColumnVisibility = useCallback((newVisibility: Record<string, boolean>) => {
    setColumnVisibilityState(newVisibility);
  }, []);

  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumnVisibilityState((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }, []);

  const setRowSelection = useCallback((newSelection: Record<string, boolean>) => {
    setRowSelectionState(newSelection);
  }, []);

  const toggleRowSelection = useCallback((rowId: string) => {
    setRowSelectionState((prev) => {
      const copy = { ...prev };
      if (copy[rowId]) {
        delete copy[rowId];
      } else {
        copy[rowId] = true;
      }
      return copy;
    });
  }, []);

  const toggleAllRowSelection = useCallback((rowIds: string[], checked: boolean) => {
    setRowSelectionState((prev) => {
      const copy = { ...prev };
      rowIds.forEach((id) => {
        if (checked) {
          copy[id] = true;
        } else {
          delete copy[id];
        }
      });
      return copy;
    });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const setFilter = useCallback((id: string, value: any) => {
    setFiltersState((prev) => {
      const updated = { ...prev };
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "All Fields" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete updated[id];
      } else {
        updated[id] = value;
      }
      return updated;
    });
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const resetSelection = useCallback(() => {
    setRowSelectionState({});
  }, []);

  const setHorizontalScroll = useCallback((enabled: boolean) => {
    setHorizontalScrollState(enabled);
  }, []);

  const { processedData, totalRows, pageCount } = useMemo(() => {
    if (isServerSide) {
      const total = totalCount ?? data.length;
      return {
        processedData: data,
        totalRows: total,
        pageCount: Math.ceil(total / pagination.pageSize) || 1,
      };
    }

    // 1. Filter by Search Query
    let result = [...data];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((row) => {
        return Object.entries(row as any).some(([key, val]) => {
          if (typeof val === "string" || typeof val === "number") {
            return String(val).toLowerCase().includes(query);
          }
          return false;
        });
      });
    }

    // 2. Filter by Column Filter Keys (supporting both single and multi-select array states)
    Object.entries(filters).forEach(([filterKey, filterValue]) => {
      if (filterValue !== undefined && filterValue !== null) {
        // Normalize filterValue to an array for uniform checking
        const filterValues = Array.isArray(filterValue) ? filterValue : [filterValue];
        if (filterValues.length === 0) return; // skip if empty array

        result = result.filter((row) => {
          const val = (row as any)[filterKey];
          if (typeof val === "string") {
            const rowValues = val.includes(",")
              ? val.toLowerCase().split(",").map((s) => s.trim())
              : [val.toLowerCase()];

            // Return true if any of the filter values match any of the row values
            return filterValues.some((fv) =>
              rowValues.includes(String(fv).toLowerCase())
            );
          }
          // For non-string or other primitive values
          return filterValues.includes(val);
        });
      }
    });

    const filteredCount = result.length;

    // 3. Apply Sorting
    if (sorting) {
      const { id: sortColId, desc } = sorting;
      const colDef = columns.find((c) => c.id === sortColId);
      const accessor = colDef?.accessorKey;

      if (accessor) {
        result.sort((a, b) => {
          let aVal = a[accessor];
          let bVal = b[accessor];

          if (aVal == null) aVal = "" as any;
          if (bVal == null) bVal = "" as any;

          if (typeof aVal === "string" && typeof bVal === "string") {
            return desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
          }
          return desc ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
        });
      }
    }

    // 4. Slice for Pagination
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    const sliced = result.slice(start, end);

    return {
      processedData: sliced,
      totalRows: filteredCount,
      pageCount: Math.ceil(filteredCount / pagination.pageSize) || 1,
    };
  }, [data, columns, sorting, pagination, searchQuery, filters, isServerSide, totalCount]);

  return {
    state: activeState,
    processedData,
    pageCount,
    totalRows,
    setSorting,
    setPagination,
    setColumnVisibility,
    toggleColumnVisibility,
    setRowSelection,
    toggleRowSelection,
    toggleAllRowSelection,
    setSearchQuery,
    setFilter,
    resetSelection,
    setHorizontalScroll,
  };
}
