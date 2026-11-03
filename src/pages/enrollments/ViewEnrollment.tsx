import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getEnrollmentById } from "../../services/enrollmentService";
import { useTranslation } from "react-i18next";
import type { Enrollment, EnrollmentResponse } from "../../types/enrollment";

export const ViewEnrollmentPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();

  const { data } = useQuery<EnrollmentResponse>({
    queryKey: ["enrollments", params.id],
    queryFn: ({ signal }) => {
      if (!params?.id) {
        throw new Error("No ID provided");
      }

      return getEnrollmentById({
        id: Number(params.id),
        signal,
      });
    },

    enabled: !!params?.id,
  });
  const enrollment = data as unknown as Enrollment;
  const displayedFormData = data
    ? {
        enrollmentDate: enrollment.enrollmentDate,
        universityName: enrollment.universityName,
        departmentName: enrollment.departmentName,
        studentFirstName: enrollment.studentFirstName,
        studentLastName: enrollment.studentLastName,
      }
    : null;

  return (
    <div className="p-6">
      <PageTitle
        title={t("enrollments.viewEnrollment")}
        subTitle={t("enrollments.viewDescription") || ""}
      />

      <form>
        <div className="mb-4 grid grid-cols-12 gap-6 mt-4">
          <div className="col-span-6">
            <Label
              htmlFor="student"
              className="block text-md font-medium text-gray-700"
            >
              {t("enrollments.table.student")}
            </Label>

            <Input
              id="student"
              value={
                displayedFormData
                  ? `${displayedFormData.studentFirstName} ${displayedFormData.studentLastName}`
                  : ""
              }
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="university"
              className="block text-md font-medium text-gray-700"
            >
              {t("enrollments.table.university")}
            </Label>

            <Input
              id="university"
              value={displayedFormData?.universityName ?? ""}
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="department"
              className="block text-md font-medium text-gray-700"
            >
              {t("enrollments.table.department")}
            </Label>

            <Input
              id="department"
              value={displayedFormData?.departmentName ?? ""}
              disabled
            />
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
              type="date"
              value={displayedFormData?.enrollmentDate ?? ""}
              disabled
            />
          </div>

          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/enrollment")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ViewEnrollmentPage;
