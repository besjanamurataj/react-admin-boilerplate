import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getUsers, deleteUsers } from "../../services/useService";
import { getRole } from "../../services/roleService";
import { useAuth } from "../../hooks/useAuth";
import UserPage from "./User";
import { useToast } from "../../contexts/toast/ToastProvider";
import type { User, UserResponse } from "../../types/user";
import type { ComponentProps, ReactNode } from "react";

vi.mock("../../services/useService", () => ({
  getUsers: vi.fn(),
  deleteUsers: vi.fn(),
}));

vi.mock("../../services/roleService", () => ({
  getRole: vi.fn(),
}));

vi.mock("../../contexts/ToastContex", () => ({
  useToast: vi.fn(),
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Render the data passed from UserPage into a simple test table.
vi.mock("../../components/ui/DataTable", () => ({
  DataTable: ({ data, loading }: { data: User[]; loading?: boolean }) => (
    <table data-testid="users-table" data-loading={String(loading)}>
      <tbody>
        {data.map((user: User) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.surname}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

vi.mock("../../components/PageTitle", () => ({
  PageTitle: () => <h1>Users</h1>,
}));

vi.mock("../../components/ui/Button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("../../components/ui/Search", () => ({
  Search: (props: ComponentProps<"input">) => <input {...props} />,
}));

vi.mock("../../components/ui/Input", () => ({
  Input: (props: ComponentProps<"input">) => <input {...props} />,
}));
vi.mock("../../components/ui/Label", () => ({
  Label: ({ children }: { children: ReactNode }) => <label>{children}</label>,
}));

vi.mock("../../components/ui/MultiSelect", () => ({
  MultiSelect: () => <div data-testid="multi-select" />,
}));

vi.mock("../../components/ui/Dialog", () => ({
  Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? <div role="dialog">{children}</div> : null,
}));

describe("UserPage", () => {
  let queryClient: QueryClient;

  const mockUsers = {
    content: [
      {
        id: 1,
        name: "Ana",
        surname: "Hoxha",
        username: "ana.hoxha",
        email: "ana@test.com",
        password: "",
        roles: [],
        authorities: [],
        userInfo: {
          phoneNumber: "0691111111",
          birthDate: "1998-01-12",
          gender: "F",
          street: "Tirana",
        },
      },
      {
        id: 2,
        name: "Arben",
        surname: "Kola",
        username: "arben.kola",
        email: "arben@test.com",
        password: "",
        roles: [],
        authorities: [],
        userInfo: {
          phoneNumber: "0692222222",
          birthDate: "1995-05-10",
          gender: "M",
          street: "Durres",
        },
      },
    ],
    page: 0,
    size: 5,
    totalElements: 2,
    totalPages: 1,
    last: true,
  } satisfies UserResponse;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });

    vi.mocked(getUsers).mockResolvedValue(mockUsers as UserResponse);
    vi.mocked(getRole).mockResolvedValue({
      content: [],
      page: 0,
      size: 5,
      totalElements: 0,
      totalPages: 0,
      last: true,
    });

    vi.mocked(useToast).mockReturnValue({
      addToast: vi.fn(),
      toasts: [],
      removeToast: vi.fn(),
    });

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      userId: null,
      roles: [],
      hasPermission: () => false,
      hasRole: () => false,
      authenticateUser: vi.fn(),
      unAuthenticateUser: vi.fn(),
      updateUser: vi.fn(),
      loading: false,
    });
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <UserPage />
      </QueryClientProvider>,
    );

  it("should call getUsers when the page loads", async () => {
    renderPage();

    await waitFor(() => {
      expect(getUsers).toHaveBeenCalledTimes(1);
    });

    expect(getUsers).toHaveBeenCalledWith(
      "", // search
      "", // name
      "", // username
      "", // surname
      "", // email
      [], // roles
      0, // pageIndex
      5, // pageSize
      [], // sorting
    );
  });

  it("should display users returned by the API in the table", async () => {
    renderPage();

    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Hoxha")).toBeInTheDocument();
    expect(screen.getByText("ana.hoxha")).toBeInTheDocument();
    expect(screen.getByText("ana@test.com")).toBeInTheDocument();

    expect(screen.getByText("Arben")).toBeInTheDocument();
    expect(screen.getByText("Kola")).toBeInTheDocument();
    expect(screen.getByText("arben.kola")).toBeInTheDocument();
    expect(screen.getByText("arben@test.com")).toBeInTheDocument();

    expect(
      screen.getByTestId("users-table").querySelectorAll("tbody tr"),
    ).toHaveLength(2);
  });

  it("should display an empty table when the API returns no users", async () => {
    vi.mocked(getUsers).mockResolvedValue({
      content: [],
      page: 0,
      size: 5,
      totalElements: 0,
      totalPages: 0,
      last: true,
    });

    renderPage();

    await waitFor(() => {
      expect(getUsers).toHaveBeenCalled();
    });

    expect(await screen.findByTestId("users-table")).toBeInTheDocument();
    expect(
      screen.getByTestId("users-table").querySelectorAll("tbody tr"),
    ).toHaveLength(0);
  });

  it("should fetch users with the default page size of 5", async () => {
    renderPage();

    await waitFor(() => {
      expect(getUsers).toHaveBeenCalledWith("", "", "", "", "", [], 0, 5, []);
    });
  });

  it("should call getRole when the page loads", async () => {
    renderPage();

    await waitFor(() => {
      expect(getRole).toHaveBeenCalledTimes(1);
    });
  });

  it("should not delete users during initial page loading", async () => {
    renderPage();

    await screen.findByText("Ana");

    expect(deleteUsers).not.toHaveBeenCalled();
  });
});
