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
import type { AuthorityResponse } from "../../types/authorities.service";

export const ViewRolePage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();
  const title = "View Role";

  const { data } = useQuery<Role>({
    queryKey: ["roles", params.id],
    queryFn: ({ signal }) => {
      if (!params?.id) throw new Error("No ID provided");
      return getById({ id: params.id, signal });
    },
    enabled: !!params?.id,
  });

  const role = data
    ? {
        name: data.name,
        description: data.description,
        authorities:
          data.authorities?.map((a: AuthorityResponse) => a.id) || [],
      }
    : null;
  const { data: permission } = useQuery({
    queryKey: ["permission"],
    queryFn: getAuthorities,
  });

  return (
    <div className="p-6">
      <PageTitle title={title} subTitle="Create or update role information" />
      <form>
        <div className="mb-4 grid grid-cols-12 gap-6 mt-4">
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
              value={role?.name}
              disabled={true}
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="roles"
              className="block text-md font-medium text-gray-700"
            >
              {t("roles.table.permission")}
            </Label>
            <MultiSelect
              placeholder={t("common.selectOptions") || ""}
              options={
                permission?.map((role) => ({
                  label: role.label,
                  value: role.value,
                })) || []
              }
              value={(role?.authorities ?? []).map(String)}
              onChange={() => {}}
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="username"
              className="block text-md font-medium text-gray-700"
            >
              {t("roles.table.description")}
            </Label>
            <Textarea
              id="description"
              placeholder={t("roles.descriptionPlaceholder") || ""}
              value={role?.description}
              disabled={true}
            />
          </div>
          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => navigate("/role")}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default ViewRolePage;
