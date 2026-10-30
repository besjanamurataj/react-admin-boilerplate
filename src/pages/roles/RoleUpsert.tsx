import { useEffect, useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { MultiSelect } from "../../components/ui/MultiSelect";
import { roleSchema } from "../../types/validations/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  createRole,
  updateRole,
  getById,
  getAuthorities,
} from "../../services/roleService";
import type { RoleRequest } from "../../types/role";
import { Textarea } from "../../components/ui/Textarea";
import { useTranslation } from "react-i18next";
import { useToast } from "../../contexts/toast/ToastContex";

export const RoleUpsertPage = () => {
  const [formData, setFormData] = useState<RoleRequest>({
    name: "",
    description: "",
    authorities: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const title = params.id ? t("roles.editRole") : t("roles.createRole");

  const { data } = useQuery<any>({
    queryKey: ["roles", params.id],
    queryFn: ({ signal }) => {
      if (!params?.id) throw new Error("No ID provided");
      return getById({ id: params.id, signal });
    },
    enabled: !!params?.id,
  });

  const { data: permission } = useQuery({
    queryKey: ["permission"],
    queryFn: getAuthorities,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name ?? "",
        description: data.description ?? "",
        authorities: data.authorities?.map((auth: any) => auth.id) || [],
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (data: RoleRequest) =>
      params.id ? updateRole(params.id, data) : createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      addToast({
        title: t("messages.success") || "",
        description: params.id
          ? t("messages.roleUpdated") || ""
          : t("messages.roleCreated") || "",
        variant: "success",
      });
      navigate("/role");
    },
    onError: (error) => {
      addToast({
        title: t("messages.error") || "",
        description:
          error instanceof Error
            ? error.message || ""
            : t("messages.roleOperationFailed") || "",
        variant: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = roleSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    mutation.mutate(formData);
  };
  return (
    <div className="p-6">
      <PageTitle title={title} subTitle="Create or update role information" />
      <form onSubmit={handleSubmit}>
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
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
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
                permission?.map((role: any) => ({
                  label: role.label,
                  value: role.value,
                })) || []
              }
              value={formData.authorities}
              onChange={(values) =>
                setFormData({ ...formData, authorities: values })
              }
            />
            {errors.authorities && (
              <p className="text-red-500 text-sm mt-1">{errors.authorities}</p>
            )}
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
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => navigate("/role")}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="default"
              className="bg-green-700 text-white hover:bg-green-700"
            >
              {params.id ? t("common.update") : t("common.create")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default RoleUpsertPage;
