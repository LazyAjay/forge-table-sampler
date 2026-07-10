"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ColumnDef } from "@/components/ui/forge-table/types";
import { useDataTableState } from "@/components/ui/forge-table/useDataTableState";
import { DataTable } from "@/components/ui/forge-table/DataTable";
import { DataTableToolbar } from "@/components/ui/forge-table/DataTableToolbar";

// 1. Data Type Contract
interface WorkerData {
  id: string; // initials, e.g. "JD"
  uid: string; // unique ID, e.g. "MEMB-2026-94X"
  name: string;
  dept: string;
  shift: string;
  hours: string;
  checkInTime: string;
  status: "inside" | "outside" | "absent" | "off-duty";
  salesCoverage: number | null; // territory completion percentage
  phone: string;
  skills: string;
  riskLevel: "Low" | "Medium" | "High";
}

// 2. Custom Toast Types
interface Toast {
  id: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
}

// Initial workforce telemetry dataset
const initialDataset: WorkerData[] = [
  {
    id: "JD",
    uid: "MEMB-2026-94X",
    name: "John Doe",
    dept: "Field Logistics Alpha",
    shift: "Morning Shift Blueprint",
    hours: "09:00 AM - 06:00 PM",
    checkInTime: "08:54 AM",
    status: "inside",
    salesCoverage: 85,
    phone: "+1 (555) 234-5678",
    skills: "Logistics, Dispatch, Routing",
    riskLevel: "Low",
  },
  {
    id: "SJ",
    uid: "MEMB-2026-44B",
    name: "Sarah Jenkins",
    dept: "Engineering Fleet",
    shift: "Technical Support On-Site",
    hours: "10:00 AM - 07:00 PM",
    checkInTime: "10:12 AM",
    status: "outside",
    salesCoverage: 62,
    phone: "+1 (555) 876-5432",
    skills: "Field Maintenance, Diagnostic",
    riskLevel: "Medium",
  },
  {
    id: "MK",
    uid: "MEMB-2026-12Z",
    name: "Michael Kapoor",
    dept: "DevOps Infrastructure",
    shift: "Night Operations Network",
    hours: "09:00 PM - 06:00 AM",
    checkInTime: "08:45 PM",
    status: "inside",
    salesCoverage: null,
    phone: "+1 (555) 345-6789",
    skills: "Docker, Kubernetes, Linux",
    riskLevel: "Low",
  },
  {
    id: "AA",
    uid: "MEMB-2026-78V",
    name: "Amara Al-Jamil",
    dept: "Medical Health Fleet",
    shift: "Day Roster Template B",
    hours: "08:00 AM - 05:00 PM",
    checkInTime: "--",
    status: "absent",
    salesCoverage: null,
    phone: "+1 (555) 987-6543",
    skills: "Triage, Critical Care, Nursing",
    riskLevel: "High",
  },
  {
    id: "DB",
    uid: "MEMB-2026-31N",
    name: "David Beck",
    dept: "Field Logistics Alpha",
    shift: "Morning Shift Blueprint",
    hours: "09:00 AM - 06:00 PM",
    checkInTime: "08:58 AM",
    status: "inside",
    salesCoverage: 92,
    phone: "+1 (555) 456-7890",
    skills: "Logistics, Route Optimization",
    riskLevel: "Low",
  },
  {
    id: "EL",
    uid: "MEMB-2026-19P",
    name: "Elena Rostova",
    dept: "Engineering Fleet",
    shift: "Technical Support On-Site",
    hours: "10:00 AM - 07:00 PM",
    checkInTime: "09:45 AM",
    status: "inside",
    salesCoverage: 75,
    phone: "+1 (555) 654-3210",
    skills: "Network Cabling, Hardware Repair",
    riskLevel: "Low",
  },
  {
    id: "MC",
    uid: "MEMB-2026-55Q",
    name: "Marcus Chang",
    dept: "Field Logistics Alpha",
    shift: "Morning Shift Blueprint",
    hours: "09:00 AM - 06:00 PM",
    checkInTime: "10:05 AM",
    status: "outside",
    salesCoverage: 40,
    phone: "+1 (555) 567-8901",
    skills: "Inventory Management, Shipping",
    riskLevel: "Medium",
  },
  {
    id: "NM",
    uid: "MEMB-2026-22M",
    name: "Nisha Malik",
    dept: "DevOps Infrastructure",
    shift: "Night Operations Network",
    hours: "09:00 PM - 06:00 AM",
    checkInTime: "09:02 PM",
    status: "inside",
    salesCoverage: null,
    phone: "+1 (555) 123-4567",
    skills: "AWS, Shell Scripting, CI/CD",
    riskLevel: "Low",
  },
  {
    id: "OW",
    uid: "MEMB-2026-61W",
    name: "Oliver Wright",
    dept: "Medical Health Fleet",
    shift: "Day Roster Template B",
    hours: "08:00 AM - 05:00 PM",
    checkInTime: "07:55 AM",
    status: "inside",
    salesCoverage: null,
    phone: "+1 (555) 890-1234",
    skills: "Occupational Safety, First Aid",
    riskLevel: "Low",
  },
  {
    id: "PT",
    uid: "MEMB-2026-05T",
    name: "Priya Theron",
    dept: "Engineering Fleet",
    shift: "No Active Shift Configured",
    hours: "Weekend Roster Off-Cycle Calendar",
    checkInTime: "--",
    status: "off-duty",
    salesCoverage: null,
    phone: "+1 (555) 901-2345",
    skills: "Soldering, Circuits, CAD Drafting",
    riskLevel: "Low",
  },
];

