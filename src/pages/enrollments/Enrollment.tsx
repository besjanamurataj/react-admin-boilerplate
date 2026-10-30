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
  batchEnrollByDepartment,
  deleteEnrollment,
  exportEnrollmentsCsv,
  exportEnrollmentsPdf,
  getDepartments,
  getEnrollments,
  getStudents,
  getUniversities,
} from "../../services/enrollmentService";

import { useTranslation } from "react-i18next";

import { useAuth } from "../../hooks/useAuth";
import debounce from "debounce";

import type { ColumnDef, SortingState } from "@tanstack/react-table";

import type {
  BatchEnrollmentResponse,
  EnrollmentResponse,
} from "../../types/enrollment";
import { useToast } from "../../contexts/toast/ToastProvider";

export const EnrollmentPage = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { hasPermission } = useAuth();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const initialFilters = {
    enrollmentDate: "",
    universityId: 0,
    departmentId: 0,
    studentId: 0,
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
    pageSize: 10,
  });

  const [exportOpen, setExportOpen] = useState(false);

  const [batchOpen, setBatchOpen] = useState(false);

  const [batchForm, setBatchForm] = useState({
    departmentId: 0,
    enrollmentDate: "",
  });

  const [batchResult, setBatchResult] =
    useState<BatchEnrollmentResponse | null>(null);

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

  const { data: universities } = useQuery({
    queryKey: ["universities-options"],
    queryFn: getUniversities,
  });

  const { data: departments } = useQuery({
    queryKey: ["departments-options"],
    queryFn: getDepartments,
  });

  const { data: students } = useQuery({
    queryKey: ["students-options"],
    queryFn: getStudents,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "enrollments",
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      search,
      filters.enrollmentDate,
      filters.universityId,
      filters.departmentId,
      filters.studentId,
    ],

    queryFn: () => {
      const sortStrings = sorting.map(
        (sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`,
      );

      return getEnrollments(
        search,
        pagination.pageIndex,
        pagination.pageSize,
        sortStrings,
        filters.enrollmentDate,
        filters.universityId,
        filters.departmentId,
        filters.studentId,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (deleteId === undefined) {
        throw new Error("Enrollment ID is required");
      }

      return deleteEnrollment(deleteId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrollments"],
      });

      addToast({
        title: t("messages.success") || "",
        description: t("messages.enrollmentDeleteSuccess") || "",
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

  const batchEnrollmentMutation = useMutation({
    mutationFn: () => {
      if (batchForm.departmentId === 0) {
        throw new Error("Department is required");
      }

      if (!batchForm.enrollmentDate) {
        throw new Error("Enrollment date is required");
      }

      return batchEnrollByDepartment(batchForm);
    },

    onSuccess: (response) => {
      setBatchResult(response);

      queryClient.invalidateQueries({
        queryKey: ["enrollments"],
      });

      addToast({
        title: t("messages.success") || "",
        description: `${response.successfullyEnrolled} students enrolled successfully`,
        variant: "success",
      });
    },

    onError: (error: Error) => {
      addToast({
        title: t("messages.error") || "",
        description: error.message,
        variant: "error",
      });
    },
  });

  const columns: ColumnDef<EnrollmentResponse>[] = [
    {
      accessorKey: "studentFirstName",

      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("enrollments.table.studentFirstName")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),

      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("studentFirstName")}</span>
      ),
    },

    {
      accessorKey: "studentLastName",

      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("enrollments.table.studentLastName")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),

      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("studentLastName")}</span>
      ),
    },

    {
      accessorKey: "universityName",

      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("enrollments.table.university")}

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
      accessorKey: "departmentName",

      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("enrollments.table.department")}

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
      accessorKey: "enrollmentDate",

      header: ({ column }) => (
        <div className="flex items-center justify-between">
          {t("enrollments.table.enrollmentDate")}

          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            <ArrowUpDown size={14} />
          </Button>
        </div>
      ),

      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("enrollmentDate")}</span>
      ),
    },

    {
      id: "actions",

      header: () => <span>{t("common.actions")}</span>,

      enableSorting: false,

      cell: ({ row }) => (
        <div className="flex gap-1">
          {hasPermission("VIEW_ENROLLMENT") && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/enrollment/view/${row.original.id}`)}
            >
              <Eye size={20} className="text-green-700" />
            </Button>
          )}

          {hasPermission("MANAGE_ENROLLMENT") && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate(`/enrollment/edit/${row.original.id}`)}
            >
              <Edit size={20} className="text-green-700" />
            </Button>
          )}

          {hasPermission("MANAGE_ENROLLMENT") && (
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

  const handleExportCsv = async () => {
    try {
      const sortStrings = sorting.map(
        (sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`,
      );

      const csvBlob = await exportEnrollmentsCsv(
        search,
        sortStrings,
        filters.enrollmentDate,
        filters.universityId,
        filters.departmentId,
        filters.studentId,
      );

      const url = window.URL.createObjectURL(csvBlob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "enrollments.csv";

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
            : "Failed to export enrollments CSV",
        variant: "error",
      });
    }
  };

  const handleExportPdf = async () => {
    try {
      const sortStrings = sorting.map(
        (sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`,
      );

      const pdfBlob = await exportEnrollmentsPdf(
        search,
        sortStrings,
        filters.enrollmentDate,
        filters.universityId,
        filters.departmentId,
        filters.studentId,
      );

      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "enrollments.pdf";

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
            : "Failed to export enrollments PDF",
        variant: "error",
      });
    }
  };

  return (
    <div className="p-6">
      <PageTitle
        title={t("enrollments.title")}
        subTitle={t("enrollments.description") || ""}
      />

      <div className="flex justify-end gap-4 my-6">
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setExportOpen((previous) => !previous)}
          >
            <Download size={18} />
            Export
          </Button>

          {exportOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-md z-50">
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  setExportOpen(false);
                  handleExportPdf();
                }}
              >
                Export PDF
              </button>

              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  setExportOpen(false);
                  handleExportCsv();
                }}
              >
                Export CSV
              </button>
            </div>
          )}
        </div>

        {hasPermission("MANAGE_ENROLLMENT") && (
          <Button
            variant="outline"
            onClick={() => {
              setBatchResult(null);

              setBatchForm({
                departmentId: 0,
                enrollmentDate: "",
              });

              setBatchOpen(true);
            }}
          >
            Enroll Active Students
          </Button>
        )}

        {hasPermission("MANAGE_ENROLLMENT") && (
          <Button
            variant="outline"
            className="bg-green-700 text-white hover:bg-green-700"
            onClick={() => navigate("/enrollment/upsert")}
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
                placeholder={t("enrollments.searchPlaceholder") ?? undefined}
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
                    {t("enrollments.table.enrollmentDate")}
                  </Label>

                  <Input
                    type="date"
                    className="col-span-4 h-8"
                    value={filterForm.enrollmentDate}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        enrollmentDate: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-6 items-center gap-3">
                  <Label htmlFor="universityFilter" className="col-span-2">
                    {t("enrollments.table.university")}
                  </Label>

                  <select
                    id="universityFilter"
                    className="col-span-4 h-10 rounded-md border border-input bg-background px-3"
                    value={filterForm.universityId}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        universityId: Number(event.target.value),
                      })
                    }
                  >
                    <option value={0}>{t("common.all")}</option>

                    {universities?.map(
                      (university: { value: number; label: string }) => (
                        <option key={university.value} value={university.value}>
                          {university.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-6 items-center gap-3">
                  <Label htmlFor="departmentFilter" className="col-span-2">
                    {t("enrollments.table.department")}
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

                <div className="grid grid-cols-6 items-center gap-3">
                  <Label htmlFor="studentFilter" className="col-span-2">
                    {t("enrollments.table.student")}
                  </Label>

                  <select
                    id="studentFilter"
                    className="col-span-4 h-10 rounded-md border border-input bg-background px-3"
                    value={filterForm.studentId}
                    onChange={(event) =>
                      setFilterForm({
                        ...filterForm,
                        studentId: Number(event.target.value),
                      })
                    }
                  >
                    <option value={0}>{t("common.all")}</option>

                    {students?.map(
                      (student: { value: number; label: string }) => (
                        <option key={student.value} value={student.value}>
                          {student.label}
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

      <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
        <DialogContent>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Enroll Active Students
            </h2>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="batchDepartment">Department</Label>

                <select
                  id="batchDepartment"
                  className="h-10 rounded-md border border-input bg-background px-3"
                  value={batchForm.departmentId}
                  onChange={(event) =>
                    setBatchForm({
                      ...batchForm,
                      departmentId: Number(event.target.value),
                    })
                  }
                >
                  <option value={0}>Select department</option>

                  {departments?.map(
                    (department: { value: number; label: string }) => (
                      <option key={department.value} value={department.value}>
                        {department.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="batchEnrollmentDate">Enrollment Date</Label>

                <Input
                  id="batchEnrollmentDate"
                  type="date"
                  value={batchForm.enrollmentDate}
                  onChange={(event) =>
                    setBatchForm({
                      ...batchForm,
                      enrollmentDate: event.target.value,
                    })
                  }
                />
              </div>

              {batchResult && (
                <div className="rounded-md border p-4 mt-2 text-sm space-y-2">
                  <p>
                    <strong>Department:</strong> {batchResult.departmentName}
                  </p>

                  <p>
                    <strong>University:</strong> {batchResult.universityName}
                  </p>

                  <p>
                    <strong>Total Students:</strong> {batchResult.totalStudents}
                  </p>

                  <p>
                    <strong>Active Students:</strong>{" "}
                    {batchResult.activeStudents}
                  </p>

                  <p>
                    <strong>Inactive Students:</strong>{" "}
                    {batchResult.inactiveStudents}
                  </p>

                  <p>
                    <strong>Already Enrolled:</strong>{" "}
                    {batchResult.alreadyEnrolled}
                  </p>

                  <p>
                    <strong>Successfully Enrolled:</strong>{" "}
                    {batchResult.successfullyEnrolled}
                  </p>

                  <p>
                    <strong>Failed:</strong> {batchResult.failed}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setBatchOpen(false)}>
                {t("common.cancel")}
              </Button>

              <Button
                className="bg-green-700 text-white hover:bg-green-700"
                disabled={batchEnrollmentMutation.isPending}
                onClick={() => batchEnrollmentMutation.mutate()}
              >
                {batchEnrollmentMutation.isPending
                  ? "Enrolling..."
                  : "Enroll Active Students"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              {t("enrollments.deleteEnrollment")}
            </h2>

            <p className="text-sm text-muted-foreground mb-4">
              {t("enrollments.confirmDelete")}
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

export default EnrollmentPage;
