import {
  ArrowUpDown,
  Download,
  Edit,
  Eye,
  Plus,
  SearchIcon,
  Trash,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import React, { useEffect, useMemo, useState } from "react";
import { Search } from "../../components/ui/Search";
import { PageTitle } from "../../components/PageTitle";
import { Dialog, DialogContent } from "../../components/ui/Dialog";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteRole, getRole } from "../../services/roleService";
import { useTranslation } from "react-i18next";
import { useToast } from "../../contexts/ToastContex";
import { useAuth } from "../../hooks/useAuth";
import { formatRole } from "../../utils/formatRole";
import debounce from "debounce";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

export const RolePage = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>();
  const [globalFilter, setGlobalFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });


  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
      }, 500),
    [],
  );
  useEffect(() => {
  return () => {
    debouncedSetSearch.clear?.()
  }
}, [debouncedSetSearch])

  // Fetch roles me query
  const { data, isLoading } = useQuery({
    queryKey: [
      "roles",
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      search,
    ],
    queryFn: () => {
      const sortStrings = sorting.map(
        (s) => `${s.id},${s.desc ? "desc" : "asc"}`,
      );
      return getRole(
        search,
        pagination.pageIndex,
        pagination.pageSize,
        sortStrings,
      );
    },
  });

  // Delete role mutation
  const mutation = useMutation({
    mutationFn: () => deleteRole(deleteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      addToast({
        title: t("messages.success") || "",
        description: t("messages.roleDeleteSuccess") || "",
        variant: "success",
      });
      setOpen(false);
    },
    onError: (err: any) => {
      addToast({
        title: t("messages.error") || "",
        description: err.message,
        variant: "error",
      });
    },
  });

  // Columns for DataTable
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("roles.table.name")}
          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{formatRole(row.getValue("name"))}</span>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("roles.table.description")}
          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("description")}</span>
      ),
      enableSorting: false,
    },
    {
      accessorFn: (row: any) => row.authorities?.join(", "),
      id: "permission",
      header: () => <span>{t("roles.table.permission")}</span>,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.original.authorities?.map((role: any) => (
            <span key={role.name} className="w-fit text-gray-800">
              {formatRole(role.name)}
            </span>
          ))}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {hasPermission("VIEW_ROLE") && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/role/view/${row.original.id}`)}
            >
              <Eye size={20} className="text-green-700" />
            </Button>
          )}
          {hasPermission("MANAGE_ROLE") && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/role/edit/${row.original.id}`)}
            >
              <Edit size={20} className="text-green-700" />
            </Button>
          )}
          {hasPermission("MANAGE_ROLE") && (
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
        title={t("roles.title")}
        subTitle={t("roles.description") || ""}
      />

      {/* Buttons top */}
      <div className="flex justify-end gap-4 my-6">
        <Button variant="outline">
          <Download />
          {t("common.export")}
        </Button>

        {hasPermission("MANAGE_ROLE") && (
          <Button
            variant="outline"
            className="bg-green-700 text-white hover:bg-green-700"
            onClick={() => navigate("/role/upsert")}
          >
            <Plus className="text-white" />
            {t("common.add")}
          </Button>
        )}
      </div>

      {/* Search input */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center  gap-2">
          <div className="flex items-center border border-input rounded-xl overflow-hidden bg-background">
            <div className="relative">
              <Search
                placeholder={t("roles.searchPlaceholder") ?? undefined}
                value={globalFilter}
                onChange={(e) => {
                  const value = e.target.value;
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

      {/* DataTable */}
      <div className="bg-white">
        {data && (
          <DataTable
            data={data.content}
            columns={columns}
            loading={isLoading}
            length={data.totalElements}
            sorting={{ state: sorting, onChange: setSorting }}
            pagination={{
              ...pagination,
              total: data?.total ?? 0,
              onChange: setPagination,
            }}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              {t("roles.deleteRole")}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("roles.confirmDelete")}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                className="bg-green-700 text-white hover:bg-green-700"
                onClick={() => mutation.mutate()}
              >
                {t("common.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default RolePage;