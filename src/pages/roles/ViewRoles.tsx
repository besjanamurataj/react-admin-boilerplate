import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { MultiSelect } from "../../components/ui/MultiSelect";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getById, getAuthorities } from "../../services/roleService";
import { Textarea } from "../../components/ui/Textarea";
import { useTranslation } from "react-i18next";
import type { Role } from "../../types/role";

export const ViewRolePage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();

  const { data } = useQuery<Role>({
    queryKey: ["roles", params.id],
    queryFn: ({ signal }) => {
      if (!params.id) {
        throw new Error("No ID provided");
      }

      return getById({ id: params.id, signal });
    },
    enabled: !!params.id,
  });

  const { data: permission = [] } = useQuery({
    queryKey: ["permission"],
    queryFn: getAuthorities,
  });

  const selectedAuthorities =
    data?.authorities?.map((authority) => authority.id) ?? [];

  return (
    <div className="p-6">
      <PageTitle
        title="View Role"
        subTitle="Create or update role information"
      />

      <form>
        <div className="mb-4 mt-4 grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <Label
              htmlFor="name"
              className="block text-md font-medium text-gray-700"
            >
              {t("roles.table.name")}
            </Label>

            <Input
              id="name"
              placeholder={t("roles.namePlaceholder") || ""}
              value={data?.name ?? ""}
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="authorities"
              className="block text-md font-medium text-gray-700"
            >
              {t("roles.table.permission")}
            </Label>

            <MultiSelect
              placeholder={t("common.selectOptions") || ""}
              options={permission.map((authority) => ({
                label: authority.label,
                value: authority.value,
              }))}
              value={selectedAuthorities}
              onChange={() => {}}
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="description"
              className="block text-md font-medium text-gray-700"
            >
              {t("roles.table.description")}
            </Label>

            <Textarea
              id="description"
              placeholder={t("roles.descriptionPlaceholder") || ""}
              value={data?.description ?? ""}
              disabled
            />
          </div>

          <div className="col-span-12 mt-4 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/role")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ViewRolePage;
