import { useEffect, useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { MultiSelect } from "../../components/ui/MultiSelect";
import type { User } from "../../types/user";
import { userSchema } from "../../types/validations/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { createUser, getById, updateUsers } from "../../services/useService";
import { useTranslation } from "react-i18next";
import { useToast } from "../../contexts/toast/ToastContex";
import { getRole } from "../../services/roleService";
import { RadioGroup } from "../../components/ui/Radion";
import { DatePicker } from "../../components/ui/DatePicker";
import { formatToLocal } from "../../utils/formatDate";

export const UserUpsertPage = () => {
  const [formData, setFormData] = useState<User>({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    roles: [],
    userInfo: {
      phoneNumber: "",
      birthDate: "",
      gender: "",
      street: "",
    },
  });
  const params = useParams();
  const { t } = useTranslation();
  const { addToast } = useToast();

  const title = params.id ? t("users.editUser") : t("users.createUser");
  const [errors, setErrors] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data } = useQuery<any>({
    queryKey: ["user", params.id],
    queryFn: ({ signal }) => {
      if (!params?.id) throw new Error("No ID provided");
      return getById({ id: params.id, signal });
    },
    enabled: !!params?.id,
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRole(),
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name ?? "",
        surname: data.surname ?? "",
        email: data.email ?? "",
        password: data.password ?? "123456789",
        username: data.username ?? "",
        roles: data.roles.map((ele: any) => ele.id) ?? [],
        userInfo: {
          phoneNumber: data.userInfo?.phoneNumber ?? "",
          birthDate: data.userInfo?.birthDate ?? "",
          gender: data.userInfo?.gender ?? "",
          street: data.userInfo?.street ?? "",
        },
      });
    }
  }, [data]);

  const { mutate } = useMutation({
    mutationFn: (data: User) =>
      params.id ? updateUsers(params.id, data) : createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      addToast({
        title: t("messages.success") || "",
        description: params.id
          ? t("messages.userUpdated") || ""
          : t("messages.userCreated") || "",
        variant: "success",
      });
      navigate("/user");
    },
    onError: (error: any) => {
      console.error(error, "error");
      const data = error?.response?.data;

      console.log(data, "backend error");
      addToast({
        title: t("messages.error") || "",
        description: t(error?.response?.data?.message) || "",
        variant: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = userSchema.safeParse(formData);
    console.log(result, "result");
    if (!result.success) {
      const fieldErrors: any = {};

      result.error.issues.forEach((issue) => {
        if (issue.path.length === 2) {
          const [parent, child] = issue.path;

          fieldErrors[parent] = {
            ...(fieldErrors[parent] || {}),
            [child]: issue.message,
          };
        } else {
          fieldErrors[issue.path[0]] = issue.message;
        }
      });

      setErrors(fieldErrors);
      console.log(formData, "updatedFormData");
    } else {
      mutate({ ...formData });
    }
  };
  return (
    <div className="p-6">
      <PageTitle title={title} subTitle="Create or update user information" />
      <form onSubmit={handleSubmit}>
        <div className="mb-4 grid grid-cols-12 gap-6 mt-4">
          <div className="col-span-6">
            <Label
              htmlFor="name"
              className="block text-md font-medium text-gray-700"
            >
              {t("users.table.firstName")}
            </Label>
            <Input
              id="name"
              placeholder={t("users.namePlaceholder") || ""}
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
              htmlFor="lastName"
              className="block text-md font-medium text-gray-700"
            >
              {t("users.table.lastName")}
            </Label>
            <Input
              id="lastName"
              placeholder={t("users.lastNamePlaceholder") || ""}
              value={formData.surname}
              onChange={(e) =>
                setFormData({ ...formData, surname: e.target.value })
              }
            />
            {errors.surname && (
              <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
            )}
          </div>
          <div className="col-span-6">
            <Label
              htmlFor="username"
              className="block text-md font-medium text-gray-700"
            >
              {t("users.table.username")}
            </Label>
            <Input
              id="username"
              placeholder={t("users.usernamePlaceholder") || ""}
              value={formData.username}
              disabled={!!params.id}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>
          <div className="col-span-6">
            <Label
              htmlFor="profile"
              className="block text-md font-medium text-gray-700"
            >
              {t("users.table.email")}
            </Label>
            <Input
              id="profile"
              placeholder={t("users.emailPlaceholder") || ""}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {!params.id && (
            <div className="col-span-6">
              <Label
                htmlFor="profile"
                className="block text-md font-medium text-gray-700"
              >
                {t("users.password")}
              </Label>
              <Input
                type="password"
                placeholder={t("users.passwordPlaceholder") || ""}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
          )}

          <div className="col-span-6">
            <Label
              htmlFor="roles"
              className="block text-md font-medium text-gray-700"
            >
              {t("users.table.role")}
            </Label>
            <MultiSelect
              placeholder={t("common.selectOptions") || "Select Options"}
              options={
                roles?.content?.map((role: any) => ({
                  label: role.name,
                  value: role.id,
                })) || []
              }
              value={formData.roles}
              onChange={(values) => setFormData({ ...formData, roles: values })}
            />
            {errors.roles && (
              <p className="text-red-500 text-sm mt-1">{errors.roles}</p>
            )}
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="profile"
              className="block text-md font-medium text-gray-700"
            >
              {t("users.phoneNumber")}
            </Label>
            <Input
              type="text"
              placeholder={t("users.phonePlaceholder") || ""}
              value={formData.userInfo?.phoneNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  userInfo: {
                    ...formData?.userInfo,
                    phoneNumber: e.target.value,
                  },
                })
              }
            />
            {errors.userInfo?.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.userInfo.phoneNumber}
              </p>
            )}
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="profile"
              className="block text-md font-medium text-gray-700"
            >
              {t("users.streetLabel")}
            </Label>
            <Input
              type="text"
              placeholder={t("users.streetPlaceholder") || ""}
              value={formData.userInfo?.street}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  userInfo: { ...formData.userInfo, street: e.target.value },
                })
              }
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="profile"
              className="block text-md font-medium text-gray-700"
            >
              {t("users.genderPlaceholder")}
            </Label>
            <RadioGroup
              value={formData.userInfo?.gender ?? ""}
              onValueChange={(value: string) =>
                setFormData({
                  ...formData,
                  userInfo: { ...formData.userInfo, gender: value },
                })
              }
              options={[
                { label: "Male", value: "M" },
                { label: "Female", value: "F" },
              ]}
              name="gender"
            />
          </div>

          <div className="col-span-6">
            <Label
              htmlFor="profile"
              className="block text-md font-medium text-gray-700"
            >
              {t("users.birthDate")}
            </Label>
            <DatePicker
              value={
                formData.userInfo?.birthDate
                  ? new Date(formData.userInfo.birthDate)
                  : null
              }
              onChange={(date) =>
                setFormData({
                  ...formData,
                  userInfo: {
                    ...formData.userInfo,
                    birthDate: date ? formatToLocal(date) : "",
                  },
                })
              }
            />
          </div>

          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/user")}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="default"
              className="bg-green-700 text-white hover:bg-green-700"
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default UserUpsertPage;
