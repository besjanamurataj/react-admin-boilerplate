import type { UniversityRequest, UniversityResponse } from "../types/university";
import { HttpClient } from "../libs/https/http-client";

const API_URL = "/universities";

export async function createUniversity(data: UniversityRequest) {
  try {
    const response = await HttpClient.post(API_URL, data);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to create university",
      { cause: error },
    );
  }
}

export async function getUniversities(
  search?: string,
  page?: number,
  size?: number,
  sorting?: string[],
): Promise<UniversityResponse[]> {
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

    const response = await HttpClient.get<UniversityResponse[]>(urlWithQuery);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch universities",
      { cause: error },
    );
  }
}

export async function deleteUniversity(id: number) {
  try {
    const response = await HttpClient.delete(`${API_URL}/${id}`);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to delete university",
      { cause: error },
    );
  }
}

export async function updateUniversity(id: number, data: UniversityRequest) {
  try {
    const response = await HttpClient.put(`${API_URL}/${id}`, data);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to update university",
      { cause: error },
    );
  }
}

export async function getUniversityById({
  id,
  signal,
}: {
  id: string;
  signal?: AbortSignal;
}) {
  try {
    const response = await HttpClient.get(`${API_URL}/${id}`, {
      signal,
    });

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch university",
      { cause: error },
    );
  }
}
