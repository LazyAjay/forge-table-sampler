"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ColumnDef } from "@/components/ui/forge-table/types";
import { useDataTableState } from "@/components/ui/forge-table/useDataTableState";
import { DataTable } from "@/components/ui/forge-table/DataTable";
import { DataTableToolbar } from "@/components/ui/forge-table/DataTableToolbar";

interface EmployeeData {
  id: string;
  name: string;
  project: string;
  location: string;
  checkInTime: string;
  checkOutTime: string;
  hours: string;
  reportSubmitted: boolean;
  report: string;
  ssn: string | null;
  salary: number | null;
}

// Custom Toast interface
interface Toast {
  id: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
}

export default function UserManagementPage() {
  const [horizontalScroll, setHorizontalScroll] = useState(true);
  const [serverData, setServerData] = useState<EmployeeData[]>([]);
  const [matchedTotalCount, setMatchedTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Dynamic role switching for testing PII masking
  const [activeRole, setActiveRole] = useState<"STANDARD_USER" | "ADMIN">("STANDARD_USER");

  // Detailed Modal states
  const [activeModal, setActiveModal] = useState<"details" | "ledger" | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);

  const handleViewLedger = (row: EmployeeData) => {
    setSelectedEmployee(row);
    setActiveModal("ledger");
  };

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auto-dismiss toasts
  useEffect(() => {
    if (toasts.length > 0) {
      const lastToast = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        removeToast(lastToast.id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Click outside to close export menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Columns definition matrix mapping matching the new workforce schema
  const columns = useMemo<ColumnDef<EmployeeData>[]>(() => [
    {
      id: "checkbox",
      header: "",
    },
    {
      id: "name",
      header: "Employee Identity Context",
      sortable: true,
      accessorKey: "name",
      cell: ({ row }) => (
        <div className={`flex items-center gap-3 select-none overflow-hidden ${horizontalScroll ? "max-w-[200px]" : "w-full"}`}>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-[10px] shadow-sm select-none shrink-0">
            {row.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden min-w-0">
            <div className={`font-bold text-slate-900 text-sm leading-tight ${horizontalScroll ? "truncate" : "break-words"}`}>{row.name}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{row.id}</div>
          </div>
        </div>
      ),
    },
    {
      id: "project",
      header: "Project Assigned",
      sortable: true,
      accessorKey: "project",
      filterKey: "project",
      filterLabel: "Project",
      filterOptions: ["Project Horizon", "Project Apex", "Project Gemini", "Project Sentinel", "Project Titan"],
      filterColorClass: "text-indigo-500",
      filterBgClass: "bg-indigo-50",
      filterBorderClass: "border-indigo-300",
      filterActiveTextClass: "text-indigo-800 font-bold",
      isMultiSelect: true,
      cell: ({ value }) => (
        <span className="text-slate-800 font-semibold text-xs">{value}</span>
      ),
    },
    {
      id: "location",
      header: "Location Assigned",
      sortable: true,
      accessorKey: "location",
      filterKey: "location",
      filterLabel: "Location",
      filterOptions: ["New York Office", "Chicago Depot", "San Francisco Lab", "Austin Hub", "Remote HQ"],
      filterColorClass: "text-orange-500",
      filterBgClass: "bg-orange-50",
      filterBorderClass: "border-orange-300",
      filterActiveTextClass: "text-orange-800 font-bold",
      isMultiSelect: true,
      cell: ({ value }) => (
        <span className="text-slate-600 font-semibold text-xs">{value}</span>
      ),
    },
    {
      id: "timecard",
      header: "Shift Timing & Hours",
      sortable: true,
      accessorKey: "hours",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 min-w-[140px]">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold select-none">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono font-bold text-slate-700">{row.checkInTime}</span>
            <span className="text-slate-400 font-normal">—</span>
            <span className="font-mono font-bold text-slate-700">{row.checkOutTime}</span>
          </div>
          <div className="flex items-center gap-1.5 select-none">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-cyan-50 text-cyan-800 px-1.5 py-0.5 rounded border border-cyan-200/60 uppercase shadow-sm">
              <span className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse"></span>
              {row.hours}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "reportSubmitted",
      header: "Report Submitted",
      sortable: true,
      accessorKey: "reportSubmitted",
      filterKey: "reportSubmitted",
      filterLabel: "Submitted?",
      filterType: "boolean",
      cell: ({ value }) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase select-none ${
          value 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : "bg-rose-50 text-rose-700 border-rose-200"
        }`}>
          {value ? "Yes" : "No"}
        </span>
      ),
    },
    {
      id: "report",
      header: "Shift Report Snippet",
      sortable: true,
      accessorKey: "report",
      cell: ({ value }) => (
        <span className="text-slate-500 font-medium text-xs truncate block max-w-[200px]" title={value}>
          {value}
        </span>
      ),
    },

    {
      id: "ssn",
      header: "SSN (PII DATA)",
      sortable: true,
      accessorKey: "ssn",
      cell: ({ value }) => {
        const isMasked = value === "***-**-****";
        return (
          <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
            isMasked 
              ? "text-slate-400 bg-slate-50 border-slate-200 border-dashed" 
              : "text-slate-700 bg-slate-50 border-slate-200"
          }`}>
            {value || "N/A"}
          </span>
        );
      }
    },
    {
      id: "salary",
      header: "Salary Compensation",
      sortable: true,
      accessorKey: "salary",
      filterKey: "salary",
      filterLabel: "Salary",
      filterType: "number",
      cell: ({ value }) => {
        if (value === null || value === undefined) {
          return (
            <span className="text-slate-400 font-semibold italic text-xs tracking-wider select-none bg-slate-50 px-2 py-0.5 rounded border border-slate-200 border-dashed">
              $**,***
            </span>
          );
        }
        return (
          <span className="text-emerald-700 font-bold font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
            ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      }
    },
    {
      id: "actions",
      header: "",
    },
  ], [horizontalScroll]);

  // Headless hook instantiation with server-side configurations
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
  } = useDataTableState<EmployeeData>({
    data: serverData,
    columns,
    totalCount: matchedTotalCount,
    isServerSide: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      columnVisibility: { ssn: false, salary: false, report: true },
      horizontalScroll,
    },
  });

  const handleToggleHorizontalScroll = (enabled: boolean) => {
    setHorizontalScroll(enabled);
    setHookHorizontalScroll(enabled);
  };

  // Simulated server-side fetch trigger responding to hook state changes and active user role
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    // Build the generic API request body payload
    const body = {
      targetEntity: "Employee",
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
        sortBy: state.sorting.id === "timecard" ? "hours" : state.sorting.id,
        sortOrder: state.sorting.desc ? "DESC" : "ASC"
      }] : []
    };

    fetch("http://localhost:8080/api/v1/tables/fetch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": activeRole
      },
      body: JSON.stringify(body)
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error("HTTP error " + res.status);
      }
      return res.json();
    })
    .then((resData) => {
      if (active) {
        setServerData(resData.data);
        setMatchedTotalCount(resData.totalCount);
        setIsLoading(false);
      }
    })
    .catch((err) => {
      console.error("Error fetching table from Spring Boot:", err);
      if (active) {
        addToast("Unable to connect to Spring Boot API. Make sure the server is running on port 8080.", "error");
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
    state.filters,
    activeRole
  ]);

  // CSV Export utility
  const handleExportCSV = () => {
    const csvHeaders = [
      "ID",
      "Name",
      "Project",
      "Location",
      "Check-in Time",
      "Check-out Time",
      "Hours Worked",
      "Report Submitted",
      "Report Details",
      "SSN",
      "Salary"
    ];
    const csvRows = processedData.map((row) => [
      row.id,
      row.name,
      row.project,
      row.location,
      row.checkInTime,
      row.checkOutTime,
      row.hours,
      row.reportSubmitted ? "YES" : "NO",
      row.report || "",
      row.ssn || "MASKED",
      row.salary !== null ? `$${row.salary}` : "MASKED"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [csvHeaders.join(","), ...csvRows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `workforce_telemetry_backend_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Successfully exported ${processedData.length} records as CSV`, "success");
    setExportOpen(false);
  };

  // JSON Export utility
  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(processedData, null, 2))}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `workforce_telemetry_backend_export_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Successfully exported ${processedData.length} records as JSON`, "success");
    setExportOpen(false);
  };

  // Single action triggers
  const handleRowAction = (actionName: string, row: EmployeeData) => {
    if (actionName === "View Ledger" || actionName === "ledger") {
      handleViewLedger(row);
    } else if (actionName === "View Details" || actionName === "details") {
      setSelectedEmployee(row);
      setActiveModal("details");
    } else {
      addToast(`Action Fired: '${actionName}' triggered for ${row.name}`, "info");
    }
  };

  // Bulk action triggers
  const handleBulkAction = (actionName: string, selectedIds: string[]) => {
    addToast(`Bulk Action Fired: '${actionName}' executed on ${selectedIds.length} profiles`, "success");
  };

  return (
    <div className="bg-micro-dot min-h-screen text-slate-800 font-sans antialiased p-6 sm:p-8 pb-32 sm:pb-40 flex-1">
      <div className="max-w-7xl mx-auto space-y-4 relative">
        
        {/* Dynamic Custom Toast Box */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl border shadow-xl flex items-center justify-between pointer-events-auto transition-all animate-bounce-short bg-slate-900 border-slate-800 text-white`}
            >
              <div className="flex items-center gap-2.5">
                {toast.type === "success" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
                {toast.type === "error" && (
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                )}
                {toast.type === "info" && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                )}
                <span className="text-xs font-semibold">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-slate-500 hover:text-slate-300 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* 1. Header Area */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200/70 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2 select-none">
              <span className="bg-[#06B6D4] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Spring Boot JPA Pipeline
              </span>
              <h1 className="text-xl font-bold text-slate-950 tracking-tight">
                User & Roster Management Control
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 select-none">
              Connected directly to standard Spring Data JPA REST endpoint. Sorting, pagination, global search, and dynamic filter tokens computed on database server.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            
            {/* User Role Switcher Dropdown */}
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 p-1 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 px-2 select-none">ROLE:</span>
              <select
                value={activeRole}
                onChange={(e) => {
                  setActiveRole(e.target.value as any);
                  addToast(`Security Role switched to ${e.target.value}`, "info");
                }}
                className="bg-white border border-slate-200 text-xs font-semibold px-2 py-1.5 rounded-lg shadow-sm text-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-cyan-500"
              >
                <option value="STANDARD_USER">Standard User (Masked PII)</option>
                <option value="ADMIN">Administrator (Full Access)</option>
              </select>
            </div>

            {/* Export Dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg shadow-sm text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>

              {exportOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 space-y-0.5 text-xs text-slate-700 z-50">
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-50 font-semibold transition-colors flex items-center gap-2"
                  >
                    CSV Format (.csv)
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-50 font-semibold transition-colors flex items-center gap-2"
                  >
                    JSON Format (.json)
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 2. Database Status Indicator */}
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Connected to database <strong>tabledb</strong>. Total synchronized records: <strong>{totalRows}</strong>.</span>
          </div>
          <div className="text-[10px] text-emerald-600 bg-white border border-emerald-200/50 px-2 py-0.5 rounded font-bold uppercase tracking-wider select-none">
            H2 Database Server Active
          </div>
        </div>

        {/* 3. Toolbar filters */}
        <DataTableToolbar
          columns={columns}
          state={state}
          setSearchQuery={setSearchQuery}
          setFilter={setFilter}
          toggleColumnVisibility={toggleColumnVisibility}
          setHorizontalScroll={handleToggleHorizontalScroll}
        />

        {/* 4. Core Render Table */}
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
          onRowActionTriggered={handleRowAction}
          onBulkActionTriggered={handleBulkAction}
          isLoading={isLoading}
          actionMenuSlot={(row, close) => (
            <>
              <button
                onClick={() => {
                  setSelectedEmployee(row);
                  setActiveModal("details");
                  close();
                }}
                className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-[10px] font-semibold transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  setSelectedEmployee(row);
                  setActiveModal("ledger");
                  close();
                }}
                className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-[10px] font-semibold transition-colors"
              >
                View Ledger
              </button>
            </>
          )}
        />

        {/* Ledger Modal */}
        {activeModal === "ledger" && selectedEmployee && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 flex flex-col justify-between animate-in fade-in zoom-in duration-200">
              <div>
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Workforce Audit Log & Paystub Ledger</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Verification Stub • Active Cycle</p>
                  </div>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee Name</p>
                    <p className="font-bold text-slate-800">{selectedEmployee.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-2">Employee ID</p>
                    <p className="font-mono text-slate-700">{selectedEmployee.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Assigned</p>
                    <p className="font-bold text-slate-800">{selectedEmployee.project}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-2">Location Assigned</p>
                    <p className="font-bold text-slate-700">{selectedEmployee.location}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Weekly Timecard Audit Table</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="py-2.5 px-4">Date</th>
                          <th className="py-2.5 px-4">Project / Location</th>
                          <th className="py-2.5 px-4">Reg Hours</th>
                          <th className="py-2.5 px-4">OT Hours</th>
                          <th className="py-2.5 px-4">Gross Payout</th>
                          <th className="py-2.5 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {[
                          { date: "June 23, 2026", hours: selectedEmployee.hours, ot: "0.0 hrs", pay: `$${Math.round((parseFloat(selectedEmployee.hours) || 8.0) * (selectedEmployee.salary ? Math.round(selectedEmployee.salary / 2080 * 100) / 100 : 35.50) * 100) / 100}` },
                          { date: "June 24, 2026", hours: "8.0 hours", ot: "0.0 hrs", pay: `$${Math.round(8 * (selectedEmployee.salary ? Math.round(selectedEmployee.salary / 2080 * 100) / 100 : 35.50) * 100) / 100}` },
                          { date: "June 25, 2026", hours: "8.0 hours", ot: "0.0 hrs", pay: `$${Math.round(8 * (selectedEmployee.salary ? Math.round(selectedEmployee.salary / 2080 * 100) / 100 : 35.50) * 100) / 100}` },
                          { date: "June 26, 2026", hours: "8.5 hours", ot: "0.5 hrs", pay: `$${Math.round(8.5 * (selectedEmployee.salary ? Math.round(selectedEmployee.salary / 2080 * 100) / 100 : 35.50) * 100) / 100}` },
                          { date: "June 27, 2026", hours: selectedEmployee.hours, ot: "0.0 hrs", pay: `$${Math.round((parseFloat(selectedEmployee.hours) || 8.0) * (selectedEmployee.salary ? Math.round(selectedEmployee.salary / 2080 * 100) / 100 : 35.50) * 100) / 100}` },
                        ].map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-4 font-semibold text-slate-900">{item.date}</td>
                            <td className="py-2 px-4">
                              {selectedEmployee.project.replace("Project ", "")} • {selectedEmployee.location.split(" ")[0]}
                            </td>
                            <td className="py-2 px-4 font-mono">{item.hours}</td>
                            <td className="py-2 px-4 font-mono text-slate-400">{item.ot}</td>
                            <td className="py-2 px-4 font-mono font-bold text-slate-900">{item.pay}</td>
                            <td className="py-2 px-4 text-right">
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Approved
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 bg-cyan-50/50 border border-cyan-200/60 rounded-xl p-3 flex items-center justify-between text-xs text-cyan-900 select-none">
                  <div>
                    <span className="font-semibold">Calculated pay rate: </span>
                    <span className="font-mono font-bold">
                      ${selectedEmployee.salary ? (Math.round(selectedEmployee.salary / 2080 * 100) / 100).toFixed(2) : "35.50"}/hour
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Gross Pay Sum: </span>
                    <span className="font-mono font-bold text-sm bg-cyan-100/80 px-2 py-0.5 rounded border border-cyan-200/50">
                      ${(
                        (parseFloat(selectedEmployee.hours) || 8.0) * (selectedEmployee.salary ? Math.round(selectedEmployee.salary / 2080 * 100) / 100 : 35.50) * 2 +
                        8 * (selectedEmployee.salary ? Math.round(selectedEmployee.salary / 2080 * 100) / 100 : 35.50) * 2 +
                        8.5 * (selectedEmployee.salary ? Math.round(selectedEmployee.salary / 2080 * 100) / 100 : 35.50)
                      ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4">
                <span className="text-[10px] text-slate-400 italic">Payroll ledger logs synchronized from H2 database.</span>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  Close Ledger
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {activeModal === "details" && selectedEmployee && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 flex flex-col justify-between animate-in fade-in zoom-in duration-200">
              <div>
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                      {selectedEmployee.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{selectedEmployee.name}</h2>
                      <p className="text-[10px] text-slate-400 font-mono font-semibold">{selectedEmployee.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Project Assigned</label>
                    <p className="font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl mt-1">{selectedEmployee.project}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location Assigned</label>
                    <p className="font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl mt-1">{selectedEmployee.location}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Check-In Time</label>
                    <p className="font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl mt-1 font-mono">{selectedEmployee.checkInTime}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Check-Out Time</label>
                    <p className="font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl mt-1 font-mono">{selectedEmployee.checkOutTime}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Hours Worked</label>
                    <p className="font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl mt-1">{selectedEmployee.hours}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Report Submitted?</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border uppercase select-none ${
                        selectedEmployee.reportSubmitted 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {selectedEmployee.reportSubmitted ? "Submitted (Yes)" : "Not Submitted (No)"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-6 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SSN (PII DATA)</label>
                    <p className={`font-semibold bg-slate-50 border px-3 py-2 rounded-xl mt-1 font-mono ${
                      selectedEmployee.ssn === "***-**-****" 
                        ? "text-slate-400 border-slate-200 border-dashed" 
                        : "text-slate-700 border-slate-200"
                    }`}>
                      {selectedEmployee.ssn || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Salary Compensation</label>
                    <p className={`font-semibold bg-slate-50 border px-3 py-2 rounded-xl mt-1 font-mono ${
                      selectedEmployee.salary === null 
                        ? "text-slate-400 border-slate-200 border-dashed italic" 
                        : "text-emerald-800 border-slate-200 font-bold"
                    }`}>
                      {selectedEmployee.salary !== null 
                        ? `$${selectedEmployee.salary.toLocaleString()}` 
                        : "$**,*** (MASKED)"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shift Work Accomplishment Report</label>
                  <textarea
                    readOnly
                    value={selectedEmployee.report}
                    rows={4}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none resize-none leading-relaxed shadow-inner"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
                  <span className="text-[10px] text-slate-400 font-medium">Active Security Role: <strong>{activeRole}</strong></span>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
