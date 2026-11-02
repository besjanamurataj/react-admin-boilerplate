
import {
  ArrowUpDown,
  Download,
  Edit,
  Eye,
  Funnel,
  Plus,
  SearchIcon,
  Trash,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ColumnDef, SortingState } from "@tanstack/react-table";

import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Search } from "../../components/ui/Search";
import { PageTitle } from "../../components/PageTitle";
import { Dialog, DialogContent } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { MultiSelect } from "../../components/ui/MultiSelect";

import { deleteUsers, getUsers } from "../../services/useService";
import { getRole } from "../../services/roleService";

import { formatDate } from "../../utils/formatDate";

import type { User } from "../../types/user";
import type { Role, RoleResponse } from "../../types/role";

import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/toast/ToastProvider";

export const UserPage = () => {
  const initialFormData: User = {
    id: 0,
    name: "",
    surname: "",
    email: "",
    password: "",
    username: "",
    roles: [],
    authorities: [],
    userInfo: {
      phoneNumber: "",
      birthDate: "",
      gender: "",
      street: "",
    },
  };

  // States
  const [formData, setFormData] = useState<User>(initialFormData);
  const [appliedFilters, setAppliedFilters] =
    useState<User>(initialFormData);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState(false);

  const [deleteId, setDeleteId] = useState<number | undefined>();

  const [globalFilter, setGlobalFilter] = useState("");
  const [search, setSearch] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  // Hooks
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { t } = useTranslation();
  const { addToast } = useToast();
  const { hasPermission } = useAuth();

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(globalFilter);
      setPagination((prev) => ({
        ...prev,
        pageIndex: 0,
      }));
    }, 500);

    return () => clearTimeout(timeout);
  }, [globalFilter]);

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: [
      "users",
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      search,
      appliedFilters.name,
      appliedFilters.username,
      appliedFilters.surname,
      appliedFilters.email,
      appliedFilters.roles,
    ],

    queryFn: () => {
      const sortStrings = sorting.map(
        (item) => `${item.id},${item.desc ? "desc" : "asc"}`,
      );

      return getUsers(
        search,
        appliedFilters.name,
        appliedFilters.username,
        appliedFilters.surname,
        appliedFilters.email,
        appliedFilters.roles,
        pagination.pageIndex,
        pagination.pageSize,
        sortStrings,
      );
    },
  });

  // Fetch roles
  const { data: roles } = useQuery<RoleResponse>({
    queryKey: ["roles"],
    queryFn: () => getRole(),
  });

  // Role options for MultiSelect
  const rolesOptions =
    roles?.content.map((role: Role) => ({
      label: role.name,
      value: String(role.id),
    })) ?? [];

  // Delete user
  const mutation = useMutation({
    mutationFn: (id: number) => deleteUsers(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      addToast({
        title: t("messages.success"),
        description: t("messages.userDeleteSuccess"),
        variant: "success",
      });

      setOpen(false);
      setDeleteId(undefined);
    },

    onError: (error: Error) => {
      addToast({
        title: t("messages.error"),
        description: error.message || t("messages.userDeleteFailed"),
        variant: "error",
      });
    },
  });

  // Table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      size: 50,
      header: ({ column }) => (
        <div>
          {t("users.table.firstName")}
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.name}
        </span>
      ),
    },

    {
      accessorKey: "surname",
      header: () => <span>{t("users.table.lastName")}</span>,
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.surname}
        </span>
      ),
      enableSorting: false,
    },

    {
      accessorKey: "username",
      header: () => (
        <span className="hidden sm:table-cell">
          {t("users.table.username")}
        </span>
      ),
      cell: ({ row }) => (
        <span className="hidden font-medium sm:table-cell">
          {row.original.username}
        </span>
      ),
      enableSorting: false,
    },

    {
      accessorKey: "email",
      header: () => (
        <span className="hidden sm:table-cell">
          {t("users.table.email")}
        </span>
      ),
      cell: ({ row }) => (
        <span className="hidden font-medium sm:table-cell">
          {row.original.email}
        </span>
      ),
      enableSorting: false,
    },

    {
      id: "birthDate",
      accessorFn: (row) => row.userInfo?.birthDate ?? "",
      header: () => (
        <span className="hidden sm:table-cell">
          {t("users.table.birthDate")}
        </span>
      ),
      cell: ({ row }) => {
        const birthDate = row.original.userInfo?.birthDate;

        return (
          <span className="w-fit text-gray-800">
            {birthDate ? formatDate(birthDate) : ""}
          </span>
        );
      },
      enableSorting: false,
    },

    {
      id: "role",
      accessorFn: (row) => row.roles?.join(", ") ?? "",
      header: () => <span>{t("users.table.role")}</span>,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.original.roles?.map((role) => (
            <span key={role} className="w-fit text-gray-800">
              {role}
            </span>
          ))}
        </div>
      ),
      enableSorting: false,
    },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <div>
          {hasPermission("VIEW_USER") && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="hover:bg-white"
              onClick={() => navigate(`/user/view/${row.original.id}`)}
            >
              <Eye size={20} className="text-green-700" />
            </Button>
          )}

          {hasPermission("MANAGE_USER") && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-white"
              onClick={() => navigate(`/user/edit/${row.original.id}`)}
            >
              <Edit size={20} className="text-green-700" />
            </Button>
          )}

          {hasPermission("MANAGE_USER") && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-white"
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

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedFilters({ ...formData });
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
    setFilter(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFormData({ ...initialFormData });
    setAppliedFilters({ ...initialFormData });

    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  // Render
  return (
    <div className="p-6">
      <PageTitle
        title={t("users.title")}
        subTitle={t("users.description") || undefined}
      />

      {/* Header actions */}
      <div className="my-6 flex items-center justify-end">
        <div className="flex gap-4">
          <Button type="button" variant="outline">
            <Download />
            {t("common.export")}
          </Button>

          {hasPermission("MANAGE_USER") && (
            <Button
              type="button"
              variant="outline"
              className="bg-green-700 text-white hover:bg-green-700"
              onClick={() => navigate("/user/upsert")}
            >
              <Plus className="text-white" />
              {t("common.create")}
            </Button>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center overflow-hidden rounded-xl border border-input bg-background">
            <div className="relative">
              <Search
                placeholder={t("users.searchPlaceholder")}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full border-none py-2 pl-10 pr-3"
              />

              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            size="default"
            onClick={() => setFilter(true)}
          >
            <Funnel />
          </Button>

          {/* Filter dialog */}
          <Dialog open={filter} onOpenChange={setFilter}>
            <DialogContent>
              <h4 className="text-sm font-semibold">
                {t("common.filters")}
              </h4>

              <div>
                <div className="grid w-full gap-2">
                  {/* First name */}
                  <div className="grid grid-cols-6 items-center gap-3">
                    <Label className="col-span-2">
                      {t("users.table.firstName")}
                    </Label>

                    <Input
                      id="name"
                      className="col-span-4 h-8 w-full"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Roles */}
                  <div className="grid grid-cols-6 items-center gap-3">
                    <Label className="col-span-2">
                      {t("users.table.role")}
                    </Label>

                    <MultiSelect
                      options={rolesOptions}
                      className="col-span-4 h-8"
                      value={formData.roles}
                      onChange={(values) =>
                        setFormData((prev) => ({
                          ...prev,
                          roles: values.map(String),
                        }))
                      }
                    />
                  </div>

                  {/* Last name */}
                  <div className="grid grid-cols-6 items-center gap-3">
                    <Label className="col-span-2">
                      {t("users.table.lastName")}
                    </Label>

                    <Input
                      id="surname"
                      className="col-span-4 h-8"
                      value={formData.surname}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          surname: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Username */}
                  <div className="grid grid-cols-6 items-center gap-3">
                    <Label className="col-span-2">
                      {t("users.table.username")}
                    </Label>

                    <Input
                      id="username"
                      className="col-span-4 h-8"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Email */}
                  <div className="grid grid-cols-6 items-center gap-3">
                    <Label className="col-span-2">
                      {t("users.table.email")}
                    </Label>

                    <Input
                      id="email"
                      className="col-span-4 h-8"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Filter actions */}
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetFilters}
                  >
                    {t("common.reset")}
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    className="bg-green-700 hover:bg-green-700"
                    onClick={handleApplyFilters}
                  >
                    {t("common.apply")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white">
        {data && (
          <DataTable
            data={data.content}
            columns={columns}
            loading={isLoading}
            length={data.totalElements}
            sorting={{
              state: sorting,
              onChange: setSorting,
            }}
            pagination={{
              ...pagination,
              total: data.totalElements,
              onChange: setPagination,
            }}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold">
              {t("users.deleteUser")}
            </h2>

            <p className="mb-4 text-sm text-muted-foreground">
              {t("users.confirmDelete")}
            </p>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => setOpen(false)}
              >
                {t("common.cancel")}
              </Button>

              <Button
                type="button"
                className="bg-green-700 text-white hover:bg-green-700"
                disabled={mutation.isPending || deleteId === undefined}
                onClick={() => {
                  if (deleteId !== undefined) {
                    mutation.mutate(deleteId);
                  }
                }}
              >
                {mutation.isPending
                  ? t("common.loading")
                  : t("common.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserPage;
