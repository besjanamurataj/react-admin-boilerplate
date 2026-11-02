import type {
  BatchEnrollmentRequest,
  BatchEnrollmentResponse,
  EnrollmentRequest,
  EnrollmentResponse,
} from "../types/enrollment";
import { HttpClient } from "../libs/https/http-client";

const API_URL = "/enrollments";

export async function createEnrollment(data: EnrollmentRequest) {
  try {
    const response = await HttpClient.post(API_URL, data);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to batch enroll students",
      { cause: error },
    );
  }
}

export async function getEnrollments(
  search?: string,
  page?: number,
  size?: number,
  sorting?: string[],
  enrollmentDate?: string,
  universityId?: number,
  departmentId?: number,
  studentId?: number,
) {
  try {
    const query = new URLSearchParams();

    if (search) {
      query.append("search", search);
    }

    if (enrollmentDate) {
      query.append("enrollmentDate", enrollmentDate);
    }

    if (universityId !== undefined && universityId > 0) {
      query.append("universityId", universityId.toString());
    }

    if (departmentId !== undefined && departmentId > 0) {
      query.append("departmentId", departmentId.toString());
    }

    if (studentId !== undefined && studentId > 0) {
      query.append("studentId", studentId.toString());
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

    const response =
      await HttpClient.get<BatchEnrollmentResponse>(urlWithQuery);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch enrollments",
      { cause: error },
    );
  }
}

export async function deleteEnrollment(id: number) {
  try {
    const response = await HttpClient.delete(`${API_URL}/${id}`);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to delete enrollment",
      { cause: error },
    );
  }
}

export async function updateEnrollment(id: number, data: EnrollmentRequest) {
  try {
    const response = await HttpClient.put(`${API_URL}/${id}`, data);

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to update enrollment",
      { cause: error },
    );
  }
}

export async function getEnrollmentById({
  id,
  signal,
}: {
  id: number;
  signal?: AbortSignal;
}): Promise<EnrollmentResponse> {
  try {
    const response = await HttpClient.get<EnrollmentResponse>(
      `${API_URL}/${id}`,
      {
        signal,
      },
    );

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to fetch enrollment",
      { cause: error },
    );
  }
}

export async function exportEnrollmentsCsv(
  search?: string,
  sorting?: string[],
  enrollmentDate?: string,
  universityId?: number,
  departmentId?: number,
  studentId?: number,
) {
  try {
    const query = new URLSearchParams();

    if (search) {
      query.append("search", search);
    }

    if (enrollmentDate) {
      query.append("enrollmentDate", enrollmentDate);
    }

    if (universityId !== undefined && universityId > 0) {
      query.append("universityId", universityId.toString());
    }

    if (departmentId !== undefined && departmentId > 0) {
      query.append("departmentId", departmentId.toString());
    }

    if (studentId !== undefined && studentId > 0) {
      query.append("studentId", studentId.toString());
    }

    if (sorting && sorting.length > 0) {
      sorting.forEach((sort) => {
        query.append("sort", sort);
      });
    }

    const urlWithQuery =
      query.toString().length > 0
        ? `http://localhost:3000${API_URL}/export/csv?${query.toString()}`
        : `http://localhost:3000${API_URL}/export/csv`;

    const response = await fetch(urlWithQuery, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to export enrollments CSV");
    }

    const blob = await response.blob();

    return blob;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to export enrollments CSV",
      { cause: error },
    );
  }
}

export async function exportEnrollmentsPdf(
  search?: string,
  sorting?: string[],
  enrollmentDate?: string,
  universityId?: number,
  departmentId?: number,
  studentId?: number,
) {
  try {
    const query = new URLSearchParams();

    if (search) {
      query.append("search", search);
    }

    if (enrollmentDate) {
      query.append("enrollmentDate", enrollmentDate);
    }

    if (universityId !== undefined && universityId > 0) {
      query.append("universityId", universityId.toString());
    }

    if (departmentId !== undefined && departmentId > 0) {
      query.append("departmentId", departmentId.toString());
    }

    if (studentId !== undefined && studentId > 0) {
      query.append("studentId", studentId.toString());
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
      throw new Error("Failed to export enrollments PDF");
    }

    const blob = await response.blob();

    return blob;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to export enrollments PDF",
      { cause: error },
    );
  }
}

export async function batchEnrollByDepartment(
  data: BatchEnrollmentRequest,
): Promise<BatchEnrollmentResponse> {
  try {
    const response = await HttpClient.post<BatchEnrollmentResponse>(
      `${API_URL}/batch/department`,
      data,
    );

    return response;
  } catch (error: unknown) {
    throw new Error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to batch enroll students",
      { cause: error },
    );
  }
}
