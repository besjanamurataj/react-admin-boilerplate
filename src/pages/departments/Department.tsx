import { ArrowUpDown, Edit, Eye, Plus, SearchIcon, Trash } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { useEffect, useMemo, useState } from "react";
import { Search } from "../../components/ui/Search";
import { PageTitle } from "../../components/PageTitle";
import { Dialog, DialogContent } from "../../components/ui/Dialog";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteDepartment,
  getDepartments,
} from "../../services/departmentService";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import debounce from "debounce";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type { Department,} from "../../types/department";
import { useToast } from "../../contexts/toast/ToastProvider";

export const DepartmentPage = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();
  const [globalFilter, setGlobalFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);

        setPagination((previousPagination) => ({
          ...previousPagination,
          pageIndex: 0,
        }));
      }, 500),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.clear?.();
    };
  }, [debouncedSetSearch]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "departments",
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      search,
    ],
    queryFn: () => {
      const sortStrings = sorting.map(
        (sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`,
      );

      return getDepartments(
        search,
        pagination.pageIndex,
        pagination.pageSize,
        sortStrings,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (deleteId === undefined) {
        throw new Error("Department ID is required");
      }

      return deleteDepartment(deleteId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });

      addToast({
        title: t("messages.success") || "",
        description: t("messages.departmentDeleteSuccess") || "",
        variant: "success",
      });

      setOpen(false);
      setDeleteId(undefined);
    },

    onError: (error: Error) => {
      addToast({
        title: t("messages.error") || "",
        description: error.message,
        variant: "error",
      });
    },
  });

  const columns: ColumnDef<Department>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("departments.table.name")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("departments.table.code")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("code")}</span>
      ),
    },
    {
      accessorKey: "description",
      header: () => <span>{t("departments.table.description")}</span>,
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("description")}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "universityName",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("departments.table.university")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("universityName")}</span>
      ),
    },
    {
      id: "actions",
      header: () => <span>{t("common.actions")}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1">
          {hasPermission("VIEW_DEPARTMENT") && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/department/view/${row.original.id}`)}
            >
              <Eye size={20} className="text-green-700" />
            </Button>
          )}

          {hasPermission("MANAGE_DEPARTMENT") && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/department/edit/${row.original.id}`)}
            >
              <Edit size={20} className="text-green-700" />
            </Button>
          )}

          {hasPermission("MANAGE_DEPARTMENT") && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setDeleteId(row.original.id);
                setOpen(true);
              }}
            >
              <Trash size={20} className="text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageTitle
        title={t("departments.title")}
        subTitle={t("departments.description") || ""}
      />

      <div className="flex justify-end gap-4 my-6">
        {hasPermission("MANAGE_DEPARTMENT") && (
          <Button
            variant="outline"
            className="bg-green-700 text-white hover:bg-green-700"
            onClick={() => navigate("/department/upsert")}
          >
            <Plus className="text-white" />
            {t("common.add")}
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-input rounded-xl overflow-hidden bg-background">
            <div className="relative">
              <Search
                placeholder={t("departments.searchPlaceholder") ?? undefined}
                value={globalFilter}
                onChange={(event) => {
                  const value = event.target.value;

                  setGlobalFilter(value);
                  debouncedSetSearch(value);
                }}
                className="w-full pl-10 pr-3 border-none py-2"
              />

              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <SearchIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <DataTable
          data={data?.content ?? []}
          columns={columns}
          loading={isLoading}
          length={data?.totalElements ?? 0}
          sorting={{
            state: sorting,
            onChange: setSorting,
          }}
          pagination={{
            ...pagination,
            total: data?.totalElements ?? 0,
            onChange: setPagination,
          }}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              {t("departments.deleteDepartment")}
            </h2>

            <p className="text-sm text-muted-foreground mb-4">
              {t("departments.confirmDelete")}
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setDeleteId(undefined);
                }}
              >
                {t("common.cancel")}
              </Button>

              <Button
                className="bg-green-700 text-white hover:bg-green-700"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentPage;
