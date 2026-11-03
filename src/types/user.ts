import type { RoleRequest } from "./role";

export interface User {
  id?: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  username: string;
  roles: string[];
  authorities: string[];
  userInfo: {
    phoneNumber: string;
    birthDate: string;
    gender: string;
    street: string;
  };
}

export interface UserInfo {
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  street?: string;
}

export interface PasswordUpdate {
  password?: string;
  confirmPassword?: string;
}

export interface UserRequest {
  search?: string;
  name: string;
  surname: string;
  email: string;
  username: string;
  roles?: RoleRequest[];
  page?: number;
  size?: number;
  sorting?: string[];
}

export interface UserResponse {
  content: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  total?: number;
  last: boolean;
}
export interface UserDetailResponse {
  id: number;
  name: string;
  surname: string;
  email: string;
  password?: string;
  username: string;
  roles: {
    id: number;
    name: string;
    description: string;
  }[];
  authorities: string[];
  userInfo?: UserInfo;
}
