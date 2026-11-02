import type { UserInfo } from "./user";

export interface Profile {
  name: string;
  surname?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  roles: string[];
  userInfo: UserInfo;
}
