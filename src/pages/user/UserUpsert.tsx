import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { MultiSelect } from "../../components/ui/MultiSelect";
import { RadioGroup } from "../../components/ui/Radion";
import { DatePicker } from "../../components/ui/DatePicker";

import type { User, UserResponse } from "../../types/user";
import type { Role, RoleResponse } from "../../types/role";
import { userSchema } from "../../types/validations/schema";

import { createUser, getById, updateUsers } from "../../services/useService";
import { getRole } from "../../services/roleService";

import { formatToLocal } from "../../utils/formatDate";
import { useToast } from "../../contexts/toast/ToastProvider";

export const UserUpsertPage = () => {
  const initialFormData: User = {
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    roles: [],
    authorities: [],
    userInfo: {
      phoneNumber: "",
      birthDate: "",
      gender: "",
      street: "",
    },
  };

  const [formData, setFormData] = useState<User>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const params = useParams();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isEditing = Boolean(params.id);

  const title = isEditing ? t("users.editUser") : t("users.createUser");

  // Fetch user when editing
  const { data } = useQuery<UserResponse>({
    queryKey: ["user", params.id],
    queryFn: ({ signal }) => {
      if (!params.id) {
        throw new Error("No ID provided");
      }

      return getById({ id: params.id, signal });
    },
    enabled: isEditing,
  });

  // Fetch roles
  const { data: roles } = useQuery<RoleResponse>({
    queryKey: ["roles"],
    queryFn: () => getRole(),
  });

  // RoleResponse is paginated
  const rolesOptions =
    roles?.content.map((role: Role) => ({
      label: role.name,
      value: String(role.id),
    })) ?? [];

  useEffect(() => {
    if (!data) return;

    const user = data as unknown as User;
    const userRoles = user.roles as unknown as Array<string | Role> | undefined;

    setFormData({
      name: user.name ?? "",
      surname: user.surname ?? "",
      email: user.email ?? "",
      username: user.username ?? "",
      password: user.password ?? "",
      roles:
        userRoles?.map((role) =>
          typeof role === "string" ? role : String(role.id),
        ) ?? [],
      authorities: user.authorities ?? [],
      userInfo: {
        phoneNumber: user.userInfo?.phoneNumber ?? "",
        birthDate: user.userInfo?.birthDate ?? "",
        gender: user.userInfo?.gender ?? "",
        street: user.userInfo?.street ?? "",
      },
    });
  }, [data]);

  const updateField = (field: keyof User, value: User[keyof User]) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateUserInfo = (field: keyof User["userInfo"], value: string) => {
    setFormData((previous) => ({
      ...previous,
      userInfo: {
        ...previous.userInfo,
        [field]: value,
      },
    }));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (user: User) =>
      params.id ? updateUsers(params.id, user) : createUser(user),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      addToast({
        title: t("messages.success"),
        description: isEditing
          ? t("messages.userUpdated")
          : t("messages.userCreated"),
        variant: "success",
      });

      navigate("/user");
    },

    onError: (error: unknown) => {
      const responseData = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      )?.response?.data;

      addToast({
        title: t("messages.error"),
        description: responseData?.message
          ? t(responseData.message)
          : t("messages.error"),
        variant: "error",
      });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path.join(".");
        fieldErrors[fieldName] = issue.message;
      });

      setErrors(fieldErrors);
      return;
    }

    mutate(formData);
  };

  return (
    <div className="p-6">
      <PageTitle title={title} subTitle="Create or update user information" />

      <form onSubmit={handleSubmit}>
        <div className="mb-4 mt-4 grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <Label htmlFor="name">{t("users.table.firstName")}</Label>

            <Input
              id="name"
              placeholder={t("users.namePlaceholder") || ""}
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="col-span-6">
            <Label htmlFor="surname">{t("users.table.lastName")}</Label>

            <Input
              id="surname"
              placeholder={t("users.lastNamePlaceholder") || ""}
              value={formData.surname}
              onChange={(e) => updateField("surname", e.target.value)}
            />

            {errors.surname && (
              <p className="mt-1 text-sm text-red-500">{errors.surname}</p>
            )}
          </div>

          <div className="col-span-6">
            <Label htmlFor="username">{t("users.table.username")}</Label>

            <Input
              id="username"
              placeholder={t("users.usernamePlaceholder") || ""}
              value={formData.username}
              disabled={isEditing}
              onChange={(e) => updateField("username", e.target.value)}
            />

            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div className="col-span-6">
            <Label htmlFor="email">{t("users.table.email")}</Label>

            <Input
              id="email"
              placeholder={t("users.emailPlaceholder") || ""}
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {!isEditing && (
            <div className="col-span-6">
              <Label htmlFor="password">{t("users.password")}</Label>

              <Input
                id="password"
                type="password"
                placeholder={t("users.passwordPlaceholder") || ""}
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
              />

              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          )}

          <div className="col-span-6">
            <Label htmlFor="roles">{t("users.table.role")}</Label>

            <MultiSelect
              placeholder={t("common.selectOptions") || "Select Options"}
              options={rolesOptions}
              value={formData.roles}
              onChange={(values) => updateField("roles", values.map(String))}
            />

            {errors.roles && (
              <p className="mt-1 text-sm text-red-500">{errors.roles}</p>
            )}
          </div>

          <div className="col-span-6">
            <Label htmlFor="phoneNumber">{t("users.phoneNumber")}</Label>

            <Input
              id="phoneNumber"
              placeholder={t("users.phonePlaceholder") || ""}
              value={formData.userInfo?.phoneNumber ?? ""}
              onChange={(e) => updateUserInfo("phoneNumber", e.target.value)}
            />

            {errors["userInfo.phoneNumber"] && (
              <p className="mt-1 text-sm text-red-500">
                {errors["userInfo.phoneNumber"]}
              </p>
            )}
          </div>

          <div className="col-span-6">
            <Label htmlFor="street">{t("users.streetLabel")}</Label>

            <Input
              id="street"
              placeholder={t("users.streetPlaceholder") || ""}
              value={formData.userInfo?.street ?? ""}
              onChange={(e) => updateUserInfo("street", e.target.value)}
            />

            {errors["userInfo.street"] && (
              <p className="mt-1 text-sm text-red-500">
                {errors["userInfo.street"]}
              </p>
            )}
          </div>

          <div className="col-span-6">
            <Label htmlFor="gender">{t("users.genderPlaceholder")}</Label>

            <RadioGroup
              value={formData.userInfo?.gender ?? ""}
              onValueChange={(value: string) => updateUserInfo("gender", value)}
              options={[
                { label: "Male", value: "M" },
                { label: "Female", value: "F" },
              ]}
              name="gender"
            />

            {errors["userInfo.gender"] && (
              <p className="mt-1 text-sm text-red-500">
                {errors["userInfo.gender"]}
              </p>
            )}
          </div>

          <div className="col-span-6">
            <Label htmlFor="birthDate">{t("users.birthDate")}</Label>

            <DatePicker
              value={
                formData.userInfo?.birthDate
                  ? new Date(formData.userInfo.birthDate)
                  : null
              }
              onChange={(date) =>
                updateUserInfo("birthDate", date ? formatToLocal(date) : "")
              }
            />

            {errors["userInfo.birthDate"] && (
              <p className="mt-1 text-sm text-red-500">
                {errors["userInfo.birthDate"]}
              </p>
            )}
          </div>

          <div className="col-span-12 mt-4 flex justify-end gap-4">
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
              disabled={isPending}
              className="bg-green-700 text-white hover:bg-green-700"
            >
              {isPending ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserUpsertPage;
