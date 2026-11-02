import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ViewUserPage from "./ViewUser";
import { getById } from "../../services/useService";
import { getRole } from "../../services/roleService";


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

vi.mock("../../components/PageTitle", () => ({
  PageTitle: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock("../../components/ui/Input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("../../components/ui/Label", () => ({
  Label: ({
    children,
    ...props
  }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock("../../components/ui/Button", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
  }) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("../../components/ui/MultiSelect", () => ({
  MultiSelect: ({
    options,
    value,
    disabled,
  }: {
    options: { label: string; value: string }[];
    value: string[];
    disabled?: boolean;
  }) => (
    <select
      multiple
      disabled={disabled}
      aria-label="roles"
      value={value}
      onChange={() => {}}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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
      aria-label="birthDate"
      disabled={disabled}
      value={value ? value.toISOString().slice(0, 10) : ""}
      readOnly
    />
  ),
}));

vi.mock("../../components/ui/Radion", () => ({
  RadioGroup: ({
    value,
    options,
    disabled,
    name,
  }: {
    value: string;
    options: { label: string; value: string }[];
    disabled?: boolean;
    name: string;
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

const mockUser = {
  id: "1",
  name: "Besjana",
  surname: "Murataj",
  email: "besjana@example.com",
  username: "besjana",
  password: "password",
  roles: [{ id: "admin", name: "Admin" }],
  userInfo: {
    phoneNumber: "0691234567",
    birthDate: "1998-05-10",
    gender: "F",
    street: "Tirana",
  },
  authorities: [{ id: "read", label: "Read" }, { id: "write", label: "Write" }],
};

const mockRoles = {
  content: [
    { id: "admin", name: "Admin" },
    { id: "user", name: "User" },
  ],
};

const renderPage = (id?: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={id ? [`/user/${id}`] : ["/user"]}>
        <Routes>
          <Route path="/user/:id" element={<ViewUserPage />} />
          <Route path="/user" element={<h1>User List Page</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("ViewUserPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getById).mockResolvedValue(mockUser as any);
    vi.mocked(getRole).mockResolvedValue(mockRoles as any);
  });

  it("should call getById with the user ID when the page loads", async () => {
    renderPage("1");

    await waitFor(() => {
      expect(getById).toHaveBeenCalledWith(
        expect.objectContaining({ id: "1" }),
      );
    });
  });

  it("should display the user information returned by the API", async () => {
    renderPage("1");

    expect(await screen.findByDisplayValue("Besjana")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Murataj")).toBeInTheDocument();
    expect(screen.getByDisplayValue("besjana")).toBeInTheDocument();
    expect(screen.getByDisplayValue("besjana@example.com")).toBeInTheDocument();
  });

  it("should display the user's additional information", async () => {
    renderPage("1");

    expect(await screen.findByDisplayValue("0691234567")).toBeInTheDocument();

    expect(screen.getByDisplayValue("Tirana")).toBeInTheDocument();
    expect(screen.getByLabelText("birthDate")).toHaveValue("1998-05-10");
    expect(screen.getByRole("radio", { name: "Female" })).toBeChecked();
  });

  it("should display the user's assigned role", async () => {
    renderPage("1");

    await screen.findByDisplayValue("Besjana");

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Admin" })).toBeInTheDocument();
    });
  });

  it("should render the form fields as disabled", async () => {
    renderPage("1");

    expect(await screen.findByDisplayValue("Besjana")).toBeDisabled();
    expect(screen.getByDisplayValue("Murataj")).toBeDisabled();
    expect(screen.getByDisplayValue("besjana")).toBeDisabled();
    expect(screen.getByDisplayValue("besjana@example.com")).toBeDisabled();
    expect(screen.getByLabelText("roles")).toBeDisabled();
    expect(screen.getByLabelText("birthDate")).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Female" })).toBeDisabled();
  });

  it("should navigate to the user list when Cancel is clicked", async () => {
    const user = userEvent.setup();

    renderPage("1");

    await user.click(
      await screen.findByRole("button", { name: "common.cancel" }),
    );

    expect(
      await screen.findByRole("heading", { name: "User List Page" }),
    ).toBeInTheDocument();
  });

  it("should not call getById when no user ID is provided", async () => {
    renderPage();

    await waitFor(() => {
      expect(getById).not.toHaveBeenCalled();
    });
  });
});
