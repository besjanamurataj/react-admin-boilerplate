import { useEffect, useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
import { MultiSelect } from "../../components/ui/MultiSelect";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  createDepartment,
  getDepartmentById,
  getUniversities,
  updateDepartment,
} from "../../services/departmentService";
import type { DepartmentRequest } from "../../types/department";
import { useTranslation } from "react-i18next";
import { departmentSchema } from "../../types/validations/schema";
import { useToast } from "../../contexts/toast/ToastProvider";

export const DepartmentUpsertPage = () => {
  const [formData, setFormData] = useState<DepartmentRequest>({
    name: "",
    code: "",
    universityId: 0,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();
  const { addToast } = useToast();

  const title = params.id
    ? t("departments.editDepartment")
    : t("departments.createDepartment");

  const { data } = useQuery<any>({
    queryKey: ["departments", params.id],
    queryFn: ({ signal }) => {
      if (!params.id) {
        throw new Error("No ID provided");
      }

      return getDepartmentById({
        id: Number(params.id),
        signal,
      });
    },
    enabled: !!params.id,
  });

  const { data: universities } = useQuery({
    queryKey: ["universities-options"],
    queryFn: getUniversities,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name ?? "",
        code: data.code ?? "",
        universityId: data.universityId ?? 0,
        description: data.description ?? "",
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (departmentData: DepartmentRequest) =>
      params.id
        ? updateDepartment(Number(params.id), departmentData)
        : createDepartment(departmentData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });

      addToast({
        title: t("messages.success") || "",
        description: params.id
          ? t("messages.departmentUpdated") || ""
          : t("messages.departmentCreated") || "",
        variant: "success",
      });

      navigate("/department");
    },

    onError: (error) => {
      addToast({
        title: t("messages.error") || "",
        description:
          error instanceof Error
            ? error.message
            : t("messages.departmentOperationFailed") || "",
        variant: "error",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const result = departmentSchema.safeParse(formData);

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
      <PageTitle
        title={title}
        subTitle={t("departments.upsertDescription") || ""}
      />

      <form onSubmit={handleSubmit}>
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
              value={formData.name}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  name: event.target.value,
                })
              }
            />

            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
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
              value={formData.code}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  code: event.target.value,
                })
              }
            />

            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code}</p>
            )}
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
              value={formData.universityId ? [formData.universityId] : []}
              onChange={(values) => {
                setFormData({
                  ...formData,
                  universityId: values.length > 0 ? Number(values[0]) : 0,
                });
              }}
            />

            {errors.universityId && (
              <p className="text-red-500 text-sm mt-1">{errors.universityId}</p>
            )}
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
              placeholder={t("departments.descriptionPlaceholder") || ""}
              value={formData.description}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  description: event.target.value,
                })
              }
            />

            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/department")}
            >
              {t("common.cancel")}
            </Button>

            <Button
              type="submit"
              variant="default"
              className="bg-green-700 text-white hover:bg-green-700"
              disabled={mutation.isPending}
            >
              {params.id ? t("common.update") : t("common.create")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DepartmentUpsertPage;
