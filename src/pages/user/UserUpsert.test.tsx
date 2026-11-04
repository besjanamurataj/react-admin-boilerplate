import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ReactNode, InputHTMLAttributes } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserUpsertPage from "./UserUpsert";

// --------------------------------------------------
// Mocks
// --------------------------------------------------

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  addToast: vi.fn(),
  params: {} as { id?: string },
  createUser: vi.fn(),
  getById: vi.fn(),
  updateUsers: vi.fn(),
  getRole: vi.fn(),
  safeParse: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
  useParams: () => mocks.params,
}));

vi.mock("../../contexts/toast/ToastProvider", () => ({
  useToast: () => ({
    addToast: mocks.addToast,
  }),
}));

vi.mock("../../services/useService", () => ({
  createUser: mocks.createUser,
  getById: mocks.getById,
  updateUsers: mocks.updateUsers,
}));

vi.mock("../../services/roleService", () => ({
  getRole: mocks.getRole,
}));

vi.mock("../../types/validations/schema", () => ({
  userSchema: {
    safeParse: mocks.safeParse,
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../utils/formatDate", () => ({
  formatToLocal: (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  },
}));

// --------------------------------------------------
// Component mocks
// --------------------------------------------------

vi.mock("../../components/PageTitle", () => ({
  PageTitle: ({ title, subTitle }: { title: string; subTitle: string }) => (
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
    type = "button",
    variant,
  }: {
    children: ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: string;
  }) => (
    <button type={type} onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock("../../components/ui/Input", () => ({
  Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("../../components/ui/Label", () => ({
  Label: ({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

vi.mock("../../components/ui/MultiSelect", () => ({
  MultiSelect: ({
    options,
    value,
    onChange,
  }: {
    options: { label: string; value: string | number }[];
    value: string[];
    onChange: (values: string[]) => void;
  }) => (
    <div data-testid="multi-select">
      {options.map((option) => {
        const optionValue = String(option.value);
        const selected = value.includes(optionValue);

        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={selected}
            onClick={() =>
              onChange(
                selected
                  ? value.filter((item) => item !== optionValue)
                  : [...value, optionValue],
              )
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  ),
}));

vi.mock("../../components/ui/Radion", () => ({
  RadioGroup: ({
    value,
    onValueChange,
    options,
    name,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    options: { label: string; value: string }[];
    name: string;
  }) => (
    <div data-testid="radio-group">
      {options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onValueChange(option.value)}
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
    onChange,
  }: {
    value: Date | null;
    onChange: (date: Date | null) => void;
  }) => (
    <input
      type="date"
      data-testid="birth-date"
      value={
        value
          ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(
              2,
              "0",
            )}-${String(value.getDate()).padStart(2, "0")}`
          : ""
      }
      onChange={(e) => {
        if (!e.target.value) {
          onChange(null);
          return;
        }

        const [year, month, day] = e.target.value.split("-").map(Number);

        onChange(new Date(year, month - 1, day));
      }}
    />
  ),
}));

// --------------------------------------------------
// Test data
// --------------------------------------------------

// Intentionally inferred instead of forcing an incorrect
// UserDetailResponse assertion. The service is mocked.

const mockUser = {
  id: 1,
  name: "John",
  surname: "Doe",
  email: "john@example.com",
  username: "johndoe",
  roles: [{ id: 1, name: "ADMIN" }],
  authorities: [],
  userInfo: {
    phoneNumber: "123456789",
    birthDate: "1995-05-15",
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
// Helpers
// --------------------------------------------------

const renderPage = () => {
  const queryClient = new QueryClient({
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

  return render(
    <QueryClientProvider client={queryClient}>
      <UserUpsertPage />
    </QueryClientProvider>,
  );
};

const fillRequiredFields = async () => {
  await screen.findByRole("button", { name: "ADMIN" });

  fireEvent.change(screen.getByLabelText("users.table.firstName"), {
    target: { value: "John" },
  });

  fireEvent.change(screen.getByLabelText("users.table.lastName"), {
    target: { value: "Doe" },
  });

  fireEvent.change(screen.getByLabelText("users.table.username"), {
    target: { value: "johndoe" },
  });

  fireEvent.change(screen.getByLabelText("users.table.email"), {
    target: { value: "john@example.com" },
  });

  fireEvent.change(screen.getByPlaceholderText("users.passwordPlaceholder"), {
    target: { value: "Password123!" },
  });

  fireEvent.click(screen.getByRole("button", { name: "ADMIN" }));
};

// --------------------------------------------------
// Tests
// --------------------------------------------------

describe("UserUpsertPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.params = {};

    mocks.getRole.mockResolvedValue(mockRoles);
    mocks.getById.mockResolvedValue(mockUser);

    mocks.createUser.mockResolvedValue({ success: true });
    mocks.updateUsers.mockResolvedValue({ success: true });

    mocks.safeParse.mockReturnValue({
      success: true,
      data: {},
    });
  });

  // ================================================
  // CREATE USER
  // ================================================

  describe("Create user", () => {
    it("should render the create user page", () => {
      renderPage();

      expect(
        screen.getByRole("heading", { name: "users.createUser" }),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText("users.table.firstName"),
      ).toBeInTheDocument();

      expect(screen.getByLabelText("users.table.lastName")).toBeInTheDocument();

      expect(screen.getByLabelText("users.table.username")).toBeInTheDocument();

      expect(screen.getByLabelText("users.table.email")).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText("users.passwordPlaceholder"),
      ).toBeInTheDocument();
    });

    it("should fetch roles", async () => {
      renderPage();

      expect(
        await screen.findByRole("button", { name: "ADMIN" }),
      ).toBeInTheDocument();

      expect(screen.getByRole("button", { name: "USER" })).toBeInTheDocument();

      expect(mocks.getRole).toHaveBeenCalledTimes(1);
    });

    it("should update name, surname, username and email", () => {
      renderPage();

      fireEvent.change(screen.getByLabelText("users.table.firstName"), {
        target: { value: "Jane" },
      });

      fireEvent.change(screen.getByLabelText("users.table.lastName"), {
        target: { value: "Smith" },
      });

      fireEvent.change(screen.getByLabelText("users.table.username"), {
        target: { value: "janesmith" },
      });

      fireEvent.change(screen.getByLabelText("users.table.email"), {
        target: { value: "jane@example.com" },
      });

      expect(screen.getByLabelText("users.table.firstName")).toHaveValue(
        "Jane",
      );

      expect(screen.getByLabelText("users.table.lastName")).toHaveValue(
        "Smith",
      );

      expect(screen.getByLabelText("users.table.username")).toHaveValue(
        "janesmith",
      );

      expect(screen.getByLabelText("users.table.email")).toHaveValue(
        "jane@example.com",
      );
    });

    it("should update password", () => {
      renderPage();

      const password = screen.getByPlaceholderText("users.passwordPlaceholder");

      fireEvent.change(password, {
        target: { value: "Password123!" },
      });

      expect(password).toHaveValue("Password123!");
    });

    it("should select and deselect roles", async () => {
      renderPage();

      const adminButton = await screen.findByRole("button", {
        name: "ADMIN",
      });

      fireEvent.click(adminButton);

      expect(adminButton).toHaveAttribute("aria-pressed", "true");

      fireEvent.click(adminButton);

      expect(adminButton).toHaveAttribute("aria-pressed", "false");
    });

    it("should update gender", () => {
      renderPage();

      const femaleRadio = screen.getByRole("radio", {
        name: "Female",
      });

      fireEvent.click(femaleRadio);

      expect(femaleRadio).toBeChecked();
    });

    it("should update birth date", () => {
      renderPage();

      const dateInput = screen.getByTestId("birth-date");

      fireEvent.change(dateInput, {
        target: { value: "1998-01-12" },
      });

      expect(dateInput).toHaveValue("1998-01-12");
    });

    it("should clear birth date", () => {
      renderPage();

      const dateInput = screen.getByTestId("birth-date");

      fireEvent.change(dateInput, {
        target: { value: "1998-01-12" },
      });

      fireEvent.change(dateInput, {
        target: { value: "" },
      });

      expect(dateInput).toHaveValue("");
    });

    it("should update street", () => {
      renderPage();

      const streetInput = screen.getByPlaceholderText(
        "users.streetPlaceholder",
      );

      fireEvent.change(streetInput, {
        target: { value: "Test Street" },
      });

      expect(streetInput).toHaveValue("Test Street");
    });

    it("should display validation errors", () => {
      mocks.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              path: ["name"],
              message: "Name is required",
            },
            {
              path: ["email"],
              message: "Invalid email",
            },
          ],
        },
      });

      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
      // expect(screen.getByText("Street is required")).toBeInTheDocument();

      expect(mocks.createUser).not.toHaveBeenCalled();
    });

    it("should create a user successfully", async () => {
      renderPage();

      await fillRequiredFields();

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => {
        expect(mocks.createUser).toHaveBeenCalledTimes(1);
      });

      expect(mocks.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John",
          surname: "Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "Password123!",
          roles: ["1"],
        }),
      );

      expect(mocks.updateUsers).not.toHaveBeenCalled();

      expect(mocks.addToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "messages.success",
          description: "messages.userCreated",
          variant: "success",
        }),
      );

      expect(mocks.navigate).toHaveBeenCalledWith("/user");
    });

    it("should display error toast when creation fails", async () => {
      mocks.createUser.mockRejectedValue({
        response: {
          data: {
            message: "messages.userAlreadyExists",
          },
        },
      });

      renderPage();

      await fillRequiredFields();

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => {
        expect(mocks.addToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "messages.error",
            description: "messages.userAlreadyExists",
            variant: "error",
          }),
        );
      });

      expect(mocks.navigate).not.toHaveBeenCalled();
    });

    it("should display default error when creation fails without API message", async () => {
      mocks.createUser.mockRejectedValue(new Error("Network error"));

      renderPage();

      await fillRequiredFields();

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => {
        expect(mocks.addToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "messages.error",
            description: "messages.error",
            variant: "error",
          }),
        );
      });
    });

    it("should navigate to users page when cancel is clicked", () => {
      renderPage();

      fireEvent.click(screen.getByRole("button", { name: "common.cancel" }));

      expect(mocks.navigate).toHaveBeenCalledWith("/user");
      expect(mocks.createUser).not.toHaveBeenCalled();
    });
  });

  // ================================================
  // EDIT USER
  // ================================================

  describe("Edit user", () => {
    beforeEach(() => {
      mocks.params = { id: "1" };
    });

    it("should render edit user page", () => {
      renderPage();

      expect(
        screen.getByRole("heading", { name: "users.editUser" }),
      ).toBeInTheDocument();

      expect(
        screen.queryByPlaceholderText("users.passwordPlaceholder"),
      ).not.toBeInTheDocument();
    });

    it("should fetch user details", async () => {
      renderPage();

      await waitFor(() => {
        expect(mocks.getById).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "1",
            signal: expect.anything(),
          }),
        );
      });
    });

    it("should populate form with existing user data", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByLabelText("users.table.firstName")).toHaveValue(
          "John",
        );
      });

      expect(screen.getByLabelText("users.table.lastName")).toHaveValue("Doe");

      expect(screen.getByLabelText("users.table.username")).toHaveValue(
        "johndoe",
      );

      expect(screen.getByLabelText("users.table.email")).toHaveValue(
        "john@example.com",
      );

      expect(screen.getByLabelText("users.table.username")).toBeDisabled();

      expect(
        screen.getByPlaceholderText("users.streetPlaceholder"),
      ).toHaveValue("Main Street");

      expect(screen.getByRole("radio", { name: "Male" })).toBeChecked();

      expect(screen.getByTestId("birth-date")).toHaveValue("1995-05-15");

      expect(screen.getByRole("button", { name: "ADMIN" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("should update an existing user successfully", async () => {
      renderPage();

      const nameInput = await screen.findByLabelText("users.table.firstName");

      await waitFor(() => {
        expect(nameInput).toHaveValue("John");
      });

      fireEvent.change(nameInput, {
        target: { value: "Johnny" },
      });

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => {
        expect(mocks.updateUsers).toHaveBeenCalledTimes(1);
      });

      expect(mocks.updateUsers).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          name: "Johnny",
          surname: "Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "",
        }),
      );

      expect(mocks.createUser).not.toHaveBeenCalled();

      expect(mocks.addToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "messages.success",
          description: "messages.userUpdated",
          variant: "success",
        }),
      );

      expect(mocks.navigate).toHaveBeenCalledWith("/user");
    });

    it("should display error toast when update fails", async () => {
      mocks.updateUsers.mockRejectedValue({
        response: {
          data: {
            message: "messages.updateFailed",
          },
        },
      });

      renderPage();

      const nameInput = await screen.findByLabelText("users.table.firstName");

      await waitFor(() => {
        expect(nameInput).toHaveValue("John");
      });

      fireEvent.change(nameInput, {
        target: { value: "Johnny" },
      });

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => {
        expect(mocks.addToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "messages.error",
            description: "messages.updateFailed",
            variant: "error",
          }),
        );
      });

      expect(mocks.navigate).not.toHaveBeenCalled();
      expect(mocks.createUser).not.toHaveBeenCalled();
    });

    it("should show default error toast when update fails without a message", async () => {
      mocks.updateUsers.mockRejectedValue({
        response: {
          data: {},
        },
      });

      renderPage();

      const nameInput = await screen.findByLabelText("users.table.firstName");

      await waitFor(() => {
        expect(nameInput).toHaveValue("John");
      });

      fireEvent.change(nameInput, {
        target: { value: "Johnny" },
      });

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => {
        expect(mocks.addToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "messages.error",
            description: "messages.error",
            variant: "error",
          }),
        );
      });
    });

    it("should navigate to users page when cancel is clicked", async () => {
      renderPage();

      await screen.findByDisplayValue("John");

      fireEvent.click(screen.getByRole("button", { name: "common.cancel" }));

      expect(mocks.navigate).toHaveBeenCalledWith("/user");
      expect(mocks.updateUsers).not.toHaveBeenCalled();
    });
  });

  // ================================================
  // GENERAL
  // ================================================

  describe("General behavior", () => {
    it("should not fetch user details in create mode", () => {
      mocks.params = {};

      renderPage();

      expect(mocks.getById).not.toHaveBeenCalled();
    });

    it("should invalidate user queries after successful creation", async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      render(
        <QueryClientProvider client={queryClient}>
          <UserUpsertPage />
        </QueryClientProvider>,
      );

      await fillRequiredFields();

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ["user"],
        });
      });
    });
  });
});
