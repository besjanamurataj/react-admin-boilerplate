import { useEffect, useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";

import { enrollmentSchema } from "../../types/validations/schema";

import type {
  EnrollmentRequest,
  EnrollmentResponse,
} from "../../types/enrollment";

import {
  createEnrollment,
  getDepartments,
  getEnrollmentById,
  getStudents,
  getUniversities,
  updateEnrollment,
} from "../../services/enrollmentService";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useNavigate, useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { useToast } from "../../contexts/toast/ToastContex";

import type { ZodIssue } from "zod";

export const EnrollmentUpsertPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();

  const { t } = useTranslation();
  const { addToast } = useToast();

  const isEditMode = Boolean(params.id);

  const [formData, setFormData] = useState<EnrollmentRequest>({
    enrollmentDate: "",
    universityId: 0,
    departmentId: 0,
    studentId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: enrollmentData, isLoading: isEnrollmentLoading } =
    useQuery<EnrollmentResponse>({
      queryKey: ["enrollments", params.id],

      queryFn: ({ signal }) => {
        if (!params.id) {
          throw new Error("Enrollment ID is required");
        }

        return getEnrollmentById({
          id: Number(params.id),
          signal,
        });
      },

      enabled: isEditMode,
    });

  const { data: universities, isLoading: isUniversitiesLoading } = useQuery({
    queryKey: ["universities-options"],
    queryFn: getUniversities,
  });

  const { data: departments, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departments-options"],
    queryFn: getDepartments,
  });

  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students-options"],
    queryFn: getStudents,
  });

  useEffect(() => {
    if (!enrollmentData) {
      return;
    }

    setFormData({
      enrollmentDate: enrollmentData.enrollmentDate ?? "",
      universityId: enrollmentData.universityId ?? 0,
      departmentId: enrollmentData.departmentId ?? 0,
      studentId: enrollmentData.studentId ?? 0,
    });
  }, [enrollmentData]);

  const createMutation = useMutation({
    mutationFn: (enrollment: EnrollmentRequest) => createEnrollment(enrollment),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrollments"],
      });

      addToast({
        title: t("messages.success") || "",
        description: t("messages.enrollmentCreated") || "",
        variant: "success",
      });

      navigate("/enrollment");
    },

    onError: (error: Error) => {
      addToast({
        title: t("messages.error") || "",
        description:
          error.message || t("messages.enrollmentOperationFailed") || "",
        variant: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (enrollment: EnrollmentRequest) => {
      if (!params.id) {
        throw new Error("Enrollment ID is required");
      }

      return updateEnrollment(Number(params.id), enrollment);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrollments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["enrollments", params.id],
      });

      addToast({
        title: t("messages.success") || "",
        description: t("messages.enrollmentUpdated") || "",
        variant: "success",
      });

      navigate("/enrollment");
    },

    onError: (error: Error) => {
      addToast({
        title: t("messages.error") || "",
        description:
          error.message || t("messages.enrollmentOperationFailed") || "",
        variant: "error",
      });
    },
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationResult = enrollmentSchema.safeParse(formData);

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

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isEnrollmentLoading) {
    return (
      <div className="p-6">
        <p>{t("enrollments.loading")}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageTitle
        title={
          isEditMode
            ? t("enrollments.editEnrollment")
            : t("enrollments.createEnrollment")
        }
        subTitle={
          isEditMode
            ? t("enrollments.editDescription") || ""
            : t("enrollments.createDescription") || ""
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="mb-4 mt-4 grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <Label
              htmlFor="student"
              className="block text-md font-medium text-gray-700"
            >
              {t("enrollments.table.student")}
            </Label>

            <select
              id="student"
              value={formData.studentId}
              onChange={(event) => {
                setFormData((previousFormData) => ({
                  ...previousFormData,
                  studentId: Number(event.target.value),
                }));

                if (errors.studentId) {
                  setErrors((previousErrors) => ({
                    ...previousErrors,
                    studentId: "",
                  }));
                }
              }}
              disabled={isStudentsLoading}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value={0}>{t("enrollments.studentPlaceholder")}</option>

              {students?.map((student: { value: number; label: string }) => (
                <option key={student.value} value={student.value}>
                  {student.label}
                </option>
              ))}
            </select>

            {errors.studentId && (
              <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>
            )}
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="university"
              className="block text-md font-medium text-gray-700"
            >
              {t("enrollments.table.university")}
            </Label>

            <select
              id="university"
              value={formData.universityId}
              onChange={(event) => {
                setFormData((previousFormData) => ({
                  ...previousFormData,
                  universityId: Number(event.target.value),
                }));

                if (errors.universityId) {
                  setErrors((previousErrors) => ({
                    ...previousErrors,
                    universityId: "",
                  }));
                }
              }}
              disabled={isUniversitiesLoading}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value={0}>
                {t("enrollments.universityPlaceholder")}
              </option>

              {universities?.map(
                (university: { value: number; label: string }) => (
                  <option key={university.value} value={university.value}>
                    {university.label}
                  </option>
                ),
              )}
            </select>

            {errors.universityId && (
              <p className="mt-1 text-sm text-red-500">{errors.universityId}</p>
            )}
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="department"
              className="block text-md font-medium text-gray-700"
            >
              {t("enrollments.table.department")}
            </Label>

            <select
              id="department"
              value={formData.departmentId}
              onChange={(event) => {
                setFormData((previousFormData) => ({
                  ...previousFormData,
                  departmentId: Number(event.target.value),
                }));

                if (errors.departmentId) {
                  setErrors((previousErrors) => ({
                    ...previousErrors,
                    departmentId: "",
                  }));
                }
              }}
              disabled={isDepartmentsLoading}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value={0}>
                {t("enrollments.departmentPlaceholder")}
              </option>

              {departments?.map(
                (department: { value: number; label: string }) => (
                  <option key={department.value} value={department.value}>
                    {department.label}
                  </option>
                ),
              )}
            </select>

            {errors.departmentId && (
              <p className="mt-1 text-sm text-red-500">{errors.departmentId}</p>
            )}
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="enrollmentDate"
              className="block text-md font-medium text-gray-700"
            >
              {t("enrollments.table.enrollmentDate")}
            </Label>

            <Input
              id="enrollmentDate"
              name="enrollmentDate"
              type="date"
              value={formData.enrollmentDate}
              onChange={handleInputChange}
            />

            {errors.enrollmentDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.enrollmentDate}
              </p>
            )}
          </div>

          <div className="col-span-12 mt-4 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/enrollment")}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>

            <Button
              type="submit"
              className="bg-green-700 text-white hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isEditMode ? t("common.update") : t("common.create")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentUpsertPage;
