export interface StudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  active: boolean;
  departmentId: number;
}

export interface Student {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  active: boolean;
  departmentId: number;
  departmentName: string;
}
export interface StudentResponse {
  content: Student[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
