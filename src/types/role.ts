export interface RoleRequest {
  name: string;
  description: string;
  authorities: string[];
}

export interface RoleResponse {
  id: number;
  name: string;
  displayName: string;
  description: string;
  authorities: string[];
  permission: { [category: string]: string[] };
}
export interface RoleSelection {
  name: string;
  id: number;
}
