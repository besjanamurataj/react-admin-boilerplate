import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/Card";

type UserRole = {
  id: number;
  name: string;
  description?: string;
};

export type RecentUser = {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  admin: boolean;
  roles: UserRole[];
};

type RecentUsersProps = {
  users: RecentUser[];
  isLoading?: boolean;
};

const RecentUsers = ({
  users,
  isLoading = false,
}: RecentUsersProps) => {

  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const getInitials = (name: string, surname: string) => {
    const firstInitial = name?.charAt(0) ?? "";
    const secondInitial = surname?.charAt(0) ?? "";

    return `${firstInitial}${secondInitial}`.toUpperCase();
  };

  const handlePreviousPage = () => {
    setCurrentPage((previousPage) => previousPage - 1);
  };

  const handleNextPage = () => {
    setCurrentPage((previousPage) => previousPage + 1);
  };

  return (
    <Card className="p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          {t("recentUsers.title")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("recentUsers.description")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {t("recentUsers.loading")}
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {t("recentUsers.noData")}
          </p>
        </div>
      ) : (
        <>
          <div className="min-h-[320px] divide-y divide-border">
            {paginatedUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                    {getInitials(user.name, user.surname)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user.name} {user.surname}
                    </p>

                    <p className="truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:max-w-[50%] sm:justify-end">
                  {user.roles?.length > 0 ? (
                    user.roles.map((role) => (
                      <span
                        key={role.id}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {role.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {t("recentUsers.noRoles")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("recentUsers.previous")}
              </button>

              <span className="text-sm text-muted-foreground">
                {t("recentUsers.page")} {currentPage} {t("recentUsers.of")} {totalPages}
              </span>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default RecentUsers;