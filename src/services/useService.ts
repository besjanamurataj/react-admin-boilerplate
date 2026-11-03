import type {
  PasswordUpdate,
  User,
  UserDetailResponse,
  UserResponse,
} from "../types/user";
import { HttpClient } from "../libs/https/http-client";
import type { Profile } from "../types/profile";

const API_URL = "/users";

export async function createUser(data: User) {
  const response = await HttpClient.post(API_URL, data);
  return response;
}

export async function getUsers(
  search?: string,
  name?: string,
  username?: string,
  surname?: string,
  email?: string,
  roles?: string[],
  page?: number,
  size?: number,
  sorting?: string[],
): Promise<UserResponse> {
  try {
    const query = new URLSearchParams();

    if (search) query.append("search", search);
    if (name !== undefined) query.append("name", name.toString());
    if (username !== undefined) query.append("username", username.toString());
    if (surname !== undefined) query.append("surname", surname.toString());
    if (email !== undefined) query.append("email", email.toString());

    if (page !== undefined) query.append("page", page.toString());
    if (size !== undefined) query.append("size", size.toString());
    if (sorting && sorting.length > 0) {
      sorting.forEach((s) => query.append("sort", s));
    }
    if (roles && roles.length >= 0) {
      roles.forEach((s) => query.append("roles", s));
    }

    const urlWithQuery =
      query.toString().length > 0 ? `${API_URL}?${query.toString()}` : API_URL;

    const response = await HttpClient.get<UserResponse>(urlWithQuery);
    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch users",
      { cause: error },
    );
  }
}

export async function deleteUsers(id: number) {
  try {
    const response = await HttpClient.delete(API_URL + `/${id}`);
    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to delete user",
      { cause: error },
    );
  }
}
export async function updateUsers(id: string, user: User) {
  try {
    const response = await HttpClient.put(API_URL + `/${id}`, user);
    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to update user",
      { cause: error },
    );
  }
}
export async function getById({
  id,
  signal,
}: {
  id: string;
  signal?: AbortSignal;
}): Promise<UserDetailResponse> {
  try {
    const response = await HttpClient.get<UserDetailResponse>(
      API_URL + `/${id}`,
      {
        signal,
      },
    );
    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch user",
      { cause: error },
    );
  }
}
export async function getByEmail(email: string) {
  return await HttpClient.get(API_URL, { params: { email } });
}

export async function changePassword(changePasswordData: PasswordUpdate) {
  try {
    const response = await HttpClient.put(
      API_URL + "/change-password",
      changePasswordData,
    );
    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to change password",
      { cause: error },
    );
  }
}

export async function updateProfile(updateProfileData: Profile) {
  try {
    const response = await HttpClient.put(API_URL, updateProfileData);
    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to update user",
      { cause: error },
    );
  }
}
