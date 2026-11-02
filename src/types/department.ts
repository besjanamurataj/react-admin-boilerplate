export interface DepartmentRequest {
  name: string;
  code: string;
  universityId: number;
  description: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  universityId: number;
  universityName: string;
}
export interface DepartmentResponse {
  content: Department[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
