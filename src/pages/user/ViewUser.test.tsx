
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getById } from "../../services/useService";
import { getRole } from "../../services/roleService";
import ViewUserPage from "./ViewUser";


const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  params: { id: "1" as string | undefined },
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
  useParams: () => mocks.params,
}));

vi.mock("../../services/useService", () => ({
  getById: vi.fn(),
}));

vi.mock("../../services/roleService", () => ({
  getRole: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// --------------------------------------------------
// UI component mocks
// --------------------------------------------------

vi.mock("../../components/PageTitle", () => ({
  PageTitle: ({
    title,
    subTitle,
  }: {
    title: string;
    subTitle?: string;
  }) => (
    <div>
      <h1>{title}</h1>
      <p>{subTitle}</p>
    </div>
  ),
}));

vi.mock("../../components/ui/Button", () => ({
  Button: ({
    children,
    onClick,
    type,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      type={type ?? "button"}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("../../components/ui/Input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("../../components/ui/Label", () => ({
  Label: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => <label htmlFor={htmlFor}>{children}</label>,
}));

vi.mock("../../components/ui/MultiSelect", () => ({
  MultiSelect: ({
    options,
    value,
    disabled,
    placeholder,
  }: {
    options: { label: string; value: string }[];
    value: string[];
    disabled?: boolean;
    placeholder?: string;
  }) => (
    <select
      aria-label="Roles"
      multiple
      disabled={disabled}
      value={value}
      onChange={() => {}}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("../../components/ui/Radion", () => ({
  RadioGroup: ({
    value,
    disabled,
    options,
    name,
  }: {
    value: string;
    disabled?: boolean;
    options: { label: string; value: string }[];
    name: string;
    onValueChange: (value: string) => void;
  }) => (
    <div>
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            readOnly
          />
          {option.label}
        </label>
      ))}
    </div>
  ),
}));

vi.mock("../../components/ui/DatePicker", () => ({
  DatePicker: ({
    value,
    disabled,
  }: {
    value: Date | null;
    disabled?: boolean;
  }) => (
    <input
      aria-label="Birth date"
      type="date"
      disabled={disabled}
      value={value ? value.toISOString().split("T")[0] : ""}
      readOnly
    />
  ),
}));

// --------------------------------------------------
// Test data
// --------------------------------------------------

const mockUser = {
  id: 1,
  name: "John",
  surname: "Doe",
  username: "johndoe",
  email: "john@example.com",
  password: "",
  roles: [
    { id: 1, name: "ADMIN" },
    { id: 2, name: "USER" },
  ],
  authorities: [],
  userInfo: {
    phoneNumber: "123456789",
    birthDate: "1995-01-01",
    gender: "M",
    street: "Main Street",
  },
};

const mockRoles = {
  content: [
    { id: 1, name: "ADMIN" },
    { id: 2, name: "USER" },
  ],
};

// --------------------------------------------------
// Render helper
// --------------------------------------------------

const renderViewUserPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ViewUserPage />
    </QueryClientProvider>,
  );
};


describe("ViewUserPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.params.id = "1";

    vi.mocked(getById).mockResolvedValue(mockUser as never);
    vi.mocked(getRole).mockResolvedValue(mockRoles as never);
  });

  // -----------------------------------------------
  // Rendering
  // -----------------------------------------------

  it("should render the page title and subtitle", () => {
    renderViewUserPage();

    expect(screen.getByText("View User")).toBeInTheDocument();

    expect(
      screen.getByText("Create or update user information"),
    ).toBeInTheDocument();
  });

  it("should render all form fields", () => {
    renderViewUserPage();

    expect(
      screen.getByPlaceholderText("users.namePlaceholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("users.lastNamePlaceholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("users.usernamePlaceholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("users.emailPlaceholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("users.phonePlaceholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("users.streetPlaceholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Birth date"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Roles"),
    ).toBeInTheDocument();
  });

  // -----------------------------------------------
  // API calls
  // -----------------------------------------------

  it("should fetch user details using the route ID", async () => {
    renderViewUserPage();

    await waitFor(() => {
      expect(getById).toHaveBeenCalledTimes(1);

      expect(getById).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          signal: expect.any(AbortSignal),
        }),
      );
    });
  });

  it("should fetch available roles", async () => {
    renderViewUserPage();

    await waitFor(() => {
      expect(getRole).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByRole("option", { name: "ADMIN" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "USER" }),
    ).toBeInTheDocument();
  });

  it("should not fetch user details when ID is missing", () => {
    mocks.params.id = undefined;

    renderViewUserPage();

    expect(getById).not.toHaveBeenCalled();
  });

  // -----------------------------------------------
  // User information
  // -----------------------------------------------

  it("should display fetched user information", async () => {
    renderViewUserPage();

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("users.namePlaceholder"),
      ).toHaveValue("John");
    });

    expect(
      screen.getByPlaceholderText("users.lastNamePlaceholder"),
    ).toHaveValue("Doe");

    expect(
      screen.getByPlaceholderText("users.usernamePlaceholder"),
    ).toHaveValue("johndoe");

    expect(
      screen.getByPlaceholderText("users.emailPlaceholder"),
    ).toHaveValue("john@example.com");

    expect(
      screen.getByPlaceholderText("users.phonePlaceholder"),
    ).toHaveValue("123456789");

    expect(
      screen.getByPlaceholderText("users.streetPlaceholder"),
    ).toHaveValue("Main Street");
  });

  it("should display user roles", async () => {
    renderViewUserPage();

    await waitFor(() => {
      expect(screen.getByLabelText("Roles")).toHaveValue([
        "1",
        "2",
      ]);
    });
  });

  it("should display user gender", async () => {
    renderViewUserPage();

    await waitFor(() => {
      expect(
        screen.getByRole("radio", { name: "Male" }),
      ).toBeChecked();
    });

    expect(
      screen.getByRole("radio", { name: "Female" }),
    ).not.toBeChecked();
  });

  it("should display user birth date", async () => {
    renderViewUserPage();

    await waitFor(() => {
      expect(
        screen.getByLabelText("Birth date"),
      ).toHaveValue("1995-01-01");
    });
  });

  // -----------------------------------------------
  // Read-only behavior
  // -----------------------------------------------

  it("should disable all input fields", async () => {
    renderViewUserPage();

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("users.namePlaceholder"),
      ).toHaveValue("John");
    });

    expect(
      screen.getByPlaceholderText("users.namePlaceholder"),
    ).toBeDisabled();

    expect(
      screen.getByPlaceholderText("users.lastNamePlaceholder"),
    ).toBeDisabled();

    expect(
      screen.getByPlaceholderText("users.usernamePlaceholder"),
    ).toBeDisabled();

    expect(
      screen.getByPlaceholderText("users.emailPlaceholder"),
    ).toBeDisabled();

    expect(
      screen.getByPlaceholderText("users.phonePlaceholder"),
    ).toBeDisabled();

    expect(
      screen.getByPlaceholderText("users.streetPlaceholder"),
    ).toBeDisabled();

    expect(
      screen.getByLabelText("Roles"),
    ).toBeDisabled();

    expect(
      screen.getByLabelText("Birth date"),
    ).toBeDisabled();
  });

  it("should disable gender options", async () => {
    renderViewUserPage();

    await waitFor(() => {
      expect(
        screen.getByRole("radio", { name: "Male" }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("radio", { name: "Male" }),
    ).toBeDisabled();

    expect(
      screen.getByRole("radio", { name: "Female" }),
    ).toBeDisabled();
  });

  it("should not allow editing form fields", async () => {
    renderViewUserPage();

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("users.namePlaceholder"),
      ).toHaveValue("John");
    });

    expect(
      screen.getByPlaceholderText("users.namePlaceholder"),
    ).toBeDisabled();
  });

  // -----------------------------------------------
  // Missing optional data
  // -----------------------------------------------

  it("should display empty values when user data is missing", async () => {
    vi.mocked(getById).mockResolvedValueOnce({
      id: 1,
      roles: [],
      authorities: [],
    } as never);

    renderViewUserPage();

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("users.namePlaceholder"),
      ).toHaveValue("");
    });

    expect(
      screen.getByPlaceholderText("users.lastNamePlaceholder"),
    ).toHaveValue("");

    expect(
      screen.getByPlaceholderText("users.emailPlaceholder"),
    ).toHaveValue("");

    expect(
      screen.getByPlaceholderText("users.phonePlaceholder"),
    ).toHaveValue("");

    expect(
      screen.getByPlaceholderText("users.streetPlaceholder"),
    ).toHaveValue("");

    expect(screen.getByLabelText("Roles")).toHaveValue([]);

    expect(screen.getByLabelText("Birth date")).toHaveValue("");
  });

  it("should display female gender when user gender is F", async () => {
    vi.mocked(getById).mockResolvedValueOnce({
      ...mockUser,
      userInfo: {
        ...mockUser.userInfo,
        gender: "F",
      },
    } as never);

    renderViewUserPage();

    await waitFor(() => {
      expect(
        screen.getByRole("radio", { name: "Female" }),
      ).toBeChecked();
    });
  });

  // -----------------------------------------------
  // Navigation
  // -----------------------------------------------

  it("should navigate to users page when clicking cancel", () => {
    renderViewUserPage();

    fireEvent.click(screen.getByText("common.cancel"));

    expect(mocks.navigate).toHaveBeenCalledWith("/user");
  });
});