const firstNames = [
  "Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Theodore",
  "Jack", "Levi", "Alexander", "Jackson", "Mateo", "Daniel", "Michael", "Mason", "Sebastian", "Ethan",
  "Logan", "Owen", "Samuel", "Wyatt", "John", "David", "Carter", "Julian", "Hudson", "Grayson",
  "Olivia", "Emma", "Charlotte", "Amelia", "Sophia", "Isabella", "Ava", "Mia", "Evelyn", "Harper",
  "Luna", "Camila", "Gianna", "Elizabeth", "Eleanor", "Ella", "Abigail", "Sofia", "Avery", "Scarlett"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
];

const deptsList = [
  "Field Logistics Alpha",
  "Engineering Fleet",
  "DevOps Infrastructure",
  "Medical Health Fleet"
];

const shiftsByDept: Record<string, { shift: string; hours: string }> = {
  "Field Logistics Alpha": { shift: "Morning Shift Blueprint", hours: "09:00 AM - 06:00 PM" },
  "Engineering Fleet": { shift: "Technical Support On-Site", hours: "10:00 AM - 07:00 PM" },
  "DevOps Infrastructure": { shift: "Night Operations Network", hours: "09:00 PM - 06:00 AM" },
  "Medical Health Fleet": { shift: "Day Roster Template B", hours: "08:00 AM - 05:00 PM" }
};

const skillsByDept: Record<string, string[]> = {
  "Field Logistics Alpha": ["Logistics", "Dispatch", "Routing", "Inventory Management", "Shipping"],
  "Engineering Fleet": ["Field Maintenance", "Diagnostic", "Soldering", "Circuits", "CAD Drafting"],
  "DevOps Infrastructure": ["Docker", "Kubernetes", "Linux", "AWS", "Shell Scripting", "CI/CD"],
  "Medical Health Fleet": ["Triage", "Critical Care", "Nursing", "Occupational Safety", "First Aid"]
};

const statusesList: WorkerData["status"][] = ["inside", "outside", "absent", "off-duty"];
const riskLevelsList: WorkerData["riskLevel"][] = ["Low", "Medium", "High"];

