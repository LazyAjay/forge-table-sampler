# High-Performance Virtualized DataTable Reference Guide

This directory contains a highly optimized, feature-rich custom `DataTable` component built for React (React 19 compatible) and Next.js (App Router compatible) using Tailwind CSS. It is specifically designed to handle massive datasets (>10,000 active records) with zero visual stutter or input lag by utilizing custom list virtualization (windowing) alongside robust client-side or server-side pagination, sorting, filtering, and custom layouts.

---

## File Architecture

1. **[types.ts](file:///c:/Users/ajaya/.gemini/antigravity-ide/scratch/table-component-app/src/components/ui/table/types.ts)**: Declares core interfaces, sorting models, pagination states, and column properties (`ColumnDef`).
2. **[useDataTableState.ts](file:///c:/Users/ajaya/.gemini/antigravity-ide/scratch/table-component-app/src/components/ui/table/useDataTableState.ts)**: Headless React hook managing state, search filtering, multi-select filters, custom sorting, client-side pagination slicing, and page state syncing.
3. **[DataTable.tsx](file:///c:/Users/ajaya/.gemini/antigravity-ide/scratch/table-component-app/src/components/ui/table/DataTable.tsx)**: View component implementing DOM list virtualization, sticky headers, conditional layout scroll wheels, selection boxes, context menus, and paginator footer.
4. **[DataTableToolbar.tsx](file:///c:/Users/ajaya/.gemini/antigravity-ide/scratch/table-component-app/src/components/ui/table/DataTableToolbar.tsx)**: Control toolbar containing search debouncer, popover multi-select filters, toggleable column dropdowns, and the Scrollable/Wrapped layout toggle.

---

## Installation, Dependencies & Porting Guide

To copy this component into another React / Next.js project, follow these instructions:

### 1. Copy the Directory
Copy the entire `table` component directory (which includes `DataTable.tsx`, `DataTableToolbar.tsx`, `useDataTableState.ts`, `types.ts`, and this `README.md`) into your project's components folder (e.g., `src/components/ui/table/`).

### 2. External Dependencies
The component runs on standard React but has specific dependencies on:
* **React 18 or 19** (uses standard hooks: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`)
* **Tailwind CSS** (v3 or v4, configured in your project for styling layout, grid, flexbox, transitions, etc.)
* **TypeScript** (if using TypeScript, standard types are declared in `types.ts`)

### 3. Required Custom CSS Utilities
The components utilize a few custom utility classes and animations that must be added to your global CSS stylesheet (e.g., `app/globals.css` or `styles/globals.css`):

```css
/* Scrollbar Hiding utility (used for horizontal layouts) */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Custom Premium Transitions */
.transition-all-custom {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Pulse animation adjustments (used for live status dots) */
@keyframes custom-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: .4;
    transform: scale(1.2);
  }
}

.animate-pulse-dot {
  animation: custom-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 4. Updating Import Paths
When rendering the table inside your pages or container components, update your import paths to reference the new location, e.g.:
```tsx
import { DataTable } from "@/components/ui/table/DataTable";
import { DataTableToolbar } from "@/components/ui/table/DataTableToolbar";
import { useDataTableState } from "@/components/ui/table/useDataTableState";
import { ColumnDef } from "@/components/ui/table/types";
```

---

## Key Features & Layout Dynamics

### 1. Spacer-Row-Based List Virtualization (Windowing)
Instead of rendering thousands of `<tr>` elements in the DOM, the table measures its viewport dynamically using a `ResizeObserver` and slices the rendered row list down to the visible screen area plus a small rendering buffer.
- **Off-screen Spacing**: Renders two transparent `<tr>` rows styled with precise heights (`paddingTop` and `paddingBottom` calculated dynamically) to retain a precise, responsive browser scrollbar.
- **Scroll Buffer**: Automatically allocates a rendering buffer (5 rows in Scrollable mode, 15 rows in Wrapped mode) to prevent visual flashes or clipping during rapid scrolling.

### 2. Sticky Table Headers
The headers (`thead`) are pinned to the top of the container using `sticky top-0 bg-slate-900 z-20`, remaining fixed in view during vertical scroll.

### 3. Scrollable vs. Wrapped Layout Toggles
- **Scrollable Mode (Default)**: Keeps columns in a compact single line using `whitespace-nowrap`. Hovering over the table intercepts vertical wheel scrolls to move columns horizontally, making navigation of wide column tables natural.
- **Wrapped Mode**: Drops horizontal scrollbars entirely. Cells use `whitespace-normal break-words` and column definitions auto-scale to wrap text, making the table fit 100% of the screen width. Scroll wheel actions scroll the page vertically.

### 4. Ellipsis Paginator
To handle huge page sizes without overflowing the footer controls, the pagination bar renders a shortened window:
`[1] [2] [3] ... [1000]`
It automatically slides a window of 3 buttons around the active index, always showing the boundary pages (first/last) and ellipses.

---

## Quick-Start Integration Guide

Here is an end-to-end code integration example:

```tsx
"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "./components/ui/table/types";
import { useDataTableState } from "./components/ui/table/useDataTableState";
import { DataTable } from "./components/ui/table/DataTable";
import { DataTableToolbar } from "./components/ui/table/DataTableToolbar";

interface Member {
  id: string;
  name: string;
  role: string;
  status: string;
}

export default function MemberDashboard() {
  const [data, setData] = useState<Member[]>([
    { id: "M1", name: "Alice", role: "Developer", status: "Active" },
    // ... load/generate dataset
  ]);

  // Local state for scroll layout toggling
  const [horizontalScroll, setHorizontalScroll] = useState(true);

  // 1. Column Definition Mapping
  const columns = useMemo<ColumnDef<Member>[]>(() => [
    { id: "checkbox", header: "" }, // Selection Checkbox Column
    {
      id: "name",
      header: "Member Name",
      sortable: true,
      accessorKey: "name",
      cell: ({ row }) => (
        <span className={horizontalScroll ? "truncate" : "break-words"}>
          {row.name}
        </span>
      ),
    },
    {
      id: "role",
      header: "Workspace Role",
      sortable: true,
      accessorKey: "role",
      filterKey: "role",
      filterLabel: "Role",
      filterOptions: ["Developer", "Designer", "Manager"],
      cell: ({ value }) => <span>{value}</span>,
    },
    { id: "actions", header: "" }, // Kebab Context Menu Column
  ], [horizontalScroll]);

  // 2. Headless State Controller Hook Instantiation
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
  } = useDataTableState<Member>({
    data,
    columns,
    isServerSide: false, // Set to true to control pagination/sorting/filtering externally
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      horizontalScroll,
    },
  });

  // Layout synchronization handler
  const handleToggleHorizontalScroll = (enabled: boolean) => {
    setHorizontalScroll(enabled);
    setHookHorizontalScroll(enabled);
  };

  return (
    <div className="space-y-4">
      {/* 3. Render Filtering & Actions Toolbar */}
      <DataTableToolbar
        columns={columns}
        state={state}
        setSearchQuery={setSearchQuery}
        setFilter={setFilter}
        toggleColumnVisibility={toggleColumnVisibility}
        setHorizontalScroll={handleToggleHorizontalScroll}
      />

      {/* 4. Render Virtualized Grid */}
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
        onRowActionTriggered={(action, row) => console.log(action, row)}
        onBulkActionTriggered={(action, ids) => console.log(action, ids)}
      />
    </div>
  );
}
```

---

## Action Integrations

### Single-Row Context Actions (Kebab Menu)
- **Automatic Rendering**: If a column has `id: "actions"`, the component places a contextual kebab button (`⋮`).
- **Callbacks**: Provide `onRowActionTriggered(actionName, rowData)` to run custom logic.
- **Custom slots**: You can pass `actionMenuSlot={(row, closeMenu) => <MyCustomMenu row={row} onClose={closeMenu} />}` as a prop to customize the dropdown contents.

### Multi-Row Bulk Actions (Floating Checklist Dock)
- **Automatic Rendering**: When rows are selected, a floating dark bar appears at the bottom indicating the checked count.
- **Custom slots**: Provide `bulkActionSlot={(selectedIds, resetSelection) => <button onClick={...}>Bulk Delete</button>}` to place custom operations in the dock.

---

## API Reference

### useDataTableState Config Properties

| Option | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `data` | `TData[]` | Yes | Raw source array. |
| `columns` | `ColumnDef<TData>[]` | Yes | Grid structure column setups. |
| `isServerSide` | `boolean` | No | Skips hook internal filtering/sorting/slicing for remote APIs. |
| `totalCount` | `number` | No | Overrides total rows count in Server-Side mode. |
| `initialState` | `Partial<DataTableState>` | No | Initial pagination, sorting, scroll properties. |

### ColumnDef Configuration Properties

| Option | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (required). Set to `"checkbox"` or `"actions"` for preset cells. |
| `header` | `ReactNode \| fn` | Header label or custom functional rendering. |
| `accessorKey` | `keyof TData` | Key matching row data fields. |
| `sortable` | `boolean` | Activates column sorting toggles. |
| `filterKey` | `string` | Populates search tags inside the centralized filter list. |
| `filterOptions` | `string[]` | Selection metrics populated inside drop-down lists. |
| `isMultiSelect` | `boolean` | Uses checkbox popovers for filters instead of single select dropdowns. |
| `cell` | `(props) => ReactNode` | Custom renderer for styling tags, profile boxes, or phone links. |
