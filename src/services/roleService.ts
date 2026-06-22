import type { RoleRequest } from "../types/role";
import { HttpClient } from "../libs/https/http-client";

const API_URL = "/roles";

export async function createRole(data: RoleRequest) {
  try {
    const response = await HttpClient.post(API_URL, data);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create user");
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
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch roles");
  }
}

export async function deleteRole(id: any) {
  try {
    const response = await HttpClient.delete(API_URL + `/${id}`);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete role");
  }
}

export async function updateRole(id: any, user: RoleRequest) {
  try {
    const response = await HttpClient.put(API_URL + `/${id}`, user);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update role");
  }
}

export async function getById({
  id,
  signal,
}: {
  id: any;
  signal?: AbortSignal;
}) {
  try {
    const response = await HttpClient.get(API_URL + `/${id}`, { signal });
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create role");
  }
}

export async function getAuthorities() {
  try {
    const response = await HttpClient.get<any>("/authorities");
    return response.map((element: any) => ({
      value: element.id,
      label: element.name || element.label,
    }));
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create role");
  }
}
