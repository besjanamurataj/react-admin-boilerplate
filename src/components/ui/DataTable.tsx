import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type SortingState,
  type PaginationState,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Select } from "./Select";
import { Button } from "./Button";
import { useTranslation } from "react-i18next";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  loading?: boolean;
  length?: number;
  sorting: {
    state: SortingState;
    onChange: (s: SortingState) => void;
  };

  pagination: PaginationState & {
    total: number;
    onChange: (p: PaginationState) => void;
  };

  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
}

export function DataTable<TData>({
  data,
  columns,
  loading,
  length,
  sorting,
  pagination,
  globalFilter,
  setGlobalFilter,
}: DataTableProps<TData>) {
  const { t } = useTranslation();

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting: sorting.state,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
      globalFilter: globalFilter ?? "",
    },

    manualPagination: true,
    manualSorting: true,

    pageCount: Math.ceil(pagination.total / pagination.pageSize),
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(sorting.state) : updater;
      sorting.onChange(next);
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({
              pageIndex: pagination.pageIndex,
              pageSize: pagination.pageSize,
            })
          : updater;

      pagination.onChange(next);
    },
    onGlobalFilterChange: (val) => setGlobalFilter?.(String(val)),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <table className="w-full border">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer p-2 text-left"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center">
                Loading...
              </td>
            </tr>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center">
                {t("common.noResults")}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <Select
          value={pagination.pageSize}
          onChange={(e) =>
            pagination.onChange({
              ...pagination,
              pageSize: Number(e.target.value),
              pageIndex: 0,
            })
          }
          options={[
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 20, label: "20" },
          ]}
          className="h-8 w-[70px]"
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={() => pagination.onChange({ ...pagination, pageIndex: 0 })}
        >
          <ChevronsLeft />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() =>
            pagination.onChange({
              ...pagination,
              pageIndex: pagination.pageIndex - 1,
            })
          }
          disabled={pagination.pageIndex === 0}
        >
          <ChevronLeft />
        </Button>

        <span>
          Page {pagination.pageIndex + 1} of {length}
        </span>

        <Button
          size="icon"
          variant="ghost"
          onClick={() =>
            pagination.onChange({
              ...pagination,
              pageIndex: pagination.pageIndex + 1,
            })
          }
          disabled={
            pagination.pageIndex >=
            Math.ceil(pagination.total / pagination.pageSize) - 1
          }
        >
          <ChevronRight />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() =>
            pagination.onChange({
              ...pagination,
              pageIndex: Math.ceil(pagination.total / pagination.pageSize) - 1,
            })
          }
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
