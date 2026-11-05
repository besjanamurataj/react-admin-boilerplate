import type {
  DepartmentRequest,
  DepartmentResponse,
} from "../types/department";
import { HttpClient } from "../libs/https/http-client";

const API_URL = "api/departments";

export async function createDepartment(data: DepartmentRequest) {
  try {
    const response = await HttpClient.post(API_URL, data);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to create department",
      { cause: error },
    );
  }
}

export async function getDepartments(
  search?: string,
  page?: number,
  size?: number,
  sorting?: string[],
): Promise<DepartmentResponse> {
  try {
    const query = new URLSearchParams();

    if (search) {
      query.append("search", search);
    }

    if (page !== undefined) {
      query.append("number", (page + 1).toString());
    }

    if (size !== undefined) {
      query.append("size", size.toString());
    }

    if (sorting && sorting.length > 0) {
      sorting.forEach((sort) => {
        query.append("sort", sort);
      });
    }

    const urlWithQuery =
      query.toString().length > 0 ? `${API_URL}?${query.toString()}` : API_URL;

    const response = await HttpClient.get<DepartmentResponse>(urlWithQuery);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch departments",
      { cause: error },
    );
  }
}

export async function deleteDepartment(id: number) {
  try {
    const response = await HttpClient.delete(`${API_URL}/${id}`);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to delete department",
      { cause: error },
    );
  }
}

export async function updateDepartment(id: number, data: DepartmentRequest) {
  try {
    const response = await HttpClient.put(`${API_URL}/${id}`, data);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to update department",
      { cause: error },
    );
  }
}

export async function getDepartmentById({
  id,
  signal,
}: {
  id: string;
  signal?: AbortSignal;
}): Promise<DepartmentResponse> {
  try {
    const response = await HttpClient.get<DepartmentResponse>(
      `${API_URL}/${id}`,
      {
        signal,
      },
    );

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch department",
      { cause: error },
    );
  }
}
