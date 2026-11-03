import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import StatisticsCard from "../../components/dashboard/StatisticsCard";
import RecentUsers from "../../components/dashboard/RecentUsers";
import RoleSummary from "../../components/dashboard/RoleSummary";
import { getUsers } from "../../services/useService";
import { getAuthorities, getRole } from "../../services/roleService";
import type { User } from "../../types/user";
import type { RoleResponse } from "../../types/role";

const AnalyticsDashboard = () => {
  const { t } = useTranslation();

  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["dashboard-users"],
    queryFn: () => getUsers("", "", "", "", "", [], 0, 100, []),
  });

  const { data: rolesData, isLoading: isRolesLoading } = useQuery({
    queryKey: ["dashboard-roles-total"],
    queryFn: () => getRole(),
  });

  const { data: authoritiesData, isLoading: isAuthoritiesLoading } = useQuery({
    queryKey: ["dashboard-authorities-total"],
    queryFn: () => getAuthorities(),
  });

  const users = useMemo(() => usersData?.content ?? [], [usersData?.content]);
  const roleUsageData = useMemo(() => {
    const roleCounter = new Map();

    users.forEach((user: User) => {
      user.roles?.forEach((role: RoleResponse) => {
        const currentCount = roleCounter.get(role.id)?.usersCount ?? 0;

        roleCounter.set(role.id, {
          role: role.name,
          usersCount: currentCount + 1,
        });
      });
    });

    return Array.from(roleCounter.values());
  }, [users]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {t("dashboard.title")}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatisticsCard
          title={t("dashboard.totalUsers")}
          value={isUsersLoading ? 0 : (usersData?.totalElements ?? 0)}
          description={t("dashboard.users")}
          icon={<UserRound size={22} />}
        />

        <StatisticsCard
          title={t("dashboard.totalRoles")}
          value={isRolesLoading ? 0 : (rolesData?.totalElements ?? 0)}
          description={t("dashboard.roles")}
          icon={<UsersRound size={22} />}
        />

        <StatisticsCard
          title={t("dashboard.totalAuthorities")}
          value={isAuthoritiesLoading ? 0 : (authoritiesData?.length ?? 0)}
          description={t("dashboard.authorities")}
          icon={<ShieldCheck size={22} />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RoleSummary data={roleUsageData} isLoading={isUsersLoading} />

        <RecentUsers users={users} isLoading={isUsersLoading} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
