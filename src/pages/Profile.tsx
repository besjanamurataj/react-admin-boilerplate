import { useEffect, useState } from "react";
import { PageTitle } from "../components/PageTitle";
import { Button } from "../components/ui/Button";
import { DatePicker } from "../components/ui/DatePicker";
import { Input } from "../components/ui/Input";
import type { Profile } from "../types/profile";
import { passwordSchema, userSchema } from "../types/validations/schema";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changePassword, getById, updateProfile } from "../services/useService";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/toast/ToastContex";
import type { PasswordUpdate } from "../types/user";
import { Label } from "../components/ui/Label";
import { Dialog, DialogContent } from "../components/ui/Dialog";
import { MultiSelect } from "../components/ui/MultiSelect";
import { getRole } from "../services/roleService";
import { formatToLocal } from "../utils/formatDate";

const initialPasswordState: PasswordUpdate = {
  password: "",
  confirmPassword: "",
};

export const ProfilePage = () => {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToast } = useToast();

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [updatePassword, setUpdatePassword] =
    useState<PasswordUpdate>(initialPasswordState);

  const [formData, setFormData] = useState<Profile>({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    roles: [],
    userInfo: {
      phoneNumber: "",
      birthDate: "",
      gender: "",
      street: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, any>>({});

  const { data } = useQuery<Profile>({
    queryKey: ["user", userId],
    queryFn: ({ signal }): Promise<Profile> => {
      if (!userId) throw new Error("No ID provided");
      return getById({ id: userId, signal });
    },
    enabled: !!userId,
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRole(),
  });

  useEffect(() => {
    if (!data) return;

    setFormData({
      name: data?.name ?? "",
      surname: data?.surname ?? "",
      email: data?.email ?? "",
      username: data?.username ?? "",
      roles: data?.roles?.map((r: any) => r.id) ?? [],
      userInfo: {
        phoneNumber: data?.userInfo?.phoneNumber ?? "",
        birthDate: data?.userInfo?.birthDate ?? "",
        street: data?.userInfo?.street ?? "",
        gender: data?.userInfo?.gender ?? "",
      },
    });
  }, [data]);

  const updatePasswordMutate = useMutation({
    mutationFn: (payload: PasswordUpdate) => changePassword(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });

      addToast({
        title: t("messages.success"),
        description: t("messages.passwordUpdateSuccess"),
        variant: "success",
      });

      setOpen(false);
      setUpdatePassword(initialPasswordState);
    },
  });

  const profileMutation = useMutation({
    mutationFn: (payload: Profile) => updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });

      addToast({
        title: t("messages.success"),
        description: t("messages.profileUpdateSuccess"),
        variant: "success",
      });

      navigate("/user");
    },
    onError: (error: any) => {
      addToast({
        title: t("messages.error"),
        description: t(error?.response?.data?.message),
        variant: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, any> = {};

      result.error.issues.forEach((issue) => {
        const parent = String(issue.path[0]);
        const child = issue.path.length > 1 ? String(issue.path[1]) : undefined;

        if (child) {
          fieldErrors[parent] = {
            ...(fieldErrors[parent] || {}),
            [child]: issue.message,
          };
        } else {
          fieldErrors[parent] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    profileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = passwordSchema.safeParse(updatePassword);
    console.log(result, result);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    updatePasswordMutate.mutate(updatePassword);
  };

  return (
    <div className="p-6">
      <PageTitle
        title={isEditing ? t("profile.updateProfile") : t("profile.title")}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-6 mt-4">
          {Object.keys(errors).length > 0 && (
            <div className="col-span-12 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {Object.entries(errors).map(([key, value]) => (
                <p key={key}>
                  {typeof value === "string" ? value : JSON.stringify(value)}
                </p>
              ))}
            </div>
          )}
          <div className="col-span-6">
            <Label>{t("users.table.firstName")}</Label>
            <Input
              value={formData.name}
              disabled={!isEditing}
              onChange={(e) =>
                setFormData((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>

          <div className="col-span-6">
            <Label>{t("users.table.lastName")}</Label>
            <Input
              value={formData.surname}
              disabled={!isEditing}
              onChange={(e) =>
                setFormData((p) => ({ ...p, surname: e.target.value }))
              }
            />
          </div>

          <div className="col-span-6">
            <Label>{t("users.table.email")}</Label>
            <Input
              value={formData.email}
              disabled={!isEditing}
              onChange={(e) =>
                setFormData((p) => ({ ...p, email: e.target.value }))
              }
            />
          </div>

          <div className="col-span-6">
            <Label>{t("users.table.role")}</Label>
            <MultiSelect
              value={formData.roles}
              options={
                roles?.content?.map((r: any) => ({
                  label: r.name,
                  value: r.id,
                })) || []
              }
              disabled={!isEditing}
              onChange={(values) =>
                setFormData((p) => ({ ...p, roles: values }))
              }
            />
          </div>

          <div className="col-span-6">
            <Label>{t("users.phoneNumber")}</Label>
            <Input
              value={formData.userInfo.phoneNumber}
              disabled={!isEditing}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  userInfo: {
                    ...p.userInfo,
                    phoneNumber: e.target.value,
                  },
                }))
              }
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
              onChange={(date) =>
                setFormData((p) => ({
                  ...p,
                  userInfo: {
                    ...p.userInfo,
                    birthDate: date ? formatToLocal(date) : "",
                  },
                }))
              }
              disabled={!isEditing}
            />
          </div>

          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={() => setOpen(true)}>
              {t("common.changePassword")}
            </Button>

            {!isEditing ? (
              <Button
                variant="default"
                onClick={() => setIsEditing(true)}
                className="bg-green-700 text-white hover:bg-green-700"
              >
                {t("profile.updateProfile")}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="default"
                className="bg-green-700 text-white hover:bg-green-700"
              >
                {t("common.save")}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* PASSWORD MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handlePasswordSubmit}>
            <Label>{t("users.password")}</Label>
            <Input
              type="password"
              value={updatePassword.password}
              onChange={(e) =>
                setUpdatePassword((p) => ({
                  ...p,
                  password: e.target.value,
                }))
              }
            />

            <Label>{t("users.confirmPassword")}</Label>
            <Input
              type="password"
              value={updatePassword.confirmPassword}
              onChange={(e) =>
                setUpdatePassword((p) => ({
                  ...p,
                  confirmPassword: e.target.value,
                }))
              }
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t("common.cancel")}
              </Button>

              <Button
                type="submit"
                variant="default"
                className="bg-green-700 text-white hover:bg-green-700"
              >
                {t("common.updatePassword")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
