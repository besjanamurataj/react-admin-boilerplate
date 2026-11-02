import type { StudentRequest } from "../types/student";
import { HttpClient } from "../libs/https/http-client";

const API_URL = "/students";

export async function createStudent(data: StudentRequest) {
  try {
    const response = await HttpClient.post(API_URL, data);

    return response;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to create student",
      { cause: error },
    );
  }
}

export async function getStudents(
  search?: string,
  page?: number,
  size?: number,
  sorting?: string[],
  firstName?: string,
  lastName?: string,
  birthDate?: string,
  active?: boolean,
  departmentId?: number,
) {
  try {
    const query = new URLSearchParams();

    if (search) {
      query.append("search", search);
    }

    if (firstName) {
      query.append("firstName", firstName);
    }

    if (lastName) {
      query.append("lastName", lastName);
    }

    if (birthDate) {
      query.append("birthDate", birthDate);
    }

    if (active !== undefined) {
      query.append("active", active.toString());
    }

    if (departmentId !== undefined && departmentId > 0) {
      query.append("departmentId", departmentId.toString());
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
      query.toString().length > 0
        ? `${API_URL}?${query.toString()}`
        : API_URL;

    const response = await HttpClient.get<any>(urlWithQuery);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch students",
      { cause: error },
    );
  }
}

export async function deleteStudent(id: number) {
  try {
    const response = await HttpClient.delete(`${API_URL}/${id}`);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to delete student",
      { cause: error },
    );
  }
}

export async function updateStudent(
  id: number,
  data: StudentRequest,
) {
  try {
    const response = await HttpClient.put(`${API_URL}/${id}`, data);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to update student",
      { cause: error },
    );
  }
}

export async function getStudentById({
  id,
  signal,
}: {
  id: number;
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
        ?.message || "Failed to fetch student",
      { cause: error },
    );
  }
}

export async function getDepartments() {
  try {
    const response = await HttpClient.get<any>(
      "/departments?number=1&size=100",
    );

    const departments = Array.isArray(response)
      ? response
      : response?.content || [];

    return departments.map((department: any) => ({
      value: department.id,
      label: department.name,
    }));
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch departments",
      { cause: error },
    );
  }
}

export async function exportStudentsPdf(
  search?: string,
  sorting?: string[],
  firstName?: string,
  lastName?: string,
  birthDate?: string,
  active?: boolean,
  departmentId?: number,
) {
  try {
    const query = new URLSearchParams();

    if (search) {
      query.append("search", search);
    }

    if (firstName) {
      query.append("firstName", firstName);
    }

    if (lastName) {
      query.append("lastName", lastName);
    }

    if (birthDate) {
      query.append("birthDate", birthDate);
    }

    if (active !== undefined) {
      query.append("active", active.toString());
    }

    if (departmentId !== undefined && departmentId > 0) {
      query.append("departmentId", departmentId.toString());
    }

    if (sorting && sorting.length > 0) {
      sorting.forEach((sort) => {
        query.append("sort", sort);
      });
    }

    const urlWithQuery =
      query.toString().length > 0
        ? `http://localhost:3000${API_URL}/export/pdf?${query.toString()}`
        : `http://localhost:3000${API_URL}/export/pdf`;

    const response = await fetch(urlWithQuery, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to export students PDF");
    }

    const blob = await response.blob();

    return blob;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to export students PDF",
      { cause: error },
    );
  }
}
