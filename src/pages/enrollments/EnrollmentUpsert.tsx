import {useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";

import { enrollmentSchema } from "../../types/validations/schema";

import type {
  Enrollment,
  EnrollmentRequest,
  EnrollmentResponse,
} from "../../types/enrollment";

import {
  createEnrollment,
  getEnrollmentById,
  updateEnrollment,
} from "../../services/enrollmentService";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useNavigate, useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { useToast } from "../../contexts/toast/ToastProvider";

import type { ZodIssue } from "zod";

import { getUniversities } from "../../services/universityService";
import type { UniversityResponse } from "../../types/university";

import { getDepartments } from "../../services/departmentService";
import type { DepartmentResponse } from "../../types/department";

import { getStudents } from "../../services/studentService";
import type {  StudentResponse } from "../../types/student";

export const EnrollmentUpsertPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { t } = useTranslation();
  const { addToast } = useToast();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<EnrollmentRequest>({
    enrollmentDate: "",
    universityId: 0,
    departmentId: 0,
    studentId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get enrollment by ID
  const {
    data: enrollmentData,
    isLoading: isEnrollmentLoading,
    isError: isEnrollmentError,
  } = useQuery<EnrollmentResponse>({
    queryKey: ["enrollments", id],
    queryFn: ({ signal }) => {
      if (!id) {
        throw new Error("Enrollment ID is required");
      }

      return getEnrollmentById({
        id: Number(id),
        signal,
      });
    },
    enabled: isEditMode,
  });

  // Get universities
  const { data: universities, isLoading: isUniversitiesLoading } =
    useQuery<UniversityResponse>({
      queryKey: ["universities-options"],
      queryFn: () => getUniversities(),
    });

  // Get departments
  const { data: departments, isLoading: isDepartmentsLoading } =
    useQuery<DepartmentResponse>({
      queryKey: ["departments-options"],
      queryFn: () => getDepartments(),
    });

  // Get students
  const { data: students, isLoading: isStudentsLoading } =
    useQuery<StudentResponse>({
      queryKey: ["students-options"],
      queryFn: () => getStudents(),
    });


      const enrollment = enrollmentData as unknown as Enrollment ;
      const displayFormData: EnrollmentRequest = isEditMode
       ? formData
       :
     { enrollmentDate: enrollment.enrollmentDate ?? "",
      universityId: enrollment.universityId ?? 0,
      departmentId: enrollment.departmentId ?? 0,
      studentId: enrollment.studentId ?? 0,}
    
  // Populate form in edit mode


  // Filter departments by selected university
  // Assumes Department has a universityId property.
  const filteredDepartments =
    departments?.content.filter(
      (department) => department.universityId === formData.universityId,
    ) ?? [];

  // Create enrollment
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

  // Update enrollment
  const updateMutation = useMutation({
    mutationFn: (enrollment: EnrollmentRequest) => {
      if (!id) {
        throw new Error("Enrollment ID is required");
      }

      return updateEnrollment(Number(id), enrollment);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrollments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["enrollments", id],
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

  // Handle input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    const numericValue = Number(value);

    setFormData((previous) => ({
      ...previous,
      [name]: numericValue,
      ...(name === "universityId" ? { departmentId: 0 } : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      ...(name === "universityId" ? { departmentId: "" } : {}),
    }));
  };

  // Handle form submission
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

  // Loading state
  if (isEditMode && isEnrollmentLoading) {
    return (
      <div className="p-6">
        <p>{t("enrollments.loading")}</p>
      </div>
    );
  }

  // Error state when fetching enrollment
  if (isEditMode && isEnrollmentError) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          {t("messages.enrollmentOperationFailed")}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/enrollment")}
        >
          {t("common.cancel")}
        </Button>
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
          {/* Student */}
          <div className="col-span-6">
            <Label
              htmlFor="studentId"
              className="block text-md font-medium text-gray-700"
            >
              {t("enrollments.table.student")}
            </Label>

            <select
              id="studentId"
              name="studentId"
              value={displayFormData.studentId}
              onChange={handleSelectChange}
              disabled={isStudentsLoading}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value={0}>{t("enrollments.studentPlaceholder")}</option>

              {students?.content.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>

            {errors.studentId && (
              <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>
            )}
          </div>

          {/* University */}
          <div className="col-span-6">
            <Label
              htmlFor="universityId"
              className="block text-md font-medium text-gray-700"
            >
              {t("enrollments.table.university")}
            </Label>

            <select
              id="universityId"
              name="universityId"
              value={displayFormData.universityId}
              onChange={handleSelectChange}
              disabled={isUniversitiesLoading}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value={0}>
                {t("enrollments.universityPlaceholder")}
              </option>

              {universities?.content.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>

            {errors.universityId && (
              <p className="mt-1 text-sm text-red-500">{errors.universityId}</p>
            )}
          </div>

          {/* Department */}
          <div className="col-span-6">
            <Label
              htmlFor="departmentId"
              className="block text-md font-medium text-gray-700"
            >
              {t("enrollments.table.department")}
            </Label>

            <select
              id="departmentId"
              name="departmentId"
              value={displayFormData.departmentId}
              onChange={handleSelectChange}
              disabled={isDepartmentsLoading || !displayFormData.universityId}
              className="w-full h-10 rounded-md border border-input bg-background px-3"
            >
              <option value={0}>
                {t("enrollments.departmentPlaceholder")}
              </option>

              {filteredDepartments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            {errors.departmentId && (
              <p className="mt-1 text-sm text-red-500">{errors.departmentId}</p>
            )}
          </div>

          {/* Enrollment date */}
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
              value={displayFormData.enrollmentDate}
              onChange={handleInputChange}
            />

            {errors.enrollmentDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.enrollmentDate}
              </p>
            )}
          </div>

          {/* Actions */}
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
              {isSubmitting
                ? t("common.loading")
                : isEditMode
                  ? t("common.update")
                  : t("common.create")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentUpsertPage;
