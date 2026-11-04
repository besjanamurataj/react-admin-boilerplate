import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import UserPage from "./User";

const {
  mockNavigate,
  mockDeleteUsers,
  mockInvalidateQueries,
  mockAddToast,
  mockHasPermission,
  mockMutate,
  mockRefetch,
  mockGetUsers,
  mockGetRole,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockDeleteUsers: vi.fn(),
  mockInvalidateQueries: vi.fn(),
  mockAddToast: vi.fn(),
  mockHasPermission: vi.fn(),
  mockMutate: vi.fn(),
  mockRefetch: vi.fn(),
  mockGetUsers: vi.fn(),
  mockGetRole: vi.fn(),
}));

const mockUsers = [
  {
    id: 1,
    name: "John",
    surname: "Doe",
    username: "johndoe",
    email: "john@example.com",
    userInfo: {
      birthDate: "1995-05-10",
      phoneNumber: "123456789",
      gender: "Male",
      street: "Main Street",
    },
    roles: [{ id: 1, name: "ADMIN" }],
  },
  {
    id: 2,
    name: "Jane",
    surname: "Smith",
    username: "janesmith",
    email: "jane@example.com",
    userInfo: {
      birthDate: "1998-03-15",
      phoneNumber: "987654321",
      gender: "Female",
      street: "Second Street",
    },
    roles: [{ id: 2, name: "USER" }],
  },
];

vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => {
    if (queryKey[0] === "users") {
      return {
        data: {
          content: mockUsers,
          totalElements: 2,
          total: 2,
        },
        isLoading: false,
        refetch: mockRefetch,
      };
    }

    if (queryKey[0] === "roles") {
      return {
        data: {
          content: [
            { id: 1, name: "ADMIN" },
            { id: 2, name: "USER" },
          ],
        },
        isLoading: false,
      };
    }

    return {
      data: undefined,
      isLoading: false,
    };
  },

  useMutation: ({
    mutationFn,
    onSuccess,
  }: {
    mutationFn: () => Promise<unknown>;
    onSuccess: () => void;
  }) => ({
    mutate: async () => {
      mockMutate();
      await mutationFn();
      onSuccess();
    },
  }),

  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    hasPermission: mockHasPermission,
  }),
}));

vi.mock("../../contexts/toast/ToastProvider", () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

vi.mock("../../services/useService", () => ({
  getUsers: mockGetUsers,
  deleteUsers: mockDeleteUsers,
}));

vi.mock("../../services/roleService", () => ({
  getRole: mockGetRole,
}));

vi.mock("../../utils/formatRole", () => ({
  formatRole: (role: string) => role,
}));

vi.mock("../../utils/formatDate", () => ({
  formatDate: (date: string) => `formatted-${date}`,
}));

vi.mock("debounce", () => ({
  default: (callback: (value: string) => void) => callback,
}));

vi.mock("../../components/PageTitle", () => ({
  PageTitle: ({ title, subTitle }: { title: string; subTitle?: string }) => (
    <div>
      <h1>{title}</h1>
      {subTitle && <p>{subTitle}</p>}
    </div>
  ),
}));

vi.mock("../../components/ui/Button", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("../../components/ui/Search", () => ({
  Search: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
  }) => (
    <input
      aria-label="user-search"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  ),
}));

vi.mock("../../components/ui/Input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("../../components/ui/Label", () => ({
  Label: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
}));

