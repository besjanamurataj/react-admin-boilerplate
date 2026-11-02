import {
  createContext,
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

interface AuthState {
  user: AuthenticatedUser | null;
  userId: string | null;
  permissions: string[];
  loading: boolean;
}

const getInitialAuthState = (): AuthState => {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    return {
      user: null,
      userId: null,
      permissions: [],
      loading: false,
    };
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      throw new Error("Invalid JWT token");
    }

    const decoded = JSON.parse(atob(payload));

    const storedUser = decoded?.sub;
    const authorities: string[] = decoded?.authorities ?? [];

    return {
      user: storedUser ? { email: storedUser } : null,
      userId: decoded?.id ? String(decoded.id) : null,
      permissions: authorities,
      loading: false,
    };
  } catch (error) {
    console.error("Failed to decode authentication token:", error);
    localStorage.removeItem("jwtToken");

    return {
      user: null,
      userId: null,
      permissions: [],
      loading: false,
    };
  }
};

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
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState);
  const [roles, setRoles] = useState<RoleRequest[]>([]);

  const { user, userId, permissions, loading } = authState;

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  const authenticateUser = (userData: AuthUser): void => {
    const { email, authorities, id } = userData;

    setAuthState({
      user: { email },
      userId: String(id),
      permissions: authorities ?? [],
      loading: false,
    });
  };

  const unAuthenticateUser = (): void => {
    localStorage.removeItem("jwtToken");

    setAuthState({
      user: null,
      userId: null,
      permissions: [],
      loading: false,
    });

    setRoles([]);
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
