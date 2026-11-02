export interface RoleRequest {
  name: string;
  description: string;
  authorities: number[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
  authorities: number[];
  // permission: { [category: string]: string[] };
}
export interface RoleSelection {
  name: string;
  id: number;
}
export interface RoleResponse {
  content: Role[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  total?: number;
  last: boolean;
}
