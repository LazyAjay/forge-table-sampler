"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ColumnDef } from "@/components/ui/forge-table/types";
import { useDataTableState } from "@/components/ui/forge-table/useDataTableState";
import { DataTable } from "@/components/ui/forge-table/DataTable";
import { DataTableToolbar } from "@/components/ui/forge-table/DataTableToolbar";

interface ProductData {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: "active" | "discontinued";
  weight: number;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
}

export default function ProductsPage() {
  const [horizontalScroll, setHorizontalScroll] = useState(true);
  const [serverData, setServerData] = useState<ProductData[]>([]);
  const [matchedTotalCount, setMatchedTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (toasts.length > 0) {
      const lastToast = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        removeToast(lastToast.id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const columns = useMemo<ColumnDef<ProductData>[]>(() => [
    {
      id: "checkbox",
      header: "",
    },
    {
      id: "sku",
      header: "SKU Code",
      sortable: true,
      accessorKey: "sku",
      cell: ({ value }) => (
        <span className="font-mono text-xs text-slate-500 font-semibold select-all">{value}</span>
      ),
    },
    {
      id: "name",
      header: "Product Item Name",
      sortable: true,
      accessorKey: "name",
      cell: ({ value }) => (
        <span className="font-bold text-slate-900 text-sm">{value}</span>
      ),
    },
    {
      id: "category",
      header: "Category",
      sortable: true,
      accessorKey: "category",
      filterKey: "category",
      filterLabel: "Category",
      filterOptions: ["Electronics", "Office Supplies", "Home & Living", "Fitness & Outdoors", "Apparel", "Books"],
      filterColorClass: "text-indigo-500",
      filterBgClass: "bg-indigo-50",
      filterBorderClass: "border-indigo-300",
      filterActiveTextClass: "text-indigo-800 font-bold",
      isMultiSelect: true,
      cell: ({ value }) => (
        <span className="text-slate-600 font-semibold text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
          {value}
        </span>
      ),
    },
    {
      id: "price",
      header: "Unit Price",
      sortable: true,
      accessorKey: "price",
      filterKey: "price",
      filterLabel: "Price",
      filterType: "number",
      cell: ({ value }) => (
        <span className="text-emerald-700 font-bold font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: "stock",
      header: "Stock Level",
      sortable: true,
      accessorKey: "stock",
      filterKey: "stock",
      filterLabel: "Stock",
      filterType: "number",
      cell: ({ value }) => {
        const isOutOfStock = value === 0;
        const isLowStock = value > 0 && value < 30;
        return (
          <div className="flex items-center gap-2 max-w-[120px]">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
              <div
                className={`h-full rounded-full transition-all ${isOutOfStock ? "bg-rose-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(100, (value / 500) * 100)}%` }}
              ></div>
            </div>
            <span className={`text-[10px] font-bold min-w-[28px] text-right ${isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-slate-700"}`}>
              {value} units
            </span>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status Flags",
      sortable: true,
      accessorKey: "status",
      filterKey: "status",
      filterLabel: "Status",
      filterOptions: ["active", "discontinued"],
      filterColorClass: "text-[#06B6D4]",
      filterBgClass: "bg-cyan-50",
      filterBorderClass: "border-cyan-300",
      filterActiveTextClass: "text-cyan-800 font-bold",
      cell: ({ value }) => {
        const color = value === "active" 
          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
          : "bg-rose-50 text-rose-700 border-rose-200";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${color} select-none`}>
            {value}
          </span>
        );
      },
    },
    {
      id: "weight",
      header: "Shipping Weight",
      sortable: true,
      accessorKey: "weight",
      cell: ({ value }) => (
        <span className="text-slate-600 font-medium font-mono text-xs">{value.toFixed(1)} kg</span>
      ),
    },
    {
      id: "actions",
      header: "",
    },
  ], [horizontalScroll]);

  const {
    state,
    processedData,
    pageCount,
    totalRows,
    setSorting,
    setPagination,
    toggleRowSelection,
    toggleAllRowSelection,
    setSearchQuery,
    setFilter,
    resetSelection,
    toggleColumnVisibility,
    setHorizontalScroll: setHookHorizontalScroll,
  } = useDataTableState<ProductData>({
    data: serverData,
    columns,
    totalCount: matchedTotalCount,
    isServerSide: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      columnVisibility: { weight: false },
      horizontalScroll,
    },
  });

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const body = {
      targetEntity: "Product",
      page: state.pagination.pageIndex + 1,
      pageSize: state.pagination.pageSize,
      searchQuery: state.searchQuery,
      filters: Object.entries(state.filters)
        .filter(([key, val]) => {
          if (!val) return false;
          if (val && typeof val === "object" && "operator" in val) {
            const op = val.operator;
            const v = val.value;
            if (op === "IS_NULL" || op === "IS_NOT_NULL") return true;
            if (op === "BETWEEN") {
              return Array.isArray(v) && v[0] !== null && v[0] !== "" && v[1] !== null && v[1] !== "";
            }
            return v !== null && v !== "";
          }
          return Array.isArray(val) ? val.length > 0 : val !== "";
        })
        .map(([key, val]) => {
          if (val && typeof val === "object" && "operator" in val) {
            return {
              key,
              operator: val.operator,
              value: val.value
            };
          }
          return {
            key,
            value: val
          };
        }),
      sortFields: state.sorting ? [{
        sortBy: state.sorting.id,
        sortOrder: state.sorting.desc ? "DESC" : "ASC"
      }] : []
    };

    console.log("TableFramework: Fetching data from Spring Boot server...", body);

    fetch("http://localhost:8080/api/v1/tables/fetch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    .then((res) => res.json())
    .then((resData) => {
      if (active) {
        setServerData(resData.data);
        setMatchedTotalCount(resData.totalCount);
        setIsLoading(false);
      }
    })
    .catch((err) => {
      console.error(err);
      if (active) {
        addToast("Unable to connect to server.", "error");
        setServerData([]);
        setMatchedTotalCount(0);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [
    state.sorting,
    state.pagination.pageIndex,
    state.pagination.pageSize,
    state.searchQuery,
    state.filters
  ]);

  return (
    <div className="bg-micro-dot min-h-screen text-slate-800 font-sans antialiased p-6 sm:p-8 pb-32 sm:pb-40 flex-1">
      <div className="max-w-7xl mx-auto space-y-4 relative">
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
          {toasts.map((toast) => (
            <div key={toast.id} className="p-3.5 rounded-xl border shadow-xl flex items-center justify-between pointer-events-auto bg-slate-900 border-slate-800 text-white animate-bounce-short">
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200/70 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 select-none">
              <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Product Database
              </span>
              <h1 className="text-xl font-bold text-slate-950 tracking-tight">
                Inventory SKU Catalog
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 select-none">
              Live Spring Boot JPA lookup demonstrating numeric ranges and categories on Product Entity.
            </p>
          </div>
        </div>

        <DataTableToolbar
          columns={columns}
          state={state}
          setSearchQuery={setSearchQuery}
          setFilter={setFilter}
          toggleColumnVisibility={toggleColumnVisibility}
          setHorizontalScroll={setHorizontalScroll}
        />

        <DataTable
          columns={columns}
          processedData={processedData}
          state={state}
          pageCount={pageCount}
          totalRows={totalRows}
          setSorting={setSorting}
          setPagination={setPagination}
          toggleRowSelection={toggleRowSelection}
          toggleAllRowSelection={toggleAllRowSelection}
          resetSelection={resetSelection}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