function generateRosterData(): WorkerData[] {
  const dataset = [...initialDataset];
  const uids = new Set(dataset.map((d) => d.uid));

  let count = dataset.length;
  let nameIndex = 0;
  
  while (count < 10000) {
    const fn = firstNames[nameIndex % firstNames.length];
    const ln = lastNames[(nameIndex * 7) % lastNames.length];
    const fullName = `${fn} ${ln}`;
    const id = (fn[0] + ln[0]).toUpperCase();
    
    let uid = "";
    let uidNum = 100 + ((nameIndex * 13) % 900);
    let uidLetter = String.fromCharCode(65 + ((nameIndex * 3) % 26));
    uid = `MEMB-2026-${uidNum}${uidLetter}`;
    
    if (uids.has(uid)) {
      const fallbackNum = Math.floor(100 + Math.random() * 900);
      uid = `MEMB-2026-${fallbackNum}Z`;
    }
    uids.add(uid);

    const dept = deptsList[nameIndex % deptsList.length];
    const status = statusesList[(nameIndex * 3) % statusesList.length];
    
    let shift = "No Active Shift Configured";
    let hours = "Weekend Roster Off-Cycle Calendar";
    let checkInTime = "--";

    if (status !== "off-duty") {
      const shiftConfig = shiftsByDept[dept];
      shift = shiftConfig.shift;
      hours = shiftConfig.hours;
      
      if (status === "inside" || status === "outside") {
        const startHour = parseInt(hours.split(":")[0], 10);
        const startAmPm = hours.split(" ")[1];
        const minutes = (nameIndex * 4) % 60;
        const checkInMin = minutes < 10 ? `0${minutes}` : minutes;
        const checkInHour = status === "inside" ? startHour - 1 + (nameIndex % 2) : startHour + (nameIndex % 2);
        checkInTime = `${checkInHour}:${checkInMin} ${startAmPm}`;
      }
    }

    const salesCoverage = nameIndex % 3 === 0 ? null : 40 + ((nameIndex * 9) % 60);
    const phone = `+1 (555) ${100 + ((nameIndex * 17) % 900)}-${1000 + ((nameIndex * 31) % 9000)}`;
    
    const deptSkills = skillsByDept[dept];
    const skillCount = 2 + (nameIndex % 2);
    const selectedSkills = [...deptSkills].slice(0, skillCount);
    const skills = selectedSkills.join(", ");

    const riskLevel = riskLevelsList[(nameIndex * 2) % riskLevelsList.length];

    dataset.push({
      id,
      uid,
      name: fullName,
      dept,
      shift,
      hours,
      checkInTime,
      status,
      salesCoverage,
      phone,
      skills,
      riskLevel
    });

    nameIndex++;
    count++;
  }

  return dataset;
}

