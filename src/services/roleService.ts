import type { RoleRequest, RoleResponse } from "../types/role";
import { HttpClient } from "../libs/https/http-client";
import type { AuthorityResponse } from "./authoritiesService";

const API_URL = "/roles";

export async function createRole(data: RoleRequest) {
  try {
    const response = await HttpClient.post(API_URL, data);
    return response;
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
) {
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

    const response = await HttpClient.get<any>(urlWithQuery);
    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch roles",
      { cause: error },
    );
  }
}

export async function deleteRole(id: string) {
  try {
    const response = await HttpClient.delete(API_URL + `/${id}`);
    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to delete role",
      { cause: error },
    );
  }
}

export async function updateRole(id: string, user: RoleRequest) {
  try {
    const response = await HttpClient.put(API_URL + `/${id}`, user);
    return response;
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
  id: string;
  signal?: AbortSignal;
}): Promise<RoleResponse> {
  try {
    const response = await HttpClient.get<RoleResponse>(API_URL + `/${id}`, {
      signal,
    });
    return response;
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
