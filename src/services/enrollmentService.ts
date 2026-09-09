import type {
  BatchEnrollmentRequest,
  BatchEnrollmentResponse,
  EnrollmentRequest,
} from "../types/enrollment";
import { HttpClient } from "../libs/https/http-client";

const API_URL = "/enrollments";

export async function createEnrollment(data: EnrollmentRequest) {
  try {
    const response = await HttpClient.post(API_URL, data);

    return response;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to create enrollment",
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
      query.toString().length > 0
        ? `${API_URL}?${query.toString()}`
        : API_URL;

    const response = await HttpClient.get<any>(urlWithQuery);

    return response;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch enrollments",
      { cause: error },
    );
  }
}

export async function deleteEnrollment(id: number) {
  try {
    const response = await HttpClient.delete(`${API_URL}/${id}`);

    return response;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to delete enrollment",
      { cause: error },
    );
  }
}

export async function updateEnrollment(
  id: number,
  data: EnrollmentRequest,
) {
  try {
    const response = await HttpClient.put(`${API_URL}/${id}`, data);

    return response;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update enrollment",
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
}) {
  try {
    const response = await HttpClient.get(`${API_URL}/${id}`, {
      signal,
    });

    return response;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch enrollment",
      { cause: error },
    );
  }
}

export async function getUniversities() {
  try {
    const response = await HttpClient.get<any>(
      "/universities?number=1&size=100",
    );

    const universities = Array.isArray(response)
      ? response
      : response?.content || [];

    return universities.map((university: any) => ({
      value: university.id,
      label: university.name,
    }));
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch universities",
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
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch departments",
      { cause: error },
    );
  }
}

export async function getStudents() {
  try {
    const response = await HttpClient.get<any>(
      "/students?number=1&size=100",
    );

    const students = Array.isArray(response)
      ? response
      : response?.content || [];

    return students.map((student: any) => ({
      value: student.id,
      label: `${student.firstName} ${student.lastName}`,
    }));
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch students",
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
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to export enrollments CSV",
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
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to export enrollments PDF",
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
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to batch enroll students",
      { cause: error },
    );
  }
}
