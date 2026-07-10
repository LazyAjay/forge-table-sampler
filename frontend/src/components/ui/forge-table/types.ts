import React from "react";

export interface ColumnDef<TData> {
  id: string;
  header: React.ReactNode | ((props: { column: ColumnDef<TData>; isSorted: "asc" | "desc" | null; toggleSort: () => void }) => React.ReactNode);
  accessorKey?: keyof TData;
  cell?: (props: { row: TData; value: any; column: ColumnDef<TData> }) => React.ReactNode;
  sortable?: boolean;

  // Custom filter configs for scalability
  filterKey?: string;
  filterLabel?: string;
  filterOptions?: string[];
  filterColorClass?: string;
  filterBgClass?: string;
  filterBorderClass?: string;
  filterActiveTextClass?: string;
  isMultiSelect?: boolean;
  filterType?: "select" | "number" | "date" | "boolean";
}

export interface DataTableSorting {
  id: string;
  desc: boolean;
}

export interface DataTablePagination {
  pageIndex: number;
  pageSize: number;
}

export interface DataTableState {
  sorting: DataTableSorting | null;
  pagination: DataTablePagination;
  columnVisibility: Record<string, boolean>;
  rowSelection: Record<string, boolean>;
  searchQuery: string;
  filters: Record<string, any>;
  horizontalScroll?: boolean;
}

export interface DataTableHookProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  totalCount?: number;
  isServerSide?: boolean;
  getRowId?: (row: TData, index: number) => string;
  initialState?: Partial<DataTableState>;
  onStateChange?: (state: DataTableState) => void;
}

export interface DataTableHookReturn<TData> {
  state: DataTableState;
  processedData: TData[];
  pageCount: number;
  totalRows: number;
  setSorting: (sorting: DataTableSorting | null) => void;
  setPagination: (pagination: DataTablePagination) => void;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;
  toggleColumnVisibility: (columnId: string) => void;
  setRowSelection: (selection: Record<string, boolean>) => void;
  toggleRowSelection: (rowId: string) => void;
  toggleAllRowSelection: (rowIds: string[], checked: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilter: (id: string, value: any) => void;
  resetSelection: () => void;
  setHorizontalScroll: (enabled: boolean) => void;
}
