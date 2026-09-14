import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDepartmentById,
  getUniversities,
} from "../../services/departmentService";
import { useTranslation } from "react-i18next";
import { MultiSelect } from "../../components/ui/MultiSelect";

export const ViewDepartmentPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();

  const { data } = useQuery<any>({
    queryKey: ["departments", params.id],
    queryFn: ({ signal }) => {
      if (!params?.id) {
        throw new Error("No ID provided");
      }

      return getDepartmentById({
        id: params.id,
        signal,
      });
    },
    enabled: !!params?.id,
  });

  const department = data
    ? {
        name: data.name,
        code: data.code,
        description: data.description,
        universityId: data.universityId,
      }
    : null;

  const { data: universities } = useQuery({
    queryKey: ["universities"],
    queryFn: getUniversities,
  });

  return (
    <div className="p-6">
      <PageTitle
        title={t("departments.viewDepartment")}
        subTitle={t("departments.viewDescription") || ""}
      />

      <form>
        <div className="mb-4 grid grid-cols-12 gap-6 mt-4">
          <div className="col-span-6">
            <Label
              htmlFor="name"
              className="block text-md font-medium text-gray-700"
            >
              {t("departments.table.name")}
            </Label>

            <Input
              id="name"
              placeholder={t("departments.namePlaceholder") || ""}
              value={department?.name}
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="code"
              className="block text-md font-medium text-gray-700"
            >
              {t("departments.table.code")}
            </Label>

            <Input
              id="code"
              placeholder={t("departments.codePlaceholder") || ""}
              value={department?.code}
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="university"
              className="block text-md font-medium text-gray-700"
            >
              {t("departments.table.university")}
            </Label>

            <MultiSelect
              placeholder={t("common.selectOptions") || ""}
              options={
                universities?.map((university: any) => ({
                  label: university.label,
                  value: university.value,
                })) || []
              }
              value={
                department?.universityId
                  ? [department.universityId]
                  : []
              }
              onChange={() => {}}
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="description"
              className="block text-md font-medium text-gray-700"
            >
              {t("departments.table.description")}
            </Label>

            <Textarea
              id="description"
              placeholder={
                t("departments.descriptionPlaceholder") || ""
              }
              value={department?.description}
              disabled
            />
          </div>

          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/department")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ViewDepartmentPage;