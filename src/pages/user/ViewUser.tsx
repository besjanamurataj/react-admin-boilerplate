import { useEffect, useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { MultiSelect } from "../../components/ui/MultiSelect";
import type { User } from "../../types/user";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getById } from "../../services/useService";
import { useTranslation } from "react-i18next";
import { getRole } from "../../services/roleService";
import { DatePicker } from "../../components/ui/DatePicker";
import { RadioGroup } from "../../components/ui/Radion";
import { formatToLocal } from "../../utils/formatDate";

export const ViewUserPage = () => {
  const [formData, setFormData] = useState<User>({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "1234565",
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
  const title = "View User";
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
      console.log(data, "formdata");
      setFormData({
        name: data.name ?? "",
        surname: data.surname ?? "",
        email: data.email ?? "",
        username: data.username ?? "",
        password: data.password ?? "",
        roles: data.roles.map((el: any) => el.id) ?? [],
        userInfo: {
          phoneNumber: data.userInfo?.phoneNumber ?? "",
          birthDate: data.userInfo?.birthDate ?? "",
          gender: data.userInfo?.gender ?? "",
          street: data.userInfo?.street ?? "",
        },
      });
    }
  }, [data]);

  return (
    <div className="p-6">
      <PageTitle title={title} subTitle="Create or update user information" />
      <form>
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
              disabled={true}
            />
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
              disabled={true}
            />
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
              disabled={true}
            />
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
              disabled={true}
            />
          </div>
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
              disabled={true}
              onChange={() => {}}
            />
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
              disabled={true}
            />
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
              disabled={true}
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
              disabled={true}
            />
          </div>
          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => navigate("/user")}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default ViewUserPage;
