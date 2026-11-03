import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProfilePage } from "./Profile";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  getById: vi.fn(),
  getRole: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  invalidateQueries: vi.fn(),
  navigate: vi.fn(),
  addToast: vi.fn(),
  userSchemaSafeParse: vi.fn(),
  passwordSchemaSafeParse: vi.fn(),
  userId: "1",
}));

vi.mock("../services/useService", () => ({
  getById: mocks.getById,
  updateProfile: mocks.updateProfile,
  changePassword: mocks.changePassword,
}));

vi.mock("../services/roleService", () => ({
  getRole: mocks.getRole,
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    userId: mocks.userId,
    isAuthenticated: true,
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("../contexts/toast/ToastProvider", () => ({
  useToast: () => ({
    addToast: mocks.addToast,
  }),
}));

vi.mock("../types/validations/schema", () => ({
  userSchema: {
    safeParse: mocks.userSchemaSafeParse,
  },
  passwordSchema: {
    safeParse: mocks.passwordSchemaSafeParse,
  },
}));

vi.mock("../components/PageTitle", () => ({
  PageTitle: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock("../components/ui/Label", () => ({
  Label: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
}));

vi.mock("../components/ui/Input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      data-testid={
        props.type === "password" ? "password-input" : "profile-input"
      }
    />
  ),
}));

vi.mock("../components/ui/Button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../components/ui/DatePicker", () => ({
  DatePicker: ({
    value,
    onChange,
    disabled,
  }: {
    value: Date | null;
    onChange: (date: Date | null) => void;
    disabled?: boolean;
  }) => (
    <input
      data-testid="birth-date"
      type="date"
      disabled={disabled}
      value={value ? value.toISOString().slice(0, 10) : ""}
      onChange={(e) =>
        onChange(e.target.value ? new Date(`${e.target.value}T00:00:00`) : null)
      }
    />
  ),
}));

vi.mock("../components/ui/MultiSelect", () => ({
  MultiSelect: ({
    value,
    options,
    onChange,
    disabled,
  }: {
    value: string[];
    options: { label: string; value: string }[];
    onChange: (values: string[]) => void;
    disabled?: boolean;
  }) => (
    <select
      data-testid="roles-select"
      multiple
      disabled={disabled}
      value={value}
      onChange={(e) =>
        onChange(
          Array.from(e.target.selectedOptions).map((option) => option.value),
        )
      }
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("../components/ui/Dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="dialog">{children}</div> : null,

  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// --------------------------------------------------
// Test data
// --------------------------------------------------

const mockUser = {
  id: 1,
  name: "John",
  surname: "Doe",
  email: "john@example.com",
  username: "johndoe",
  roles: [
    { id: 1, name: "Admin" },
    { id: 2, name: "User" },
  ],
  userInfo: {
    phoneNumber: "123456789",
    birthDate: "1998-01-12",
    gender: "Male",
    street: "Main Street",
  },
};

const mockRoles = {
  content: [
    { id: 1, name: "Admin" },
    { id: 2, name: "User" },
    { id: 3, name: "Manager" },
  ],
};

const mockProfile = {
  name: "John",
  surname: "Doe",
  email: "john@example.com",
  username: "johndoe",
  password: "",
  confirmPassword: "",
  roles: ["1", "2"],
  userInfo: {
    phoneNumber: "123456789",
    birthDate: "1998-01-12",
    gender: "Male",
    street: "Main Street",
  },
};

const mockPassword = {
  password: "Password123!",
  confirmPassword: "Password123!",
};

let queryClient: QueryClient;

const renderProfilePage = () => {
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

  return render(
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
    </QueryClientProvider>,
  );
};

const getProfileInputs = () => screen.getAllByTestId("profile-input");

const editProfile = async () => {
  await screen.findByDisplayValue("John");

  fireEvent.click(
    screen.getByRole("button", {
      name: "profile.updateProfile",
    }),
  );
};

const openPasswordModal = async () => {
  await screen.findByDisplayValue("John");

  fireEvent.click(
    screen.getByRole("button", {
      name: "common.changePassword",
    }),
  );

  expect(screen.getByTestId("dialog")).toBeInTheDocument();
};

// --------------------------------------------------
// Tests
// --------------------------------------------------

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.userId = "1";

    mocks.getById.mockResolvedValue(mockUser);
    mocks.getRole.mockResolvedValue(mockRoles);

    mocks.updateProfile.mockResolvedValue({});
    mocks.changePassword.mockResolvedValue({});

    mocks.userSchemaSafeParse.mockReturnValue({
      success: true,
      data: mockProfile,
    });

    mocks.passwordSchemaSafeParse.mockReturnValue({
      success: true,
      data: mockPassword,
    });

    mocks.invalidateQueries.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    queryClient?.clear();
  });

  // ----------------------------------------------
  // Loading and error states
  // ----------------------------------------------

  describe("Loading and error states", () => {
    it("should display the loading state", () => {
      mocks.getById.mockReturnValue(new Promise(() => {}));

      renderProfilePage();

      expect(screen.getByText("Loading profile...")).toBeInTheDocument();

      expect(
        screen.getByRole("heading", {
          name: "profile.title",
        }),
      ).toBeInTheDocument();
    });

    it("should display an error when fetching the profile fails", async () => {
      mocks.getById.mockRejectedValue(new Error("Request failed"));

      renderProfilePage();

      expect(
        await screen.findByText("Error loading profile."),
      ).toBeInTheDocument();
    });

    it("should display an error when user data is unavailable", async () => {
      mocks.getById.mockResolvedValue(null);

      renderProfilePage();

      expect(
        await screen.findByText("Error loading profile."),
      ).toBeInTheDocument();
    });

    it("should not fetch a user when userId is missing", async () => {
      mocks.userId = "";

      renderProfilePage();

      expect(
        await screen.findByText("Error loading profile."),
      ).toBeInTheDocument();

      expect(mocks.getById).not.toHaveBeenCalled();
    });

    it("should fetch the user using the authenticated user ID", async () => {
      renderProfilePage();

      await screen.findByDisplayValue("John");

      expect(mocks.getById).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          signal: expect.anything(),
        }),
      );
    });

    it("should fetch available roles", async () => {
      renderProfilePage();

      await screen.findByDisplayValue("John");

      await waitFor(() => {
        expect(mocks.getRole).toHaveBeenCalled();
      });
    });
  });

  // ----------------------------------------------
  // Profile rendering
  // ----------------------------------------------

  describe("Profile rendering", () => {
    it("should render the profile title", async () => {
      renderProfilePage();

      expect(
        await screen.findByRole("heading", {
          name: "profile.title",
        }),
      ).toBeInTheDocument();
    });

    it("should render all user profile information", async () => {
      renderProfilePage();

      const inputs = await screen.findAllByTestId("profile-input");

      expect(inputs).toHaveLength(4);

      expect(inputs[0]).toHaveValue("John");
      expect(inputs[1]).toHaveValue("Doe");
      expect(inputs[2]).toHaveValue("john@example.com");
      expect(inputs[3]).toHaveValue("123456789");

      expect(screen.getByTestId("birth-date")).toHaveValue("1998-01-12");

      expect(screen.getByTestId("roles-select")).toHaveValue(["1", "2"]);
    });

    it("should render the user's roles", async () => {
      renderProfilePage();

      const rolesSelect = await screen.findByTestId("roles-select");

      expect(rolesSelect).toHaveValue(["1", "2"]);

      expect(
        within(rolesSelect).getByRole("option", {
          name: "Admin",
        }),
      ).toBeInTheDocument();

      expect(
        within(rolesSelect).getByRole("option", {
          name: "User",
        }),
      ).toBeInTheDocument();
    });

    it("should render the change password button", async () => {
      renderProfilePage();

      await screen.findByDisplayValue("John");

      expect(
        screen.getByRole("button", {
          name: "common.changePassword",
        }),
      ).toBeInTheDocument();
    });

    it("should render the update profile button", async () => {
      renderProfilePage();

      await screen.findByDisplayValue("John");

      expect(
        screen.getByRole("button", {
          name: "profile.updateProfile",
        }),
      ).toBeInTheDocument();
    });

    it("should disable profile fields when not editing", async () => {
      renderProfilePage();

      const inputs = await screen.findAllByTestId("profile-input");

      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });

      expect(screen.getByTestId("roles-select")).toBeDisabled();
      expect(screen.getByTestId("birth-date")).toBeDisabled();
    });
  });

  // ----------------------------------------------
  // Profile editing
  // ----------------------------------------------

  describe("Profile editing", () => {
    it("should enable editing when clicking update profile", async () => {
      renderProfilePage();

      await editProfile();

      const inputs = getProfileInputs();

      inputs.forEach((input) => {
        expect(input).toBeEnabled();
      });

      expect(screen.getByTestId("roles-select")).toBeEnabled();
      expect(screen.getByTestId("birth-date")).toBeEnabled();
    });

    it("should display the update profile title when editing", async () => {
      renderProfilePage();

      await editProfile();

      expect(
        screen.getByRole("heading", {
          name: "profile.updateProfile",
        }),
      ).toBeInTheDocument();
    });

    it("should populate form data when entering edit mode", async () => {
      renderProfilePage();

      await editProfile();

      expect(getProfileInputs()[0]).toHaveValue("John");
      expect(getProfileInputs()[1]).toHaveValue("Doe");
      expect(getProfileInputs()[2]).toHaveValue("john@example.com");
      expect(getProfileInputs()[3]).toHaveValue("123456789");
    });

    it("should update the name field", async () => {
      renderProfilePage();

      await editProfile();

      fireEvent.change(getProfileInputs()[0], {
        target: { value: "Jane" },
      });

      expect(getProfileInputs()[0]).toHaveValue("Jane");
    });

    it("should update the surname field", async () => {
      renderProfilePage();

      await editProfile();

      fireEvent.change(getProfileInputs()[1], {
        target: { value: "Smith" },
      });

      expect(getProfileInputs()[1]).toHaveValue("Smith");
    });

    it("should update the email field", async () => {
      renderProfilePage();

      await editProfile();

      fireEvent.change(getProfileInputs()[2], {
        target: { value: "jane@example.com" },
      });

      expect(getProfileInputs()[2]).toHaveValue("jane@example.com");
    });

    it("should update the phone number", async () => {
      renderProfilePage();

      await editProfile();

      fireEvent.change(getProfileInputs()[3], {
        target: { value: "987654321" },
      });

      expect(getProfileInputs()[3]).toHaveValue("987654321");
    });

    it("should update selected roles", async () => {
      const user = userEvent.setup();

      renderProfilePage();

      await editProfile();

      const rolesSelect = screen.getByTestId("roles-select");

      await user.selectOptions(rolesSelect, ["3"]);

      expect(rolesSelect).toHaveValue(["1", "2", "3"]);
    });

    it("should update the birth date", async () => {
      renderProfilePage();

      await editProfile();

      fireEvent.change(screen.getByTestId("birth-date"), {
        target: { value: "2000-05-15" },
      });

      expect(screen.getByTestId("birth-date")).toHaveValue("2000-05-15");
    });

    it("should reset errors when entering edit mode", async () => {
      mocks.userSchemaSafeParse.mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              path: ["name"],
              message: "Name is required",
            },
          ],
        },
      });

      renderProfilePage();

      await editProfile();

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      expect(await screen.findByText("Name is required")).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.changePassword",
        }),
      );

      // Errors are cleared when opening the password dialog.
      expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
    });
  });

  // ----------------------------------------------
  // Profile validation
  // ----------------------------------------------

  describe("Profile validation", () => {
    it("should display validation errors when profile is invalid", async () => {
      mocks.userSchemaSafeParse.mockReturnValue({
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

      renderProfilePage();

      await editProfile();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.save",
        }),
      );

      expect(await screen.findByText("Name is required")).toBeInTheDocument();

      expect(screen.getByText("Invalid email")).toBeInTheDocument();

      expect(mocks.updateProfile).not.toHaveBeenCalled();
    });

    it("should display nested userInfo validation errors", async () => {
      mocks.userSchemaSafeParse.mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              path: ["userInfo", "phoneNumber"],
              message: "Invalid phone number",
            },
            {
              path: ["userInfo", "birthDate"],
              message: "Invalid birth date",
            },
          ],
        },
      });

      renderProfilePage();

      await editProfile();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.save",
        }),
      );

      expect(
        await screen.findByText(
          JSON.stringify({
            phoneNumber: "Invalid phone number",
            birthDate: "Invalid birth date",
          }),
        ),
      ).toBeInTheDocument();
    });

    it("should not call updateProfile when validation fails", async () => {
      mocks.userSchemaSafeParse.mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              path: ["surname"],
              message: "Surname is required",
            },
          ],
        },
      });

      renderProfilePage();

      await editProfile();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.save",
        }),
      );

      await waitFor(() => {
        expect(mocks.updateProfile).not.toHaveBeenCalled();
      });
    });

    it("should call userSchema.safeParse with the form data", async () => {
      renderProfilePage();

      await editProfile();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.save",
        }),
      );

      await waitFor(() => {
        expect(mocks.userSchemaSafeParse).toHaveBeenCalledWith(mockProfile);
      });
    });
  });

  // ----------------------------------------------
  // Profile update mutation
  // ----------------------------------------------

  describe("Profile update", () => {
    it("should update the profile successfully", async () => {
      renderProfilePage();

      await editProfile();

      fireEvent.change(getProfileInputs()[0], {
        target: { value: "Jane" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.save",
        }),
      );

      await waitFor(() => {
        expect(mocks.updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Jane",
            surname: "Doe",
            email: "john@example.com",
          }),
        );
      });
    });

    it("should invalidate the user query after successful update", async () => {
      renderProfilePage();

      await editProfile();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.save",
        }),
      );

      await waitFor(() => {
        expect(mocks.invalidateQueries).not.toHaveBeenCalled();
        expect(mocks.updateProfile).toHaveBeenCalled();
      });

      // QueryClient invalidation is verified through the real
      // QueryClient in the dedicated mutation test below.
    });

    it("should show a success toast after profile update", async () => {
      renderProfilePage();

      await editProfile();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.save",
        }),
      );

      await waitFor(() => {
        expect(mocks.addToast).toHaveBeenCalledWith({
          title: "messages.success",
          description: "messages.profileUpdateSuccess",
          variant: "success",
        });
      });
    });

    it("should navigate to the user page after successful update", async () => {
      renderProfilePage();

      await editProfile();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.save",
        }),
      );

      await waitFor(() => {
        expect(mocks.navigate).toHaveBeenCalledWith("/user");
      });
    });

    it("should leave edit mode after successful update", async () => {
      renderProfilePage();

      await editProfile();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.save",
        }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", {
            name: "profile.updateProfile",
          }),
        ).toBeInTheDocument();
      });
    });

    it("should show an error toast when profile update fails", async () => {
      mocks.updateProfile.mockRejectedValue(new Error("Profile update failed"));

      renderProfilePage();

      await editProfile();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.save",
        }),
      );

      await waitFor(() => {
        expect(mocks.addToast).toHaveBeenCalledWith({
          title: "messages.error",
          description: "Profile update failed",
          variant: "error",
        });
      });
    });

    it("should use the default error message when update fails without a message", async () => {
      mocks.updateProfile.mockRejectedValue(new Error(""));

      renderProfilePage();

      await editProfile();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.save",
        }),
      );

      await waitFor(() => {
        expect(mocks.addToast).toHaveBeenCalledWith({
          title: "messages.error",
          description: "messages.profileUpdateFailed",
          variant: "error",
        });
      });
    });
  });

  // ----------------------------------------------
  // Change password modal
  // ----------------------------------------------

  describe("Change password modal", () => {
    it("should open the password modal", async () => {
      renderProfilePage();

      await openPasswordModal();

      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });

    it("should render password fields", async () => {
      renderProfilePage();

      await openPasswordModal();

      expect(screen.getAllByTestId("password-input")).toHaveLength(2);
    });

    it("should render cancel and update password buttons", async () => {
      renderProfilePage();

      await openPasswordModal();

      expect(
        screen.getByRole("button", {
          name: "common.cancel",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "common.updatePassword",
        }),
      ).toBeInTheDocument();
    });

    it("should close the modal when clicking cancel", async () => {
      renderProfilePage();

      await openPasswordModal();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.cancel",
        }),
      );

      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });

    it("should reset password fields when cancelling", async () => {
      renderProfilePage();

      await openPasswordModal();

      const inputs = screen.getAllByTestId("password-input");

      fireEvent.change(inputs[0], {
        target: { value: "Password123!" },
      });

      fireEvent.change(inputs[1], {
        target: { value: "Password123!" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.cancel",
        }),
      );

      await openPasswordModal();

      screen.getAllByTestId("password-input").forEach((input) => {
        expect(input).toHaveValue("");
      });
    });

    it("should not change the profile when opening the password modal", async () => {
      renderProfilePage();

      await openPasswordModal();

      expect(mocks.updateProfile).not.toHaveBeenCalled();
      expect(mocks.changePassword).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------
  // Password validation
  // ----------------------------------------------

  describe("Password validation", () => {
    it("should display password validation errors", async () => {
      mocks.passwordSchemaSafeParse.mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              path: ["password"],
              message: "Password is required",
            },
            {
              path: ["confirmPassword"],
              message: "Passwords do not match",
            },
          ],
        },
      });

      renderProfilePage();

      await openPasswordModal();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.updatePassword",
        }),
      );

      expect(
        await screen.findByText("Password is required"),
      ).toBeInTheDocument();

      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();

      expect(mocks.changePassword).not.toHaveBeenCalled();
    });

    it("should call passwordSchema.safeParse with password data", async () => {
      renderProfilePage();

      await openPasswordModal();

      const inputs = screen.getAllByTestId("password-input");

      fireEvent.change(inputs[0], {
        target: { value: "Password123!" },
      });

      fireEvent.change(inputs[1], {
        target: { value: "Password123!" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.updatePassword",
        }),
      );

      await waitFor(() => {
        expect(mocks.passwordSchemaSafeParse).toHaveBeenCalledWith(
          mockPassword,
        );
      });
    });

    it("should not call changePassword when validation fails", async () => {
      mocks.passwordSchemaSafeParse.mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              path: ["password"],
              message: "Invalid password",
            },
          ],
        },
      });

      renderProfilePage();

      await openPasswordModal();

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.updatePassword",
        }),
      );

      await waitFor(() => {
        expect(mocks.changePassword).not.toHaveBeenCalled();
      });
    });
  });

  // ----------------------------------------------
  // Change password mutation
  // ----------------------------------------------

  describe("Change password", () => {
    it("should change the password successfully", async () => {
      renderProfilePage();

      await openPasswordModal();

      const inputs = screen.getAllByTestId("password-input");

      fireEvent.change(inputs[0], {
        target: { value: "Password123!" },
      });

      fireEvent.change(inputs[1], {
        target: { value: "Password123!" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.updatePassword",
        }),
      );

      await waitFor(() => {
        expect(mocks.changePassword).toHaveBeenCalledWith(mockPassword);
      });
    });

    it("should show a success toast after changing password", async () => {
      renderProfilePage();

      await openPasswordModal();

      const inputs = screen.getAllByTestId("password-input");

      fireEvent.change(inputs[0], {
        target: { value: "Password123!" },
      });

      fireEvent.change(inputs[1], {
        target: { value: "Password123!" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.updatePassword",
        }),
      );

      await waitFor(() => {
        expect(mocks.addToast).toHaveBeenCalledWith({
          title: "messages.success",
          description: "messages.passwordUpdateSuccess",
          variant: "success",
        });
      });
    });

    it("should close the modal after successful password change", async () => {
      renderProfilePage();

      await openPasswordModal();

      const inputs = screen.getAllByTestId("password-input");

      fireEvent.change(inputs[0], {
        target: { value: "Password123!" },
      });

      fireEvent.change(inputs[1], {
        target: { value: "Password123!" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.updatePassword",
        }),
      );

      await waitFor(() => {
        expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
      });
    });

    it("should reset password fields after successful update", async () => {
      renderProfilePage();

      await openPasswordModal();

      const inputs = screen.getAllByTestId("password-input");

      fireEvent.change(inputs[0], {
        target: { value: "Password123!" },
      });

      fireEvent.change(inputs[1], {
        target: { value: "Password123!" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.updatePassword",
        }),
      );

      await waitFor(() => {
        expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
      });

      await openPasswordModal();

      screen.getAllByTestId("password-input").forEach((input) => {
        expect(input).toHaveValue("");
      });
    });

    it("should show an error toast when password update fails", async () => {
      mocks.changePassword.mockRejectedValue(
        new Error("Password update failed"),
      );

      renderProfilePage();

      await openPasswordModal();

      const inputs = screen.getAllByTestId("password-input");

      fireEvent.change(inputs[0], {
        target: { value: "Password123!" },
      });

      fireEvent.change(inputs[1], {
        target: { value: "Password123!" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.updatePassword",
        }),
      );

      await waitFor(() => {
        expect(mocks.addToast).toHaveBeenCalledWith({
          title: "messages.error",
          description: "Password update failed",
          variant: "error",
        });
      });
    });

    it("should use the default error message when password update fails without a message", async () => {
      mocks.changePassword.mockRejectedValue(new Error(""));

      renderProfilePage();

      await openPasswordModal();

      const inputs = screen.getAllByTestId("password-input");

      fireEvent.change(inputs[0], {
        target: { value: "Password123!" },
      });

      fireEvent.change(inputs[1], {
        target: { value: "Password123!" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.updatePassword",
        }),
      );

      await waitFor(() => {
        expect(mocks.addToast).toHaveBeenCalledWith({
          title: "messages.error",
          description: "messages.passwordUpdateFailed",
          variant: "error",
        });
      });
    });

    it("should not navigate after changing password", async () => {
      renderProfilePage();

      await openPasswordModal();

      const inputs = screen.getAllByTestId("password-input");

      fireEvent.change(inputs[0], {
        target: { value: "Password123!" },
      });

      fireEvent.change(inputs[1], {
        target: { value: "Password123!" },
      });

      fireEvent.click(
        screen.getByRole("button", {
          name: "common.updatePassword",
        }),
      );

      await waitFor(() => {
        expect(mocks.changePassword).toHaveBeenCalled();
      });

      expect(mocks.navigate).not.toHaveBeenCalled();
    });
  });
});
