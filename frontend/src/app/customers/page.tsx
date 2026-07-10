"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ColumnDef } from "@/components/ui/forge-table/types";
import { useDataTableState } from "@/components/ui/forge-table/useDataTableState";
import { DataTable } from "@/components/ui/forge-table/DataTable";
import { DataTableToolbar } from "@/components/ui/forge-table/DataTableToolbar";

interface CustomerData {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  rating: number;
  creditLimit: number;
  status: "active" | "inactive";
}

export default function CustomersPage() {
  const [horizontalScroll, setHorizontalScroll] = useState(true);
  const [serverData, setServerData] = useState<CustomerData[]>([]);
  const [matchedTotalCount, setMatchedTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const columns = useMemo<ColumnDef<CustomerData>[]>(() => [
    {
      id: "checkbox",
      header: "",
    },
    {
      id: "companyName",
      header: "Corporate Client Name",
      sortable: true,
      accessorKey: "companyName",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-900 text-sm">{row.companyName}</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{row.id}</div>
        </div>
      ),
    },
    {
      id: "email",
      header: "Contact Email",
      sortable: true,
      accessorKey: "email",
      cell: ({ value }) => (
        <span className="text-slate-600 text-xs hover:underline select-all cursor-pointer">{value}</span>
      ),
    },
    {
      id: "phone",
      header: "Phone Number",
      sortable: true,
      accessorKey: "phone",
      cell: ({ value }) => (
        <span className="text-slate-600 font-medium font-mono text-[11px] select-all">{value}</span>
      ),
    },
    {
      id: "country",
      header: "Country Location",
      sortable: true,
      accessorKey: "country",
      filterKey: "country",
      filterLabel: "Country",
      filterOptions: ["USA", "Canada", "UK", "Germany", "France", "Japan", "Australia", "India"],
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
      id: "rating",
      header: "Customer Rating",
      sortable: true,
      accessorKey: "rating",
      filterKey: "rating",
      filterLabel: "Rating",
      filterType: "number",
      cell: ({ value }) => (
        <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs select-none">
          {"★".repeat(value)}
          <span className="text-slate-300 font-normal">{"☆".repeat(5 - value)}</span>
        </div>
      ),
    },
    {
      id: "creditLimit",
      header: "Credit Allowance",
      sortable: true,
      accessorKey: "creditLimit",
      filterKey: "creditLimit",
      filterLabel: "Credit",
      filterType: "number",
      cell: ({ value }) => (
        <span className="text-emerald-700 font-extrabold font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
          ${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      accessorKey: "status",
      filterKey: "status",
      filterLabel: "Status",
      filterOptions: ["active", "inactive"],
      filterColorClass: "text-[#06B6D4]",
      filterBgClass: "bg-cyan-50",
      filterBorderClass: "border-cyan-300",
      filterActiveTextClass: "text-cyan-800 font-bold",
      cell: ({ value }) => {
        const color = value === "active" 
          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
          : "bg-slate-100 text-slate-500 border-slate-200";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${color} select-none`}>
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
  } = useDataTableState<CustomerData>({
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
      targetEntity: "Customer",
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
              <span className="bg-[#10B981] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Corporate CRM
              </span>
              <h1 className="text-xl font-bold text-slate-950 tracking-tight">
                Client Accounts & Ratings
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 select-none">
              JPA Generic dynamic Specification querying and sorting ratings (1-5), countries, and credit limits.
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
