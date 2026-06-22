import { useRoutes } from "react-router-dom";
import { HomeIcon, LayoutGrid, Users } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import { ProfilePage } from "../pages/Profile";
import { PrivateGuard } from "../guards/PrivateGuard";
import { useTranslation } from "react-i18next";
import { PermissionGuard } from "../guards/RoleGuard";
import { GeneralPage } from "../pages/GeneralePage";
import { lazy, Suspense } from "react";

const HomePage = lazy(() => import("../pages/Home"));
const UserPage = lazy(() => import("../pages/user/User"));
const UserUpsertPage = lazy(() => import("../pages/user/UserUpsert"));
const RolePage = lazy(() => import("../pages/roles/Role"));
const RoleUpsertPage = lazy(() => import("../pages/roles/RoleUpsert"));
const ViewUserPage = lazy(() => import("../pages/user/ViewUser"));
const ViewRolePage = lazy(() => import("../pages/roles/ViewRoles"));
const LoginPage = lazy(() => import("../pages/Login"));
const ForgetPasswordPage = lazy(() => import("../pages/ForgetPasword"));

export const Navigator = () => {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {useRoutes([
        { path: "/login", element: <LoginPage /> },
        { path: "/forgot-password", element: <ForgetPasswordPage /> },
        {
          path: "/",
          element: (
            <PrivateGuard>
              <AppLayout
                menuItems={[
                  {
                    label: t("common.home"),
                    path: "/",
                    icon: <HomeIcon size={20} />,
                  },
                  {
                    label: t("common.galery"),
                    path: "/general",
                    icon: <LayoutGrid size={20} />,
                  },

                  {
                    label: t("common.user"),
                    path: "/user",
                    icon: <Users size={20} />,
                    permission: "VIEW_USER",
                  },
                  {
                    label: t("common.role"),
                    path: "/role",
                    icon: <Users size={20} />,
                    permission: "VIEW_ROLE",
                  },
                ]}
              />
            </PrivateGuard>
          ),
          children: [
            { index: true, element: <HomePage /> },
            {
              path: "/user",
              element: (
                <PermissionGuard permissions={["VIEW_USER"]}>
                  <UserPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/role",
              element: (
                <PermissionGuard permissions={["VIEW_ROLE"]}>
                  <RolePage />
                </PermissionGuard>
              ),
            },
            {
              path: "/user/upsert",
              element: (
                <PermissionGuard permissions={["MANAGE_USER"]}>
                  <UserUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/user/edit/:id",
              element: (
                <PermissionGuard permissions={["MANAGE_USER"]}>
                  <UserUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/user/view/:id",
              element: (
                <PermissionGuard permissions={["VIEW_USER"]}>
                  <ViewUserPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/role/upsert",
              element: (
                <PermissionGuard permissions={["MANAGE_ROLE"]}>
                  <RoleUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/role/edit/:id",
              element: (
                <PermissionGuard permissions={["MANAGE_ROLE"]}>
                  <RoleUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/role/view/:id",
              element: (
                <PermissionGuard permissions={["VIEW_ROLE"]}>
                  <ViewRolePage />
                </PermissionGuard>
              ),
            },
            { path: "/profile", element: <ProfilePage /> },
            { path: "/general", element: <GeneralPage /> },
          ],
        },
      ])}
    </Suspense>
  );
};

export default Navigator;
