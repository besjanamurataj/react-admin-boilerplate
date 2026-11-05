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
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import React, { useMemo, useState } from "react";
import { Search } from "../../components/ui/Search";
import { PageTitle } from "../../components/PageTitle";
import { Dialog, DialogContent } from "../../components/ui/Dialog";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { MultiSelect } from "../../components/ui/MultiSelect";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUsers, getUsers } from "../../services/useService";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { getRole } from "../../services/roleService";
import { formatRole } from "../../utils/formatRole";
import { formatDate } from "../../utils/formatDate";
import type { User, UserDetailResponse } from "../../types/user";
import debounce from "debounce";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
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
  const [formData, setFormData] = useState<User>(initialFormData);
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<number>();
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { hasPermission } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "users",
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      search,
    ],
    queryFn: () => {
      const sortStrings = sorting.map(
        (s) => `${s.id},${s.desc ? "desc" : "asc"}`,
      );
      return getUsers(
        search,
        formData.name,
        formData.username,
        formData.surname,
        formData.email,
        formData.roles,
        pagination.pageIndex,
        pagination.pageSize,
        sortStrings,
      );
    },
  });
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRole(),
  });

  const mutation = useMutation({
    mutationFn: () => deleteUsers(Number(deleteId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      addToast({
        title: t("messages.success") ?? "Success",
        description: t("messages.userDeleteSuccess") ?? "",
        variant: "success",
      });
      setOpen(false);
    },
  });

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
      }, 500),
    [],
  );

  const columns: ColumnDef<UserDetailResponse>[] = [
    //   {
    //     id: 'select',
    //     size: 10,
    //     header: ({ table }) => (
    //       <Checkbox
    //         checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
    //         onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
    //         aria-label="Select all"
    //       />
    //     ),
    //     cell: ({ row }) => (
    //       <Checkbox
    //         checked={row.getIsSelected()}
    //         onCheckedChange={value => row.toggleSelected(!!value)}
    //         aria-label="Select row"
    //       />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    //   },
    {
      accessorKey: "name",
      size: 50,
      header: ({ column }) => {
        return (
          <div>
            {t("users.table.firstName")}
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown size={14} />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("name")}</span>;
      },
    },
    {
      accessorKey: "surname",
      header: () => <span>{t("users.table.lastName")}</span>,
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue("surname")}</span>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "username",
      header: () => (
        <span className="hidden sm:table-cell">
          {t("users.table.username")}
        </span>
      ),
      cell: ({ row }) => {
        return (
          <span className="font-medium hidden sm:table-cell">
            {row.getValue("username")}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "email",
      header: () => (
        <span className="hidden sm:table-cell">{t("users.table.email")}</span>
      ),
      cell: ({ row }) => {
        return (
          <span className="font-medium hidden sm:table-cell">
            {row.getValue("email")}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "birthDate",
      header: () => (
        <span className="hidden sm:table-cell">
          {t("users.table.birthDate")}
        </span>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-1">
            <span className="w-fit text-gray-800">
              {row?.original?.userInfo?.birthDate
                ? formatDate(row.original.userInfo.birthDate)
                : ""}
            </span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorFn: (row) => row.roles?.map((role) => role.name).join(", "),
      id: "role",
      header: () => <span>{t("users.table.role")}</span>,

      cell: ({ row }) => {
        const roles = row.original?.roles;

        return (
          <div className="flex flex-col gap-1">
            {roles?.map((role) => (
              <span key={role.id} className="font-medium hidden sm:table-cell">
                {formatRole(role.name)}
              </span>
            ))}
          </div>
        );
      },

      enableSorting: false,
    },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div>
            {hasPermission("VIEW_USER") && (
              <Button
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
        );
      },
    },
  ];
  return (
    <div className="p-6">
      <PageTitle
        title={t("users.title") ?? ""}
        subTitle={t("users.description") ?? undefined}
      />
      <div className="flex  justify-end  items-center my-6">
        <div className="flex gap-4">
          <Button variant="outline">
            {" "}
            <Download />
            {t("common.export")}
          </Button>

          {hasPermission("MANAGE_USER") && (
            <Button
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
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center  gap-2">
          <div className="flex items-center border border-input rounded-xl overflow-hidden bg-background">
            <div className="relative">
              <Search
                placeholder={t("users.searchPlaceholder") ?? undefined}
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

          <Button
            variant={"outline"}
            className="rounded-xl"
            size={"default"}
            onClick={() => setFilter(true)}
          >
            <Funnel />
          </Button>

          <Dialog open={filter} onOpenChange={setFilter}>
            <DialogContent>
              <h4 className="text-sm font-semibold">{t("common.filters")}</h4>
              <div>
                {/* <form> */}
                <div className="grid w-38 gap-2">
                  <div className="grid grid-cols-6 items-center gap-3 w-full ">
                    <Label className="col-span-2">
                      {t("users.table.firstName")}
                    </Label>
                    <Input
                      id="maxWidth"
                      className="col-span-4 h-8 w-full"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-6 items-center gap-3">
                    <Label className="col-span-2">
                      {t("users.table.role")}
                    </Label>
                    <MultiSelect
                      options={
                        roles?.content?.map((role) => ({
                          label: role.name,
                          value: String(role.id),
                        })) ?? []
                      }
                      className="col-span-4 h-8"
                      value={formData.roles ?? []}
                      onChange={(values) => {
                        setFormData((prev) => ({
                          ...prev,
                          roles: values.map(String),
                        }));
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-6 items-center gap-3">
                    <Label className="col-span-2">
                      {t("users.table.lastName")}
                    </Label>
                    <Input
                      id="maxWidth"
                      className="col-span-4 h-8"
                      value={formData.surname}
                      onChange={(e) =>
                        setFormData({ ...formData, surname: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-6 items-center gap-3">
                    <Label className="col-span-2">
                      {t("users.table.username")}
                    </Label>
                    <Input
                      id="height"
                      className="col-span-4 h-8"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-6 items-center gap-3">
                    <Label className="col-span-2">
                      {t("users.table.email")}
                    </Label>
                    <Input
                      id="maxHeight"
                      className="col-span-4 h-8"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFormData(initialFormData)}
                  >
                    {t("common.reset")}
                  </Button>
                  <Button
                    variant="default"
                    className="bg-green-700 hover:bg-green-700"
                    onClick={() => {
                      refetch();
                      setFilter(false);
                    }}
                  >
                    {t("common.apply")}
                  </Button>
                </div>
                {/* </form> */}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="bg-white">
        {" "}
        {data && (
          <DataTable
            data={data.content}
            columns={columns}
            loading={isLoading}
            length={data?.totalElements}
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              {t("users.deleteUser")}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("users.confirmDelete")}
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
export default UserPage;
