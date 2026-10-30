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
import { useEffect, useMemo, useState } from "react";
import { Search } from "../../components/ui/Search";
import { PageTitle } from "../../components/PageTitle";
import { Dialog, DialogContent } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteStudent,
  getDepartments,
  getStudents,
  exportStudentsPdf,
} from "../../services/studentService";
import { useTranslation } from "react-i18next";
import { useToast } from "../../contexts/toast/ToastContex";
import { useAuth } from "../../hooks/useAuth";
import debounce from "debounce";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import type { StudentResponse } from "../../types/student";

export const StudentPage = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const initialFilters = {
    firstName: "",
    lastName: "",
    birthDate: "",
    active: undefined as boolean | undefined,
    departmentId: 0,
  };

  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();
  const [globalFilter, setGlobalFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [filterForm, setFilterForm] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);

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

  const { data: departments } = useQuery({
    queryKey: ["departments-options"],
    queryFn: getDepartments,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "students",
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      search,
      filters.firstName,
      filters.lastName,
      filters.birthDate,
      filters.active,
      filters.departmentId,
    ],
    queryFn: () => {
      const sortStrings = sorting.map(
        (sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`,
      );

      return getStudents(
        search,
        pagination.pageIndex,
        pagination.pageSize,
        sortStrings,
        filters.firstName,
        filters.lastName,
        filters.birthDate,
        filters.active,
        filters.departmentId,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (deleteId === undefined) {
        throw new Error("Student ID is required");
      }

      return deleteStudent(deleteId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });

      addToast({
        title: t("messages.success") || "",
        description: t("messages.studentDeleteSuccess") || "",
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

  const columns: ColumnDef<StudentResponse>[] = [
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("students.table.firstName")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("firstName")}</span>
      ),
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("students.table.lastName")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("lastName")}</span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("students.table.email")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "birthDate",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("students.table.birthDate")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("birthDate")}</span>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("students.table.active")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.active ? t("common.yes") : t("common.no")}
        </span>
      ),
    },
    {
      accessorKey: "departmentName",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("students.table.department")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("departmentName")}</span>
      ),
    },
    {
      id: "actions",
      header: () => <span>{t("common.actions")}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1">
          {hasPermission("VIEW_STUDENT") && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/student/view/${row.original.id}`)}
            >
              <Eye size={20} className="text-green-700" />
            </Button>
          )}

          {hasPermission("MANAGE_STUDENT") && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/student/edit/${row.original.id}`)}
            >
              <Edit size={20} className="text-green-700" />
            </Button>
          )}

          {hasPermission("MANAGE_STUDENT") && (
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

  const handleExportPdf = async () => {
    try {
      const sortStrings = sorting.map(
        (sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`,
      );

      const pdfBlob = await exportStudentsPdf(
        search,
        sortStrings,
        filters.firstName,
        filters.lastName,
        filters.birthDate,
        filters.active,
        filters.departmentId,
      );

      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "students.pdf";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      addToast({
        title: t("messages.error") || "",
        description:
          error instanceof Error
            ? error.message
            : "Failed to export students PDF",
        variant: "error",
      });
    }
  };

  return (
    <div className="p-6">
      <PageTitle
        title={t("students.title")}
        subTitle={t("students.description") || ""}
      />

      <div className="flex justify-end gap-4 my-6">
        <Button variant="outline" onClick={handleExportPdf}>
          <Download />
          {t("common.export")}
        </Button>

        {hasPermission("MANAGE_STUDENT") && (
          <Button
            variant="outline"
            className="bg-green-700 text-white hover:bg-green-700"
            onClick={() => navigate("/student/upsert")}
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
                placeholder={t("students.searchPlaceholder") ?? undefined}
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

          <Button
            variant="outline"
            className="rounded-xl"
            size="default"
            onClick={() => setFilterOpen(true)}
          >
            <Funnel />
          </Button>

          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogContent>
              <h4 className="text-sm font-semibold">{t("common.filters")}</h4>

              <div className="grid gap-4 mt-4">
                <div className="grid grid-cols-6 items-center gap-3">
                  <Label className="col-span-2">
                    {t("students.table.firstName")}
                  </Label>

                  <Input
                    className="col-span-4 h-8"
                    value={filterForm.firstName}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        firstName: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-6 items-center gap-3">
                  <Label className="col-span-2">
                    {t("students.table.lastName")}
                  </Label>

                  <Input
                    className="col-span-4 h-8"
                    value={filterForm.lastName}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        lastName: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-6 items-center gap-3">
                  <Label className="col-span-2">
                    {t("students.table.birthDate")}
                  </Label>

                  <Input
                    type="date"
                    className="col-span-4 h-8"
                    value={filterForm.birthDate}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        birthDate: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-6 items-center gap-3">
                  <Label className="col-span-2">
                    {t("students.table.active")}
                  </Label>

                  <select
                    className="col-span-4 h-8 rounded-md border px-2"
                    value={
                      filterForm.active === undefined
                        ? ""
                        : filterForm.active.toString()
                    }
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        active:
                          event.target.value === ""
                            ? undefined
                            : event.target.value === "true",
                      })
                    }
                  >
                    <option value="">{t("common.all")}</option>
                    <option value="true">{t("common.yes")}</option>
                    <option value="false">{t("common.no")}</option>
                  </select>
                </div>

                <div className="grid grid-cols-6 items-center gap-3">
                  <Label htmlFor="departmentFilter" className="col-span-2">
                    {t("students.table.department")}
                  </Label>

                  <select
                    id="departmentFilter"
                    className="col-span-4 h-10 rounded-md border border-input bg-background px-3"
                    value={filterForm.departmentId}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        departmentId: Number(event.target.value),
                      })
                    }
                  >
                    <option value={0}>{t("common.all")}</option>

                    {departments?.map(
                      (department: { value: number; label: string }) => (
                        <option key={department.value} value={department.value}>
                          {department.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterForm(initialFilters);
                    setFilters(initialFilters);

                    setPagination((previousPagination) => ({
                      ...previousPagination,
                      pageIndex: 0,
                    }));
                  }}
                >
                  {t("common.reset")}
                </Button>

                <Button
                  className="bg-green-700 hover:bg-green-700"
                  onClick={() => {
                    setFilters(filterForm);

                    setPagination((previousPagination) => ({
                      ...previousPagination,
                      pageIndex: 0,
                    }));

                    setFilterOpen(false);
                  }}
                >
                  {t("common.apply")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
              {t("students.deleteStudent")}
            </h2>

            <p className="text-sm text-muted-foreground mb-4">
              {t("students.confirmDelete")}
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

export default StudentPage;