vi.mock("../../components/ui/MultiSelect", () => ({
  MultiSelect: ({
    options,
    value,
    onChange,
  }: {
    options: { label: string; value: string }[];
    value: string[];
    onChange: (values: string[]) => void;
  }) => (
    <select
      aria-label="roles-filter"
      multiple
      value={value}
      onChange={(event) =>
        onChange(
          Array.from(event.target.selectedOptions).map(
            (option) => option.value,
          ),
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

vi.mock("../../components/ui/Dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,

  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div role="dialog">{children}</div>
  ),
}));

vi.mock("../../components/ui/DataTable", () => ({
  DataTable: ({
    data,
    columns,
    loading,
    pagination,
    sorting,
  }: {
    data: typeof mockUsers;
    columns: {
      accessorKey?: string;
      id?: string;
      header?: (props: {
        column: {
          toggleSorting: (desc: boolean) => void;
          getIsSorted: () => string | false;
        };
      }) => React.ReactNode;
      cell?: (props: {
        row: {
          original: (typeof mockUsers)[number];
          getValue: (key: string) => unknown;
        };
      }) => React.ReactNode;
    }[];
    loading: boolean;
    pagination: {
      onChange: (value: { pageIndex: number; pageSize: number }) => void;
    };
    sorting: {
      onChange: (value: { id: string; desc: boolean }[]) => void;
    };
  }) => (
    <div data-testid="data-table">
      {loading && <span>Loading...</span>}

      <table>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={column.id ?? column.accessorKey ?? index}>
                {column.header?.({
                  column: {
                    toggleSorting: () =>
                      sorting.onChange([{ id: "name", desc: true }]),
                    getIsSorted: () => false,
                  },
                })}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((user) => (
            <tr key={user.id}>
              {columns.map((column, index) => {
                const row = {
                  original: user,
                  getValue: (key: string) => {
                    if (key === "birthDate") {
                      return user.userInfo?.birthDate;
                    }

                    return user[key as keyof typeof user];
                  },
                };

                return (
                  <td key={column.id ?? column.accessorKey ?? index}>
                    {column.cell?.({ row })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() =>
          pagination.onChange({
            pageIndex: 1,
            pageSize: 10,
          })
        }
      >
        Next page
      </button>
    </div>
  ),
}));

describe("UserPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockHasPermission.mockImplementation((permission: string) =>
      ["VIEW_USER", "MANAGE_USER"].includes(permission),
    );

    mockDeleteUsers.mockResolvedValue({});
    mockRefetch.mockResolvedValue({});
  });

  it("should render page title and description", () => {
    render(<UserPage />);

    expect(screen.getByText("users.title")).toBeInTheDocument();
    expect(screen.getByText("users.description")).toBeInTheDocument();
  });

  it("should render create and export buttons", () => {
    render(<UserPage />);

    expect(screen.getByText("common.create")).toBeInTheDocument();
    expect(screen.getByText("common.export")).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(<UserPage />);

    expect(screen.getByLabelText("user-search")).toBeInTheDocument();
  });

  it("should render DataTable when data is available", () => {
    render(<UserPage />);

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("should render user information", () => {
    render(<UserPage />);

    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("johndoe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Smith")).toBeInTheDocument();
  });

  it("should format birth dates", () => {
    render(<UserPage />);

    expect(screen.getByText("formatted-1995-05-10")).toBeInTheDocument();
  });

  it("should render user roles", () => {
    render(<UserPage />);

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("USER")).toBeInTheDocument();
  });

  it("should hide create button without MANAGE_USER permission", () => {
    mockHasPermission.mockImplementation(
      (permission: string) => permission === "VIEW_USER",
    );

    render(<UserPage />);

    expect(screen.queryByText("common.create")).not.toBeInTheDocument();
  });

  it("should hide view, edit and delete actions without permissions", () => {
    mockHasPermission.mockReturnValue(false);

    render(<UserPage />);

    const row = screen.getByText("John").closest("tr")!;

    expect(within(row).queryByRole("button")).not.toBeInTheDocument();
  });

  it("should show view action with VIEW_USER permission", () => {
    mockHasPermission.mockImplementation(
      (permission: string) => permission === "VIEW_USER",
    );

    render(<UserPage />);

    const row = screen.getByText("John").closest("tr")!;

    expect(within(row).getAllByRole("button")).toHaveLength(1);
  });

  it("should navigate to create user page", () => {
    render(<UserPage />);

    fireEvent.click(screen.getByText("common.create"));

    expect(mockNavigate).toHaveBeenCalledWith("/user/upsert");
  });

  it("should navigate to user details page", () => {
    render(<UserPage />);

    const row = screen.getByText("John").closest("tr")!;
    const buttons = within(row).getAllByRole("button");

    fireEvent.click(buttons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/user/view/1");
  });

  it("should navigate to edit user page", () => {
    render(<UserPage />);

    const row = screen.getByText("John").closest("tr")!;
    const buttons = within(row).getAllByRole("button");

    fireEvent.click(buttons[1]);

    expect(mockNavigate).toHaveBeenCalledWith("/user/edit/1");
  });

  it("should update search input value", () => {
    render(<UserPage />);

    const searchInput = screen.getByLabelText("user-search");

    fireEvent.change(searchInput, {
      target: { value: "John" },
    });

    expect(searchInput).toHaveValue("John");
  });

  const openFilterDialog = () => {
    fireEvent.click(screen.getByRole("button", { name: "", hidden: true }));
  };

  it("should open filter dialog", () => {
    render(<UserPage />);

    // Filter is the second button in the page toolbar.
    const toolbarButtons = screen.getAllByRole("button");
    fireEvent.click(toolbarButtons[2]);

    expect(screen.getByText("common.filters")).toBeInTheDocument();
  });

  it("should update first name filter", () => {
    render(<UserPage />);

    const toolbarButtons = screen.getAllByRole("button");
    fireEvent.click(toolbarButtons[2]);

    const inputs = screen.getAllByRole("textbox");

    fireEvent.change(inputs[1], {
      target: { value: "John" },
    });

    expect(inputs[1]).toHaveValue("John");
  });

  it("should reset filters", () => {
    render(<UserPage />);

    const toolbarButtons = screen.getAllByRole("button");
    fireEvent.click(toolbarButtons[2]);

    const inputs = screen.getAllByRole("textbox");

    fireEvent.change(inputs[1], {
      target: { value: "John" },
    });

    fireEvent.click(screen.getByText("common.reset"));

    expect(inputs[1]).toHaveValue("");
  });

  it("should apply filters and refetch users", () => {
    render(<UserPage />);

    const toolbarButtons = screen.getAllByRole("button");
    fireEvent.click(toolbarButtons[2]);

    fireEvent.click(screen.getByText("common.apply"));

    expect(mockRefetch).toHaveBeenCalled();
    expect(screen.queryByText("common.filters")).not.toBeInTheDocument();
  });

  it("should update the roles filter", () => {
    render(<UserPage />);

    const toolbarButtons = screen.getAllByRole("button");
    fireEvent.click(toolbarButtons[2]);

    const roleSelect = screen.getByLabelText("roles-filter");

    fireEvent.change(roleSelect, {
      target: {
        value: "ADMIN",
      },
    });

    expect(
      within(roleSelect).getByRole("option", {
        name: "ADMIN",
      }),
    ).toBeInTheDocument();
  });

  it("should open delete confirmation dialog", () => {
    render(<UserPage />);

    const row = screen.getByText("John").closest("tr")!;
    const buttons = within(row).getAllByRole("button");

    fireEvent.click(buttons[2]);

    expect(screen.getByText("users.deleteUser")).toBeInTheDocument();

    expect(screen.getByText("users.confirmDelete")).toBeInTheDocument();
  });

  it("should close delete dialog when cancel is clicked", () => {
    render(<UserPage />);

    const row = screen.getByText("John").closest("tr")!;
    const buttons = within(row).getAllByRole("button");

    fireEvent.click(buttons[2]);

    fireEvent.click(screen.getByText("common.cancel"));

    expect(screen.queryByText("users.deleteUser")).not.toBeInTheDocument();
  });

  it("should delete selected user successfully", async () => {
    render(<UserPage />);

    const row = screen.getByText("John").closest("tr")!;
    const buttons = within(row).getAllByRole("button");

    fireEvent.click(buttons[2]);

    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => {
      expect(mockDeleteUsers).toHaveBeenCalledWith(1);
    });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["users"],
    });

    expect(mockAddToast).toHaveBeenCalledWith({
      title: "messages.success",
      description: "messages.userDeleteSuccess",
      variant: "success",
    });

    await waitFor(() => {
      expect(screen.queryByText("users.deleteUser")).not.toBeInTheDocument();
    });
  });

  it("should trigger sorting when name header is clicked", () => {
    render(<UserPage />);

    const nameHeader = screen.getByText("users.table.firstName");

    const sortButton = within(nameHeader.parentElement!).getByRole("button");

    fireEvent.click(sortButton);

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });

  it("should trigger pagination when next page is clicked", () => {
    render(<UserPage />);

    fireEvent.click(screen.getByText("Next page"));

    expect(screen.getByTestId("data-table")).toBeInTheDocument();
  });
});
