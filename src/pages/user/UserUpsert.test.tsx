import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import UserUpsertPage from "./UserUpsert";
import { createUser, getById, updateUsers } from "../../services/useService";
import { getRole } from "../../services/roleService";
import { userSchema } from "../../types/validations/schema";
import { useToast } from "../../contexts/toast/ToastProvider";

vi.mock("../../services/useService", () => ({
  createUser: vi.fn(),
  getById: vi.fn(),
  updateUsers: vi.fn(),
}));

vi.mock("../../services/roleService", () => ({
  getRole: vi.fn(),
}));

vi.mock("../../contexts/ToastContex", () => ({
  useToast: vi.fn(),
}));

vi.mock("../../types/validations/schema", () => ({
  userSchema: {
    safeParse: vi.fn(),
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../components/PageTitle", () => ({
  PageTitle: ({ title, subTitle }: { title: string; subTitle: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{subTitle}</p>
    </div>
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
    ...props
  }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));

vi.mock("../../components/ui/Button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../../components/ui/MultiSelect", () => ({
  MultiSelect: ({
    options,
    value,
    onChange,
    placeholder,
  }: {
    options: { label: string; value: string }[];
    value: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
  }) => (
    <select
      aria-label="roles"
      multiple
      value={(value ?? []).map(String)}
      onChange={(event) => {
        const selectedValues = Array.from(
          event.currentTarget.selectedOptions,
          (option) => option.value,
        );

        onChange(selectedValues);
      }}
      data-placeholder={placeholder}
    >
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
    onValueChange,
    options,
    name,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    options: { label: string; value: string }[];
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
      aria-label="birthDate"
      type="date"
      value={
        value instanceof Date && !Number.isNaN(value.getTime())
          ? [
              value.getFullYear(),
              String(value.getMonth() + 1).padStart(2, "0"),
              String(value.getDate()).padStart(2, "0"),
            ].join("-")
          : ""
      }
      onChange={(event) => {
        const dateValue = event.target.value;
        onChange(dateValue ? new Date(`${dateValue}T00:00:00`) : null);
      }}
    />
  ),
}));

vi.mock("../../utils/formatDate", () => ({
  formatToLocal: vi.fn((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }),
}));

const addToast = vi.fn();

const mockRoles = {
  content: [
    { id: "1", name: "Admin" },
    { id: "2", name: "User" },
  ],
};

const mockUser = {
  id: "1",
  name: "Besjana",
  surname: "Murataj",
  email: "besjana@example.com",
  username: "besjana",
  password: "password123",
  roles: [{ id: "1", name: "Admin" }],
  userInfo: {
    phoneNumber: "0691234567",
    birthDate: "1998-05-10",
    gender: "F",
    street: "Tirana",
  },
};

const validUser = {
  name: "Besjana",
  surname: "Murataj",
  email: "besjana@example.com",
  username: "besjana",
  password: "password123",
  roles: ["1"],
  userInfo: {
    phoneNumber: "0691234567",
    birthDate: "1998-05-10",
    gender: "F",
    street: "Tirana",
  },
};

const mockedCreateUser = vi.mocked(createUser);
const mockedUpdateUser = vi.mocked(updateUsers);
const mockedGetById = vi.mocked(getById);
const mockedGetRole = vi.mocked(getRole);
const mockedUseToast = vi.mocked(useToast);
const mockedSafeParse = vi.mocked(userSchema.safeParse);

const renderPage = (id?: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const initialRoute = id ? `/user/edit/${id}` : "/user/upsert";

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/user/edit/:id" element={<UserUpsertPage />} />

          <Route path="/user/upsert" element={<UserUpsertPage />} />

          <Route path="/user" element={<h1>User List</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("UserUpsertPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseToast.mockReturnValue({
      addToast,
    } as unknown as ReturnType<typeof useToast>);

    mockedGetRole.mockResolvedValue(mockRoles as never);
    mockedGetById.mockResolvedValue(mockUser as never);

    mockedCreateUser.mockResolvedValue({} as never);
    mockedUpdateUser.mockResolvedValue({} as never);

    mockedSafeParse.mockReturnValue({
      success: true,
      data: validUser,
    } as never);
  });

  it("should render the create-user form", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        name: "users.createUser",
      }),
    ).toBeInTheDocument();

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
      screen.getByPlaceholderText("users.passwordPlaceholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "common.save" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "common.cancel" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedGetRole).toHaveBeenCalled();
    });
  });

  it("should fetch roles when the page loads", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockedGetRole).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByRole("option", { name: "Admin" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "User" })).toBeInTheDocument();
  });

  it("should not fetch a user when creating a new user", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockedGetRole).toHaveBeenCalled();
    });

    expect(mockedGetById).not.toHaveBeenCalled();
  });

  it("should fetch the user when editing", async () => {
    renderPage("1");

    await waitFor(() => {
      expect(mockedGetById).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
        }),
      );
    });
  });

  it("should display the edit-user heading", async () => {
    renderPage("1");

    expect(
      screen.getByRole("heading", {
        name: "users.editUser",
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedGetById).toHaveBeenCalled();
    });
  });

  it("should populate the form with the existing user's data", async () => {
    renderPage("1");

    await waitFor(() => {
      expect(screen.getByPlaceholderText("users.namePlaceholder")).toHaveValue(
        "Besjana",
      );

      expect(
        screen.getByPlaceholderText("users.lastNamePlaceholder"),
      ).toHaveValue("Murataj");

      expect(
        screen.getByPlaceholderText("users.usernamePlaceholder"),
      ).toHaveValue("besjana");

      expect(screen.getByPlaceholderText("users.emailPlaceholder")).toHaveValue(
        "besjana@example.com",
      );
    });

    expect(
      screen.getByPlaceholderText("users.usernamePlaceholder"),
    ).toBeDisabled();

    expect(screen.getByLabelText("birthDate")).toHaveValue("1998-05-10");

    expect(screen.getByRole("radio", { name: "Female" })).toBeChecked();
  });

  it("should call createUser when the create form is submitted", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(mockedSafeParse).toHaveBeenCalled();

      expect(mockedCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "",
          surname: "",
          email: "",
          username: "",
        }),
      );
    });
  });

  it("should call updateUsers when the edit form is submitted", async () => {
    const user = userEvent.setup();

    renderPage("1");

    await waitFor(() => {
      expect(screen.getByPlaceholderText("users.namePlaceholder")).toHaveValue(
        "Besjana",
      );
    });

    await user.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => {
      expect(mockedSafeParse).toHaveBeenCalled();

      expect(mockedUpdateUser).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          name: "Besjana",
          surname: "Murataj",
          email: "besjana@example.com",
        }),
      );
    });
  });

  it("should navigate to the user list after successful creation", async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole("button", { name: "common.save" }));

    expect(
      await screen.findByRole("heading", { name: "User List" }),
    ).toBeInTheDocument();

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "success",
      }),
    );
  });

  it("should navigate to the user list after successful update", async () => {
    const user = userEvent.setup();

    renderPage("1");

    await waitFor(() => {
      expect(screen.getByPlaceholderText("users.namePlaceholder")).toHaveValue(
        "Besjana",
      );
    });

    await user.click(screen.getByRole("button", { name: "common.save" }));

    expect(
      await screen.findByRole("heading", { name: "User List" }),
    ).toBeInTheDocument();

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "success",
      }),
    );
  });

  it("should navigate to the user list when Cancel is clicked", async () => {
    const user = userEvent.setup();

    renderPage();

    // Wait for the form to finish loading.
    await screen.findByRole("button", { name: "common.cancel" });

    // Clear any previous calls before testing Cancel.
    mockedCreateUser.mockClear();
    mockedSafeParse.mockClear();

    await user.click(screen.getByRole("button", { name: "common.cancel" }));

    expect(
      await screen.findByRole("heading", { name: "User List" }),
    ).toBeInTheDocument();

    expect(mockedCreateUser).not.toHaveBeenCalled();
    expect(mockedSafeParse).not.toHaveBeenCalled();
  });

  it("should display validation errors when the form is invalid", async () => {
    const user = userEvent.setup();

    mockedSafeParse.mockReturnValue({
      success: false,
      error: {
        issues: [
          {
            path: ["name"],
            message: "Name is required",
          },
          {
            path: ["userInfo", "phoneNumber"],
            message: "Phone number is invalid",
          },
        ],
      },
    } as never);

    renderPage();

    await user.click(screen.getByRole("button", { name: "common.save" }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();

    expect(screen.getByText("Phone number is invalid")).toBeInTheDocument();

    expect(mockedCreateUser).not.toHaveBeenCalled();
  });
});
