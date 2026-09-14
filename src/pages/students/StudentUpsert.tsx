import { useEffect, useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { MultiSelect } from "../../components/ui/MultiSelect";
import { studentSchema } from "../../types/validations/schema";
import type {
  StudentRequest,
  StudentResponse,
} from "../../types/student";
import {
  createStudent,
  getDepartments,
  getStudentById,
  updateStudent,
} from "../../services/studentService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../contexts/ToastContex";
import type { ZodIssue } from "zod";

export const StudentUpsertPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { addToast } = useToast();

  const isEditMode = Boolean(params.id);

  const [formData, setFormData] = useState<StudentRequest>({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    active: true,
    departmentId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: studentData, isLoading: isStudentLoading } =
    useQuery<StudentResponse>({
      queryKey: ["students", params.id],
      queryFn: ({ signal }) => {
        if (!params.id) {
          throw new Error("Student ID is required");
        }

        return getStudentById({
          id: Number(params.id),
          signal,
        });
      },
      enabled: isEditMode,
    });

  const { data: departments, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departments-options"],
    queryFn: getDepartments,
  });

  useEffect(() => {
    if (!studentData) {
      return;
    }

    setFormData({
      firstName: studentData.firstName ?? "",
      lastName: studentData.lastName ?? "",
      email: studentData.email ?? "",
      birthDate: studentData.birthDate ?? "",
      active: studentData.active ?? true,
      departmentId: studentData.departmentId ?? 0,
    });
  }, [studentData]);

  const createMutation = useMutation({
    mutationFn: (student: StudentRequest) => createStudent(student),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });

      addToast({
        title: t("messages.success") || "",
        description: t("messages.studentCreated") || "",
        variant: "success",
      });

      navigate("/student");
    },

    onError: (error: Error) => {
      addToast({
        title: t("messages.error") || "",
        description:
          error.message || t("messages.studentOperationFailed") || "",
        variant: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (student: StudentRequest) => {
      if (!params.id) {
        throw new Error("Student ID is required");
      }

      return updateStudent(Number(params.id), student);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["students"],
      });

      queryClient.invalidateQueries({
        queryKey: ["students", params.id],
      });

      addToast({
        title: t("messages.success") || "",
        description: t("messages.studentUpdated") || "",
        variant: "success",
      });

      navigate("/student");
    },

    onError: (error: Error) => {
      addToast({
        title: t("messages.error") || "",
        description:
          error.message || t("messages.studentOperationFailed") || "",
        variant: "error",
      });
    },
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previousFormData) => ({
      ...previousFormData,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        [name]: "",
      }));
    }
  };

  const handleActiveChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { checked } = event.target;

    setFormData((previousFormData) => ({
      ...previousFormData,
      active: checked,
    }));

    if (errors.active) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        active: "",
      }));
    }
  };

  const handleDepartmentChange = (values: Array<string | number>) => {
    const selectedDepartmentId = values[0];

    setFormData((previousFormData) => ({
      ...previousFormData,
      departmentId:
        selectedDepartmentId !== undefined
          ? Number(selectedDepartmentId)
          : 0,
    }));

    if (errors.departmentId) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        departmentId: "",
      }));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationResult = studentSchema.safeParse(formData);

    if (!validationResult.success) {
      const validationErrors: Record<string, string> = {};

      validationResult.error.issues.forEach((issue: ZodIssue) => {
        const fieldName = issue.path[0];

        if (fieldName) {
          validationErrors[String(fieldName)] = issue.message;
        }
      });

      setErrors(validationErrors);

      return;
    }

    setErrors({});

    if (isEditMode) {
      updateMutation.mutate(validationResult.data);

      return;
    }

    createMutation.mutate(validationResult.data);
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isStudentLoading) {
    return (
      <div className="p-6">
        <p>{t("students.loading")}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageTitle
        title={
          isEditMode
            ? t("students.editStudent")
            : t("students.createStudent")
        }
        subTitle={
          isEditMode
            ? t("students.editDescription") || ""
            : t("students.createDescription") || ""
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="mb-4 mt-4 grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <Label
              htmlFor="firstName"
              className="block text-md font-medium text-gray-700"
            >
              {t("students.table.firstName")}
            </Label>

            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              placeholder={t("students.firstNamePlaceholder") || ""}
              onChange={handleInputChange}
            />

            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.firstName}
              </p>
            )}
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="lastName"
              className="block text-md font-medium text-gray-700"
            >
              {t("students.table.lastName")}
            </Label>

            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              placeholder={t("students.lastNamePlaceholder") || ""}
              onChange={handleInputChange}
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lastName}
              </p>
            )}
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="email"
              className="block text-md font-medium text-gray-700"
            >
              {t("students.table.email")}
            </Label>

            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              placeholder={t("students.emailPlaceholder") || ""}
              onChange={handleInputChange}
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="birthDate"
              className="block text-md font-medium text-gray-700"
            >
              {t("students.table.birthDate")}
            </Label>

            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleInputChange}
            />

            {errors.birthDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.birthDate}
              </p>
            )}
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="department"
              className="block text-md font-medium text-gray-700"
            >
              {t("students.table.department")}
            </Label>

            <MultiSelect
              placeholder={t("students.departmentPlaceholder") || ""}
              options={departments ?? []}
              value={
                formData.departmentId > 0
                  ? [formData.departmentId]
                  : []
              }
              onChange={handleDepartmentChange}
              disabled={isDepartmentsLoading}
            />

            {errors.departmentId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.departmentId}
              </p>
            )}
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="active"
              className="block text-md font-medium text-gray-700"
            >
              {t("students.table.active")}
            </Label>

            <div className="mt-3 flex items-center gap-2">
              <Input
                id="active"
                name="active"
                type="checkbox"
                checked={formData.active}
                onChange={handleActiveChange}
                className="h-4 w-4"
              />

              <span className="text-sm text-gray-700">
                {formData.active
                  ? t("common.yes")
                  : t("common.no")}
              </span>
            </div>

            {errors.active && (
              <p className="mt-1 text-sm text-red-500">
                {errors.active}
              </p>
            )}
          </div>

          <div className="col-span-12 mt-4 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/student")}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>

            <Button
              type="submit"
              className="bg-green-700 text-white hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isEditMode
                ? t("common.update")
                : t("common.create")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentUpsertPage;
