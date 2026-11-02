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
    onChange: (sorting: SortingState) => void;
  };

  pagination: PaginationState & {
    total: number;
    onChange: (pagination: PaginationState) => void;
  };

  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
}

export function DataTable<TData>({
  data,
  columns,
  loading = false,
  length,
  sorting,
  pagination,
  globalFilter,
  setGlobalFilter,
}: DataTableProps<TData>) {
  const { t } = useTranslation();

  const pageCount = Math.ceil(pagination.total / pagination.pageSize);

  const currentPage = pagination.pageIndex + 1;

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
    manualFiltering: true,

    pageCount,

    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(sorting.state) : updater;

      sorting.onChange(next);
    },

    onPaginationChange: (updater) => {
      const currentPagination: PaginationState = {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      };

      const next =
        typeof updater === "function" ? updater(currentPagination) : updater;

      pagination.onChange(next);
    },

    onGlobalFilterChange: (value) => {
      setGlobalFilter?.(String(value));
    },

    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    pagination.onChange({
      pageIndex: 0,
      pageSize: Number(event.target.value),
    });
  };

  const goToPage = (pageIndex: number) => {
    const safePageIndex = Math.max(
      0,
      Math.min(pageIndex, Math.max(0, pageCount - 1)),
    );

    pagination.onChange({
      pageIndex: safePageIndex,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <div className="space-y-4">
      <table className="w-full border">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
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
          ) : table.getRowModel().rows.length > 0 ? (
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
          onChange={handlePageSizeChange}
          options={[
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 20, label: "20" },
          ]}
          className="h-8 w-[70px]"
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => goToPage(0)}
          disabled={pagination.pageIndex === 0 || pageCount === 0}
        >
          <ChevronsLeft />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => goToPage(pagination.pageIndex - 1)}
          disabled={pagination.pageIndex === 0 || pageCount === 0}
        >
          <ChevronLeft />
        </Button>

        <span>
          Page {currentPage} of {length ?? pageCount}
        </span>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => goToPage(pagination.pageIndex + 1)}
          disabled={pageCount === 0 || pagination.pageIndex >= pageCount - 1}
        >
          <ChevronRight />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => goToPage(pageCount - 1)}
          disabled={pageCount === 0 || pagination.pageIndex >= pageCount - 1}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