export default function Home() {
  const [fullDatabase, setFullDatabase] = useState<WorkerData[]>(() => generateRosterData());
  const [horizontalScroll, setHorizontalScroll] = useState(true);
  const [serverData, setServerData] = useState<WorkerData[]>([]);
  const [matchedTotalCount, setMatchedTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Form states for onboarding drawer
  const [formName, setFormName] = useState("");
  const [formUid, setFormUid] = useState("");
  const [formDept, setFormDept] = useState("Field Logistics Alpha");
  const [formShift, setFormShift] = useState("Morning Shift Blueprint");
  const [formHours, setFormHours] = useState("09:00 AM - 06:00 PM");
  const [formStatus, setFormStatus] = useState<WorkerData["status"]>("inside");
  const [formCheckIn, setFormCheckIn] = useState("");
  const [formSales, setFormSales] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSkills, setFormSkills] = useState("");
  const [formRisk, setFormRisk] = useState<"Low" | "Medium" | "High">("Low");

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

  // Columns specification matrix mapping
  const columns = useMemo<ColumnDef<WorkerData>[]>(() => [
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
            {row.id}
          </div>
          <div className="overflow-hidden min-w-0">
            <div className={`font-bold text-slate-900 text-sm leading-tight ${horizontalScroll ? "truncate" : "break-words"}`}>{row.name}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{row.uid}</div>
          </div>
        </div>
      ),
    },
    {
      id: "dept",
      header: "Department Hub",
      sortable: true,
      accessorKey: "dept",
      filterKey: "dept",
      filterLabel: "Dept",
      filterOptions: [
        "Field Logistics Alpha",
        "Engineering Fleet",
        "DevOps Infrastructure",
        "Medical Health Fleet",
      ],
      filterColorClass: "text-[#EA580C]",
      filterBgClass: "bg-[#FFF7ED]",
      filterBorderClass: "border-orange-300",
      filterActiveTextClass: "text-[#EA580C] font-bold",
      isMultiSelect: true,
      cell: ({ value }) => (
        <span className={`text-slate-600 font-semibold text-xs block ${horizontalScroll ? "truncate max-w-[150px]" : "break-words"}`}>{value}</span>
      ),
    },
    {
      id: "shift",
      header: "Assigned Shift Settings",
      sortable: true,
      accessorKey: "shift",
      filterKey: "shift",
      filterLabel: "Shift",
      filterOptions: [
        "Morning Shift Blueprint",
        "Technical Support On-Site",
        "Night Operations Network",
        "Day Roster Template B",
        "No Active Shift Configured",
      ],
      filterColorClass: "text-[#06B6D4]",
      filterBgClass: "bg-cyan-50",
      filterBorderClass: "border-cyan-300",
      filterActiveTextClass: "text-cyan-800 font-bold",
      cell: ({ row }) => {
        const isConfigured = row.shift !== "No Active Shift Configured";
        return (
          <div className={`flex flex-col select-none overflow-hidden ${horizontalScroll ? "max-w-[180px]" : "w-full"}`}>
            <span className={`font-semibold text-xs ${isConfigured ? "text-slate-800" : "text-slate-400 italic"} ${horizontalScroll ? "truncate" : "break-words"}`}>
              {row.shift}
            </span>
            <span className={`text-[10px] text-slate-400 mt-0.5 flex ${horizontalScroll ? "items-center" : "flex-wrap"} gap-1.5 font-medium`}>
              <span className={horizontalScroll ? "truncate" : "break-words"}>{row.hours}</span>
              {row.checkInTime !== "--" && (
                <>
                  <span className="text-slate-200 shrink-0">•</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200/50 text-[9px] shrink-0">
                    IN: {row.checkInTime}
                  </span>
                </>
              )}
            </span>
          </div>
        );
      },
    },
    {
      id: "compliance",
      header: "Geofence Compliance Pulse",
      sortable: true,
      accessorKey: "status",
      filterKey: "status",
      filterLabel: "Compliance",
      filterOptions: [
        "inside",
        "outside",
        "absent",
        "off-duty",
      ],
      filterColorClass: "text-[#10B981]",
      filterBgClass: "bg-emerald-50",
      filterBorderClass: "border-emerald-300",
      filterActiveTextClass: "text-emerald-800 font-bold",
      cell: ({ row }) => {
        switch (row.status) {
          case "inside":
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot"></span> INSIDE RADAR SITE
              </span>
            );
          case "outside":
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF7ED] text-[#EA580C] border border-orange-200 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></span> OUTSIDE BOUNDS
              </span>
            );
          case "absent":
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> SIGNAL TERMINATED / ABSENT
              </span>
            );
          case "off-duty":
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> CALENDAR OFF-DUTY
              </span>
            );
          default:
            return null;
        }
      },
    },
    {
      id: "sales",
      header: "Territory Target Progress",
      sortable: true,
      accessorKey: "salesCoverage",
      cell: ({ value }) => {
        if (value === null || value === undefined) {
          return <span className="text-[10px] text-slate-400 font-semibold italic">N/A</span>;
        }
        return (
          <div className="flex items-center gap-2 max-w-[120px] select-none">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
              <div
                className={`h-full rounded-full transition-all ${value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-[#EA580C]" : "bg-rose-500"}`}
                style={{ width: `${value}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-bold text-slate-700 min-w-[28px] text-right">{value}%</span>
          </div>
        );
      },
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
      id: "skills",
      header: "Specialized Skill Tag",
      sortable: true,
      accessorKey: "skills",
      filterKey: "skills",
      filterLabel: "Skills",
      filterOptions: [
        "Logistics",
        "Dispatch",
        "Routing",
        "Field Maintenance",
        "Diagnostic",
        "Docker",
        "Kubernetes",
        "Linux",
        "Triage",
        "Critical Care",
        "Nursing",
        "AWS",
        "CI/CD",
        "First Aid",
      ],
      filterColorClass: "text-indigo-500",
      filterBgClass: "bg-indigo-50",
      filterBorderClass: "border-indigo-300",
      filterActiveTextClass: "text-indigo-800 font-bold",
      isMultiSelect: true,
      cell: ({ value }) => (
        <div className={`flex items-center gap-1 ${horizontalScroll ? "max-w-[180px] overflow-hidden whitespace-nowrap" : "flex-wrap"}`}>
          {String(value || "").split(",").map((s) => {
            const skill = s.trim();
            if (!skill) return null;
            return (
              <span key={skill} className="bg-slate-100 text-slate-700 font-bold text-[9px] px-1.5 py-0.5 rounded border border-slate-200 select-none shrink-0">
                {skill}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      id: "riskLevel",
      header: "Risk Assessment",
      sortable: true,
      accessorKey: "riskLevel",
      filterKey: "riskLevel",
      filterLabel: "Risk Level",
      filterOptions: ["Low", "Medium", "High"],
      filterColorClass: "text-red-500",
      filterBgClass: "bg-red-50",
      filterBorderClass: "border-red-300",
      filterActiveTextClass: "text-red-800 font-bold",
      cell: ({ value }) => {
        const color =
          value === "High"
            ? "text-rose-700 bg-rose-50 border-rose-200"
            : value === "Medium"
              ? "text-[#EA580C] bg-[#FFF7ED] border-orange-200"
              : "text-emerald-700 bg-emerald-50 border-emerald-200";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${color} select-none whitespace-nowrap`}>
            {value} Risk
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
    },
  ], [horizontalScroll]);

  // Headless hook instantiation
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
  } = useDataTableState<WorkerData>({
    data: serverData,
    columns,
    totalCount: matchedTotalCount,
    isServerSide: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 }, // Default page size of 10 for server-side loading visibility
      columnVisibility: { phone: false, skills: false, riskLevel: false }, // Hide optional columns by default
      horizontalScroll,
    },
  });

  const handleToggleHorizontalScroll = (enabled: boolean) => {
    setHorizontalScroll(enabled);
    setHookHorizontalScroll(enabled);
  };

  // Telemetry KPIs calculations
  const totalRosterCount = fullDatabase.length;
  const insideCount = fullDatabase.filter((w) => w.status === "inside").length;
  const alertCount = fullDatabase.filter((w) => w.status === "outside" || w.status === "absent").length;
  const offDutyCount = fullDatabase.filter((w) => w.status === "off-duty").length;
  const complianceRate = totalRosterCount > 0 ? Math.round((insideCount / totalRosterCount) * 100) : 0;

  // Simulated server-side fetch trigger responding to hook state changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      let result = [...fullDatabase];

      // 1. Search Query filtering
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase().trim();
        result = result.filter((row) => {
          return Object.entries(row).some(([key, val]) => {
            if (typeof val === "string" || typeof val === "number") {
              return String(val).toLowerCase().includes(query);
            }
            return false;
          });
        });
      }

      // 2. Sibling multi-select/single filters
      Object.entries(state.filters).forEach(([filterKey, filterValue]) => {
        if (filterValue !== undefined && filterValue !== null) {
          const filterValues = Array.isArray(filterValue) ? filterValue : [filterValue];
          if (filterValues.length === 0) return;

          result = result.filter((row) => {
            const val = (row as any)[filterKey];
            if (typeof val === "string") {
              const rowValues = val.includes(",")
                ? val.split(",").map((s) => s.trim())
                : [val];

              return filterValues.some((fv) =>
                rowValues.some(rv => rv.toLowerCase() === String(fv).toLowerCase())
              );
            }
            return filterValues.includes(val);
          });
        }
      });

      const matchedCount = result.length;

      // 3. Sorting
      if (state.sorting) {
        const { id: sortColId, desc } = state.sorting;
        const colDef = columns.find((c) => c.id === sortColId);
        const accessor = colDef?.accessorKey;

        if (accessor) {
          result.sort((a, b) => {
            const aVal = a[accessor];
            const bVal = b[accessor];

            if (aVal === null || aVal === undefined) {
              return desc ? -1 : 1;
            }
            if (bVal === null || bVal === undefined) {
              return desc ? 1 : -1;
            }

            if (typeof aVal === "string" && typeof bVal === "string") {
              return desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
            }
            return desc
              ? ((bVal as any) > (aVal as any) ? 1 : -1)
              : ((aVal as any) > (bVal as any) ? 1 : -1);
          });
        }
      }

      // 4. Pagination slicing
      const start = state.pagination.pageIndex * state.pagination.pageSize;
      const end = start + state.pagination.pageSize;
      const sliced = result.slice(start, end);

      setServerData(sliced);
      setMatchedTotalCount(matchedCount);
      setIsLoading(false);
    }, 250); // Simulated network latency of 250ms

    return () => clearTimeout(timer);
  }, [
    state.sorting,
    state.pagination.pageIndex,
    state.pagination.pageSize,
    state.searchQuery,
    state.filters,
    fullDatabase,
    columns
  ]);

  // CSV Export utility
  const handleExportCSV = () => {
    const csvHeaders = [
      "UID",
      "Name",
      "Department",
      "Shift",
      "Shift Hours",
      "Check-in Time",
      "Geofence Status",
      "Sales Progress %",
      "Phone Number",
      "Skills",
    ];
    const csvRows = processedData.map((row) => [
      row.uid,
      row.name,
      row.dept,
      row.shift,
      row.hours,
      row.checkInTime,
      row.status.toUpperCase(),
      row.salesCoverage !== null ? `${row.salesCoverage}%` : "N/A",
      row.phone,
      row.skills,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [csvHeaders.join(","), ...csvRows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `workforce_telemetry_export_${Date.now()}.csv`);
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
    link.setAttribute("download", `workforce_telemetry_export_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Successfully exported ${processedData.length} records as JSON`, "success");
    setExportOpen(false);
  };

  // Single action triggers
  const handleRowAction = (actionName: string, row: WorkerData) => {
    addToast(`Action Fired: '${actionName}' triggered for ${row.name}`, "info");
  };

  // Bulk action triggers
  const handleBulkAction = (actionName: string, selectedIds: string[]) => {
    addToast(`Bulk Action Fired: '${actionName}' executed on ${selectedIds.length} profiles`, "success");
  };

  // Onboard Employee Save Handler
  const handleOnboardSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      addToast("Employee name is required", "error");
      return;
    }

    const generatedUid = formUid.trim() || `MEMB-2026-${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    const initials = formName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "EE";

    const newWorker: WorkerData = {
      id: initials,
      uid: generatedUid,
      name: formName.trim(),
      dept: formDept,
      shift: formShift,
      hours: formHours,
      checkInTime: formCheckIn.trim() || "--",
      status: formStatus,
      salesCoverage: formSales ? parseInt(formSales, 10) : null,
      phone: formPhone.trim() || "+1 (555) 000-0000",
      skills: formSkills.trim() || "General Ops",
      riskLevel: formRisk,
    };

    setFullDatabase((prev) => [newWorker, ...prev]);
    addToast(`Successfully onboarded ${formName.trim()} to database`, "success");

    // Clear form & close drawer
    setFormName("");
    setFormUid("");
    setFormCheckIn("");
    setFormSales("");
    setFormPhone("");
    setFormSkills("");
    setFormRisk("Low");
    setDrawerOpen(false);
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
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Enterprise Console
              </span>
              <h1 className="text-xl font-bold text-slate-950 tracking-tight">
                Workforce Operational Matrix
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 select-none">
              Real-time telemetry tracking, geofenced tracking compliance, multi-tenant roster logs, and direct workspace shift controllers.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            {/* Export Dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg shadow-sm text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Dataset
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

            {/* Onboard Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Onboard Employee
            </button>
          </div>
        </div>

        {/* 2. Telemetry KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Roster size
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalRosterCount} Employees</div>
            <div className="text-[9px] font-semibold text-slate-400 mt-1.5">
              Live DB records synced
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Geofence Compliance
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{complianceRate}% Active</div>
            <div className="text-[9px] font-semibold text-emerald-600 mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {insideCount} of {totalRosterCount} inside site boundaries
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Compliance Alerts
            </div>
            <div className="text-2xl font-bold text-[#EA580C] mt-1">{alertCount} Incidents</div>
            <div className="text-[9px] font-semibold text-orange-500 mt-1.5">
              Outside radar or absent signals
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Calendar Off-Duty
            </div>
            <div className="text-2xl font-bold text-slate-500 mt-1">{offDutyCount} Logged Off</div>
            <div className="text-[9px] font-semibold text-slate-400 mt-1.5">
              Weekend rosters & calendar cycles
            </div>
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
        />

        {/* 5. Sliding Drawer Modal for Onboarding Worker */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Modal backdrop */}
            <div
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            ></div>

            {/* Modal sheet */}
            <div className="relative w-full max-w-md bg-white border-l border-slate-200 shadow-2xl p-6 flex flex-col h-full overflow-y-auto animate-slide-left z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 select-none">
                <div>
                  <h2 className="text-base font-bold text-slate-950">Onboard Employee</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Add worker details to the matrix log database</p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleOnboardSave} className="space-y-4 flex-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 select-none">
                    Worker Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 select-none">
                    Worker Unique ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formUid}
                    onChange={(e) => setFormUid(e.target.value)}
                    placeholder="e.g. MEMB-2026-94X (Auto-generated if empty)"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 select-none">
                    Department Hub *
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
                  >
                    <option value="Field Logistics Alpha">Field Logistics Alpha</option>
                    <option value="Engineering Fleet">Engineering Fleet</option>
                    <option value="DevOps Infrastructure">DevOps Infrastructure</option>
                    <option value="Medical Health Fleet">Medical Health Fleet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 select-none">
                    Assigned Shift Settings *
                  </label>
                  <select
                    value={formShift}
                    onChange={(e) => {
                      setFormShift(e.target.value);
                      // Update default hours depending on shift
                      if (e.target.value === "Morning Shift Blueprint") {
                        setFormHours("09:00 AM - 06:00 PM");
                      } else if (e.target.value === "Technical Support On-Site") {
                        setFormHours("10:00 AM - 07:00 PM");
                      } else if (e.target.value === "Night Operations Network") {
                        setFormHours("09:00 PM - 06:00 AM");
                      } else if (e.target.value === "Day Roster Template B") {
                        setFormHours("08:00 AM - 05:00 PM");
                      } else {
                        setFormHours("Weekend Roster Off-Cycle Calendar");
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
                  >
                    <option value="Morning Shift Blueprint">Morning Shift Blueprint</option>
                    <option value="Technical Support On-Site">Technical Support On-Site</option>
                    <option value="Night Operations Network">Night Operations Network</option>
                    <option value="Day Roster Template B">Day Roster Template B</option>
                    <option value="No Active Shift Configured">No Active Shift Configured (Off-Duty)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 select-none">
                    Shift Hours Interval
                  </label>
                  <input
                    type="text"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    placeholder="e.g. 09:00 AM - 06:00 PM"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 select-none">
                    Geofence Compliance *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
                  >
                    <option value="inside">INSIDE RADAR SITE</option>
                    <option value="outside">OUTSIDE BOUNDS</option>
                    <option value="absent">SIGNAL TERMINATED / ABSENT</option>
                    <option value="off-duty">CALENDAR OFF-DUTY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 select-none">
                    Clock-In Timestamp (Optional)
                  </label>
                  <input
                    type="text"
                    value={formCheckIn}
                    onChange={(e) => setFormCheckIn(e.target.value)}
                    placeholder="e.g. 08:54 AM (Or leave empty/--)"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 select-none">
                    Sales Target completion % (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formSales}
                    onChange={(e) => setFormSales(e.target.value)}
                    placeholder="e.g. 85 (leave empty if not sales)"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 select-none">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 234-5678"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 select-none">
                    Specialized Skill Tags (Optional)
                  </label>
                  <input
                    type="text"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                    placeholder="e.g. Logistics, Routing, Dispatch"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 select-none">
                    Risk Assessment *
                  </label>
                  <select
                    value={formRisk}
                    onChange={(e) => setFormRisk(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="flex-1 p-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg text-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 p-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Save Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
