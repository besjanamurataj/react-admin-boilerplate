
import { useState } from "react";
import { PageTitle } from "../components/PageTitle";
import { Button } from "../components/ui/Button";
import { DatePicker } from "../components/ui/DatePicker";
import { Input } from "../components/ui/Input";
import type { Profile } from "../types/profile";
import { passwordSchema, userSchema } from "../types/validations/schema";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  getById,
  updateProfile,
} from "../services/useService";
import { useAuth } from "../hooks/useAuth";
import type { PasswordUpdate, UserDetailResponse } from "../types/user";
import { Label } from "../components/ui/Label";
import { Dialog, DialogContent } from "../components/ui/Dialog";
import { MultiSelect } from "../components/ui/MultiSelect";
import { getRole } from "../services/roleService";
import { formatToLocal } from "../utils/formatDate";
import { useToast } from "../contexts/toast/ToastProvider";

const initialPasswordState: PasswordUpdate = {
  password: "",
  confirmPassword: "",
};

const initialFormData: Profile = {
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

  const [formData, setFormData] = useState<Profile>(initialFormData);
  const [errors, setErrors] = useState<Record<string, unknown>>({});

  // Fetch current user
  const {
    data,
    isLoading,
    isError,
  } = useQuery<UserDetailResponse>({
    queryKey: ["user", userId],
    queryFn: ({ signal }) => {
      if (!userId) throw new Error("No ID provided");
      return getById({ id: userId, signal });
    },
    enabled: !!userId,
  });

  // Fetch roles
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRole(),
  });

  const user = data;

  const displayedFormData: Profile = isEditing
    ? formData
    : {
        name: user?.name ?? "",
        surname: user?.surname ?? "",
        email: user?.email ?? "",
        username: user?.username ?? "",
        password: "",
        confirmPassword: "",
        roles: user?.roles?.map((role) => String(role.id)) ?? [],
        userInfo: {
          phoneNumber: user?.userInfo?.phoneNumber ?? "",
          birthDate: user?.userInfo?.birthDate ?? "",
          street: user?.userInfo?.street ?? "",
          gender: user?.userInfo?.gender ?? "",
        },
      };

  // Initialize form when clicking Edit
  const handleEdit = () => {
    if (!user) return;

    setFormData({
      name: user.name ?? "",
      surname: user.surname ?? "",
      email: user.email ?? "",
      username: user.username ?? "",
      password: "",
      confirmPassword: "",
      roles: user.roles?.map((role) => String(role.id)) ?? [],
      userInfo: {
        phoneNumber: user.userInfo?.phoneNumber ?? "",
        birthDate: user.userInfo?.birthDate ?? "",
        street: user.userInfo?.street ?? "",
        gender: user.userInfo?.gender ?? "",
      },
    });

    setErrors({});
    setIsEditing(true);
  };

  // Change password mutation
  const updatePasswordMutate = useMutation({
    mutationFn: (payload: PasswordUpdate) => changePassword(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", userId],
      });

      addToast({
        title: t("messages.success"),
        description: t("messages.passwordUpdateSuccess"),
        variant: "success",
      });

      setOpen(false);
      setUpdatePassword(initialPasswordState);
      setErrors({});
    },

    onError: (error: Error) => {
      addToast({
        title: t("messages.error"),
        description: t(error.message || "messages.passwordUpdateFailed"),
        variant: "error",
      });
    },
  });

  // Update profile mutation
  const profileMutation = useMutation({
    mutationFn: (payload: Profile) => updateProfile(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", userId],
      });

      addToast({
        title: t("messages.success"),
        description: t("messages.profileUpdateSuccess"),
        variant: "success",
      });

      setIsEditing(false);
      navigate("/user");
    },

    onError: (error: Error) => {
      addToast({
        title: t("messages.error"),
        description: t(error.message || "messages.profileUpdateFailed"),
        variant: "error",
      });
    },
  });

  // Profile form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, unknown> = {};

      result.error.issues.forEach((issue) => {
        const parent = String(issue.path[0]);
        const child =
          issue.path.length > 1 ? String(issue.path[1]) : undefined;

        if (child) {
          const existing = fieldErrors[parent];

          fieldErrors[parent] = {
            ...(typeof existing === "object" && existing !== null
              ? existing
              : {}),
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

  // Password form submit
  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = passwordSchema.safeParse(updatePassword);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        fieldErrors[field] = issue.message;
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    updatePasswordMutate.mutate(updatePassword);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <PageTitle title={t("profile.title")} />
        <p className="mt-4 text-muted-foreground">
          Loading profile...
        </p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-6">
        <PageTitle title={t("profile.title")} />
        <p className="mt-4 text-destructive">
          Error loading profile.
        </p>
      </div>
    );
  }

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
                  {typeof value === "string"
                    ? value
                    : JSON.stringify(value)}
                </p>
              ))}
            </div>
          )}

          <div className="col-span-6">
            <Label>{t("users.table.firstName")}</Label>
            <Input
              value={displayedFormData.name}
              disabled={!isEditing}
              onChange={(e) =>
                setFormData((previous) => ({
                  ...previous,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-span-6">
            <Label>{t("users.table.lastName")}</Label>
            <Input
              value={displayedFormData.surname}
              disabled={!isEditing}
              onChange={(e) =>
                setFormData((previous) => ({
                  ...previous,
                  surname: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-span-6">
            <Label>{t("users.table.email")}</Label>
            <Input
              value={displayedFormData.email}
              disabled={!isEditing}
              onChange={(e) =>
                setFormData((previous) => ({
                  ...previous,
                  email: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-span-6">
            <Label>{t("users.table.role")}</Label>
            <MultiSelect
              value={displayedFormData.roles}
              options={
                roles?.content.map((role) => ({
                  label: role.name,
                  value: String(role.id),
                })) ?? []
              }
              disabled={!isEditing}
              onChange={(values) =>
                setFormData((previous) => ({
                  ...previous,
                  roles: values.map(String),
                }))
              }
            />
          </div>

          <div className="col-span-6">
            <Label>{t("users.phoneNumber")}</Label>
            <Input
              value={displayedFormData.userInfo.phoneNumber}
              disabled={!isEditing}
              onChange={(e) =>
                setFormData((previous) => ({
                  ...previous,
                  userInfo: {
                    ...previous.userInfo,
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
                displayedFormData.userInfo.birthDate
                  ? new Date(displayedFormData.userInfo.birthDate)
                  : null
              }
              onChange={(date) =>
                setFormData((previous) => ({
                  ...previous,
                  userInfo: {
                    ...previous.userInfo,
                    birthDate: date ? formatToLocal(date) : "",
                  },
                }))
              }
              disabled={!isEditing}
            />
          </div>

          <div className="col-span-12 flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setErrors({});
                setOpen(true);
              }}
            >
              {t("common.changePassword")}
            </Button>

            {!isEditing ? (
              <Button
                type="button"
                variant="default"
                onClick={handleEdit}
                className="bg-green-700 text-white hover:bg-green-700"
              >
                {t("profile.updateProfile")}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="default"
                disabled={profileMutation.isPending}
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
                setUpdatePassword((previous) => ({
                  ...previous,
                  password: e.target.value,
                }))
              }
            />

            <Label>{t("users.confirmPassword")}</Label>
            <Input
              type="password"
              value={updatePassword.confirmPassword}
              onChange={(e) =>
                setUpdatePassword((previous) => ({
                  ...previous,
                  confirmPassword: e.target.value,
                }))
              }
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setUpdatePassword(initialPasswordState);
                  setErrors({});
                }}
              >
                {t("common.cancel")}
              </Button>

              <Button
                type="submit"
                variant="default"
                disabled={updatePasswordMutate.isPending}
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
