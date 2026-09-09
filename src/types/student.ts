export interface StudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  active: boolean;
  departmentId: number;
}

export interface StudentResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  active: boolean;
  departmentId: number;
  departmentName: string;
}
