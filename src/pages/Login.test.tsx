import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/toast/ToastProvider";
import LoginPage from "./Login";

// Mocks
const mockNavigate = vi.fn();
const mockAuthenticateUser = vi.fn();
const mockAddToast = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../services/authService", () => ({
  login: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../contexts/toast/ToastProvider", () => ({
  useToast: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../layouts/Header", () => ({
  default: () => <div data-testid="header">Header</div>,
}));

const mockedLogin = vi.mocked(login);
const mockedUseAuth = vi.mocked(useAuth);
const mockedUseToast = vi.mocked(useToast);

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mockedUseAuth.mockReturnValue({
      authenticateUser: mockAuthenticateUser,
    } as unknown as ReturnType<typeof useAuth>);

    mockedUseToast.mockReturnValue({
      addToast: mockAddToast,
      toasts: [],
      removeToast: vi.fn(),
    });
  });

  it("renders the login page correctly", () => {
    renderPage();

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("login.title")).toBeInTheDocument();

    expect(
      screen.getByLabelText("common.emailPlaceholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("login.passwordPlaceholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "common.login" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "login.forgotPassword" }),
    ).toBeInTheDocument();
  });

  it("updates email and password inputs", async () => {
    const user = userEvent.setup();

    renderPage();

    const emailInput = screen.getByLabelText("common.emailPlaceholder");
    const passwordInput = screen.getByLabelText("login.passwordPlaceholder");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123!");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("Password123!");
  });

  it("displays validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole("button", { name: "common.login" }));

    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });

    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("displays email validation error for an invalid email", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.type(
      screen.getByLabelText("common.emailPlaceholder"),
      "invalid-email",
    );

    await user.type(
      screen.getByLabelText("login.passwordPlaceholder"),
      "Password123!",
    );

    await user.click(screen.getByRole("button", { name: "common.login" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("does not call login when validation fails", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.type(
      screen.getByLabelText("common.emailPlaceholder"),
      "invalid",
    );

    await user.click(screen.getByRole("button", { name: "common.login" }));

    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("successfully logs in and authenticates the user", async () => {
    const user = userEvent.setup();

    const tokenPayload = {
      sub: "test@example.com",
      id: 1,
      authorities: ["ROLE_ADMIN"],
    };

    const token = `header.${btoa(JSON.stringify(tokenPayload))}.signature`;

    mockedLogin.mockResolvedValue({
      token,
    } as Awaited<ReturnType<typeof login>>);

    renderPage();

    await user.type(
      screen.getByLabelText("common.emailPlaceholder"),
      "test@example.com",
    );

    await user.type(
      screen.getByLabelText("login.passwordPlaceholder"),
      "Password123!",
    );

    await user.click(screen.getByRole("button", { name: "common.login" }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123!",
      });
    });

    await waitFor(() => {
      expect(localStorage.getItem("jwtToken")).toBe(token);

      expect(mockAuthenticateUser).toHaveBeenCalledWith({
        email: "test@example.com",
        id: 1,
        authorities: ["ROLE_ADMIN"],
      });

      expect(mockAddToast).toHaveBeenCalledWith({
        title: "messages.success",
        description: "messages.loginSuccess",
        variant: "success",
      });

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("uses an empty authorities array when token has no authorities", async () => {
    const user = userEvent.setup();

    const tokenPayload = {
      sub: "test@example.com",
      id: 2,
    };

    const token = `header.${btoa(JSON.stringify(tokenPayload))}.signature`;

    mockedLogin.mockResolvedValue({
      token,
    } as Awaited<ReturnType<typeof login>>);

    renderPage();

    await user.type(
      screen.getByLabelText("common.emailPlaceholder"),
      "test@example.com",
    );

    await user.type(
      screen.getByLabelText("login.passwordPlaceholder"),
      "Password123!",
    );

    await user.click(screen.getByRole("button", { name: "common.login" }));

    await waitFor(() => {
      expect(mockAuthenticateUser).toHaveBeenCalledWith({
        email: "test@example.com",
        id: 2,
        authorities: [],
      });
    });
  });

  it("displays an error toast when login fails", async () => {
    const user = userEvent.setup();

    mockedLogin.mockRejectedValue(new Error("Invalid credentials"));

    renderPage();

    await user.type(
      screen.getByLabelText("common.emailPlaceholder"),
      "test@example.com",
    );

    await user.type(
      screen.getByLabelText("login.passwordPlaceholder"),
      "Password123!",
    );

    await user.click(screen.getByRole("button", { name: "common.login" }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: "messages.error",
        description: "Invalid credentials",
        variant: "error",
      });
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockAuthenticateUser).not.toHaveBeenCalled();
  });

  it("navigates to forgot password page", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(
      screen.getByRole("button", { name: "login.forgotPassword" }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
  });

  it("disables the login button while mutation is pending", async () => {
    const user = userEvent.setup();

    let resolveLogin!: (value: Awaited<ReturnType<typeof login>>) => void;

    mockedLogin.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );

    renderPage();

    await user.type(
      screen.getByLabelText("common.emailPlaceholder"),
      "test@example.com",
    );

    await user.type(
      screen.getByLabelText("login.passwordPlaceholder"),
      "Password123!",
    );

    await user.click(screen.getByRole("button", { name: "common.login" }));

    expect(
      await screen.findByRole("button", { name: "common.loading" }),
    ).toBeDisabled();

    resolveLogin({
      token: `header.${btoa(
        JSON.stringify({
          sub: "test@example.com",
          id: 1,
          authorities: [],
        }),
      )}.signature`,
    } as Awaited<ReturnType<typeof login>>);
  });
});
