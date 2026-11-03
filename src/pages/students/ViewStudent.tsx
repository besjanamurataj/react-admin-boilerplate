import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { MultiSelect } from "../../components/ui/MultiSelect";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentById } from "../../services/studentService";
import { useTranslation } from "react-i18next";
import type { DepartmentResponse } from "../../types/department";
import { getDepartments } from "../../services/departmentService";
import type { Student, StudentResponse } from "../../types/student";

export const ViewStudentPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();

  const { data } = useQuery<StudentResponse>({
    queryKey: ["students", params.id],
    queryFn: ({ signal }) => {
      if (!params?.id) {
        throw new Error("No ID provided");
      }

      return getStudentById({
        id: Number(params.id),
        signal,
      });
    },
    enabled: !!params?.id,
  });

  const student = data as unknown as Student | undefined;
  const displayFormData = data
    ? {
        firstName: student?.firstName,
        lastName: student?.lastName,
        email: student?.email,
        birthDate: student?.birthDate,
        active: student?.active,
        departmentId: student?.departmentId,
      }
    : null;

  const { data: departments } = useQuery({
    queryKey: ["departments-options"],
    queryFn: (): Promise<DepartmentResponse> => getDepartments(),
  });

  return (
    <div className="p-6">
      <PageTitle
        title={t("students.viewStudent")}
        subTitle={t("students.viewDescription") || ""}
      />

      <form>
        <div className="mb-4 grid grid-cols-12 gap-6 mt-4">
          <div className="col-span-6">
            <Label
              htmlFor="firstName"
              className="block text-md font-medium text-gray-700"
            >
              {t("students.table.firstName")}
            </Label>

            <Input
              id="firstName"
              placeholder={t("students.firstNamePlaceholder") || ""}
              value={displayFormData?.firstName ?? ""}
              disabled
            />
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
              placeholder={t("students.lastNamePlaceholder") || ""}
              value={displayFormData?.lastName ?? ""}
              disabled
            />
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
              type="email"
              placeholder={t("students.emailPlaceholder") || ""}
              value={displayFormData?.email ?? ""}
              disabled
            />
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
              type="date"
              value={displayFormData?.birthDate ?? ""}
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="active"
              className="block text-md font-medium text-gray-700"
            >
              {t("students.table.active")}
            </Label>

            <Input
              id="active"
              value={
                displayFormData
                  ? displayFormData.active
                    ? t("common.yes")
                    : t("common.no")
                  : ""
              }
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="department"
              className="block text-md font-medium text-gray-700"
            >
              {t("students.table.department")}
            </Label>

            <MultiSelect
              placeholder={t("common.selectOptions") || ""}
              options={
                departments?.content?.map((department) => ({
                  label: department.name,
                  value: department.id,
                })) || []
              }
              value={
                displayFormData?.departmentId !== undefined
                  ? [displayFormData.departmentId]
                  : []
              }
              onChange={() => {}}
            />
          </div>

          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/student")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ViewStudentPage;
