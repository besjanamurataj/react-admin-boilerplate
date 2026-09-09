export interface DepartmentRequest {
  name: string;
  code: string;
  universityId: number;
  description: string;
}

export interface DepartmentResponse {
  id: number;
  name: string;
  code: string;
  description: string;
  universityId: number;
  universityName: string;
}
