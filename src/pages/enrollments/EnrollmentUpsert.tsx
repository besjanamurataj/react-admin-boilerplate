
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ZodIssue } from "zod";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";

import { enrollmentSchema } from "../../types/validations/schema";

import type {
  EnrollmentRequest,
  EnrollmentResponse,
} from "../../types/enrollment";

import { getDepartments } from "../../services/departmentService";
import { getStudents } from "../../services/studentService";
import { getUniversities } from "../../services/universityService";

import type { StudentResponse } from "../../types/student";

interface EnrollmentFormProps {
  enrollmentData?: EnrollmentResponse;
  onSubmit: (enrollment: EnrollmentRequest) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const EnrollmentForm = ({
  enrollmentData,
  onSubmit,
  onCancel,
  isSubmitting,
}: EnrollmentFormProps) => {
  const { t } = useTranslation();

  const isEditMode = Boolean(enrollmentData);

  // Initialize form state directly from API data.
  const [formData, setFormData] = useState<EnrollmentRequest>(() => ({
    enrollmentDate: enrollmentData?.enrollmentDate ?? "",
    universityId: enrollmentData?.universityId ?? 0,
    departmentId: enrollmentData?.departmentId ?? 0,
    studentId: enrollmentData?.studentId ?? 0,
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: universities, isLoading: isUniversitiesLoading } = useQuery({
    queryKey: ["universities-options"],
    queryFn: () => getUniversities(),
  });

  const { data: departments, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departments-options"],
    queryFn: () => getDepartments(),
  });

  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students-options"],
    queryFn: () => getStudents(),
  });

  const universityOptions =
    universities?.map((university) => ({
      label: university.name,
      value: university.id,
    })) ?? [];

  const departmentOptions =
    departments?.map((department) => ({
      label: department.name,
      value: department.id,
    })) ?? [];

  const studentOptions =
    students
      ?.filter(
        (student): student is StudentResponse =>
          student !== undefined
      )
      .map((student) => ({
        label: `${student.firstName} ${student.lastName}`,
        value: student.id,
      })) ?? [];

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationResult = enrollmentSchema.safeParse(formData);

    if (!validationResult.success) {
      const validationErrors: Record<string, string> = {};

      validationResult.error.issues.forEach((issue: ZodIssue) => {
        const fieldName = issue.path[0];

        if (fieldName !== undefined) {
          validationErrors[String(fieldName)] = issue.message;
        }
      });

      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSubmit(validationResult.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 mt-4 grid grid-cols-12 gap-6">

        {/* Student */}
        <div className="col-span-6">
          <Label htmlFor="student">
            {t("enrollments.table.student")}
          </Label>

          <select
            id="student"
            value={formData.studentId}
            onChange={(event) => {
              setFormData((previous) => ({
                ...previous,
                studentId: Number(event.target.value),
              }));

              setErrors((previous) => ({
                ...previous,
                studentId: "",
              }));
            }}
            disabled={isStudentsLoading}
            className="w-full h-10 rounded-md border border-input bg-background px-3"
          >
            <option value={0}>
              {t("enrollments.studentPlaceholder")}
            </option>

            {studentOptions.map((student) => (
              <option key={student.value} value={student.value}>
                {student.label}
              </option>
            ))}
          </select>

          {errors.studentId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.studentId}
            </p>
          )}
        </div>

        {/* University */}
        <div className="col-span-6">
          <Label htmlFor="university">
            {t("enrollments.table.university")}
          </Label>

          <select
            id="university"
            value={formData.universityId}
            onChange={(event) => {
              setFormData((previous) => ({
                ...previous,
                universityId: Number(event.target.value),
              }));

              setErrors((previous) => ({
                ...previous,
                universityId: "",
              }));
            }}
            disabled={isUniversitiesLoading}
            className="w-full h-10 rounded-md border border-input bg-background px-3"
          >
            <option value={0}>
              {t("enrollments.universityPlaceholder")}
            </option>

            {universityOptions.map((university) => (
              <option key={university.value} value={university.value}>
                {university.label}
              </option>
            ))}
          </select>

          {errors.universityId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.universityId}
            </p>
          )}
        </div>

        {/* Department */}
        <div className="col-span-6">
          <Label htmlFor="department">
            {t("enrollments.table.department")}
          </Label>

          <select
            id="department"
            value={formData.departmentId}
            onChange={(event) => {
              setFormData((previous) => ({
                ...previous,
                departmentId: Number(event.target.value),
              }));

              setErrors((previous) => ({
                ...previous,
                departmentId: "",
              }));
            }}
            disabled={isDepartmentsLoading}
            className="w-full h-10 rounded-md border border-input bg-background px-3"
          >
            <option value={0}>
              {t("enrollments.departmentPlaceholder")}
            </option>

            {departmentOptions.map((department) => (
              <option key={department.value} value={department.value}>
                {department.label}
              </option>
            ))}
          </select>

          {errors.departmentId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.departmentId}
            </p>
          )}
        </div>

        {/* Enrollment Date */}
        <div className="col-span-6">
          <Label htmlFor="enrollmentDate">
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

        {/* Actions */}
        <div className="col-span-12 mt-4 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
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
  );
};
