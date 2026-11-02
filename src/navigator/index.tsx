import { useRoutes } from "react-router-dom";
import {
  HomeIcon,
  LayoutGrid,
  Users,
  ChartNoAxesCombined,
  GraduationCap,
  University,
  Building2,
  BookOpenCheck,
} from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import { ProfilePage } from "../pages/Profile";
import { PrivateGuard } from "../guards/PrivateGuard";
import { useTranslation } from "react-i18next";
import { PermissionGuard } from "../guards/RoleGuard";
import { GeneralPage } from "../pages/GeneralePage";
import { lazy, Suspense } from "react";
import { EnrollmentUpsertPage } from "../pages/enrollments/EnrollmentUpsert";

const HomePage = lazy(() => import("../pages/Home"));
const UserPage = lazy(() => import("../pages/user/User"));
const UserUpsertPage = lazy(() => import("../pages/user/UserUpsert"));
const RolePage = lazy(() => import("../pages/roles/Role"));
const RoleUpsertPage = lazy(() => import("../pages/roles/RoleUpsert"));
const UniversityPage = lazy(() => import("../pages/universities/University"));
const UniversityUpsertPage = lazy(
  () => import("../pages/universities/UniversityUpsert"),
);
const ViewUniversityPage = lazy(
  () => import("../pages/universities/ViewUniversity"),
);
const DepartmentPage = lazy(() => import("../pages/departments/Department"));
const DepartmentUpsertPage = lazy(
  () => import("../pages/departments/DepartmentUpsert"),
);
const ViewDepartmentPage = lazy(
  () => import("../pages/departments/ViewDepartment"),
);
const StudentPage = lazy(() => import("../pages/students/Student"));
const StudentUpsertPage = lazy(() => import("../pages/students/StudentUpsert"));
const ViewStudentPage = lazy(() => import("../pages/students/ViewStudent"));
const EnrollmentPage = lazy(() => import("../pages/enrollments/Enrollment"));
const ViewEnrollmentPage = lazy(
  () => import("../pages/enrollments/ViewEnrollment"),
);
const ViewUserPage = lazy(() => import("../pages/user/ViewUser"));
const ViewRolePage = lazy(() => import("../pages/roles/ViewRoles"));
const LoginPage = lazy(() => import("../pages/Login"));
const ForgetPasswordPage = lazy(() => import("../pages/ForgetPasword"));
const AnalyticsDashboard = lazy(
  () => import("../pages/dashboard/AnalyticsDashboard"),
);

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
                  {
                    label: t("common.university"),
                    path: "/university",
                    icon: <University size={20} />,
                    permission: "VIEW_UNIVERSITY",
                  },
                  {
                    label: t("common.department"),
                    path: "/department",
                    icon: <Building2 size={20} />,
                    permission: "VIEW_DEPARTMENT",
                  },
                  {
                    label: t("common.student"),
                    path: "/student",
                    icon: <GraduationCap size={20} />,
                    permission: "VIEW_STUDENT",
                  },
                  {
                    label: t("common.enrollment"),
                    path: "/enrollment",
                    icon: <BookOpenCheck size={20} />,
                    permission: "VIEW_ENROLLMENT",
                  },
                  {
                    label: t("common.analytics"),
                    path: "/analytics",
                    icon: <ChartNoAxesCombined size={20} />,
                    permission: "VIEW_USER",
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
              path: "/analytics",
              element: (
                <PermissionGuard permissions={["VIEW_USER"]}>
                  <AnalyticsDashboard />
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
            {
              path: "/university",
              element: (
                <PermissionGuard permissions={["VIEW_UNIVERSITY"]}>
                  <UniversityPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/university/upsert",
              element: (
                <PermissionGuard permissions={["MANAGE_UNIVERSITY"]}>
                  <UniversityUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/university/edit/:id",
              element: (
                <PermissionGuard permissions={["MANAGE_UNIVERSITY"]}>
                  <UniversityUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/university/view/:id",
              element: (
                <PermissionGuard permissions={["VIEW_UNIVERSITY"]}>
                  <ViewUniversityPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/department",
              element: (
                <PermissionGuard permissions={["VIEW_DEPARTMENT"]}>
                  <DepartmentPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/department/upsert",
              element: (
                <PermissionGuard permissions={["MANAGE_DEPARTMENT"]}>
                  <DepartmentUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/department/edit/:id",
              element: (
                <PermissionGuard permissions={["MANAGE_DEPARTMENT"]}>
                  <DepartmentUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/department/view/:id",
              element: (
                <PermissionGuard permissions={["VIEW_DEPARTMENT"]}>
                  <ViewDepartmentPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/student",
              element: (
                <PermissionGuard permissions={["VIEW_STUDENT"]}>
                  <StudentPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/student/upsert",
              element: (
                <PermissionGuard permissions={["MANAGE_STUDENT"]}>
                  <StudentUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/student/edit/:id",
              element: (
                <PermissionGuard permissions={["MANAGE_STUDENT"]}>
                  <StudentUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/student/view/:id",
              element: (
                <PermissionGuard permissions={["VIEW_STUDENT"]}>
                  <ViewStudentPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/enrollment",
              element: (
                <PermissionGuard permissions={["VIEW_ENROLLMENT"]}>
                  <EnrollmentPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/enrollment/upsert",
              element: (
                <PermissionGuard permissions={["MANAGE_ENROLLMENT"]}>
                  <EnrollmentUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/enrollment/edit/:id",
              element: (
                <PermissionGuard permissions={["MANAGE_ENROLLMENT"]}>
                  <EnrollmentUpsertPage />
                </PermissionGuard>
              ),
            },
            {
              path: "/enrollment/view/:id",
              element: (
                <PermissionGuard permissions={["VIEW_ENROLLMENT"]}>
                  <ViewEnrollmentPage />
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
