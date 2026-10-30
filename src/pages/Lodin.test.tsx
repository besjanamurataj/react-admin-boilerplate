import { describe, it, expect, vi, beforeEach } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import LoginPage from "./Login";
import { login } from "../services/authService";
import { useToast } from "../contexts/ToastContex";
import { useAuth } from "../hooks/useAuth";

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("../services/authService", () => ({
  login: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../contexts/ToastContex", () => ({
  useToast: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../layouts/Header", () => ({
  default: () => <header>Header</header>,
}));

describe("LoginPage", () => {
  const addToast = vi.fn();
  const authenticateUser = vi.fn();

  const renderLogin = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <LoginPage />
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(useToast).mockReturnValue({
      addToast,
      toasts: [],
      removeToast: vi.fn(),
    });

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      userId: null,
      roles: [],
      hasRole: vi.fn().mockReturnValue(false),
      hasPermission: vi.fn().mockReturnValue(false),
      authenticateUser,
      unAuthenticateUser: vi.fn(),
      updateUser: vi.fn(),
      loading: false,
    });
  });

  it("renders the login form", () => {
    renderLogin();

    expect(
      screen.getByRole("heading", {
        name: "login.title",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("common.emailPlaceholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("login.passwordPlaceholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "common.login",
      }),
    ).toBeInTheDocument();
  });

  it("does not call the API when fields are empty", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(
      screen.getByRole("button", {
        name: "common.login",
      }),
    );

    expect(login).not.toHaveBeenCalled();
    expect(await screen.findAllByRole("alert")).toHaveLength(2);
  });

  it("calls login with valid form data", async () => {
    const user = userEvent.setup();

    vi.mocked(login).mockResolvedValue({
      token: "unused",
    } as Awaited<ReturnType<typeof login>>);

    renderLogin();

    await user.type(
      screen.getByLabelText("common.emailPlaceholder"),
      "test@example.com",
    );

    await user.type(
      screen.getByLabelText("login.passwordPlaceholder"),
      "Password123!",
    );

    await user.click(
      screen.getByRole("button", {
        name: "common.login",
      }),
    );

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123!",
      });
    });
  });

  it("stores the JWT, authenticates the user and redirects after success", async () => {
    const user = userEvent.setup();

    const payload = {
      sub: "test@example.com",
      id: 1,
      authorities: ["USER"],
    };

    const token = ["header", btoa(JSON.stringify(payload)), "signature"].join(
      ".",
    );

    vi.mocked(login).mockResolvedValue({
      token,
    } as Awaited<ReturnType<typeof login>>);

    renderLogin();

    await user.type(
      screen.getByLabelText("common.emailPlaceholder"),
      "test@example.com",
    );

    await user.type(
      screen.getByLabelText("login.passwordPlaceholder"),
      "Password123!",
    );

    await user.click(
      screen.getByRole("button", {
        name: "common.login",
      }),
    );

    await waitFor(() => {
      expect(localStorage.getItem("jwtToken")).toBe(token);

      expect(authenticateUser).toHaveBeenCalledWith({
        email: "test@example.com",
        id: 1,
        authorities: ["USER"],
      });

      expect(mockNavigate).toHaveBeenCalledWith("/");

      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
        }),
      );
    });
  });

  it("shows an error toast when login fails", async () => {
    const user = userEvent.setup();
    vi.mocked(login).mockRejectedValue(new Error("Invalid credentials"));
    renderLogin();
    await user.type(
      screen.getByLabelText("common.emailPlaceholder"),
      "test@example.com",
    );

    await user.type(
      screen.getByLabelText("login.passwordPlaceholder"),
      "WrongPassword123!",
    );

    await user.click(
      screen.getByRole("button", {
        name: "common.login",
      }),
    );

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Invalid credentials",
          variant: "error",
        }),
      );
    });

    expect(localStorage.getItem("jwtToken")).toBeNull();
  });

  it("navigates to the forgot password page", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(
      screen.getByRole("button", {
        name: "login.forgotPassword",
      }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");

    expect(login).not.toHaveBeenCalled();
  });
});
