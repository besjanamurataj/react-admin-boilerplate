import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type FunctionComponent,
  type ReactNode,
} from "react";

import type { User } from "../types/user";
import type { RoleRequest } from "../types/role";

interface AuthProviderProps {
  children: ReactNode;
}

type AuthUser = Pick<User, "email" | "id" | "authorities">;
type AuthenticatedUser = Pick<User, "email">;

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  userId: string | null;
  roles: RoleRequest[];
  hasRole: (roleName: string) => boolean;
  hasPermission: (permissionName: string) => boolean;
  authenticateUser: (user: AuthUser) => void;
  unAuthenticateUser: () => void;
  updateUser: () => void;
  loading: boolean;
}

const initialState: AuthContextType = {
  isAuthenticated: false,
  user: null,
  userId: null,
  roles: [],
  hasRole: () => false,
  hasPermission: () => false,
  authenticateUser: () => {},
  unAuthenticateUser: () => {},
  updateUser: () => {},
  loading: true,
};

const AuthContext = createContext<AuthContextType>(initialState);

const AuthProvider: FunctionComponent<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [roles, setRoles] = useState<RoleRequest[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  const authenticateUser = (userData: AuthUser): void => {
    const { email, authorities, id } = userData;

    setUser({ email });
    setPermissions(authorities ?? []);
    setUserId(id || null);
  };

  const unAuthenticateUser = (): void => {
    localStorage.removeItem("jwtToken");
    setUser(null);
    setRoles([]);
    setPermissions([]);
    setUserId(null);
  };

  const hasRole = (roleName: string): boolean => {
    return roles.some((role) => role.name === roleName);
  };

  const hasPermission = (permissionName: string): boolean => {
    return permissions.some((permission) =>
      permission.includes(permissionName),
    );
  };

  const updateUser = (): void => {
    // Implement user update logic when needed.
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1] || ""));

      const storedUser = decoded?.sub;
      const authorities: string[] = decoded?.authorities ?? [];

      setUserId(decoded?.id || null);

      if (storedUser) {
        setUser({
          email: storedUser,
        });
        setPermissions(authorities);
      }
    } catch (error) {
      console.error("Failed to decode authentication token:", error);
      unAuthenticateUser();
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userId,
        roles,
        hasRole,
        hasPermission,
        authenticateUser,
        unAuthenticateUser,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
