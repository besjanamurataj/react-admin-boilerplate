import type { Role, RoleRequest, RoleResponse } from "../types/role";
import { HttpClient } from "../libs/https/http-client";
import type { AuthorityResponse } from "./authoritiesService";

const API_URL = "/roles";

export async function createRole(data: RoleRequest): Promise<void> {
  try {
    await HttpClient.post<void>(API_URL, data);
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to create role",
      { cause: error },
    );
  }
}

export async function getRole(
  search?: string,
  page?: number,
  size?: number,
  sorting?: string[],
): Promise<RoleResponse> {
  try {
    const query = new URLSearchParams();

    if (search) query.append("search", search);
    if (page !== undefined) query.append("page", page.toString());
    if (size !== undefined) query.append("size", size.toString());
    if (sorting && sorting.length > 0) {
      sorting.forEach((s) => query.append("sort", s));
    }

    const urlWithQuery =
      query.toString().length > 0 ? `${API_URL}?${query.toString()}` : API_URL;

    const response = await HttpClient.get<RoleResponse>(urlWithQuery);
    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch roles",
      { cause: error },
    );
  }
}

export async function deleteRole(id: number) {
  try {
    const response = await HttpClient.delete<RoleResponse>(API_URL + `/${id}`);
    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to delete role",
      { cause: error },
    );
  }
}

export async function updateRole(
  id: number | string,
  data: RoleRequest,
): Promise<void> {
  try {
    await HttpClient.put<void>(`${API_URL}/${id}`, data);
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to update role",
      { cause: error },
    );
  }
}

export async function getById({
  id,
  signal,
}: {
  id: number | string;
  signal?: AbortSignal;
}): Promise<Role> {
  try {
    return await HttpClient.get<Role>(`${API_URL}/${id}`, { signal });
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch role",
      { cause: error },
    );
  }
}

export async function getAuthorities() {
  try {
    const response = await HttpClient.get<AuthorityResponse[]>("/authorities");
    return response.map((element: AuthorityResponse) => ({
      value: element.id,
      label: element.name,
    }));
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch authorities",
      { cause: error },
    );
  }
}
