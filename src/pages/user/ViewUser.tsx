import { useEffect, useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { MultiSelect } from "../../components/ui/MultiSelect";
import type { User, UserResponse } from "../../types/user";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getById } from "../../services/useService";
import { useTranslation } from "react-i18next";
import { getRole } from "../../services/roleService";
import { DatePicker } from "../../components/ui/DatePicker";
import { RadioGroup } from "../../components/ui/Radion";
import type { RoleResponse } from "../../types/role";

export const ViewUserPage = () => {
  const [formData, setFormData] = useState<User>({
    id: 0,
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
  });

  const params = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useQuery<UserResponse>({
    queryKey: ["user", params.id],
    queryFn: ({ signal }) => {
      if (!params.id) {
        throw new Error("No ID provided");
      }

      return getById({ id: params.id, signal });
    },
    enabled: !!params.id,
  });

  const { data: roles } = useQuery<RoleResponse>({
    queryKey: ["roles"],
    queryFn: () => getRole(),
  });

  useEffect(() => {
    if (!data) return;

    const user = data as unknown as User;

    setFormData({
      id: user.id ?? 0,
      name: user.name ?? "",
      surname: user.surname ?? "",
      email: user.email ?? "",
      username: user.username ?? "",
      password: user.password ?? "",
      roles: user.roles ?? [],
      authorities: user.authorities ?? [],
      userInfo: {
        phoneNumber: user.userInfo?.phoneNumber ?? "",
        birthDate: user.userInfo?.birthDate ?? "",
        gender: user.userInfo?.gender ?? "",
        street: user.userInfo?.street ?? "",
      },
    });
  }, [data]);

  const rolesOptions =
    roles?.content.map((role) => ({
      label: role.name,
      value: String(role.id),
    })) ?? [];

  return (
    <div className="p-6">
      <PageTitle title="View User" subTitle="View user information" />

      <form>
        <div className="mb-4 mt-4 grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <Label htmlFor="name">{t("users.table.firstName")}</Label>
            <Input id="name" value={formData.name} disabled />
          </div>

          <div className="col-span-6">
            <Label htmlFor="surname">{t("users.table.lastName")}</Label>
            <Input id="surname" value={formData.surname} disabled />
          </div>

          <div className="col-span-6">
            <Label htmlFor="username">{t("users.table.username")}</Label>
            <Input id="username" value={formData.username} disabled />
          </div>

          <div className="col-span-6">
            <Label htmlFor="email">{t("users.table.email")}</Label>
            <Input id="email" value={formData.email} disabled />
          </div>

          <div className="col-span-6">
            <Label htmlFor="roles">{t("users.table.role")}</Label>
            <MultiSelect
              placeholder={t("common.selectOptions") || "Select Options"}
              options={rolesOptions}
              value={formData.roles}
              disabled
              onChange={() => {}}
            />
          </div>

          <div className="col-span-6">
            <Label htmlFor="phoneNumber">{t("users.phoneNumber")}</Label>
            <Input
              id="phoneNumber"
              value={formData.userInfo.phoneNumber}
              disabled
            />
          </div>

          <div className="col-span-6">
            <Label htmlFor="street">{t("users.streetLabel")}</Label>
            <Input id="street" value={formData.userInfo.street} disabled />
          </div>

          <div className="col-span-6">
            <Label>{t("users.genderPlaceholder")}</Label>
            <RadioGroup
              value={formData.userInfo?.gender ?? ""}
              disabled={true}
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
            <Label>{t("users.birthDate")}</Label>
            <DatePicker
              value={
                formData.userInfo.birthDate
                  ? new Date(formData.userInfo.birthDate)
                  : null
              }
              disabled
            />
          </div>

          <div className="col-span-12 mt-4 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/user")}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ViewUserPage;
