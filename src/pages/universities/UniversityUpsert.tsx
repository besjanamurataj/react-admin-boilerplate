import { useEffect, useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { universitySchema } from "../../types/validations/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  createUniversity,
  getUniversityById,
  updateUniversity,
} from "../../services/universityService";
import type { UniversityRequest } from "../../types/university";
import { useTranslation } from "react-i18next";
import { useToast } from "../../contexts/toast/ToastProvider";
export const UniversityUpsertPage = () => {
  const [formData, setFormData] = useState<UniversityRequest>({
    name: "",
    code: "",
    city: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();
  const { addToast } = useToast();

  const title = params.id
    ? t("universities.editUniversity")
    : t("universities.createUniversity");

  const { data } = useQuery<any>({
    queryKey: ["universities", params.id],
    queryFn: ({ signal }) => {
      if (!params.id) {
        throw new Error("No ID provided");
      }

      return getUniversityById({
        id: params.id,
        signal,
      });
    },
    enabled: !!params.id,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name ?? "",
        code: data.code ?? "",
        city: data.city ?? "",
        email: data.email ?? "",
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (data: UniversityRequest) =>
      params.id
        ? updateUniversity(Number(params.id), data)
        : createUniversity(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["universities"],
      });

      addToast({
        title: t("messages.success") || "",
        description: params.id
          ? t("messages.universityUpdated") || ""
          : t("messages.universityCreated") || "",
        variant: "success",
      });

      navigate("/university");
    },

    onError: (error) => {
      addToast({
        title: t("messages.error") || "",
        description:
          error instanceof Error
            ? error.message
            : t("messages.universityOperationFailed") || "",
        variant: "error",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const result = universitySchema.safeParse(formData);

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
        subTitle={t("universities.upsertDescription") || ""}
      />

      <form onSubmit={handleSubmit}>
        <div className="mb-4 grid grid-cols-12 gap-6 mt-4">
          <div className="col-span-6">
            <Label
              htmlFor="name"
              className="block text-md font-medium text-gray-700"
            >
              {t("universities.table.name")}
            </Label>

            <Input
              id="name"
              placeholder={t("universities.namePlaceholder") || ""}
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
              {t("universities.table.code")}
            </Label>

            <Input
              id="code"
              placeholder={t("universities.codePlaceholder") || ""}
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
              htmlFor="city"
              className="block text-md font-medium text-gray-700"
            >
              {t("universities.table.city")}
            </Label>

            <Input
              id="city"
              placeholder={t("universities.cityPlaceholder") || ""}
              value={formData.city}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  city: event.target.value,
                })
              }
            />

            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="email"
              className="block text-md font-medium text-gray-700"
            >
              {t("universities.table.email")}
            </Label>

            <Input
              id="email"
              type="email"
              placeholder={t("universities.emailPlaceholder") || ""}
              value={formData.email}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  email: event.target.value,
                })
              }
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/university")}
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

export default UniversityUpsertPage;
