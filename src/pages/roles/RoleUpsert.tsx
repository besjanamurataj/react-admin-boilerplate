import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { MultiSelect } from "../../components/ui/MultiSelect";
import { Textarea } from "../../components/ui/Textarea";

import { roleSchema } from "../../types/validations/schema";
import type { Role, RoleRequest } from "../../types/role";

import {
  createRole,
  updateRole,
  getById,
  getAuthorities,
} from "../../services/roleService";

import { useToast } from "../../contexts/toast/ToastProvider";

const initialFormData: RoleRequest = {
  name: "",
  description: "",
  authorities: [],
};

export const RoleUpsertPage = () => {
  // Form state
  const [formData, setFormData] = useState<RoleRequest>(initialFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hooks
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();
  const { addToast } = useToast();

  const isEditMode = !!params.id;

  const title = isEditMode ? t("roles.editRole") : t("roles.createRole");

  const { data, isLoading } = useQuery<Role>({
    queryKey: ["roles", params.id],
    queryFn: ({ signal }) => {
      if (!params.id) {
        throw new Error("No ID provided");
      }

      return getById({
        id: params.id,
        signal,
      });
    },
    enabled: isEditMode,
  });

  // Fetch available permissions
  const { data: permission } = useQuery({
    queryKey: ["permission"],
    queryFn: getAuthorities,
  });
  const role = data as unknown as Role | undefined;
  const displayedFormData: RoleRequest =
    isEditMode && role
      ? {
          name: role.name ?? "",
          description: role.description ?? "",
          authorities: role.authorities ?? [],
        }
      : formData;

  // Create / Update mutation
  const mutation = useMutation({
    mutationFn: (payload: RoleRequest) =>
      isEditMode ? updateRole(params.id!, payload) : createRole(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["roles"],
      });

      addToast({
        title: t("messages.success"),
        description: isEditMode
          ? t("messages.roleUpdated")
          : t("messages.roleCreated"),
        variant: "success",
      });

      navigate("/role");
    },

    onError: (error: Error) => {
      addToast({
        title: t("messages.error"),
        description: error.message || t("messages.roleOperationFailed"),
        variant: "error",
      });
    },
  });

  // Form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

  // Update individual form fields
  const handleChange = (field: keyof RoleRequest, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // Loading state for edit mode
  if (isEditMode && isLoading) {
    return (
      <div className="p-6">
        <PageTitle title={title} subTitle="Create or update role information" />
        <p className="mt-6 text-gray-500">Loading role...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageTitle title={title} subTitle="Create or update role information" />

      <form onSubmit={handleSubmit}>
        <div className="mb-4 mt-4 grid grid-cols-12 gap-6">
          {/* Role name */}
          <div className="col-span-6">
            <Label
              htmlFor="name"
              className="block text-md font-medium text-gray-700"
            >
              {t("roles.table.name")}
            </Label>

            <Input
              id="name"
              placeholder={t("roles.namePlaceholder")}
              value={displayedFormData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Permissions */}
          <div className="col-span-6">
            <Label
              htmlFor="authorities"
              className="block text-md font-medium text-gray-700"
            >
              {t("roles.table.permission")}
            </Label>

            <MultiSelect
              placeholder={t("common.selectOptions")}
              options={(permission ?? []).map((role) => ({
                label: role.label,
                value: role.value,
              }))}
              value={displayedFormData.authorities.map(
                (authority) => authority.id,
              )}
              onChange={(values) =>
                handleChange("authorities", values.map(String))
              }
            />

            {errors.authorities && (
              <p className="mt-1 text-sm text-red-500">{errors.authorities}</p>
            )}
          </div>

          {/* Description */}
          <div className="col-span-6">
            <Label
              htmlFor="description"
              className="block text-md font-medium text-gray-700"
            >
              {t("roles.table.description")}
            </Label>

            <Textarea
              id="description"
              placeholder={t("roles.descriptionPlaceholder")}
              value={displayedFormData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="col-span-12 mt-4 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/role")}
              disabled={mutation.isPending}
            >
              {t("common.cancel")}
            </Button>

            <Button
              type="submit"
              variant="default"
              disabled={mutation.isPending}
              className="bg-green-700 text-white hover:bg-green-700"
            >
              {mutation.isPending
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

export default RoleUpsertPage;
