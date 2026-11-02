export interface User {
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
  roles: any[];
  userInfo?: UserInfo;
  id: number;
  authorities: string[];
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

export interface UserResponse {
  id: string;
  email: string;
  authorities: string[];
}
