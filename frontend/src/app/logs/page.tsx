"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ColumnDef } from "@/components/ui/forge-table/types";
import { useDataTableState } from "@/components/ui/forge-table/useDataTableState";
import { DataTable } from "@/components/ui/forge-table/DataTable";
import { DataTableToolbar } from "@/components/ui/forge-table/DataTableToolbar";

interface LogData {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  serviceName: string;
  message: string;
  durationMs: number;
}

export default function LogsPage() {
  const [horizontalScroll, setHorizontalScroll] = useState(true);
  const [serverData, setServerData] = useState<LogData[]>([]);
  const [matchedTotalCount, setMatchedTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const columns = useMemo<ColumnDef<LogData>[]>(() => [
    {
      id: "checkbox",
      header: "",
    },
    {
      id: "level",
      header: "Log Severity Level",
      sortable: true,
      accessorKey: "level",
      filterKey: "level",
      filterLabel: "Severity",
      filterOptions: ["INFO", "WARN", "ERROR", "DEBUG"],
      filterColorClass: "text-[#06B6D4]",
      filterBgClass: "bg-cyan-50",
      filterBorderClass: "border-cyan-300",
      filterActiveTextClass: "text-cyan-800 font-bold",
      isMultiSelect: true,
      cell: ({ value }) => {
        let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
        if (value === "INFO") badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
        if (value === "WARN") badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
        if (value === "ERROR") badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
        if (value === "DEBUG") badgeColor = "bg-slate-100 text-slate-700 border-slate-200 font-mono";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${badgeColor} select-none`}>
            {value}
          </span>
        );
      },
    },
    {
      id: "timestamp",
      header: "Event Timestamp",
      sortable: true,
      accessorKey: "timestamp",
      cell: ({ value }) => (
        <span className="text-slate-500 font-medium text-xs font-mono">{value}</span>
      ),
    },
    {
      id: "serviceName",
      header: "System Microservice",
      sortable: true,
      accessorKey: "serviceName",
      filterKey: "serviceName",
      filterLabel: "Microservice",
      filterOptions: ["AuthService", "OrderService", "InventoryService", "BillingService", "NotificationService", "TableModelEngine"],
      filterColorClass: "text-indigo-500",
      filterBgClass: "bg-indigo-50",
      filterBorderClass: "border-indigo-300",
      filterActiveTextClass: "text-indigo-800 font-bold",
      isMultiSelect: true,
      cell: ({ value }) => (
        <span className="text-slate-800 font-semibold text-xs font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{value}</span>
      ),
    },
    {
      id: "message",
      header: "Log Message Context",
      sortable: true,
      accessorKey: "message",
      cell: ({ value }) => (
        <span className="text-slate-600 font-medium text-xs break-all block max-w-md">{value}</span>
      ),
    },
    {
      id: "durationMs",
      header: "Duration (ms)",
      sortable: true,
      accessorKey: "durationMs",
      filterKey: "durationMs",
      filterLabel: "Duration",
      filterType: "number",
      cell: ({ value }) => {
        const isSlow = value > 1000;
        return (
          <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${isSlow ? "text-rose-700 bg-rose-50 border border-rose-200/50" : "text-slate-600 bg-slate-50"}`}>
            {value} ms
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
  } = useDataTableState<LogData>({
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
      targetEntity: "SystemLog",
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
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                System Console
              </span>
              <h1 className="text-xl font-bold text-slate-950 tracking-tight">
                Microservice Diagnostic Logs
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 select-none">
              JPA Generic mapping showing system event levels, microservices names, message contexts and compute durations.
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
