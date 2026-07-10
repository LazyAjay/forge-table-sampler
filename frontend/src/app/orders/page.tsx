"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ColumnDef } from "@/components/ui/forge-table/types";
import { useDataTableState } from "@/components/ui/forge-table/useDataTableState";
import { DataTable } from "@/components/ui/forge-table/DataTable";
import { DataTableToolbar } from "@/components/ui/forge-table/DataTableToolbar";

interface OrderData {
  id: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
}

export default function OrdersPage() {
  const [horizontalScroll, setHorizontalScroll] = useState(true);
  const [serverData, setServerData] = useState<OrderData[]>([]);
  const [matchedTotalCount, setMatchedTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const columns = useMemo<ColumnDef<OrderData>[]>(() => [
    {
      id: "checkbox",
      header: "",
    },
    {
      id: "id",
      header: "Order Reference",
      sortable: true,
      accessorKey: "id",
      cell: ({ value }) => (
        <span className="font-mono text-xs text-slate-900 font-bold select-all bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">{value}</span>
      ),
    },
    {
      id: "customerName",
      header: "Client Account Identity",
      sortable: true,
      accessorKey: "customerName",
      cell: ({ value }) => (
        <span className="font-bold text-slate-800 text-sm">{value}</span>
      ),
    },
    {
      id: "orderDate",
      header: "Order Date",
      sortable: true,
      accessorKey: "orderDate",
      filterKey: "orderDate",
      filterLabel: "Order Date",
      filterType: "date",
      cell: ({ value }) => (
        <span className="text-slate-500 font-semibold text-xs font-mono">{value}</span>
      ),
    },
    {
      id: "paymentMethod",
      header: "Payment Channels",
      sortable: true,
      accessorKey: "paymentMethod",
      filterKey: "paymentMethod",
      filterLabel: "Payment",
      filterOptions: ["Credit Card", "PayPal", "Bank Transfer", "Apple Pay"],
      filterColorClass: "text-[#EA580C]",
      filterBgClass: "bg-[#FFF7ED]",
      filterBorderClass: "border-orange-300",
      filterActiveTextClass: "text-orange-800 font-bold",
      isMultiSelect: true,
      cell: ({ value }) => (
        <span className="text-slate-600 font-semibold text-xs">{value}</span>
      ),
    },
    {
      id: "totalAmount",
      header: "Transaction Value",
      sortable: true,
      accessorKey: "totalAmount",
      filterKey: "totalAmount",
      filterLabel: "Amount",
      filterType: "number",
      cell: ({ value }) => (
        <span className="text-emerald-700 font-extrabold font-mono text-xs bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/50">
          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: "status",
      header: "Order Status Log",
      sortable: true,
      accessorKey: "status",
      filterKey: "status",
      filterLabel: "Status",
      filterOptions: ["pending", "shipped", "delivered", "cancelled"],
      filterColorClass: "text-[#10B981]",
      filterBgClass: "bg-emerald-50",
      filterBorderClass: "border-emerald-300",
      filterActiveTextClass: "text-emerald-800 font-bold",
      cell: ({ value }) => {
        let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
        if (value === "delivered") badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (value === "shipped") badgeColor = "bg-cyan-50 text-cyan-700 border-cyan-200";
        if (value === "pending") badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
        if (value === "cancelled") badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${badgeColor} select-none`}>
            {value}
          </span>
        );
      },
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
  } = useDataTableState<OrderData>({
    data: serverData,
    columns,
    totalCount: matchedTotalCount,
    isServerSide: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      horizontalScroll,
    },
  });

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const body = {
      targetEntity: "Order", // Maps to custom_order in DB automatically via JpaRepository
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
        addToast("Failed to connect to backend", "error");
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200/70 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 select-none">
              <span className="bg-[#EA580C] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Sales Ledger
              </span>
              <h1 className="text-xl font-bold text-slate-950 tracking-tight">
                Customer Transactions & Orders
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 select-none">
              Spring Boot dynamic Specifications parsing dates, totals, and payment methods from order logs.
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
